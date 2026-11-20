from typing import Dict, Any, List, Tuple
try:
    from backend.services.crop_data import SOIL_CHARACTERISTICS
except ImportError:
    from services.crop_data import SOIL_CHARACTERISTICS

class AgronomyRulesEngine:

    @staticmethod
    def evaluate_irrigation(
        weather_data: Dict[str, Any],
        crop_stage: Dict[str, Any],
        soil_type: str = "loamy",
        irrigation_method: str = "canal"
    ) -> Dict[str, Any]:
        """
        Determines irrigation action: Postpone, Recommend, or Monitor.
        """
        daily = weather_data.get("daily", [])
        current = weather_data.get("current", {})
        
        # Check rain in next 24-48 hours
        next_24h_rain_prob = daily[0]["rain_probability"] if len(daily) > 0 else current.get("rain_probability", 0)
        next_48h_rain_prob = daily[1]["rain_probability"] if len(daily) > 1 else next_24h_rain_prob
        expected_rain_24h = daily[0]["precipitation_sum"] if len(daily) > 0 else 0.0
        expected_rain_48h = daily[1]["precipitation_sum"] if len(daily) > 1 else 0.0
        
        max_temp_today = daily[0]["temp_max"] if len(daily) > 0 else current.get("temperature", 28.0)
        soil_info = SOIL_CHARACTERISTICS.get(soil_type.lower(), SOIL_CHARACTERISTICS["loamy"])
        
        stage_name = crop_stage.get("current_stage", "Vegetative")
        stage_sensitivity = crop_stage.get("stage_water_sensitivity", "Moderate")

        # Rule 1: Rain expected in next 24-48h -> Postpone
        if next_24h_rain_prob >= 40 or next_48h_rain_prob >= 50 or expected_rain_24h >= 4.0 or expected_rain_48h >= 6.0:
            status = "Postpone Irrigation"
            status_hi = "सिंचाई स्थगित करें (Postpone)"
            urgency = "warning"
            reason = (
                f"अगले 24-48 घंटों में बारिश की संभावना {max(next_24h_rain_prob, next_48h_rain_prob)}% है "
                f"({expected_rain_24h + expected_rain_48h:.1f} मिमी तक वर्षा संभावित)। "
                f"अभी पानी देने से मिट्टी में जलभराव हो सकता है और पानी/बिजली व्यर्थ होगी।"
            )
            recommendation = "आज और कल सिंचाई टाल दें। बारिश के बाद खेत में नमी का स्तर देखकर ही निर्णय लें।"

        # Rule 2: Ripening / harvest stage -> No irrigation
        elif "Harvest" in stage_name or "Ripening" in stage_name or stage_sensitivity == "None":
            status = "Do Not Irrigate"
            status_hi = "सिंचाई न करें (कटाई अवस्था)"
            urgency = "caution"
            reason = f"फसल {stage_name} पर है। इस समय सिंचाई से दाने की गुणवत्ता खराब हो सकती है और कटाई में देरी होगी।"
            recommendation = "सिंचाई पूरी तरह बंद रखें ताकि फसल पक सके।"

        # Rule 3: High Temperature & Dry Weather -> Early morning / late evening irrigation
        elif max_temp_today >= 35.0:
            status = "Irrigate Early Morning / Evening"
            status_hi = "सुबह या शाम हल्की सिंचाई करें"
            urgency = "caution"
            reason = (
                f"आज अधिकतम तापमान {max_temp_today}°C रहने का अनुमान है। तेज धूप में पानी देने से वाष्पीकरण बढ़ जाता है "
                f"और जड़ों पर विपरीत असर पड़ता है।"
            )
            recommendation = "सिंचाई केवल सुबह 6-9 बजे या शाम 5 बजे के बाद करें। दोपहर की धूप में पानी न लगाएं।"

        # Rule 4: Critical stage & Dry weather -> Recommend irrigation
        elif stage_sensitivity in ["Critical", "High"]:
            status = "Recommended"
            status_hi = "सिंचाई के लिए उपयुक्त समय"
            urgency = "safe"
            reason = (
                f"आपकी फसल संवेदनशील अवस्था ({crop_stage.get('stage_hindi', stage_name)}) में है "
                f"और अगले 48 घंटों में बारिश की संभावना नगण्य ({next_24h_rain_prob}%) है।"
            )
            recommendation = f"{irrigation_method.capitalize()} द्वारा पर्याप्त नमी बनाए रखें। सुबह या शाम सिंचाई उत्तम रहेगी।"

        else:
            status = "Monitor Moisture"
            status_hi = "नमी की जांच करें"
            urgency = "safe"
            reason = "मौसम सामान्य है और भारी बारिश का अनुमान नहीं है।"
            recommendation = "खेत की ऊपरी 5 सेमी मिट्टी की नमी उंगली से जांचें। यदि मिट्टी भुरभुरी और सूखी लगे तभी हल्की सिंचाई करें।"

        # Add soil nuance
        soil_note = f"मिट्टी नोट ({soil_type.capitalize()}): {soil_info['advice_hi']}"

        return {
            "status": status,
            "status_hi": status_hi,
            "urgency": urgency,
            "recommendation": recommendation,
            "reason": reason,
            "soil_note": soil_note,
            "rain_prob_24h": next_24h_rain_prob,
            "rain_prob_48h": next_48h_rain_prob
        }

    @staticmethod
    def evaluate_spray(
        weather_data: Dict[str, Any],
        crop_stage: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Determines if chemical / bio-pesticide spraying is safe today.
        """
        current = weather_data.get("current", {})
        daily = weather_data.get("daily", [])

        wind_speed = current.get("wind_speed", 8.0)
        wind_max_today = daily[0]["wind_speed_max"] if len(daily) > 0 else wind_speed
        rain_prob_today = daily[0]["rain_probability"] if len(daily) > 0 else current.get("rain_probability", 0)
        temp_max_today = daily[0]["temp_max"] if len(daily) > 0 else current.get("temperature", 28.0)
        humidity = current.get("humidity", 55)

        # Rule 1: High Wind Speed (> 15 km/h)
        if wind_max_today >= 15.0 or wind_speed >= 15.0:
            status = "Unfavorable - High Wind"
            status_hi = "छिड़काव स्थगित करें (तेज हवा)"
            urgency = "warning"
            reason = f"हवा की गति {max(wind_speed, wind_max_today)} km/h रहने की संभावना है। तेज हवा से दवा हवा में उड़कर व्यर्थ जाएगी (Drift risk) और पड़ोसी खेतों को नुकसान पहुंचा सकती है।"
            recommendation = "आज किसी भी प्रकार का स्प्रे न करें। हवा की गति 10-12 km/h से कम होने की प्रतीक्षा करें।"

        # Rule 2: Rain expected (> 30%)
        elif rain_prob_today >= 35:
            status = "Unfavorable - Rain Likely"
            status_hi = "छिड़काव न करें (बारिश की संभावना)"
            urgency = "warning"
            reason = f"आज बारिश की संभावना {rain_prob_today}% है। छिड़काव के बाद बारिश होने से दवा धुल जाएगी और कोई लाभ नहीं होगा।"
            recommendation = "स्प्रे स्थगित करें। मौसम साफ होने और पत्तियां पूरी तरह सूखने के बाद ही छिड़काव करें।"

        # Rule 3: Extreme Heat (> 35C) or High Humidity
        elif temp_max_today >= 36.0:
            status = "Caution - Early Morning Only"
            status_hi = "केवल सुबह 7-9 बजे छिड़काव करें"
            urgency = "caution"
            reason = f"दोपहर का तापमान {temp_max_today}°C तक पहुंचेगा। तेज धूप में छिड़काव से पत्तियों के जलने (Phytotoxicity) का खतरा रहता है।"
            recommendation = "छिड़काव केवल सुबह 7 से 9:30 बजे के बीच या शाम 5 बजे के बाद करें।"

        # Rule 4: Favorable window
        else:
            status = "Favorable Window"
            status_hi = "छिड़काव के लिए अनुकूल समय"
            urgency = "safe"
            reason = f"मौसम साफ है, हवा की गति सामान्य ({wind_speed} km/h) है और बारिश की संभावना केवल {rain_prob_today}% है।"
            recommendation = "स्प्रे के लिए खिड़की खुली है। कीटनाशक लेबल पर लिखी सही खुराक का पालन करें और सुरक्षा मास्क अवश्य पहनें।"

        disclaimer = "ध्यान दें: बिना सटीक बीमारी/कीट पहचान के कीटनाशक का छिड़काव न करें। नजदीकी कृषि अधिकारी (KVK) से खुराक अवश्य सत्यापित करें।"

        return {
            "status": status,
            "status_hi": status_hi,
            "urgency": urgency,
            "recommendation": recommendation,
            "reason": reason,
            "disclaimer": disclaimer,
            "wind_speed": wind_speed,
            "rain_prob": rain_prob_today
        }

    @staticmethod
    def evaluate_weather_risks(
        weather_data: Dict[str, Any],
        crop_stage: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Detects heavy rain, heat stress, frost, strong wind, and harvest window risks.
        """
        alerts = []
        daily = weather_data.get("daily", [])
        current = weather_data.get("current", {})

        rain_today = daily[0]["precipitation_sum"] if len(daily) > 0 else 0.0
        rain_prob_today = daily[0]["rain_probability"] if len(daily) > 0 else 0
        temp_max = daily[0]["temp_max"] if len(daily) > 0 else current.get("temperature", 28.0)
        temp_min = daily[0]["temp_min"] if len(daily) > 0 else 18.0
        wind_max = daily[0]["wind_speed_max"] if len(daily) > 0 else current.get("wind_speed", 8.0)

        # 1. Heavy Rain Warning
        if rain_today >= 25.0 or rain_prob_today >= 70:
            alerts.append({
                "type": "rain",
                "title": "भारी बारिश चेतावनी (Heavy Rain)",
                "message": f"आज/कल भारी बारिश ({rain_today:.1f} मिमी, {rain_prob_today}% संभावना) का अनुमान है। खेतों में पानी निकासी के नाले साफ रखें और कटी फसल को तिरपाल से ढकें।",
                "urgency": "danger",
                "icon": "cloud-rain"
            })
        elif rain_prob_today >= 40:
            alerts.append({
                "type": "rain",
                "title": "बारिश की संभावना (Rain Alert)",
                "message": f"आज बारिश की {rain_prob_today}% संभावना है। सिंचाई और छिड़काव रोक दें।",
                "urgency": "caution",
                "icon": "cloud-drizzle"
            })

        # 2. Heat Stress Alert
        if temp_max >= 38.0:
            alerts.append({
                "type": "heat",
                "title": "भीषण गर्मी एवं लू (Heatwave Alert)",
                "message": f"अधिकतम तापमान {temp_max}°C तक पहुंच सकता है। फसलों को मुरझाने से बचाने के लिए सुबह हल्की सिंचाई करें। पशुओं को छायादार स्थान पर रखें।",
                "urgency": "danger",
                "icon": "sun"
            })
        elif temp_max >= 34.0:
            alerts.append({
                "type": "heat",
                "title": "उष्ण तापमान (Heat Stress)",
                "message": f"तापमान {temp_max}°C रहने का अनुमान है। दोपहर 12 से 4 बजे के बीच भारी खेत कार्य और रासायनिक छिड़काव से बचें।",
                "urgency": "caution",
                "icon": "sun"
            })

        # 3. Frost / Cold Wave Alert (Rabi crops)
        if temp_min <= 4.0:
            alerts.append({
                "type": "frost",
                "title": "पाला पड़ने की चेतावनी (Frost Alert)",
                "message": f"न्यूनतम तापमान {temp_min}°C तक गिरने का अनुमान है। पाले से बचाव के लिए शाम के समय खेत में हल्की सिंचाई करें या धुआं करें।",
                "urgency": "danger",
                "icon": "snowflake"
            })

        # 4. Wind Alert
        if wind_max >= 18.0:
            alerts.append({
                "type": "wind",
                "title": "तेज हवा चेतावनी (High Wind)",
                "message": f"हवा की रफ्तार {wind_max} km/h तक हो सकती है। लंबी फसलों (जैसे गेहूं/गन्ना) में भारी पानी न लगाएं जिससे फसल गिरने (Lodging) का खतरा न रहे।",
                "urgency": "warning",
                "icon": "wind"
            })

        # 5. Harvest Window Assessment
        # Check next 3 days dry window
        dry_days = sum(1 for d in daily[:3] if d.get("rain_probability", 0) < 20 and d.get("precipitation_sum", 0) < 1.0)
        is_harvest_stage = "Harvest" in crop_stage.get("current_stage", "") or "Ripening" in crop_stage.get("current_stage", "")
        
        if is_harvest_stage:
            if dry_days >= 3:
                alerts.append({
                    "type": "harvest",
                    "title": "कटाई के लिए उत्तम मौसम (Harvest Window)",
                    "message": "आगामी 3 दिन मौसम पूरी तरह सूखा व साफ रहने की संभावना है। फसल कटाई व मड़ाई (threshing) के लिए यह आदर्श समय है।",
                    "urgency": "safe",
                    "icon": "scissors"
                })
            else:
                alerts.append({
                    "type": "harvest",
                    "title": "कटाई में सावधानी (Rain Risk during Harvest)",
                    "message": "आगामी दिनों में बारिश की संभावना है। कटी हुई फसल को खुले में न छोड़ें, तुरंत सुरक्षित स्थान पर पहुंचाएं या तिरपाल से ढकें।",
                    "urgency": "warning",
                    "icon": "scissors"
                })

        return alerts

    @classmethod
    def generate_daily_briefing(
        cls,
        farm_profile: Dict[str, Any],
        weather_data: Dict[str, Any],
        crop_stage: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Creates a crisp daily briefing (<150 words) with clear hero action and urgency.
        """
        farmer_name = farm_profile.get("name", "किसान मित्र")
        crop_name = crop_stage.get("crop_hindi", farm_profile.get("crop", "गेहूँ"))
        stage_name = crop_stage.get("stage_hindi", crop_stage.get("current_stage", "वृद्धि"))
        soil_type = farm_profile.get("soil_type", "loamy")
        irrigation_method = farm_profile.get("irrigation_method", "canal")

        irrigation_eval = cls.evaluate_irrigation(weather_data, crop_stage, soil_type, irrigation_method)
        spray_eval = cls.evaluate_spray(weather_data, crop_stage)
        risk_alerts = cls.evaluate_weather_risks(weather_data, crop_stage)

        current = weather_data.get("current", {})
        temp = current.get("temperature", 26.0)
        rain_prob = current.get("rain_probability", 10)
        wind = current.get("wind_speed", 8.0)
        cond = current.get("weather_condition", "साफ")

        # Determine single Primary Hero Action
        if "Postpone" in irrigation_eval["status"]:
            primary_action = "आज सिंचाई स्थगित करें (बारिश की संभावना)"
            primary_urgency = "warning"
        elif "Unfavorable" in spray_eval["status"]:
            primary_action = f"आज कीटनाशक स्प्रे न करें ({spray_eval['status_hi']})"
            primary_urgency = "warning"
        elif any(a["urgency"] == "danger" for a in risk_alerts):
            top_danger = next(a for a in risk_alerts if a["urgency"] == "danger")
            primary_action = top_danger["title"]
            primary_urgency = "danger"
        elif irrigation_eval["urgency"] == "safe" and "Recommended" in irrigation_eval["status"]:
            primary_action = "आज सुबह या शाम हल्की सिंचाई का अनुकूल समय है"
            primary_urgency = "safe"
        elif spray_eval["urgency"] == "safe":
            primary_action = "मौसम साफ है — स्प्रे और सामान्य खेत कार्य के लिए उपयुक्त दिन"
            primary_urgency = "safe"
        else:
            primary_action = "मौसम स्थिर है — खेत की सामान्य निगरानी करें"
            primary_urgency = "safe"

        # Construct short briefing text (< 140 words)
        briefing_text = (
            f"राम-राम {farmer_name} जी! आपकी {crop_name} फसल अभी '{stage_name}' में है। "
            f"आज का तापमान {temp}°C, हवा {wind} km/h और बारिश की संभावना {rain_prob}% है ({cond})। "
            f"{irrigation_eval['recommendation']} "
            f"स्प्रे सलाह: {spray_eval['recommendation']} "
            f"यह मौसम आधारित निर्णय सहायता है; स्थानीय कृषि केंद्र से भी संपर्क रखें।"
        )

        audio_text = (
            f"नमस्ते {farmer_name} जी. आज {crop_name} के लिए मुख्य सलाह है: {primary_action}. "
            f"तापमान {temp} डिग्री है और बारिश की संभावना {rain_prob} प्रतिशत है. "
            f"{irrigation_eval['status_hi']}."
        )

        # Standard Alert cards
        all_alerts = [
            {
                "type": "irrigation",
                "title": "सिंचाई निर्णय (Irrigation)",
                "message": irrigation_eval["recommendation"],
                "urgency": irrigation_eval["urgency"],
                "icon": "droplet"
            },
            {
                "type": "spray",
                "title": "स्प्रे खिड़की (Spray Window)",
                "message": spray_eval["recommendation"],
                "urgency": spray_eval["urgency"],
                "icon": "spray"
            }
        ]
        all_alerts.extend(risk_alerts)

        return {
            "farmer_name": farmer_name,
            "crop": crop_name,
            "location": farm_profile.get("village_or_district", "Faridabad, Haryana"),
            "primary_action": primary_action,
            "primary_urgency": primary_urgency,
            "briefing_text": briefing_text,
            "audio_text": audio_text,
            "alerts": all_alerts,
            "weather_summary": f"{temp}°C | {cond} | हवा {wind} km/h | बारिश {rain_prob}%",
            "irrigation_advice": irrigation_eval["recommendation"],
            "spray_advice": spray_eval["recommendation"],
            "confidence": "High" if not weather_data.get("is_demo") else "Medium (Demo Data)",
            "data_updated_at": current.get("updated_at", "अभी"),
            "is_demo": weather_data.get("is_demo", False)
        }
