from typing import Dict, Any, List

GOVERNMENT_SCHEMES: List[Dict[str, Any]] = [
    {
        "scheme_code": "PM-KISAN",
        "name_en": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
        "ministry": "Ministry of Agriculture & Farmers Welfare, GoI",
        "benefit_amount": "₹6,000 / year (in 3 equal installments of ₹2,000)",
        "description_en": "Direct income support of ₹6,000 per year transferred directly into the bank accounts of eligible landholder farmer families.",
        "description_hi": "पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष वित्तीय सहायता, जो ₹2,000 की तीन समान किस्तों में सीधे बैंक खाते में भेजी जाती है।",
        "eligibility_en": "All landholding farmer families having cultivable landholding in their names. Institutional landholders and high income taxpayers are excluded.",
        "eligibility_hi": "खेती योग्य भूमि के मालिक सभी किसान परिवार। संस्थागत भूस्वामी व आयकर दाता परिवार अपात्र हैं।",
        "documents_en": "Aadhaar Card, Land ownership document (Khasra/Khatauni), Bank passbook, Aadhaar-linked active mobile number.",
        "documents_hi": "आधार कार्ड, भूमि दस्तावेज (खसरा/खतौनी), बैंक पासबुक, आधार लिंक मोबाइल नंबर।",
        "official_url": "https://pmkisan.gov.in",
        "last_verified": "November 2026"
    },
    {
        "scheme_code": "PMFBY",
        "name_en": "Pradhan Mantri Fasal Bima Yojana (Crop Insurance)",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
        "ministry": "Ministry of Agriculture & Farmers Welfare, GoI",
        "benefit_amount": "Comprehensive insurance coverage against non-preventable natural risks",
        "description_en": "Provides financial support to farmers suffering crop loss/damage arising out of unforeseen natural calamities like droughts, floods, and unseasonal rains.",
        "description_hi": "बाढ़, सूखा, बेमौसम बारिश व प्राकृतिक आपदाओं से फसल नुकसान पर किसानों को व्यापक वित्तीय सुरक्षा व बीमा क्षतिपूर्ति।",
        "eligibility_en": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas are eligible.",
        "eligibility_hi": "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान (बटाईदार व किरायेदार किसान भी पात्र)।",
        "documents_en": "Land registry/record, Sowing Certificate (Patwari report), Aadhaar Card, Bank account details, Identity proof.",
        "documents_hi": "भूमि की नकल, बुवाई प्रमाण पत्र (पटवारी रिपोर्ट), आधार कार्ड, बैंक खाता पासबुक।",
        "official_url": "https://pmfby.gov.in",
        "last_verified": "November 2026"
    },
    {
        "scheme_code": "KCC",
        "name_en": "Kisan Credit Card (KCC) Scheme",
        "name_hi": "किसान क्रेडिट कार्ड (KCC)",
        "ministry": "Reserve Bank of India & NABARD",
        "benefit_amount": "Concessional institutional credit up to ₹3,00,000 at 4% effective interest",
        "description_en": "Ensures farmers have timely access to short-term formal credit for purchasing seeds, fertilizers, pesticides, and meeting harvesting expenses at low interest rates.",
        "description_hi": "बीज, खाद, कीटनाशक व कृषि खर्चों के लिए 4% की रियायती ब्याज दर पर ₹3 लाख तक का आसान फसली ऋण।",
        "eligibility_en": "Individual/joint borrowers who are owner cultivators, tenant farmers, oral lessees & sharecroppers, as well as SHGs.",
        "eligibility_hi": "खेती करने वाले किसान, बटाईदार, पट्टेदार व स्वयं सहायता समूह (SHG)।",
        "documents_en": "Application form, Identity proof (Voter ID/Aadhaar), Land records with cropping pattern, Passport size photograph.",
        "documents_hi": "ऋण आवेदन पत्र, पहचान पत्र (आधार/वोटर कार्ड), राजस्व भूमि अभिलेख (जमाबंदी), पासपोर्ट फोटो।",
        "official_url": "https://agricoop.nic.in",
        "last_verified": "November 2026"
    },
    {
        "scheme_code": "PMKSY",
        "name_en": "Per Drop More Crop - PMKSY (Micro-Irrigation Subsidy)",
        "name_hi": "प्रति बूंद अधिक फसल - PMKSY (ड्रिप/स्प्रिंकलर सब्सिडी)",
        "ministry": "Department of Agriculture, Cooperation & Farmers Welfare",
        "benefit_amount": "Up to 45% - 55% financial subsidy on drip and sprinkler installation",
        "description_en": "Promotes micro-irrigation systems to improve on-farm water use efficiency, reduce electricity consumption and boost crop yield per drop.",
        "description_hi": "ड्रिप एवं स्प्रिंकलर सिंचाई यंत्र लगाने पर 45% से 55% तक का सरकारी अनुदान (सब्सिडी)।",
        "eligibility_en": "Farmers possessing valid land ownership and an assured water source (borewell/canal/well).",
        "eligibility_hi": "खेती योग्य भूमि एवं सुनिश्चित जल स्रोत (ट्यूबवेल/नहर/कुआं) रखने वाले सभी कृषक।",
        "documents_en": "Land ownership document (Jamabandi/Fard), Electricity bill of pump / tubewell proof, Aadhaar Card, Bank Details.",
        "documents_hi": "जमाबंदी/फर्द की प्रति, बिजली का बिल या ट्यूबवेल प्रमाण, आधार कार्ड, बैंक पासबुक।",
        "official_url": "https://pmksy.gov.in",
        "last_verified": "November 2026"
    },
    {
        "scheme_code": "SMAM",
        "name_en": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "name_hi": "कृषि यंत्रीकरण उप-मिशन (SMAM - ट्रैक्टर व कृषि उपकरण सब्सिडी)",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit_amount": "40% to 50% subsidy on procurement of agricultural machinery and implements",
        "description_en": "Subsidizes the purchase of modern farm equipment such as rotavators, seed drills, laser levelers, and power tillers to modernize smallholder farming.",
        "description_hi": "रोटावेटर, सीड ड्रिल, लेजर लैंड लेवलर व आधुनिक कृषि यंत्रों की खरीद पर 40% से 50% तक की वित्तीय छूट।",
        "eligibility_en": "Small and marginal farmers, women farmers, SC/ST farmers are given highest priority.",
        "eligibility_hi": "लघु एवं सीमांत किसान, महिला कृषक व अनुसूचित जाति/जनजाति के किसान प्राथमिकता पर।",
        "documents_en": "Aadhaar Card, Land ownership document, Caste certificate (if applicable), Bank passbook, Driving license (for tractors).",
        "documents_hi": "आधार कार्ड, भूमि खसरा/खतौनी, जाति प्रमाण पत्र (यदि लागू हो), बैंक पासबुक, ट्रैक्टर आरसी/लाइसेंस।",
        "official_url": "https://agrimachinery.nic.in",
        "last_verified": "November 2026"
    }
]

class SchemesService:
    @staticmethod
    def get_all_schemes() -> List[Dict[str, Any]]:
        return GOVERNMENT_SCHEMES

    @staticmethod
    def get_scheme_by_code(code: str) -> Dict[str, Any]:
        match = next((s for s in GOVERNMENT_SCHEMES if s["scheme_code"].lower() == code.lower()), None)
        return match or GOVERNMENT_SCHEMES[0]
