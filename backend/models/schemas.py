from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ----------------- 1. User & Auth Schemas -----------------
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., example="राहुल शर्मा")
    mobile: Optional[str] = Field(default=None, example="9876543210")
    email: Optional[str] = Field(default=None, example="rahul@kisanmitra.com")
    password: str = Field(..., min_length=6, example="kisan@123")
    state: Optional[str] = Field(default="Haryana", example="Haryana")
    district: Optional[str] = Field(default="Faridabad", example="Faridabad")
    village: Optional[str] = Field(default="Tigaon", example="Tigaon")
    language: Optional[str] = Field(default="hi", example="hi")

class UserLoginRequest(BaseModel):
    # Supports mobile or email as username_or_mobile or mobile or email
    username_or_mobile: Optional[str] = Field(default=None, example="9876543210")
    mobile: Optional[str] = Field(default=None, example="9876543210")
    email: Optional[str] = Field(default=None, example="farmer@example.com")
    password: str = Field(..., example="kisan@123")
    remember_me: Optional[bool] = Field(default=False)

    def get_identifier(self) -> str:
        return self.username_or_mobile or self.mobile or self.email or ""

class ForgotPasswordRequest(BaseModel):
    mobile_or_email: str = Field(..., example="9876543210")
    otp: str = Field(..., example="123456")
    new_password: str = Field(..., min_length=6, example="newpass123")

class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user_id: int
    full_name: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    language: Optional[str] = "hi"
    is_onboarded: bool = True
    message: str = "Login successful"

# For backwards compatibility with older AuthResponse references
AuthResponse = TokenResponse

class UserMeResponse(BaseModel):
    id: int
    full_name: str
    email: Optional[str] = None
    mobile: Optional[str] = None
    language: str = "hi"
    is_active: bool = True
    created_at: Optional[datetime] = None
    profile: Optional[Any] = None

# ----------------- 2. Farmer Profile Schemas -----------------
class FarmerProfileBase(BaseModel):
    full_name: str = Field(default="राहुल शर्मा (Rahul Sharma)")
    mobile: str = Field(default="9876543210")
    language: str = Field(default="hi") # Strictly 'hi' or 'en'
    state: str = Field(default="Haryana")
    district: str = Field(default="Faridabad")
    village: str = Field(default="Tigaon")
    pincode: str = Field(default="121101")
    latitude: Optional[float] = 28.4089
    longitude: Optional[float] = 77.3178
    total_landholding: float = Field(default=5.0)
    land_unit: str = Field(default="Acres")
    number_of_fields: int = Field(default=2)
    primary_soil_type: str = Field(default="loamy")
    primary_irrigation_method: str = Field(default="canal")
    is_onboarded: bool = Field(default=True)

class FarmerProfileCreate(FarmerProfileBase):
    pass

class FarmerProfileUpdate(FarmerProfileBase):
    pass

class FarmerProfileResponse(FarmerProfileBase):
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- 3. Field Schemas -----------------
class FieldBase(BaseModel):
    field_name: str = Field(..., example="उत्तर खेत (North Plot)")
    area: float = Field(default=2.5, example=2.5)
    crop_name: str = Field(default="wheat", example="wheat")
    crop_variety: Optional[str] = Field(default="HD-2967", example="HD-2967")
    sowing_date: str = Field(..., example="2024-11-10")
    soil_type: str = Field(default="loamy", example="loamy")
    irrigation_method: str = Field(default="canal", example="canal")
    previous_crop: Optional[str] = Field(default="rice", example="rice")
    expected_harvest_date: Optional[str] = None
    current_stage: Optional[str] = None

class FieldCreate(FieldBase):
    pass

class FieldUpdate(BaseModel):
    field_name: Optional[str] = None
    area: Optional[float] = None
    crop_name: Optional[str] = None
    crop_variety: Optional[str] = None
    sowing_date: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    previous_crop: Optional[str] = None
    expected_harvest_date: Optional[str] = None
    current_stage: Optional[str] = None

class FieldResponse(FieldBase):
    id: int
    farmer_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    days_since_sowing: Optional[int] = None
    stage_hindi: Optional[str] = None
    progress_percentage: Optional[int] = None

    class Config:
        from_attributes = True

# ----------------- 4. Farm Activity / Diary Schemas -----------------
class FarmActivityBase(BaseModel):
    field_id: Optional[int] = None
    activity_type: str = Field(..., example="irrigation") # sowing, irrigation, fertilizer, spray, pest_obs, disease_obs, harvest, other
    title: str = Field(..., example="First Irrigation completed")
    notes: Optional[str] = None
    date: str = Field(..., example="2024-12-01")
    cost: float = Field(default=0.0)

class FarmActivityCreate(FarmActivityBase):
    pass

class FarmActivityResponse(FarmActivityBase):
    id: int
    farmer_id: int
    created_at: Optional[datetime] = None
    field_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- 5. Farm Finance & Expense Schemas -----------------
class ExpenseBase(BaseModel):
    field_id: Optional[int] = None
    category: str = Field(..., example="seeds") # seeds, fertilizers, pesticides, labour, machinery, irrigation, transport, other
    amount: float = Field(..., example=3500.0)
    description: Optional[str] = None
    date: str = Field(..., example="2024-11-12")
    is_projected: bool = Field(default=False)

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    farmer_id: int
    created_at: Optional[datetime] = None
    field_name: Optional[str] = None

    class Config:
        from_attributes = True

class FinanceSummaryResponse(BaseModel):
    total_investment: float
    cost_per_acre: float
    total_acres: float
    actual_expenses: float
    projected_expenses: float
    estimated_revenue: float
    estimated_profit: float
    profit_margin_percent: float
    expenses_by_category: Dict[str, float]
    recent_transactions: List[ExpenseResponse]

# ----------------- 6. Mandi Price Schemas -----------------
class MandiPriceItem(BaseModel):
    mandi: str
    district: str
    state: str
    commodity: str
    variety: str
    arrival_date: str
    min_price: float
    max_price: float
    modal_price: float
    estimated_gross_value: float

class MandiPriceResponse(BaseModel):
    crop: str
    quantity_quintals: float
    area: str
    area_scope: str
    benchmark_mandi: str
    mandis: List[MandiPriceItem]
    data_source: str

# ----------------- 7. Government Schemes Schemas -----------------
class GovernmentSchemeResponse(BaseModel):
    id: int
    scheme_code: str
    name_en: str
    name_hi: str
    ministry: str
    benefit_amount: Optional[str] = None
    description_en: str
    description_hi: str
    eligibility_en: str
    eligibility_hi: str
    documents_en: str
    documents_hi: str
    official_url: str
    last_verified: str

# ----------------- 8. AI Crop Doctor Schemas -----------------
class CropDoctorRequest(BaseModel):
    crop_name: str = Field(default="wheat")
    symptom_hint: Optional[str] = None
    image_base64: Optional[str] = None

class CropDoctorResponse(BaseModel):
    crop: str
    detected_issue_en: str
    detected_issue_hi: str
    symptoms_en: str
    symptoms_hi: str
    severity: str # Safe, High, Critical
    confidence: str
    preventive_measures_en: str
    preventive_measures_hi: str
    expert_advice_needed: bool
    disclaimer_en: str
    disclaimer_hi: str

# ----------------- 9. Seasonal Planner Schemas -----------------
class SeasonalPlannerResponse(BaseModel):
    crop: str
    crop_hi: str
    season: str # Rabi, Kharif, Zaid
    season_hi: str
    total_duration_days: int
    current_stage: str
    current_stage_hi: str
    current_day: int
    progress_percentage: int
    stages: List[Dict[str, Any]]
    seasonal_intelligence: Dict[str, Any]

# ----------------- 10. Farm Risk Score Schemas -----------------
class RiskFactorItem(BaseModel):
    factor_name_en: str
    factor_name_hi: str
    score: int # 0 to 100
    level: str # Low, Medium, High
    description_en: str
    description_hi: str

class RiskScoreResponse(BaseModel):
    overall_score: int # 0 to 100
    risk_level: str # Low, Moderate, High, Severe
    level_color: str
    field_name: str
    crop_name: str
    factors: List[RiskFactorItem]
    recommendations_en: List[str]
    recommendations_hi: List[str]
    disclaimer_en: str
    disclaimer_hi: str

# ----------------- 11. Harvest Planner Schemas -----------------
class HarvestPlannerResponse(BaseModel):
    field_id: int
    field_name: str
    crop_name: str
    sowing_date: str
    days_since_sowing: int
    total_duration_days: int
    maturity_percentage: int
    estimated_harvest_start: str
    estimated_harvest_end: str
    weather_window_status: str # Optimal, Caution, Delay
    rain_probability_next_7_days: int
    recommendations_en: List[str]
    recommendations_hi: List[str]

# ----------------- Backward Compatibility (Original Schemas) -----------------
class FarmerBase(BaseModel):
    name: str = Field(..., example="Rajesh Kumar")
    language: str = Field(default="hi", example="hi")
    village_or_district: str = Field(default="Faridabad, Haryana", example="Faridabad, Haryana")
    crop: str = Field(default="wheat", example="wheat")
    sowing_date: str = Field(..., example="2024-11-10")
    field_size: float = Field(default=2.5, example=2.5)
    soil_type: str = Field(default="loamy", example="loamy")
    irrigation_method: str = Field(default="canal", example="canal")

class FarmerCreate(FarmerBase):
    pass

class FarmerResponse(FarmerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WeatherCurrent(BaseModel):
    temperature: float
    apparent_temperature: float
    humidity: int
    wind_speed: float
    wind_direction: Optional[int] = 0
    rain_probability: int
    precipitation: float
    weather_condition: str
    weather_icon: str
    is_day: int = 1
    updated_at: str

class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    temp_max: float
    temp_min: float
    rain_probability: int
    precipitation_sum: float
    wind_speed_max: float
    humidity_mean: int
    weather_condition: str
    weather_icon: str
    crop_implication: str

class WeatherForecastResponse(BaseModel):
    location: str
    current: WeatherCurrent
    daily: List[DailyForecastItem]
    is_demo: bool = False

class CropStageInfo(BaseModel):
    crop: str
    sowing_date: str
    days_since_sowing: int
    current_stage: str
    stage_hindi: str
    stage_description: str
    stage_water_need: str
    next_stage: Optional[str] = None
    next_stage_in_days: Optional[int] = None
    all_stages: List[Dict[str, Any]]

class AlertItem(BaseModel):
    type: str # rain, heat, wind, irrigation, spray, harvest
    title: str
    message: str
    urgency: str # safe, caution, warning, danger
    icon: str

class DailyBriefingResponse(BaseModel):
    farmer_name: str
    crop: str
    location: str
    primary_action: str
    primary_urgency: str # safe, caution, warning
    briefing_text: str
    audio_text: str
    alerts: List[AlertItem]
    weather_summary: str
    irrigation_advice: str
    spray_advice: str
    confidence: str
    data_updated_at: str
    is_demo: bool = False

class ChatRequest(BaseModel):
    message: str
    farmer_id: Optional[int] = 1
    language_hint: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    voice_text: str
    language: str
    confidence: str # High, Medium, Low
    why_this_advice: str
    tools_used: List[str]
    weather_updated_at: str
    disclaimer: str
