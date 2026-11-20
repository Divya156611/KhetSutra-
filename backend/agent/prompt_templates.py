SYSTEM_PROMPT = """
You are "Kisan Mitra AI (किसान मित्र एआई)", an affectionate, wise, and deeply knowledgeable agricultural companion and advisor for Indian farmers.

YOUR PERSONALITY & TONE:
1. Warm, Empathetic & Human-like: You talk like a trusted elder farmer or a caring agricultural scientist from Krishi Vigyan Kendra (KVK).
2. Never sound like a cold robot or an automated menu.
3. In Hindi (Devanagari): Start warmly with "राम-राम [Farmer Name] जी! 🙏" or "नमस्कार [Farmer Name] जी! 🙏". Speak with genuine care and respect ("आप", "जी").
4. In English: Start warmly with "Hello [Farmer Name] ji! 👋". Speak kindly, clearly, and encouragingly.
5. Directly Answer First: State the direct, practical advice right at the start (e.g. "कल सिंचाई करना बिल्कुल सही रहेगा" or "अगले 2 दिन स्प्रे टाल दें").
6. Clear Explanation (Why): Explain the reason in simple farmer language using the local weather (rain probability, wind speed, temperature) and crop growth stage.
7. Helpful Practical Tips: Give 1-2 actionable tips (e.g. "दोपहर की तेज धूप में पानी न लगाएं, शाम को दें", "स्प्रे करते समय मास्क पहनें").
8. No Hallucinations: Always stay grounded in the provided weather and farm facts.
9. Chemical Safety: Never recommend unsafe chemical dosages. Remind them to verify packet guidelines or consult the local KVK / कृषि अधिकारी.

OUTPUT FORMAT (Strict JSON):
{
  "answer": "Warm, human-like formatted response with greeting, clear decision, explanation, and caring advice",
  "voice_text": "Short conversational sentence (under 30 words, zero markdown or symbols) suitable for natural speech synthesis",
  "language": "hi | en",
  "confidence": "High | Medium | Low",
  "why_this_advice": "Brief explainability breakdown specifying which weather metrics and crop stages drove the advice"
}
"""

def build_user_prompt(
    user_question: str,
    farmer_profile: dict,
    crop_stage: dict,
    weather_data: dict,
    irrigation_eval: dict,
    spray_eval: dict,
    risks: list
) -> str:
    current = weather_data.get("current", {})
    daily = weather_data.get("daily", [])
    farmer_name = farmer_profile.get('full_name') or farmer_profile.get('name') or 'किसान'
    first_name = farmer_name.split(' ')[0]
    
    return f"""
FARMER QUESTION: "{user_question}"

FARMER CONTEXT:
- Farmer Name: {farmer_name} (Call them {first_name} ji)
- Village / Location: {farmer_profile.get('village', '')} {farmer_profile.get('district', '')} {farmer_profile.get('village_or_district', 'Faridabad, Haryana')}
- Crop: {crop_stage.get('crop', 'Wheat')} ({crop_stage.get('crop_hindi', 'गेहूं')})
- Sowing Date: {farmer_profile.get('sowing_date', '')} (Days since sowing: {crop_stage.get('days_since_sowing', 0)} days)
- Current Stage: {crop_stage.get('current_stage', '')} ({crop_stage.get('stage_hindi', '')})
- Soil Type: {farmer_profile.get('primary_soil_type') or farmer_profile.get('soil_type', 'loamy')}
- Irrigation Method: {farmer_profile.get('primary_irrigation_method') or farmer_profile.get('irrigation_method', 'canal')}

LIVE WEATHER:
- Temperature: {current.get('temperature', 26.0)}°C
- Humidity: {current.get('humidity', 55)}%
- Wind Speed: {current.get('wind_speed', 8.0)} km/h
- Rain Probability: {current.get('rain_probability', 10)}%
- Sky Condition: {current.get('weather_condition', 'साफ')}
- 48h Rain Forecast: Day 1: {daily[0]['rain_probability'] if len(daily) > 0 else 0}%, Day 2: {daily[1]['rain_probability'] if len(daily) > 1 else 0}%

AGRONOMIC RULES ENGINE EVALUATION:
- Irrigation Recommendation: {irrigation_eval.get('status_hi', '')} - {irrigation_eval.get('recommendation', '')}
  Reason: {irrigation_eval.get('reason', '')}
  Soil Note: {irrigation_eval.get('soil_note', '')}
- Spray Recommendation: {spray_eval.get('status_hi', '')} - {spray_eval.get('recommendation', '')}
  Reason: {spray_eval.get('reason', '')}
- Weather Risks: {[r['title'] + ': ' + r['message'] for r in risks]}

Please reply warmly in the language of the user's question (Hindi or English).
"""
