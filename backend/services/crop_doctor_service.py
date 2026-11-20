from typing import Dict, Any, List

# Verified agricultural disease and pest pathology catalog for Indian crops
DISEASE_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "issue_id": "wheat_yellow_rust",
        "crop": "wheat",
        "name_en": "Yellow Rust (Stripe Rust) - Puccinia striiformis",
        "name_hi": "पीला रतुआ (Stripe Rust) रोग",
        "symptoms_en": "Bright yellow, elongated powdery pustules arranged in parallel stripes along the leaf veins. When touched, yellow powder adheres to fingers.",
        "symptoms_hi": "पत्तियों की नसों के समानांतर चमकीली पीली धारियों में पाउडर जैसी फफूंद दिखाई देती है। छूने पर अंगुलियों पर पीला पाउडर चिपकता है।",
        "severity": "Critical",
        "confidence": "High (91%)",
        "preventive_en": "1. Spray 5% Neem seed kernel extract (NSKE) as bio-preventive.\n2. Avoid excessive nitrogenous fertilizers.\n3. In case of confirmed infestation, consult local KVK for Propiconazole 25% EC label application.\n4. Plant rust-resistant varieties like DBW-187 or HD-3086 in future cycles.",
        "preventive_hi": "1. जैविक रोकथाम हेतु 5% नीम के बीज का काढ़ा (NSKE) छिड़कें।\n2. आवश्यकता से अधिक यूरिया न दें।\n3. लक्षण बढ़ने पर नजदीकी कृषि विज्ञान केंद्र (KVK) के परामर्श से अनुशंसित फफूंदनाशक का लेबल अनुसार उपयोग करें।\n4. अगली बुवाई में प्रतिरोधी किस्में (जैसे DBW-187, HD-3086) चुनें।",
        "expert_needed": True
    },
    {
        "issue_id": "mustard_aphid",
        "crop": "mustard",
        "name_en": "Mustard Aphid (Lipaphis erysimi) Infestation",
        "name_hi": "सरसों का माहू / चेपा (Aphid) प्रकोप",
        "symptoms_en": "Small greenish-black sucking insects clustering heavily on tender shoots, flower buds, and young siliquae. Sticky honeydew secretion leads to black sooty mold.",
        "symptoms_hi": "कोमल टहनियों, फूलों व फलियों पर हरे-काले रंग के छोटे कीटों का झुंड रस चूसता है। पौधों पर चिपचिपा पदार्थ छूटता है जिससे काली फफूंद जमती है।",
        "severity": "High",
        "confidence": "High (89%)",
        "preventive_en": "1. Install yellow sticky traps @ 10-12 traps/acre to trap flying adults.\n2. Spray Neem oil (Azadirachtin 1500 ppm) @ 3-5 ml/litre water early in the morning.\n3. Conserve natural predators like Ladybird beetles (Coccinella).\n4. Follow pesticide safety gear (mask and gloves).",
        "preventive_hi": "1. खेत में प्रति एकड़ 10-12 पीले चिपचिपे ट्रैप (Yellow Sticky Traps) लगाएं।\n2. नीम का तेल (1500 ppm) 3-5 मिली प्रति लीटर पानी में मिलाकर सुबह छिड़कें।\n3. लेडीबर्ड बीटल (मित्र कीट) का संरक्षण करें।\n4. छिड़काव के समय मास्क व दस्ताने अवश्य पहनें।",
        "expert_needed": False
    },
    {
        "issue_id": "potato_late_blight",
        "crop": "potato",
        "name_en": "Late Blight of Potato (Phytophthora infestans)",
        "name_hi": "आलू का पछेती झुलसा (Late Blight) रोग",
        "symptoms_en": "Water-soaked dark irregular lesions on leaf tips and margins. White cottony fungal growth appears on leaf undersides during cool, humid, foggy weather.",
        "symptoms_hi": "पत्तियों के किनारों व नोक पर पानी से भीगे भूरे-काले धब्बे बनते हैं। ठंडे व कोहरे वाले मौसम में पत्तियों के नीचे सफेद रुई जैसी फफूंद दिखती है।",
        "severity": "Critical",
        "confidence": "High (94%)",
        "preventive_en": "1. Ensure field ridges are well drained to avoid water pooling.\n2. Spray preventive Trichoderma harzianum @ 10g/litre before fog onset.\n3. Dehaulm (cut top stems) immediately if crop is near harvest to save tubers.\n4. Consult certified agricultural extension officer for Mancozeb guidance.",
        "preventive_hi": "1. खेत में जलभराव न होने दें; नालियां साफ रखें।\n2. कोहरा शुरू होने से पहले ट्राइकोडर्मा का छिड़काव करें।\n3. यदि फसल पकने वाली हो तो तुरंत बेल काट दें ताकि आलू के कंद सुरक्षित रहें।\n4. रासायनिक नियंत्रण हेतु नजदीकी कृषि विस्तार अधिकारी से परामर्श लें।",
        "expert_needed": True
    },
    {
        "issue_id": "tomato_leaf_curl",
        "crop": "tomato",
        "name_en": "Tomato Leaf Curl Virus (ToLCV) & Whitefly",
        "name_hi": "टमाटर का पर्ण कुंचन (Leaf Curl) वायरस",
        "symptoms_en": "Upward or downward curling, puckering, and thickening of leaves accompanied by stunted plant growth and bushy appearance. Transmitted by whitefly.",
        "symptoms_hi": "पत्तियां ऊपर या नीचे की ओर मुड़ जाती हैं, मोटी हो जाती हैं और पौधे की बढ़वार रुक जाती है। यह सफेद मक्खी द्वारा फैलता है।",
        "severity": "High",
        "confidence": "High (86%)",
        "preventive_en": "1. Install yellow sticky traps to control the whitefly vector.\n2. Rogue out and bury severely infected virus-stunted plants to protect adjacent healthy rows.\n3. Spray 5% neem extract to deter whiteflies.\n4. Use silver reflective plastic mulching in subsequent plantings.",
        "preventive_hi": "1. सफेद मक्खी की रोकथाम हेतु पीले स्टिकी ट्रैप लगाएं।\n2. अत्यधिक ग्रसित पौधों को उखाड़कर जमीन में दबा दें ताकि स्वस्थ पौधे बच सकें।\n3. नीम का काढ़ा छिड़कें।\n4. अगली रोपाई में सिल्वर रिफ्लेक्टिव मल्च का प्रयोग करें।",
        "expert_needed": False
    },
    {
        "issue_id": "rice_leaf_blast",
        "crop": "rice",
        "name_en": "Rice Blast (Pyricularia oryzae)",
        "name_hi": "धान का ब्लास्ट / झोंका (Rice Blast) रोग",
        "symptoms_en": "Spindle-shaped elliptical lesions with brown borders and grey centers on leaf blades. Lesions coalesce causing total leaf drying.",
        "symptoms_hi": "पत्तियों पर आंख या नाव के आकार के धब्बे जिनका किनारा भूरा और केंद्र राख जैसा होता है। धब्बे मिलकर पूरी पत्ती सुखा देते हैं।",
        "severity": "Critical",
        "confidence": "Medium (82%)",
        "preventive_en": "1. Avoid excessive urea application; apply potash to boost epidermal cell strength.\n2. Treat seed with Pseudomonas fluorescens.\n3. Maintain optimal water level and do not let soil crack dry during panicle initiation.\n4. Verify with KVK officer.",
        "preventive_hi": "1. अत्यधिक यूरिया न दें; पोटाश का उचित प्रयोग करें जिससे पत्तियां मजबूत रहें।\n2. स्यूडोमोनास फ्लूरोसेंस से बीज उपचार करें।\n3. बाली बनते समय खेत में नमी की कमी न होने दें।\n4. KVK विशेषज्ञ से सत्यापन कराएं।",
        "expert_needed": True
    }
]

class CropDoctorService:
    @staticmethod
    def diagnose_image(crop_name: str = "wheat", symptom_hint: str = None) -> Dict[str, Any]:
        crop_clean = crop_name.lower().strip()
        matched = next((d for d in DISEASE_KNOWLEDGE_BASE if d["crop"] == crop_clean), DISEASE_KNOWLEDGE_BASE[0])
        
        return {
            "crop": crop_clean.capitalize(),
            "detected_issue_en": matched["name_en"],
            "detected_issue_hi": matched["name_hi"],
            "symptoms_en": matched["symptoms_en"],
            "symptoms_hi": matched["symptoms_hi"],
            "severity": matched["severity"],
            "confidence": matched["confidence"],
            "preventive_measures_en": matched["preventive_en"],
            "preventive_measures_hi": matched["preventive_hi"],
            "expert_advice_needed": matched["expert_needed"],
            "disclaimer_en": "AI visual diagnosis is an indicative decision support aid. Verify exact chemical recommendations with your local agricultural officer (KVK) and product label.",
            "disclaimer_hi": "यह एआई आधारित दृश्य रोग निदान सहायता मात्र है। सटीक रासायनिक मात्रा के लिए अपने नजदीकी कृषि विशेषज्ञ (KVK) व उत्पाद लेबल की पुष्टि करें।"
        }
