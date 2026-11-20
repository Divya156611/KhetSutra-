from datetime import datetime
from typing import Dict, Any, List

CROPS_DATABASE: Dict[str, Dict[str, Any]] = {
    "wheat": {
        "name_en": "Wheat",
        "name_hi": "गेहूँ",
        "season": "Rabi",
        "season_hi": "रबी",
        "total_duration_days": 135,
        "stages": [
            {
                "stage": "Sowing & Germination",
                "stage_hi": "बुवाई एवं अंकुरण",
                "start_day": 0,
                "end_day": 20,
                "water_need": "Moderate - ensure pre-sowing moisture (Palewa)",
                "water_need_hi": "मध्यम - बुवाई पूर्व पलेवा नमी सुनिश्चित करें",
                "water_sensitivity": "Moderate",
                "advice_hi": "बीज अंकुरण के लिए खेत में पर्याप्त नमी बनाए रखें। जलभराव न होने दें।",
                "advice_en": "Maintain uniform soil moisture for germination. Avoid waterlogging."
            },
            {
                "stage": "Crown Root Initiation (CRI)",
                "stage_hi": "मुकुट जड़ अवस्था (CRI)",
                "start_day": 21,
                "end_day": 40,
                "water_need": "Critical - First irrigation essential if no rain",
                "water_need_hi": "अति संवेदनशील - वर्षा न होने पर पहली सिंचाई अनिवार्य",
                "water_sensitivity": "Critical",
                "advice_hi": "यह सबसे महत्वपूर्ण सिंचाई अवस्था है (CRI)। वर्षा न होने पर तुरंत हल्की सिंचाई करें।",
                "advice_en": "Most critical irrigation stage (21-25 days). Irrigate lightly if no rain is forecast."
            },
            {
                "stage": "Tillering",
                "stage_hi": "कल्ले फूटना (Tillering)",
                "start_day": 41,
                "end_day": 60,
                "water_need": "Moderate to High",
                "water_need_hi": "मध्यम से उच्च नमी",
                "water_sensitivity": "High",
                "advice_hi": "कल्ले फूटने के समय खेत में नमी रहनी चाहिए। खरपतवार नियंत्रण और यूरिया की टॉप ड्रेसिंग करें।",
                "advice_en": "Adequate moisture promotes healthy tillers. Good window for weed management."
            },
            {
                "stage": "Jointing & Stem Elongation",
                "stage_hi": "गांठ बनने की अवस्था (Jointing)",
                "start_day": 61,
                "end_day": 80,
                "water_need": "High",
                "water_need_hi": "उच्च नमी",
                "water_sensitivity": "Moderate",
                "advice_hi": "तने के विकास के समय मिट्टी सूखने न दें। तेज हवा होने पर भारी सिंचाई से बचें ताकि फसल गिरे नहीं।",
                "advice_en": "Maintain soil moisture. Avoid heavy flood irrigation during high winds to prevent lodging."
            },
            {
                "stage": "Flowering & Booting",
                "stage_hi": "बाली निकलना एवं फूल आना (Flowering)",
                "start_day": 81,
                "end_day": 100,
                "water_need": "Critical - Water stress reduces grain count",
                "water_need_hi": "अति संवेदनशील - पानी की कमी से बालियों में दाने घटते हैं",
                "water_sensitivity": "Critical",
                "advice_hi": "फूल आते समय पानी की कमी न होने दें। तेज धूप में दोपहर के समय सिंचाई से बचें।",
                "advice_en": "Critical stage for grain formation. Irrigate in early morning or evening."
            },
            {
                "stage": "Grain Filling & Milking",
                "stage_hi": "दूधिया एवं दाना भराव (Grain Filling)",
                "start_day": 101,
                "end_day": 120,
                "water_need": "Moderate - avoid moisture stress",
                "water_need_hi": "मध्यम - नमी की कमी से बचें",
                "water_sensitivity": "High",
                "advice_hi": "दाने में दूध भरने की अवस्था है। पछुआ हवा और लू से बचाने के लिए हल्की सिंचाई करें।",
                "advice_en": "Grain filling stage. Light irrigation shields crop from early heat stress."
            },
            {
                "stage": "Ripening & Harvest",
                "stage_hi": "पकने की अवस्था एवं कटाई (Maturity & Harvest)",
                "start_day": 121,
                "end_day": 150,
                "water_need": "None - Stop irrigation 10-14 days before harvest",
                "water_need_hi": "शून्य - कटाई से 10-14 दिन पूर्व सिंचाई पूर्णतः बंद करें",
                "water_sensitivity": "None",
                "advice_hi": "सिंचाई पूरी तरह बंद करें। दाना कड़ा होने और 2-3 दिन मौसम साफ रहने पर कटाई करें।",
                "advice_en": "Cease all irrigation. Wait for 2-3 consecutive dry sunny days for harvesting."
            }
        ]
    },
    "rice": {
        "name_en": "Rice (Paddy)",
        "name_hi": "धान",
        "season": "Kharif",
        "season_hi": "खरीफ",
        "total_duration_days": 130,
        "stages": [
            {
                "stage": "Nursery & Transplanting",
                "stage_hi": "नर्सरी एवं रोपाई",
                "start_day": 0,
                "end_day": 25,
                "water_need": "High - Standing water needed",
                "water_need_hi": "उच्च - 2-3 सेमी खड़ा पानी आवश्यक",
                "water_sensitivity": "High",
                "advice_hi": "रोपाई के समय खेत में 2-3 सेमी पानी बनाए रखें।",
                "advice_en": "Maintain 2-3 cm standing water during transplanting."
            },
            {
                "stage": "Active Tillering",
                "stage_hi": "कल्ले निकलना (Tillering)",
                "start_day": 26,
                "end_day": 55,
                "water_need": "High",
                "water_need_hi": "उच्च नमी",
                "water_sensitivity": "High",
                "advice_hi": "खेत में नमी और उथला पानी रखें। कीट व्याधि की निगरानी करें।",
                "advice_en": "Maintain shallow water depth. Scout for leaf folder and stem borer."
            },
            {
                "stage": "Panicle Initiation & Flowering",
                "stage_hi": "बाली बनना एवं फूलना (Panicle Initiation)",
                "start_day": 56,
                "end_day": 95,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील - सूखा न पड़ने दें",
                "water_sensitivity": "Critical",
                "advice_hi": "बाली निकलते समय पानी की कमी बिल्कुल न होने दें।",
                "advice_en": "Moisture stress at flowering causes unfilled grains."
            },
            {
                "stage": "Grain Filling & Maturity",
                "stage_hi": "दाना भराव एवं कटाई",
                "start_day": 96,
                "end_day": 130,
                "water_need": "Low to None",
                "water_need_hi": "कम अथवा शून्य",
                "water_sensitivity": "Low",
                "advice_hi": "कटाई से 10-15 दिन पहले खेत से पानी निकाल दें।",
                "advice_en": "Drain standing water 10-12 days prior to harvest."
            }
        ]
    },
    "mustard": {
        "name_en": "Mustard",
        "name_hi": "सरसों",
        "season": "Rabi",
        "season_hi": "रबी",
        "total_duration_days": 115,
        "stages": [
            {
                "stage": "Vegetative & Branching",
                "stage_hi": "वानस्पतिक वृद्धि एवं शाखाएं",
                "start_day": 0,
                "end_day": 35,
                "water_need": "Moderate",
                "water_need_hi": "मध्यम नमी",
                "water_sensitivity": "Moderate",
                "advice_hi": "बुवाई के 30-35 दिन बाद पहली सिंचाई करें। माहू (Aphids) कीट की निगरानी करें।",
                "advice_en": "First irrigation at 30-35 days. Watch for aphid infestation."
            },
            {
                "stage": "Flowering",
                "stage_hi": "फूल आने की अवस्था",
                "start_day": 36,
                "end_day": 65,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील",
                "water_sensitivity": "Critical",
                "advice_hi": "फूल आते समय पानी की कमी न होने दें। तेज धूप में दोपहर स्प्रे न करें।",
                "advice_en": "Sensitive flowering stage. Avoid daytime chemical sprays to protect bees."
            },
            {
                "stage": "Siliqua / Pod Development",
                "stage_hi": "फलियां बनना (Pod filling)",
                "start_day": 66,
                "end_day": 95,
                "water_need": "Moderate",
                "water_need_hi": "हल्की नमी",
                "water_sensitivity": "High",
                "advice_hi": "फली भरते समय हल्की सिंचाई करें। पाला (Frost) का खतरा होने पर शाम को सिंचाई करें।",
                "advice_en": "Irrigate lightly if frost/freeze warning is issued to raise ambient temperature."
            },
            {
                "stage": "Maturity & Harvest",
                "stage_hi": "परिपक्वता एवं कटाई",
                "start_day": 96,
                "end_day": 120,
                "water_need": "None",
                "water_need_hi": "शून्य",
                "water_sensitivity": "None",
                "advice_hi": "फलियां पीली-भूरी होने पर सुबह के समय कटाई करें ताकि दाना न झड़े।",
                "advice_en": "Harvest when pods turn golden brown, preferably in morning to reduce shattering."
            }
        ]
    },
    "cotton": {
        "name_en": "Cotton",
        "name_hi": "कपास",
        "season": "Kharif",
        "season_hi": "खरीफ",
        "total_duration_days": 160,
        "stages": [
            {
                "stage": "Seedling & Vegetative",
                "stage_hi": "अंकुरण एवं प्रारंभिक विकास",
                "start_day": 0,
                "end_day": 45,
                "water_need": "Moderate",
                "water_need_hi": "मध्यम",
                "water_sensitivity": "Moderate",
                "advice_hi": "जलभराव से बचाएं। कतारों के बीच खरपतवार नियंत्रण करें।",
                "advice_en": "Avoid waterlogging; ensure inter-row weeding."
            },
            {
                "stage": "Squaring & Flowering",
                "stage_hi": "कली एवं फूल आना (Squaring)",
                "start_day": 46,
                "end_day": 90,
                "water_need": "High",
                "water_need_hi": "उच्च नमी",
                "water_sensitivity": "Critical",
                "advice_hi": "फूल और कलियां गिरना रोकने के लिए नमी बनाए रखें। गुलाबी सुंडी पर नजर रखें।",
                "advice_en": "Maintain consistent moisture to prevent boll shedding."
            },
            {
                "stage": "Boll Formation & Bursting",
                "stage_hi": "टिंडे बनना एवं खुलना (Boll Bursting)",
                "start_day": 91,
                "end_day": 160,
                "water_need": "Moderate to Low",
                "water_need_hi": "कम नमी",
                "water_sensitivity": "Moderate",
                "advice_hi": "टिंडे खुलते समय बारिश से बचाएं। धूप में चुनाई करें।",
                "advice_en": "Pick fully burst bolls in dry sunny weather."
            }
        ]
    },
    "maize": {
        "name_en": "Maize (Corn)",
        "name_hi": "मक्का",
        "season": "Kharif",
        "season_hi": "खरीफ",
        "total_duration_days": 105,
        "stages": [
            {
                "stage": "Seedling & Knee-High",
                "stage_hi": "अंकुरण एवं घुटने तक ऊंचाई",
                "start_day": 0,
                "end_day": 30,
                "water_need": "Moderate",
                "water_need_hi": "मध्यम - जलभराव से बचाएं",
                "water_sensitivity": "Moderate",
                "advice_hi": "खेत में उचित जलनिकासी रखें। फॉल आर्मीवर्म (Fall Armyworm) की निगरानी करें।",
                "advice_en": "Ensure proper drainage. Scout for Fall Armyworm in whorls."
            },
            {
                "stage": "Tasseling & Silking",
                "stage_hi": "मंजरी एवं सिल्क निकलना (Tasseling)",
                "start_day": 31,
                "end_day": 65,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील",
                "water_sensitivity": "Critical",
                "advice_hi": "परागकण और भुट्टे में दाना बनने की सबसे महत्वपूर्ण अवस्था। पानी की कमी न होने दें।",
                "advice_en": "Most critical stage for pollination and kernel set. Avoid water deficit."
            },
            {
                "stage": "Dough & Dent Stage",
                "stage_hi": "दाना भराव अवस्था (Grain Filling)",
                "start_day": 66,
                "end_day": 85,
                "water_need": "Moderate",
                "water_need_hi": "मध्यम",
                "water_sensitivity": "High",
                "advice_hi": "दाने सख्त होने तक हल्की नमी बनाए रखें।",
                "advice_en": "Maintain light moisture until kernels dent."
            },
            {
                "stage": "Maturity & Harvest",
                "stage_hi": "परिपक्वता एवं भुट्टा तुड़ाई",
                "start_day": 86,
                "end_day": 105,
                "water_need": "None",
                "water_need_hi": "शून्य",
                "water_sensitivity": "None",
                "advice_hi": "पत्तियां सूखने और दाने में 15-20% नमी रहने पर तुड़ाई करें।",
                "advice_en": "Harvest cobs when husks turn papery brown in dry weather."
            }
        ]
    },
    "sugarcane": {
        "name_en": "Sugarcane",
        "name_hi": "गन्ना",
        "season": "All Season",
        "season_hi": "वार्षिक",
        "total_duration_days": 330,
        "stages": [
            {
                "stage": "Germination Phase",
                "stage_hi": "अंकुरण अवस्था",
                "start_day": 0,
                "end_day": 45,
                "water_need": "High",
                "water_need_hi": "उच्च नमी",
                "water_sensitivity": "High",
                "advice_hi": "टुकड़ों के फुटाव के लिए खेत में हल्की नमी बनी रहनी चाहिए।",
                "advice_en": "Keep soil moist for healthy sett bud emergence."
            },
            {
                "stage": "Tillering & Formative Phase",
                "stage_hi": "कल्ले निकलना एवं प्रारंभिक बढ़वार",
                "start_day": 46,
                "end_day": 120,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील",
                "water_sensitivity": "Critical",
                "advice_hi": "गर्मियों में 8-10 दिन के अंतराल पर सिंचाई करें। तना छेदक कीट की रोकथाम करें।",
                "advice_en": "Irrigate at 8-10 day intervals during peak summer. Control shoot borer."
            },
            {
                "stage": "Grand Growth Phase",
                "stage_hi": "तीव्र बढ़वार अवस्था (Grand Growth)",
                "start_day": 121,
                "end_day": 250,
                "water_need": "High",
                "water_need_hi": "उच्च",
                "water_sensitivity": "Moderate",
                "advice_hi": "गन्ने की बंधाई (Trashing & Propping) करें ताकि तेज हवा में गिरे नहीं।",
                "advice_en": "Carry out tying and propping to prevent lodging during monsoon winds."
            },
            {
                "stage": "Ripening & Harvest",
                "stage_hi": "शर्करा परिपक्वता एवं कटाई",
                "start_day": 251,
                "end_day": 330,
                "water_need": "None - Stop water 20 days prior",
                "water_need_hi": "शून्य - कटाई से 20 दिन पूर्व पानी बंद",
                "water_sensitivity": "Low",
                "advice_hi": "कटाई से 20-25 दिन पहले सिंचाई बंद करें जिससे चीनी की मात्रा (Brix) बढ़े।",
                "advice_en": "Withhold irrigation 20-25 days before harvest to concentrate sucrose."
            }
        ]
    },
    "potato": {
        "name_en": "Potato",
        "name_hi": "आलू",
        "season": "Rabi",
        "season_hi": "रबी",
        "total_duration_days": 100,
        "stages": [
            {
                "stage": "Sprouting & Vegetative",
                "stage_hi": "अंकुरण एवं वानस्पतिक वृद्धि",
                "start_day": 0,
                "end_day": 25,
                "water_need": "Moderate",
                "water_need_hi": "मध्यम",
                "water_sensitivity": "Moderate",
                "advice_hi": "हल्की सिंचाई करें। आलू के कंद पानी में न डूबें। मिट्टी चढ़ाई (Earthing-up) करें।",
                "advice_en": "Light watering; earth up soil around plants to prevent greening of tubers."
            },
            {
                "stage": "Tuber Initiation & Bulking",
                "stage_hi": "कंद बनना एवं आकार बढ़ना (Tuber Bulking)",
                "start_day": 26,
                "end_day": 75,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील - समान नमी जरूरी",
                "water_sensitivity": "Critical",
                "advice_hi": "नमी का असंतुलन आलू फटने का कारण बनता है। झुलसा रोग (Late Blight) की निगरानी रखें।",
                "advice_en": "Even moisture prevents tuber cracking. Watch for Late Blight symptoms."
            },
            {
                "stage": "Maturation & Dehaulming",
                "stage_hi": "परिपक्वता एवं बेल कटाई (Dehaulming)",
                "start_day": 76,
                "end_day": 100,
                "water_need": "None",
                "water_need_hi": "शून्य",
                "water_sensitivity": "None",
                "advice_hi": "खुदाई से 10-12 दिन पहले बेल काट दें (Dehaulming) ताकि छिलका सख्त हो सके।",
                "advice_en": "Cut haulms 10-12 days before digging to cure and harden tuber skin."
            }
        ]
    },
    "chickpea": {
        "name_en": "Chickpea (Gram)",
        "name_hi": "चना",
        "season": "Rabi",
        "season_hi": "रबी",
        "total_duration_days": 115,
        "stages": [
            {
                "stage": "Branching & Vegetative",
                "stage_hi": "शाखाएं निकलना (Branching)",
                "start_day": 0,
                "end_day": 40,
                "water_need": "Low to Moderate",
                "water_need_hi": "कम से मध्यम",
                "water_sensitivity": "Low",
                "advice_hi": "चना कम पानी की फसल है। अधिक पानी देने से बढ़वार ज्यादा और फूल कम आते हैं।",
                "advice_en": "Chickpea requires minimal water; excess moisture leads to vegetative overgrowth."
            },
            {
                "stage": "Flowering & Pod Setting",
                "stage_hi": "फूल आना एवं घेंटी बनना (Pod Setting)",
                "start_day": 41,
                "end_day": 80,
                "water_need": "Critical",
                "water_need_hi": "संवेदनशील - फूल खिलते समय सिंचाई से बचें",
                "water_sensitivity": "Critical",
                "advice_hi": "फूल खिलते समय सिंचाई न करें (फूल झड़ सकते हैं)। घेंटी बनते समय हल्की सिंचाई लाभप्रद है। फली छेदक (Helicoverpa) पर नजर रखें।",
                "advice_en": "Avoid irrigation during full bloom. Light irrigation during pod development. Monitor pod borer."
            },
            {
                "stage": "Maturity & Harvest",
                "stage_hi": "परिपक्वता एवं कटाई",
                "start_day": 81,
                "end_day": 115,
                "water_need": "None",
                "water_need_hi": "शून्य",
                "water_sensitivity": "None",
                "advice_hi": "पौधे पीले पड़ने और दाने सूखने पर धूप वाले दिन कटाई करें।",
                "advice_en": "Harvest when plants turn straw-yellow and seeds rattle inside pods."
            }
        ]
    },
    "tomato": {
        "name_en": "Tomato",
        "name_hi": "टमाटर",
        "season": "Zaid",
        "season_hi": "जायद / सर्वऋतु",
        "total_duration_days": 110,
        "stages": [
            {
                "stage": "Transplanting & Vegetative",
                "stage_hi": "रोपाई एवं वानस्पतिक वृद्धि",
                "start_day": 0,
                "end_day": 30,
                "water_need": "Moderate",
                "water_need_hi": "मध्यम",
                "water_sensitivity": "Moderate",
                "advice_hi": "रोपाई के बाद नियमित हल्की सिंचाई करें। सहारा (Staking) दें।",
                "advice_en": "Provide regular light watering and plant staking."
            },
            {
                "stage": "Flowering & Fruit Setting",
                "stage_hi": "फूल एवं फल बनना",
                "start_day": 31,
                "end_day": 70,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील",
                "water_sensitivity": "Critical",
                "advice_hi": "नमी का असंतुलन फल फटने का कारण बन सकता है। नियमित ड्रिप या हल्की सिंचाई करें।",
                "advice_en": "Inconsistent moisture causes blossom end rot and fruit cracking."
            },
            {
                "stage": "Fruit Ripening & Harvesting",
                "stage_hi": "फल पकना एवं तुड़ाई",
                "start_day": 71,
                "end_day": 110,
                "water_need": "Moderate",
                "water_need_hi": "कम",
                "water_sensitivity": "Moderate",
                "advice_hi": "तुड़ाई से 2 दिन पहले सिंचाई बंद करें ताकि फल की शेल्फ लाइफ बनी रहे।",
                "advice_en": "Withhold water 2 days before plucking to extend shelf life."
            }
        ]
    },
    "onion": {
        "name_en": "Onion",
        "name_hi": "प्याज",
        "season": "Rabi",
        "season_hi": "रबी",
        "total_duration_days": 125,
        "stages": [
            {
                "stage": "Transplanting & Rooting",
                "stage_hi": "रोपाई एवं जड़ स्थापना",
                "start_day": 0,
                "end_day": 30,
                "water_need": "High",
                "water_need_hi": "उच्च नमी",
                "water_sensitivity": "Moderate",
                "advice_hi": "रोपाई के तुरंत बाद हल्की सिंचाई करें।",
                "advice_en": "Light irrigation immediately post-transplanting."
            },
            {
                "stage": "Bulb Initiation & Development",
                "stage_hi": "गांठ बनना एवं बढ़वार",
                "start_day": 31,
                "end_day": 90,
                "water_need": "Critical",
                "water_need_hi": "अति संवेदनशील",
                "water_sensitivity": "Critical",
                "advice_hi": "गांठ बनते समय पानी की कमी न होने दें। 7-10 दिन के अंतराल पर सिंचाई करें।",
                "advice_en": "Critical for bulb sizing. Irrigate at 7-10 day intervals."
            },
            {
                "stage": "Maturity & Neck Fall (Harvest)",
                "stage_hi": "परिपक्वता एवं पत्तियों का गिरना (कटाई)",
                "start_day": 91,
                "end_day": 125,
                "water_need": "None",
                "water_need_hi": "शून्य",
                "water_sensitivity": "None",
                "advice_hi": "पत्तियां झुकने पर सिंचाई पूरी तरह बंद करें। 10-15 दिन बाद खुदाई करें।",
                "advice_en": "Stop irrigation when 50% tops fall. Dig out after 10-15 days in dry weather."
            }
        ]
    }
}

SOIL_CHARACTERISTICS: Dict[str, Dict[str, str]] = {
    "sandy": {
        "drainage": "Very fast",
        "drainage_hi": "अति तीव्र जल रिसाव",
        "water_retention": "Low",
        "water_retention_hi": "कम जल धारण क्षमता",
        "advice_hi": "बलुई मिट्टी में पानी तेजी से रिसता है और नमी जल्दी सूखती है। हल्की और जल्दी-जल्दी सिंचाई करें।",
        "advice_en": "Sandy soil drains rapidly with low water holding capacity. Frequent, lighter irrigations are recommended."
    },
    "loamy": {
        "drainage": "Well-drained (Optimal)",
        "drainage_hi": "उत्तम जल निकास",
        "water_retention": "Medium to High (Ideal for crops)",
        "water_retention_hi": "मध्यम से उच्च (आदर्श)",
        "advice_hi": "दोमट मिट्टी खेती के लिए सबसे उपयुक्त है। इसमें नमी और वायु का संतुलन अच्छा रहता है।",
        "advice_en": "Loamy soil has ideal water retention and aeration. Standard irrigation schedule works well."
    },
    "clay": {
        "drainage": "Slow",
        "drainage_hi": "धीमी जल निकासी",
        "water_retention": "Very High",
        "water_retention_hi": "अत्यधिक जल धारण क्षमता",
        "advice_hi": "चिकनी मिट्टी में पानी देर तक ठहरता है। भारी बारिश में जलभराव का खतरा रहता है। उचित जल निकासी जरूरी है।",
        "advice_en": "Clay soil retains water for a long time. Prone to waterlogging; ensure proper drainage after rains."
    },
    "black": {
        "drainage": "Slow to Moderate",
        "drainage_hi": "धीमा से मध्यम",
        "water_retention": "High (Regur Soil)",
        "water_retention_hi": "उच्च (रेगुर मिट्टी)",
        "advice_hi": "काली मिट्टी नमी को लंबे समय तक रोक कर रखती है। सूखने पर दरारें पड़ती हैं। अधिक पानी देने से बचें।",
        "advice_en": "Black soil has high moisture retention and swells when wet. Avoid excessive flood irrigation."
    },
    "unknown": {
        "drainage": "Moderate assumption",
        "drainage_hi": "सामान्य अनुमान",
        "water_retention": "Moderate",
        "water_retention_hi": "मध्यम अनुमान",
        "advice_hi": "सामान्य दोमट मिट्टी मानकर सलाह दी जा रही है। खेत की ऊपरी 5 सेमी मिट्टी की नमी स्वयं जांचें।",
        "advice_en": "Assumed standard loamy conditions. Farmers should manually check top 5 cm soil moisture."
    }
}

SEASONAL_INTELLIGENCE: Dict[str, Dict[str, Any]] = {
    "Rabi": {
        "name_en": "Rabi Season (Winter Crops)",
        "name_hi": "रबी मौसम (शीतकालीन फसलें)",
        "months_en": "October to April",
        "months_hi": "अक्टूबर से अप्रैल",
        "primary_crops": ["wheat", "mustard", "chickpea", "potato", "onion"],
        "phases": {
            "pre_sowing": {
                "title_en": "Pre-Sowing Land Preparation",
                "title_hi": "बुवाई पूर्व खेत की तैयारी",
                "advice_en": "Carry out deep summer ploughing. Apply well-decomposed FYM (Farm Yard Manure) @ 8-10 tonnes/acre. Ensure soil moisture testing (Palewa irrigation) prior to seeding. Reference: ICAR-IARI Agronomy Guidelines.",
                "advice_hi": "गहरी जुताई कर पाटा लगाएं। प्रति एकड़ 8-10 टन गोबर की सड़ी खाद मिलाएं। बुवाई से पूर्व पलेवा सिंचाई कर नमी स्तर जांचें। (संदर्भ: भारतीय कृषि अनुसंधान परिषद - ICAR)"
            },
            "sowing": {
                "title_en": "Optimal Sowing Window & Seed Treatment",
                "title_hi": "उचित बुवाई समय एवं बीज उपचार",
                "advice_en": "Treat seeds with Trichoderma viride @ 4g/kg seed or Azotobacter for enhanced nitrogen fixing. Maintain recommended row spacing (e.g., 20-22 cm for wheat, 45 cm for mustard).",
                "advice_hi": "बीज को ट्राईकोडर्मा विरिडी (4 ग्राम/किग्रा) या एज़ोटोबैक्टर कल्चर से उपचारित करें। कतार से कतार की उचित दूरी (गेहूं: 20-22 सेमी, सरसों: 45 सेमी) रखें।"
            },
            "vegetative": {
                "title_en": "Vegetative Nutrient & Weed Management",
                "title_hi": "वानस्पतिक बढ़वार, पोषण एवं खरपतवार प्रबंधन",
                "advice_en": "Split application of Nitrogen (Urea) at first irrigation. Weed management within 30-35 days using mechanical hoeing or ICAR recommended selective herbicides. Scout for cutworms and aphids.",
                "advice_hi": "प्रथम सिंचाई के साथ यूरिया की पहली टॉप-ड्रेसिंग करें। 30-35 दिनों के भीतर निराई-गुड़ाई कर खरपतवार निकालें। माहू (चेपा) कीट की निगरानी करें।"
            },
            "flowering": {
                "title_en": "Critical Reproductive & Cold Stress Monitoring",
                "title_hi": "फूल अवस्था, पाला एवं तापमान प्रबंधन",
                "advice_en": "Ensure critical moisture at boot/flowering stage. If mercury dips below 4°C, perform light evening irrigation to safeguard blossoms from frost injury. Avoid midday foliar sprays.",
                "advice_hi": "बाली/फूल आते समय नमी बनाए रखें। तापमान 4°C से कम होने पर पाले से बचाव हेतु शाम को हल्की सिंचाई करें। दोपहर की धूप में स्प्रे न करें।"
            },
            "harvesting": {
                "title_en": "Dry-Window Harvest & Safe Storage",
                "title_hi": "मौसम आधारित कटाई एवं सुरक्षित भंडारण",
                "advice_en": "Monitor for 3 consecutive rain-free sunny days before harvesting. Dry grain until moisture drops below 12% to prevent fungal attack and storage weevils in godowns.",
                "advice_hi": "कटाई से पूर्व 3 दिन मौसम सूखा रहने का पूर्वानुमान देखें। अनाज में नमी 12% से कम होने तक सुखाएं ताकि घुन व फफूंद न लगे।"
            }
        }
    },
    "Kharif": {
        "name_en": "Kharif Season (Monsoon Crops)",
        "name_hi": "खरीफ मौसम (मानसूनी फसलें)",
        "months_en": "June to November",
        "months_hi": "जून से नवंबर",
        "primary_crops": ["rice", "cotton", "maize"],
        "phases": {
            "pre_sowing": {
                "title_en": "Monsoon Preparation & Field Bunding",
                "title_hi": "मानसून तैयारी एवं खेत की मेड़बन्दी",
                "advice_en": "Strengthen farm bunds to conserve rainwater. Ensure field drainage channels are clear to prevent waterlogging during heavy downpours. Test soil pH and organic carbon.",
                "advice_hi": "वर्षा जल संचयन के लिए मेड़ों को मजबूत करें। भारी बारिश में जलभराव रोकने के लिए जलनिकासी नाले साफ रखें।"
            },
            "sowing": {
                "title_en": "Sowing with Monsoon Arrival",
                "title_hi": "मानसून आगमन पर बुवाई",
                "advice_en": "Sow when monsoon brings at least 50-60 mm cumulative rainfall. Treat seeds against seed-borne pathogens. Maintain ridge and furrow sowing for maize and cotton to resist root rot.",
                "advice_hi": "खेत में कम से कम 50-60 मिमी बारिश होने पर ही बुवाई करें। कपास व मक्के की बुवाई मेड़ों (रिड्ज) पर करें जिससे जड़ सड़न न हो।"
            },
            "vegetative": {
                "title_en": "Weed Flush & Pest Early Warning",
                "title_hi": "खरपतवार नियंत्रण एवं कीट पूर्व चेतावनी",
                "advice_en": "Warm humid conditions favor stem borers and leaf folders. Maintain balanced NPK without over-applying Nitrogen, which invites sucking pests. Implement pheromone traps.",
                "advice_hi": "उमस भरे मौसम में तना छेदक व पत्ती लपेटक का प्रकोप बढ़ता है। अत्यधिक यूरिया न दें। फेरोमोन ट्रैप लगाएं।"
            },
            "flowering": {
                "title_en": "Pollination Protection & Water Drainage",
                "title_hi": "परागण सुरक्षा एवं जल निकासी",
                "advice_en": "Continuous waterlogging during flowering causes flower drop. Drain stagnant water within 24 hours of heavy downpour.",
                "advice_hi": "फूल आते समय खेत में पानी जमा न होने दें। मूसलाधार बारिश के बाद 24 घंटे में अतिरिक्त पानी बाहर निकालें।"
            },
            "harvesting": {
                "title_en": "Post-Monsoon Harvest & Threshing",
                "title_hi": "मानसून उपरांत कटाई एवं मड़ाई",
                "advice_en": "Check regional IMD forecast to avoid harvesting immediately before late cyclonic storms. Cover harvested sheaves in mandis with waterproof tarpaulins.",
                "advice_hi": "पश्चिमी विक्षोभ या बेमौसम बारिश से पूर्व कटी फसल तिरपाल से ढकें। दाना झड़ने से पहले सुबह के समय कटाई करें।"
            }
        }
    },
    "Zaid": {
        "name_en": "Zaid Season (Summer Crops)",
        "name_hi": "जायद मौसम (ग्रीष्मकालीन फसलें)",
        "months_en": "March to June",
        "months_hi": "मार्च से जून",
        "primary_crops": ["tomato", "watermelon", "cucumber", "fodder"],
        "phases": {
            "pre_sowing": {
                "title_en": "Summer Field Preparation",
                "title_hi": "ग्रीष्मकालीन खेत तैयारी",
                "advice_en": "Prepare raised nursery beds or drip irrigation lines. Organic mulching with straw reduces soil evaporation by up to 40%.",
                "advice_hi": "उठी हुई क्यारियां या ड्रिप लाइन तैयार करें। पुआल की मल्चिंग (Mulching) करने से 40% तक नमी बचती है।"
            },
            "sowing": {
                "title_en": "Early Summer Sowing",
                "title_hi": "शीघ्र ग्रीष्म बुवाई",
                "advice_en": "Sow early in March to complete flowering before peak May heatwave. Use heat-tolerant cultivars.",
                "advice_hi": "मार्च के प्रथम सप्ताह में बुवाई पूरी करें ताकि मई की भीषण लू से पूर्व फल बन सकें। गर्मी रोधी किस्में चुनें।"
            },
            "vegetative": {
                "title_en": "Frequent Light Irrigation & Heat Stress Shielding",
                "title_hi": "हल्की सिंचाई एवं लू से बचाव",
                "advice_en": "Irrigate during cooler evening or early morning hours. Apply potassium nitrate (13:0:45) spray @ 1% to boost drought resilience.",
                "advice_hi": "सिंचाई केवल सुबह 6-9 बजे या शाम 5 बजे के बाद करें। लू से पत्तियों को बचाने के लिए 1% पोटाशियम नाइट्रेट का छिड़काव करें।"
            },
            "flowering": {
                "title_en": "Heat Abatement in Bloom",
                "title_hi": "फूल अवस्था में तापमान नियंत्रण",
                "advice_en": "Temperatures exceeding 38°C cause flower desiccation. Keep micro-sprinklers running for 15 minutes during midday if available.",
                "advice_hi": "38°C से अधिक तापमान पर फूल सूखते हैं। यदि स्प्रिंकलर उपलब्ध हों तो दोपहर में 15 मिनट सूक्ष्म छिड़काव करें।"
            },
            "harvesting": {
                "title_en": "Morning Plucking & Cool Storage",
                "title_hi": "सुबह की तुड़ाई एवं छायादार भंडारण",
                "advice_en": "Harvest fruits/produce in early dawn hours while produce is cool. Avoid direct sun exposure before transit to local mandi.",
                "advice_hi": "फलों की तुड़ाई तड़के सुबह करें जब तापमान कम हो। मंडी भेजने से पहले छायादार स्थान पर रखें।"
            }
        }
    }
}

def detect_season(crop_name: str, sowing_date_str: str) -> str:
    crop_key = crop_name.lower().strip()
    if crop_key in CROPS_DATABASE:
        return CROPS_DATABASE[crop_key].get("season", "Rabi")
    try:
        dt = datetime.strptime(sowing_date_str, "%Y-%m-%d")
        month = dt.month
        if 6 <= month <= 10:
            return "Kharif"
        elif 3 <= month <= 5:
            return "Zaid"
        else:
            return "Rabi"
    except Exception:
        return "Rabi"

def calculate_crop_stage(crop_name: str, sowing_date_str: str) -> Dict[str, Any]:
    crop_key = crop_name.lower().strip()
    if crop_key not in CROPS_DATABASE:
        crop_key = "wheat"
    
    crop_info = CROPS_DATABASE[crop_key]
    
    try:
        sowing_date = datetime.strptime(sowing_date_str, "%Y-%m-%d")
    except Exception:
        sowing_date = datetime.now()
        
    days_elapsed = max(0, (datetime.now() - sowing_date).days)
    
    stages = crop_info["stages"]
    current_stage = stages[-1]
    next_stage = None
    next_stage_in_days = 0
    progress_percentage = min(100, int((days_elapsed / max(1, crop_info["total_duration_days"])) * 100))
    
    for idx, s in enumerate(stages):
        if s["start_day"] <= days_elapsed <= s["end_day"]:
            current_stage = s
            if idx + 1 < len(stages):
                next_stage = stages[idx + 1]["stage"]
                next_stage_in_days = max(1, stages[idx + 1]["start_day"] - days_elapsed)
            break
            
    return {
        "crop": crop_info["name_en"],
        "crop_hindi": crop_info["name_hi"],
        "season": crop_info["season"],
        "season_hindi": crop_info["season_hi"],
        "total_duration_days": crop_info["total_duration_days"],
        "progress_percentage": progress_percentage,
        "sowing_date": sowing_date_str,
        "days_since_sowing": days_elapsed,
        "current_stage": current_stage["stage"],
        "stage_hindi": current_stage["stage_hi"],
        "stage_description": current_stage["advice_hi"],
        "stage_description_en": current_stage["advice_en"],
        "stage_water_need": current_stage["water_need"],
        "stage_water_need_hi": current_stage.get("water_need_hi", current_stage["water_need"]),
        "stage_water_sensitivity": current_stage["water_sensitivity"],
        "next_stage": next_stage,
        "next_stage_in_days": next_stage_in_days,
        "all_stages": stages
    }
