import time
import math
from datetime import datetime
from typing import Any, Dict, List, Tuple

import httpx


DATA_GOV_RESOURCE_URL = (
    "https://api.data.gov.in/resource/"
    "9ef84268-d588-465a-a308-a864a43d0070"
)
CROP_COMMODITIES = {
    "wheat": "Wheat",
    "mustard": "Mustard",
    "rice": "Paddy(Dhan)",
    "cotton": "Cotton",
    "potato": "Potato",
    "tomato": "Tomato",
    "onion": "Onion",
    "chickpea": "Gram",
}
CACHE_TTL_SECONDS = 900
_CACHE: Dict[Tuple[str, str, str], Tuple[float, List[Dict[str, Any]]]] = {}


class MandiDataUnavailable(Exception):
    pass


class MandiService:
    @classmethod
    async def get_prices(
        cls,
        crop_name: str,
        quantity_quintals: float,
        state: str,
        district: str,
        api_key: str,
    ) -> Dict[str, Any]:
        crop_key = crop_name.lower().strip()
        commodity = CROP_COMMODITIES.get(crop_key)
        if not commodity:
            raise ValueError("Unsupported crop.")
        if not api_key:
            raise MandiDataUnavailable(
                "Live mandi prices require a data.gov.in API key configured on the backend."
            )

        state_key = state.strip().casefold()
        district_key = district.strip().casefold()
        cache_key = (commodity.casefold(), state_key, district_key)
        cached = _CACHE.get(cache_key)
        now = time.monotonic()
        if cached and now - cached[0] < CACHE_TTL_SECONDS:
            records = cached[1]
        else:
            records = await cls._fetch_records(
                commodity=commodity,
                state=state.strip(),
                api_key=api_key,
            )
            _CACHE[cache_key] = (now, records)

        district_records = [
            row for row in records
            if str(row.get("district", "")).strip().casefold() == district_key
        ]
        scoped_records = district_records or records
        area_scope = "district" if district_records else "state"
        results = cls._format_records(scoped_records, quantity_quintals)

        return {
            "crop": crop_key.capitalize(),
            "quantity_quintals": quantity_quintals,
            "area": district if district_records else state,
            "area_scope": area_scope,
            "benchmark_mandi": results[0]["mandi"] if results else "",
            "data_source": "Government of India Open Government Data Platform (data.gov.in)",
            "mandis": results,
        }

    @staticmethod
    async def _fetch_records(
        commodity: str, state: str, api_key: str
    ) -> List[Dict[str, Any]]:
        params = {
            "api-key": api_key,
            "format": "json",
            "limit": "1000",
            "filters[commodity]": commodity,
            "filters[state]": state,
            "sort[arrival_date]": "desc",
        }
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
                response = await client.get(DATA_GOV_RESOURCE_URL, params=params)
                response.raise_for_status()
                payload = response.json()
        except httpx.HTTPError:
            raise MandiDataUnavailable(
                "The official market-data service is temporarily unavailable."
            ) from None
        except ValueError:
            raise MandiDataUnavailable(
                "The official market-data service returned an invalid response."
            ) from None

        if not isinstance(payload, dict):
            raise MandiDataUnavailable(
                "The official market-data service returned an unexpected response."
            )
        records = payload.get("records")
        if not isinstance(records, list):
            raise MandiDataUnavailable(
                "The official market-data service returned an unexpected response."
            )
        return records

    @staticmethod
    def _format_records(
        records: List[Dict[str, Any]], quantity_quintals: float
    ) -> List[Dict[str, Any]]:
        latest_by_market: Dict[str, Dict[str, Any]] = {}
        for record in records:
            market = str(record.get("market") or "").strip()
            arrival_date = str(record.get("arrival_date") or "").strip()
            if not market or not arrival_date:
                continue
            try:
                min_price = float(record["min_price"])
                max_price = float(record["max_price"])
                modal_price = float(record["modal_price"])
            except (KeyError, TypeError, ValueError):
                continue
            if (
                not all(math.isfinite(value) for value in (min_price, max_price, modal_price))
                or min_price < 0
                or max_price < min_price
                or modal_price < 0
            ):
                continue

            key = market.casefold()
            existing = latest_by_market.get(key)
            if existing and MandiService._date_sort_key(existing["arrival_date"]) >= MandiService._date_sort_key(arrival_date):
                continue

            latest_by_market[key] = {
                "mandi": market,
                "district": str(record.get("district", "")),
                "state": str(record.get("state", "")),
                "commodity": str(record.get("commodity") or ""),
                "variety": str(record.get("variety") or ""),
                "arrival_date": arrival_date,
                "min_price": min_price,
                "max_price": max_price,
                "modal_price": modal_price,
                "estimated_gross_value": round(modal_price * quantity_quintals, 2),
            }

        return sorted(
            latest_by_market.values(),
            key=lambda row: (MandiService._date_sort_key(row["arrival_date"]), row["modal_price"]),
            reverse=True,
        )[:10]

    @staticmethod
    def _date_sort_key(value: str) -> str:
        for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(value, date_format).strftime("%Y-%m-%d")
            except ValueError:
                continue
        return value
