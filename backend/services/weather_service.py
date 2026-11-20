import httpx
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, Optional

# Pre-defined coordinates for fast lookup & offline safety
DISTRICT_COORDINATES: Dict[str, Tuple[float, float]] = {
    "faridabad": (28.4089, 77.3178),
    "karnal": (29.6857, 76.9905),
    "gurugram": (28.4595, 77.0266),
    "delhi": (28.6139, 77.2090),
    "ludhiana": (30.9010, 75.8573),
    "jaipur": (26.9124, 75.7873),
    "bhopal": (23.2599, 77.4126),
    "lucknow": (26.8467, 80.9462),
    "varanasi": (25.3176, 82.9739),
    "patna": (25.5941, 85.1376),
    "pune": (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
    "chandigarh": (30.7333, 76.7794)
}

# WMO Weather interpretation codes
WMO_CODE_MAP: Dict[int, Tuple[str, str, str]] = {
    0: ("Clear sky", "साफ मौसम", "sun"),
    1: ("Mainly clear", "मुख्यतः साफ", "sun"),
    2: ("Partly cloudy", "आंशिक बादल", "cloud-sun"),
    3: ("Overcast", "घने बादल", "cloud"),
    45: ("Foggy", "कोहरा", "cloud-fog"),
    48: ("Depositing rime fog", "घना कोहरा", "cloud-fog"),
    51: ("Light drizzle", "हल्की बूंदाबांदी", "cloud-drizzle"),
    53: ("Moderate drizzle", "मध्यम बूंदाबांदी", "cloud-drizzle"),
    55: ("Dense drizzle", "तेज बूंदाबांदी", "cloud-drizzle"),
    61: ("Slight rain", "हल्की बारिश", "cloud-rain"),
    63: ("Moderate rain", "मध्यम बारिश", "cloud-rain"),
    65: ("Heavy rain", "भारी बारिश", "cloud-rain-heavy"),
    71: ("Slight snow", "हल्की बर्फबारी", "snowflake"),
    73: ("Moderate snow", "मध्यम बर्फबारी", "snowflake"),
    75: ("Heavy snow", "भारी बर्फबारी", "snowflake"),
    80: ("Slight rain showers", "हल्की बौछारें", "cloud-rain"),
    81: ("Moderate rain showers", "मध्यम बौछारें", "cloud-rain"),
    82: ("Violent rain showers", "मूसलाधार बारिश", "cloud-lightning"),
    95: ("Thunderstorm", "गरज-चमक के साथ बारिश", "cloud-lightning"),
    96: ("Thunderstorm with slight hail", "आंधी और ओलावृष्टि", "cloud-lightning-rain"),
    99: ("Thunderstorm with heavy hail", "भारी ओलावृष्टि", "cloud-lightning-rain")
}

# In-memory cache: (cache_key) -> (timestamp, data)
_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 900 # 15 minutes

class WeatherService:
    @staticmethod
    async def get_coordinates(location_name: str) -> Tuple[float, float, str]:
        loc_lower = (location_name or "").lower()
        for dist, coords in DISTRICT_COORDINATES.items():
            if dist in loc_lower:
                return coords[0], coords[1], location_name

        normalized = loc_lower.split(",")[0].strip()

        # Geocoding via Open-Meteo
        try:
            timeout_cfg = httpx.Timeout(2.5, connect=2.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                url = f"https://geocoding-api.open-meteo.com/v1/search?name={normalized}&count=1&language=en&format=json"
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("results") and len(data["results"]) > 0:
                        first = data["results"][0]
                        resolved_name = f"{first.get('name')}, {first.get('admin1', first.get('country', ''))}"
                        return first["latitude"], first["longitude"], resolved_name
        except Exception:
            pass

        # Fallback to Faridabad, Haryana
        return 28.4089, 77.3178, location_name or "Faridabad, Haryana"

    @classmethod
    async def get_forecast(cls, location: str = "Faridabad, Haryana", days: int = 7) -> Dict[str, Any]:
        cache_key = f"forecast_{location.lower().strip()}_{days}"
        now = time.time()
        
        if cache_key in _CACHE:
            ts, cached_data = _CACHE[cache_key]
            if now - ts < CACHE_TTL_SECONDS:
                return cached_data

        lat, lon, resolved_loc = await cls.get_coordinates(location)

        try:
            timeout_cfg = httpx.Timeout(2.5, connect=2.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                url = (
                    f"https://api.open-meteo.com/v1/forecast?"
                    f"latitude={lat}&longitude={lon}&"
                    f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,is_day&"
                    f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&"
                    f"forecast_days={min(days, 14)}&timezone=Asia%2FKolkata"
                )
                response = await client.get(url)
                if response.status_code == 200:
                    raw = response.json()
                    parsed = cls._parse_open_meteo_response(raw, resolved_loc)
                    _CACHE[cache_key] = (now, parsed)
                    return parsed
        except Exception:
            pass

        demo_data = cls._generate_fallback_weather(resolved_loc, days)
        _CACHE[cache_key] = (now, demo_data)
        return demo_data

    @staticmethod
    def _parse_open_meteo_response(raw: Dict[str, Any], location: str) -> Dict[str, Any]:
        current_raw = raw.get("current", {})
        daily_raw = raw.get("daily", {})

        current_code = current_raw.get("weather_code", 0)
        cond_en, cond_hi, icon = WMO_CODE_MAP.get(current_code, ("Clear", "साफ", "sun"))

        current = {
            "temperature": round(current_raw.get("temperature_2m", 26.0), 1),
            "apparent_temperature": round(current_raw.get("apparent_temperature", 27.0), 1),
            "humidity": int(current_raw.get("relative_humidity_2m", 55)),
            "wind_speed": round(current_raw.get("wind_speed_10m", 8.5), 1),
            "wind_direction": int(current_raw.get("wind_direction_10m", 0)),
            "rain_probability": int(daily_raw.get("precipitation_probability_max", [10])[0] if daily_raw.get("precipitation_probability_max") else 10),
            "precipitation": round(current_raw.get("precipitation", 0.0), 1),
            "weather_condition": cond_hi,
            "weather_condition_en": cond_en,
            "weather_icon": icon,
            "is_day": current_raw.get("is_day", 1),
            "updated_at": datetime.now().strftime("%I:%M %p, %d %b %Y")
        }

        daily_list = []
        dates = daily_raw.get("time", [])
        weather_codes = daily_raw.get("weather_code", [])
        t_max = daily_raw.get("temperature_2m_max", [])
        t_min = daily_raw.get("temperature_2m_min", [])
        precip = daily_raw.get("precipitation_sum", [])
        rain_prob = daily_raw.get("precipitation_probability_max", [])
        wind_max = daily_raw.get("wind_speed_10m_max", [])

        for i in range(len(dates)):
            wcode = weather_codes[i] if i < len(weather_codes) else 0
            w_en, w_hi, w_icon = WMO_CODE_MAP.get(wcode, ("Clear", "साफ", "sun"))
            date_obj = datetime.strptime(dates[i], "%Y-%m-%d")
            day_name = "Today" if i == 0 else ("Tomorrow" if i == 1 else date_obj.strftime("%A"))
            
            p_prob = int(rain_prob[i]) if i < len(rain_prob) and rain_prob[i] is not None else 10
            p_sum = round(precip[i], 1) if i < len(precip) and precip[i] is not None else 0.0
            w_wind = round(wind_max[i], 1) if i < len(wind_max) and wind_max[i] is not None else 8.0

            # Generate crop implication for each day
            if p_prob >= 50 or p_sum >= 5.0:
                crop_implication = f"बारिश की संभावना ({p_prob}%). सिंचाई और कीटनाशक छिड़काव स्थगित करें।"
            elif w_wind >= 16.0:
                crop_implication = f"तेज हवाएं ({w_wind} km/h). स्प्रे करने से बचें (दवा उड़ने का खतरा)।"
            elif (t_max[i] if i < len(t_max) else 30.0) >= 36.0:
                crop_implication = "तीव्र गर्मी. दोपहर की सिंचाई से बचें, केवल सुबह या शाम पानी दें।"
            else:
                crop_implication = "मौसम अनुकूल है. सामान्य कृषि कार्य व हल्की सिंचाई की जा सकती है।"

            daily_list.append({
                "date": dates[i],
                "day_name": day_name,
                "temp_max": round(t_max[i], 1) if i < len(t_max) else 30.0,
                "temp_min": round(t_min[i], 1) if i < len(t_min) else 18.0,
                "rain_probability": p_prob,
                "precipitation_sum": p_sum,
                "wind_speed_max": w_wind,
                "humidity_mean": 55,
                "weather_condition": w_hi,
                "weather_icon": w_icon,
                "crop_implication": crop_implication
            })

        return {
            "location": location,
            "current": current,
            "daily": daily_list,
            "is_demo": False
        }

    @staticmethod
    def _generate_fallback_weather(location: str, days: int) -> Dict[str, Any]:
        """Provides realistic fallback demo data if external network is unavailable."""
        now = datetime.now()
        current = {
            "temperature": 27.5,
            "apparent_temperature": 28.2,
            "humidity": 58,
            "wind_speed": 9.2,
            "wind_direction": 110,
            "rain_probability": 15,
            "precipitation": 0.0,
            "weather_condition": "हल्के बादल / साफ (Demo)",
            "weather_condition_en": "Partly Cloudy (Demo)",
            "weather_icon": "sun",
            "is_day": 1,
            "updated_at": now.strftime("%I:%M %p, %d %b %Y") + " (Demo Mode)"
        }

        daily = []
        for i in range(days):
            d = now + timedelta(days=i)
            day_name = "Today" if i == 0 else ("Tomorrow" if i == 1 else d.strftime("%A"))
            rain_prob = 15 if i != 2 else 65
            precip = 0.0 if i != 2 else 8.5
            wind = 8.5 if i != 1 else 18.0

            if rain_prob >= 50:
                implication = "संभावित बारिश. सिंचाई रोकें एवं जलभराव से बचाव करें।"
                condition = "बारिश की संभावना"
                icon = "cloud-rain"
            elif wind >= 16:
                implication = "तेज पछुआ हवा. रासायनिक छिड़काव न करें।"
                condition = "तेज हवाएं"
                icon = "wind"
            else:
                implication = "मौसम साफ व अनुकूल है. नियमित कृषि कार्य कर सकते हैं।"
                condition = "साफ एवं धूप"
                icon = "sun"

            daily.append({
                "date": d.strftime("%Y-%m-%d"),
                "day_name": day_name,
                "temp_max": 29.5 + (i % 3),
                "temp_min": 17.0 + (i % 2),
                "rain_probability": rain_prob,
                "precipitation_sum": precip,
                "wind_speed_max": wind,
                "humidity_mean": 55,
                "weather_condition": condition,
                "weather_icon": icon,
                "crop_implication": implication
            })

        return {
            "location": location + " (Demo)",
            "current": current,
            "daily": daily,
            "is_demo": True
        }
