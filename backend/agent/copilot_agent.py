import json
import re
import httpx
from typing import Dict, Any, List

try:
    from backend.config import settings
    from backend.services.weather_service import WeatherService
    from backend.services.crop_data import calculate_crop_stage, SOIL_CHARACTERISTICS
    from backend.services.agronomy_rules import AgronomyRulesEngine
    from backend.tools.farm_tools import generate_rule_based_answer
    from backend.agent.prompt_templates import SYSTEM_PROMPT, build_user_prompt
except ImportError:
    from config import settings
    from services.weather_service import WeatherService
    from services.crop_data import calculate_crop_stage, SOIL_CHARACTERISTICS
    from services.agronomy_rules import AgronomyRulesEngine
    from tools.farm_tools import generate_rule_based_answer
    from agent.prompt_templates import SYSTEM_PROMPT, build_user_prompt

def parse_llm_json(raw_text: str) -> Dict[str, Any]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned.strip())

class CopilotAgent:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def run(
        self,
        user_message: str,
        farmer_profile: Dict[str, Any],
        language_hint: str = None
    ) -> Dict[str, Any]:
        tools_used: List[str] = []

        # Step 1: Resolve context tools
        location = farmer_profile.get("village_or_district", "Faridabad, Haryana")
        crop = farmer_profile.get("crop", "wheat")
        sowing_date = farmer_profile.get("sowing_date", "2024-11-10")
        soil_type = farmer_profile.get("soil_type", "loamy")
        irrigation_method = farmer_profile.get("irrigation_method", "canal")

        # Step 2: Call Tools
        # Tool: get_weather_forecast
        weather_data = await WeatherService.get_forecast(location, days=7)
        tools_used.append("get_weather_forecast")

        # Tool: get_crop_stage
        crop_stage = calculate_crop_stage(crop, sowing_date)
        tools_used.append("get_crop_stage")

        # Tool: get_soil_information
        soil_info = SOIL_CHARACTERISTICS.get(soil_type.lower(), SOIL_CHARACTERISTICS["loamy"])
        tools_used.append("get_soil_information")

        # Tool: calculate_irrigation_advice
        irrigation_eval = AgronomyRulesEngine.evaluate_irrigation(
            weather_data, crop_stage, soil_type, irrigation_method
        )
        tools_used.append("calculate_irrigation_advice")

        # Tool: calculate_spray_advice
        spray_eval = AgronomyRulesEngine.evaluate_spray(weather_data, crop_stage)
        tools_used.append("calculate_spray_advice")

        # Tool: calculate_weather_risks
        risks = AgronomyRulesEngine.evaluate_weather_risks(weather_data, crop_stage)
        tools_used.append("calculate_weather_risks")

        # Step 3: LLM Generation or Fallback
        context = {
            "weather": weather_data,
            "crop_stage": crop_stage,
            "soil_info": soil_info,
            "irrigation_advice": irrigation_eval,
            "spray_advice": spray_eval,
            "risks": risks,
            "farmer_profile": farmer_profile
        }

        response_dict = None

        # Attempt Gemini API if a real key is provided
        if self.gemini_key and not any(placeholder in self.gemini_key.lower() for placeholder in ["your_", "example", "placeholder"]):
            try:
                response_dict = await self._call_gemini(user_message, farmer_profile, context)
            except Exception:
                response_dict = None

        # Attempt OpenAI if Gemini wasn't used or failed
        if not response_dict and self.openai_key and not any(placeholder in self.openai_key.lower() for placeholder in ["your_", "example", "placeholder"]):
            try:
                response_dict = await self._call_openai(user_message, farmer_profile, context)
            except Exception:
                response_dict = None

        # Warm, human-like deterministic agricultural expert answer
        if not response_dict:
            detected_lang = language_hint or farmer_profile.get("language", "hi")
            response_dict = generate_rule_based_answer(user_message, context, detected_lang)

        # Caring agricultural safety note
        is_hindi = response_dict.get("language", "hi") == "hi"
        disclaimer = (
            "⚠️ किसान सुरक्षा सूचना: यह सलाह मौसम डेटा और फसल अवस्था मॉडल पर आधारित है। रासायनिक उपचार या खाद देने से पहले स्थानीय कृषि विज्ञान केंद्र (KVK) से मार्गदर्शन लें।"
            if is_hindi else
            "⚠️ Farmer Safety Note: This advice is computed from real-time weather and crop-stage agronomic models. Always confirm chemical dosage with your local KVK or agricultural officer."
        )

        return {
            "answer": response_dict.get("answer", "सलाह तैयार नहीं हो सकी।"),
            "voice_text": response_dict.get("voice_text", "कृपया अपनी फसल की स्थिति का नियमित निरीक्षण करें।"),
            "language": response_dict.get("language", "hi"),
            "confidence": response_dict.get("confidence", "High"),
            "why_this_advice": response_dict.get("why_this_advice", "मौसम एवं फसल अवस्था के विश्लेषण पर आधारित।"),
            "tools_used": tools_used,
            "weather_updated_at": weather_data.get("current", {}).get("updated_at", "अभी"),
            "disclaimer": disclaimer
        }

    async def _call_gemini(self, question: str, profile: dict, context: dict) -> Dict[str, Any]:
        prompt = build_user_prompt(
            question,
            profile,
            context["crop_stage"],
            context["weather"],
            context["irrigation_advice"],
            context["spray_advice"],
            context["risks"]
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": SYSTEM_PROMPT + "\n\n" + prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return parse_llm_json(raw_text)
        return None

    async def _call_openai(self, question: str, profile: dict, context: dict) -> Dict[str, Any]:
        prompt = build_user_prompt(
            question,
            profile,
            context["crop_stage"],
            context["weather"],
            context["irrigation_advice"],
            context["spray_advice"],
            context["risks"]
        )
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(f"{settings.OPENAI_BASE_URL}/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["choices"][0]["message"]["content"]
                return parse_llm_json(raw_text)
        return None
