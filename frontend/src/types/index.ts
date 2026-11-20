export type Language = 'hi' | 'en';

export interface FullFarmerProfile {
  id: number;
  user_id?: number;
  full_name: string;
  mobile: string;
  language: Language;
  state: string;
  district: string;
  village: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  total_landholding: number;
  land_unit: string;
  number_of_fields: number;
  primary_soil_type: string;
  primary_irrigation_method: string;
  is_onboarded: boolean;
}

export interface FieldItem {
  id: number;
  farmer_id: number;
  field_name: string;
  area: number;
  crop_name: string;
  crop_variety?: string;
  sowing_date: string;
  soil_type: string;
  irrigation_method: string;
  previous_crop?: string;
  expected_harvest_date?: string;
  current_stage?: string;
  stage_hindi?: string;
  days_since_sowing?: number;
  progress_percentage?: number;
}

export interface FieldCreateInput {
  field_name: string;
  area: number;
  crop_name: string;
  crop_variety?: string;
  sowing_date: string;
  soil_type: string;
  irrigation_method: string;
  previous_crop?: string;
}

export interface ExpenseItem {
  id: number;
  farmer_id: number;
  field_id?: number;
  category: string;
  amount: number;
  description?: string;
  date: string;
  is_projected: boolean;
  field_name?: string;
}

export interface FinanceSummary {
  total_investment: number;
  cost_per_acre: number;
  total_acres: number;
  actual_expenses: number;
  projected_expenses: number;
  estimated_revenue: number;
  estimated_profit: number;
  profit_margin_percent: number;
  expenses_by_category: Record<string, number>;
  recent_transactions: ExpenseItem[];
}

export interface FarmActivityItem {
  id: number;
  farmer_id: number;
  field_id?: number;
  activity_type: string;
  title: string;
  notes?: string;
  date: string;
  cost: number;
  field_name?: string;
}

export interface MandiPriceItem {
  mandi: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  estimated_gross_value: number;
}

export interface MandiPriceResponse {
  crop: string;
  quantity_quintals: number;
  area: string;
  area_scope: string;
  benchmark_mandi: string;
  mandis: MandiPriceItem[];
  data_source: string;
}

export interface GovernmentScheme {
  id: number;
  scheme_code: string;
  name_en: string;
  name_hi: string;
  ministry: string;
  benefit_amount?: string;
  description_en: string;
  description_hi: string;
  eligibility_en: string;
  eligibility_hi: string;
  documents_en: string;
  documents_hi: string;
  official_url: string;
  last_verified: string;
}

export interface CropDoctorDiagnosis {
  crop: string;
  detected_issue_en: string;
  detected_issue_hi: string;
  symptoms_en: string;
  symptoms_hi: string;
  severity: 'Safe' | 'High' | 'Critical';
  confidence: string;
  preventive_measures_en: string;
  preventive_measures_hi: string;
  expert_advice_needed: boolean;
  disclaimer_en: string;
  disclaimer_hi: string;
}

export interface RiskFactorItem {
  factor_name_en: string;
  factor_name_hi: string;
  score: number;
  level: string;
  description_en: string;
  description_hi: string;
}

export interface RiskScoreData {
  overall_score: number;
  risk_level: string;
  level_color: string;
  field_name: string;
  crop_name: string;
  factors: RiskFactorItem[];
  recommendations_en: string[];
  recommendations_hi: string[];
  disclaimer_en: string;
  disclaimer_hi: string;
}

export interface HarvestPlannerItem {
  field_id: number;
  field_name: string;
  crop_name: string;
  sowing_date: string;
  days_since_sowing: number;
  total_duration_days: number;
  maturity_percentage: number;
  estimated_harvest_start: string;
  estimated_harvest_end: string;
  weather_window_status: string;
  rain_probability_next_7_days: number;
  recommendations_en: string[];
  recommendations_hi: string[];
}

export interface SeasonalStageItem {
  stage: string;
  stage_hi: string;
  start_day: number;
  end_day: number;
  water_need: string;
  water_need_hi: string;
  advice_en: string;
  advice_hi: string;
}

export interface SeasonalPlannerData {
  crop: string;
  crop_hi: string;
  season: string;
  season_hi: string;
  total_duration_days: number;
  current_stage: string;
  current_stage_hi: string;
  current_day: number;
  progress_percentage: number;
  stages: SeasonalStageItem[];
  seasonal_intelligence: {
    season_name: string;
    season_name_hi: string;
    months_en: string;
    months_hi: string;
    primary_crops: string[];
    critical_advisories_en: string[];
    critical_advisories_hi: string[];
  };
}

export interface IrrigationPlanItem {
  field_id: number;
  field_name: string;
  crop_name: string;
  area: number;
  current_stage: string;
  stage_hindi: string;
  water_need: string;
  water_need_hi: string;
  irrigation_action: string;
  irrigation_action_hi: string;
  urgency: 'safe' | 'caution' | 'warning';
  reason: string;
  recommendation: string;
  soil_type: string;
  method: string;
}

export interface WeatherCurrent {
  temperature: number;
  apparent_temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction?: number;
  rain_probability: number;
  precipitation: number;
  weather_condition: string;
  weather_icon: string;
  is_day: number;
  updated_at: string;
}

export interface DailyForecastItem {
  date: string;
  day_name: string;
  temp_max: number;
  temp_min: number;
  rain_probability: number;
  precipitation_sum: number;
  wind_speed_max: number;
  humidity_mean: number;
  weather_condition: string;
  weather_icon: string;
  crop_implication: string;
}

export interface WeatherForecastResponse {
  location: string;
  current: WeatherCurrent;
  daily: DailyForecastItem[];
  is_demo: boolean;
}

export interface AlertItem {
  type: string;
  title: string;
  message: string;
  urgency: 'safe' | 'caution' | 'warning' | 'danger';
  icon: string;
}

export interface DailyBriefingResponse {
  farmer_name: string;
  crop: string;
  location: string;
  primary_action: string;
  primary_urgency: 'safe' | 'caution' | 'warning' | 'danger';
  briefing_text: string;
  audio_text: string;
  alerts: AlertItem[];
  weather_summary: string;
  irrigation_advice: string;
  spray_advice: string;
  confidence: string;
  data_updated_at: string;
  is_demo: boolean;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  voice_text?: string;
  language?: string;
  confidence?: string;
  why_reason?: string;
  why_this_advice?: string;
  weather_updated_at?: string;
  disclaimer?: string;
  tools_used?: string[];
  created_at?: string;
}

export interface AuthSession {
  token?: string;
  access_token?: string;
  token_type?: string;
  user_id: number;
  mobile?: string;
  email?: string;
  full_name: string;
  language: Language;
  is_onboarded: boolean;
  message?: string;
}

export interface UserAccount {
  id: number;
  full_name: string;
  email?: string;
  mobile?: string;
  language?: Language;
  is_active?: boolean;
  created_at?: string;
  profile?: FullFarmerProfile;
}

// Backward compatibility
export interface FarmerProfile {
  id: number;
  name: string;
  language: string;
  village_or_district: string;
  crop: string;
  sowing_date: string;
  field_size: number;
  soil_type: string;
  irrigation_method: string;
}

export interface CropStageInfo {
  crop: string;
  sowing_date: string;
  days_since_sowing: number;
  current_stage: string;
  stage_hindi: string;
  stage_description: string;
  stage_water_need: string;
  next_stage?: string;
  next_stage_in_days?: number;
  all_stages: Array<{
    stage: string;
    stage_hi: string;
    start_day: number;
    end_day: number;
    water_need: string;
    advice_hi: string;
    advice_en: string;
  }>;
}
