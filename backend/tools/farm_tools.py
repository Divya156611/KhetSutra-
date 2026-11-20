import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from backend.services.weather_service import WeatherService
    from backend.services.crop_data import calculate_crop_stage, SOIL_CHARACTERISTICS, CROPS_DATABASE
    from backend.services.agronomy_rules import AgronomyRulesEngine
except ImportError:
    from services.weather_service import WeatherService
    from services.crop_data import calculate_crop_stage, SOIL_CHARACTERISTICS, CROPS_DATABASE
    from services.agronomy_rules import AgronomyRulesEngine

# Tool 1: get_weather_forecast(location, days)
async def get_weather_forecast(location: str, days: int = 7) -> Dict[str, Any]:
    return await WeatherService.get_forecast(location, days)

# Tool 2: get_current_weather(location)
async def get_current_weather(location: str) -> Dict[str, Any]:
    forecast = await WeatherService.get_forecast(location, 1)
    return {
        "location": forecast.get("location"),
        "current": forecast.get("current"),
        "is_demo": forecast.get("is_demo", False)
    }

# Tool 3: get_crop_stage(crop, sowing_date, current_date=None)
def get_crop_stage(crop: str, sowing_date: str, current_date: Optional[str] = None) -> Dict[str, Any]:
    return calculate_crop_stage(crop, sowing_date)

# Tool 4: get_soil_information(soil_type)
def get_soil_information(soil_type: str) -> Dict[str, Any]:
    key = soil_type.lower().strip()
    return SOIL_CHARACTERISTICS.get(key, SOIL_CHARACTERISTICS["unknown"])

# Tool 5: get_crop_advisory(crop, crop_stage)
def get_crop_advisory(crop: str, crop_stage: str) -> Dict[str, Any]:
    crop_key = crop.lower().strip()
    crop_info = CROPS_DATABASE.get(crop_key, CROPS_DATABASE.get("wheat", {}))
    stages = crop_info.get("stages", [])
    matching = next((s for s in stages if crop_stage.lower() in s["stage"].lower()), None)
    if not matching and len(stages) > 0:
        matching = stages[0]
        
    return {
        "crop": crop_info.get("name_en", crop),
        "stage": matching.get("stage") if matching else crop_stage,
        "water_need": matching.get("water_need") if matching else "Normal",
        "advice_hi": matching.get("advice_hi") if matching else "नियमित निगरानी रखें।",
        "advice_en": matching.get("advice_en") if matching else "Maintain regular scouting."
    }

# Tool 6: calculate_irrigation_advice(weather_data, crop_stage, soil_type, irrigation_method)
def calculate_irrigation_advice(
    weather_data: Dict[str, Any],
    crop_stage: Dict[str, Any],
    soil_type: str = "loamy",
    irrigation_method: str = "canal"
) -> Dict[str, Any]:
    return AgronomyRulesEngine.evaluate_irrigation(weather_data, crop_stage, soil_type, irrigation_method)

# Tool 7: calculate_spray_advice(weather_data, crop_stage)
def calculate_spray_advice(
    weather_data: Dict[str, Any],
    crop_stage: Dict[str, Any]
) -> Dict[str, Any]:
    return AgronomyRulesEngine.evaluate_spray(weather_data, crop_stage)

# Tool 8: calculate_weather_risks(weather_data, crop_stage)
def calculate_weather_risks(
    weather_data: Dict[str, Any],
    crop_stage: Dict[str, Any]
) -> List[Dict[str, Any]]:
    return AgronomyRulesEngine.evaluate_weather_risks(weather_data, crop_stage)

# Tool 9: generate_daily_briefing(farm_profile, weather_data, crop_stage)
def generate_daily_briefing(
    farm_profile: Dict[str, Any],
    weather_data: Dict[str, Any],
    crop_stage: Dict[str, Any]
) -> Dict[str, Any]:
    return AgronomyRulesEngine.generate_daily_briefing(farm_profile, weather_data, crop_stage)

# Tool 10: generate_answer(user_question, context)
def generate_rule_based_answer(user_question: str, context: Dict[str, Any], language: str = "hi") -> Dict[str, Any]:
    q_lower = user_question.lower()
    weather = context.get("weather", {})
    current_w = weather.get("current", {})
    crop_st = context.get("crop_stage", {})
    irr_adv = context.get("irrigation_advice", {})
    spray_adv = context.get("spray_advice", {})
    risks = context.get("risks", [])
    farmer_profile = context.get("farmer_profile", {})
    
    # Extract farmer friendly name
    farmer_name = farmer_profile.get("full_name") or farmer_profile.get("name") or "किसान"
    # Take first name for warm addressing
    first_name = farmer_name.split()[0].replace("(", "").replace(")", "").strip()
    
    crop_name_hi = crop_st.get("crop_hindi", "गेहूं")
    crop_name_en = crop_st.get("crop", "Wheat").capitalize()
    stage_hi = crop_st.get("stage_hindi", crop_st.get("current_stage", "वृद्धि अवस्था"))
    stage_en = crop_st.get("current_stage", "Growth Stage")

    temp = current_w.get("temperature", 26.0)
    rain_p = current_w.get("rain_probability", 10)
    wind = current_w.get("wind_speed", 8.0)
    condition_hi = current_w.get("weather_condition", "साफ धूप")

    # Detect if user is asking in Hindi or English
    has_devanagari = any('\u0900' <= char <= '\u097F' for char in user_question)
    is_hindi = has_devanagari or language == "hi"

    # Category 1: Irrigation / Water / Sinchai
    if any(k in q_lower for k in ["irrigate", "paani", "pani", "sinchai", "water", "irrigation", "सिंचाई", "पानी", "पलेवा"]):
        irr_rec = irr_adv.get("recommendation", "")
        irr_reason = irr_adv.get("reason", "")
        soil_note = irr_adv.get("soil_note", "")
        
        if is_hindi:
            ans = (
                f"राम-राम {first_name} जी! 🙏\n\n"
                f"**सलाह:** कल आपकी **{crop_name_hi}** की फसल में {irr_rec}\n\n"
                f"**ऐसा क्यों करना चाहिए?**\n"
                f"• {irr_reason}\n"
                f"• आगामी 24 घंटों में बारिश की संभावना केवल **{rain_p}%** है और हवा **{wind} km/h** चल रही है।\n"
                f"• आपकी फसल अभी **{stage_hi}** में है, जहाँ नमी संतुलित रखना उपज के लिए बहुत आवश्यक है।\n\n"
                f"💡 **विशेष देखभाल सुझाव:** {soil_note} दोपहर की तेज धूप के समय पानी न लगाएं; सुबह जल्दी या शाम 4 बजे के बाद क्यारियां भरें।"
            )
            voice = f"राम-राम {first_name} जी, कल {crop_name_hi} में {irr_rec} क्योंकि बारिश की संभावना केवल {rain_p} प्रतिशत है।"
            why = f"वर्षा संभावना {rain_p}%, हवा गति {wind} km/h, और फसल अवस्था {stage_hi} के आधार पर।"
        else:
            ans = (
                f"Hello {first_name} ji! 👋\n\n"
                f"**Recommendation:** For your **{crop_name_en}** crop, {irr_rec}\n\n"
                f"**Why this decision?**\n"
                f"• {irr_reason}\n"
                f"• Expected rain probability in your area is only **{rain_p}%** with steady winds of **{wind} km/h**.\n"
                f"• The crop is currently in **{stage_en}**, where adequate root moisture is vital for healthy tillering.\n\n"
                f"💡 **Practical Farm Tip:** {soil_note} Avoid watering during midday heat; early morning or late afternoon application prevents soil crusting."
            )
            voice = f"Hello {first_name} ji, {irr_rec} for your {crop_name_en} since rain chance is just {rain_p} percent."
            why = f"Driven by rain probability {rain_p}%, wind speed {wind} km/h, and growth stage {stage_en}."
        confidence = "High"

    # Category 2: Spraying / Pesticide / Fungicide / Keetnashak
    elif any(k in q_lower for k in ["spray", "keetnashak", "dawa", "pesticide", "fungicide", "chhidkaw", "कीटनाशक", "दवा", "स्प्रे", "छिड़काव"]):
        spray_rec = spray_adv.get("recommendation", "")
        spray_reason = spray_adv.get("reason", "")
        
        if is_hindi:
            ans = (
                f"राम-राम {first_name} जी! 🙏\n\n"
                f"**स्प्रे सलाह:** आपकी **{crop_name_hi}** के लिए {spray_rec}\n\n"
                f"**कारण:**\n"
                f"• {spray_reason}\n"
                f"• वर्तमान हवा की गति **{wind} km/h** है (सुरक्षित सीमा: 15 km/h से कम) और बारिश का खतरा केवल **{rain_p}%** है।\n\n"
                f"⚠️ **सुरक्षा सुझाव:** हमेशा अनुशंसित मात्रा ही उपयोग करें। तेज हवा में स्प्रे न करें और मुंह पर मास्क या गमछा अवश्य बांधें।"
            )
            voice = f"राम-राम {first_name} जी, स्प्रे के लिए सलाह: {spray_rec} हवा की गति {wind} किलोमीटर प्रति घंटा है।"
            why = f"हवा की गति {wind} km/h और वर्षा जोखिम {rain_p}% के संयुक्त मूल्यांकन पर आधारित।"
        else:
            ans = (
                f"Hello {first_name} ji! 👋\n\n"
                f"**Spray Recommendation:** For your **{crop_name_en}**, {spray_rec}\n\n"
                f"**Rationale:**\n"
                f"• {spray_reason}\n"
                f"• Wind speed is currently **{wind} km/h** (ideal threshold: < 15 km/h) with rain probability at **{rain_p}%**.\n\n"
                f"⚠️ **Farmer Safety:** Always stick to labeled dosages, spray during calm morning hours, and wear protective face covering."
            )
            voice = f"Hello {first_name} ji, spray advisory: {spray_rec} Wind speed is {wind} km/h."
            why = f"Calculated from wind speed {wind} km/h and rain probability {rain_p}%."
        confidence = "High"

    # Category 3: Weather & Rain Forecast
    elif any(k in q_lower for k in ["rain", "baarish", "barish", "cloud", "badal", "mosam", "weather", "forecast", "मौसम", "बारिश", "पानी गिरेगा", "तापमान"]):
        if is_hindi:
            ans = (
                f"राम-राम {first_name} जी! 🙏\n\n"
                f"**आज का मौसम विवरण ({condition_hi}):**\n"
                f"• तापमान: **{temp}°C** (सुखद व सामान्य)\n"
                f"• बारिश की संभावना: **{rain_p}%**\n"
                f"• हवा की गति: **{wind} km/h**\n\n"
                f"**खेत पर इसका असर:**\n"
                f"आने वाले 48 घंटों में भारी बारिश का कोई अंदेशा नहीं है। आप बेझिझक खेत की गुड़ाई, खाद छिड़काव या हल्की सिंचाई का कार्य पूरा कर सकते हैं।"
            )
            voice = f"राम-राम {first_name} जी, आज तापमान {temp} डिग्री और बारिश की संभावना {rain_p} प्रतिशत है. मौसम साफ रहेगा."
            why = f"स्थानीय मौसम स्टेशन एवं ओपन-मेटियो 7-दिवसीय पूर्वानुमान मॉडल पर आधारित।"
        else:
            ans = (
                f"Hello {first_name} ji! 👋\n\n"
                f"**Current Farm Weather Report:**\n"
                f"• Temperature: **{temp}°C**\n"
                f"• Rain Probability: **{rain_p}%**\n"
                f"• Wind Speed: **{wind} km/h**\n"
                f"• Sky Condition: **{current_w.get('weather_condition', 'Clear & Sunny')}**\n\n"
                f"**Impact on Farm Operations:**\n"
                f"No disruptive rainfall is forecasted over the next 48 hours. Field operations such as weeding, light irrigation, or fertilizing can proceed safely."
            )
            voice = f"Hello {first_name} ji, temperature is {temp} degrees with {rain_p} percent rain probability. Weather is favorable."
            why = f"Sourced from live Open-Meteo agronomic weather telemetry."
        confidence = "High"

    # Category 4: Harvesting / Katai
    elif any(k in q_lower for k in ["harvest", "katai", "katayi", "cutting", "कटाई", "काटना"]):
        if is_hindi:
            ans = (
                f"राम-राम {first_name} जी! 🙏\n\n"
                f"आपकी **{crop_name_hi}** अभी **{stage_hi}** अवस्था में है।\n\n"
                f"**कटाई संबंधी परामर्श:**\n"
                f"• फसल अभी परिपक्वता की ओर बढ़ रही है। सामान्यतः इस अवस्था में कटाई में कुछ सप्ताह का समय शेष है।\n"
                f"• जब 80-85% बालियां सुनहरी-भूरी हो जाएं और दानों में नमी 12-14% रह जाए, तभी कटाई शुरू करें।\n"
                f"• कटाई से 10-12 दिन पहले सिंचाई पूरी तरह बंद कर दें ताकि दाने सुदृढ़ बनें।"
            )
            voice = f"राम-राम {first_name} जी, {crop_name_hi} अभी {stage_hi} में है. कटाई के लिए दानों के 80 प्रतिशत सुनहरे होने की प्रतीक्षा करें."
            why = f"फसल आयु एवं {stage_hi} विकास अवस्था के आधार पर परिपक्वता विश्लेषण।"
        else:
            ans = (
                f"Hello {first_name} ji! 👋\n\n"
                f"Your **{crop_name_en}** is currently at **{stage_en}**.\n\n"
                f"**Harvest Guidance:**\n"
                f"• The crop is progressing through its growth cycle; harvest will be optimal once grains reach physiological maturity.\n"
                f"• Initiate harvesting when 80–85% of ears turn golden-yellow and grain moisture drops below 14%.\n"
                f"• Discontinue irrigation 10–12 days prior to harvesting to promote uniform drying."
            )
            voice = f"Hello {first_name} ji, your {crop_name_en} is in {stage_en}. Harvest when grains turn 80 percent golden yellow."
            why = f"Calculated from sowing date duration and physiological maturity index."
        confidence = "High"

    # Category 5: Fertilizer / Khad / Nutrition / Disease
    elif any(k in q_lower for k in ["khad", "urea", "dap", "fertilizer", "nutrition", "keeda", "rog", "peela", "खाद", "यूरिया", "रोग", "कीट", "पीला"]):
        if is_hindi:
            ans = (
                f"राम-राम {first_name} जी! 🙏\n\n"
                f"**{crop_name_hi} पोषण एवं रोग नियंत्रण परामर्श:**\n\n"
                f"• **खाद प्रबंधन:** वर्तमान **{stage_hi}** पर यदि नाइट्रोजन (यूरिया) की टॉप-ड्रेसिंग शेष है, तो सिंचाई के समय संतुलित मात्रा में दें।\n"
                f"• **पत्तियों का पीलापन जांच:** यदि निचली पत्तियां पीली पड़ रही हैं तो यह नाइट्रोजन की कमी या अधिक जलभराव का संकेत हो सकता है।\n"
                f"• **कीट निरीक्षण:** खेत में सुबह के समय माहू (एफिड) या इल्ली के लक्षणों की जांच करें।"
            )
            voice = f"राम-राम {first_name} जी, {crop_name_hi} के {stage_hi} पर संतुलित खाद दें और पत्तियों के पीलेपन की निगरानी रखें."
            why = f"फसल अवस्था {stage_hi} के लिए अनुशंसित आईसीएआर पोषण कैलेंडर।"
        else:
            ans = (
                f"Hello {first_name} ji! 👋\n\n"
                f"**{crop_name_en} Nutrition & Crop Health Advisory:**\n\n"
                f"• **Fertilizer Dose:** At **{stage_en}**, apply top-dressed urea only in split doses with light irrigation.\n"
                f"• **Yellowing Leaves:** If lower foliage shows yellowing, evaluate whether it is nitrogen deficiency or temporary water stagnation.\n"
                f"• **Pest Scouting:** Scout field borders early in the morning for aphid or borer emergence."
            )
            voice = f"Hello {first_name} ji, apply split fertilizer at {stage_en} and inspect field borders for pests."
            why = f"Aligned with ICAR-recommended stage nutrition guidelines."
        confidence = "High"

    # Default / General Question
    else:
        if is_hindi:
            ans = (
                f"राम-राम {first_name} जी! 🙏\n\n"
                f"मैं आपका **किसान मित्र एआई (Kisan Mitra AI)** हूँ। मैंने आपके खेत और फसल का विवरण देखा है:\n\n"
                f"• आपकी मुख्य फसल: **{crop_name_hi}** (अवस्था: **{stage_hi}**)\n"
                f"• आज का तापमान: **{temp}°C**, बारिश का अनुमान: **{rain_p}%**\n"
                f"• सिंचाई स्थिति: {irr_adv.get('recommendation', 'खेत की नमी अनुसार हल्की सिंचाई करें।')}\n"
                f"• स्प्रे स्थिति: {spray_adv.get('recommendation', 'मौसम अनुकूल है।')}\n\n"
                f"आप मुझसे सिंचाई, खाद-स्प्रे, कटाई, मौसम पूर्वानुमान या मंडी भाव संबंधी कोई भी सवाल पूछ सकते हैं।"
            )
            voice = f"राम-राम {first_name} जी, मैं हूँ आपका किसान मित्र एआई. आपकी फसल {stage_hi} में सुरक्षित है."
            why = f"दैनिक समग्र कृषि और मौसम विश्लेषण।"
        else:
            ans = (
                f"Hello {first_name} ji! 👋\n\n"
                f"I am your **Kisan Mitra AI**. Here is the live status of your farm:\n\n"
                f"• Primary Crop: **{crop_name_en}** (Stage: **{stage_en}**)\n"
                f"• Weather: **{temp}°C**, Rain Probability: **{rain_p}%**\n"
                f"• Irrigation: {irr_adv.get('recommendation', 'Maintain adequate root zone moisture.')}\n"
                f"• Spray: {spray_adv.get('recommendation', 'Current conditions are calm and favorable.')}\n\n"
                f"Feel free to ask me anything about irrigation schedules, spray timing, fertilizer dosage, harvest readiness, or market prices!"
            )
            voice = f"Hello {first_name} ji, I am your Kisan Mitra AI. Your {crop_name_en} crop is in healthy condition."
            why = f"Composite agricultural and meteorological status."
        confidence = "High"

    return {
        "answer": ans,
        "voice_text": voice,
        "language": "hi" if is_hindi else "en",
        "confidence": confidence,
        "why_this_advice": why
    }
