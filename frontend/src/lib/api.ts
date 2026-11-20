import {
  FullFarmerProfile,
  FieldItem,
  FieldCreateInput,
  ExpenseItem,
  FinanceSummary,
  FarmActivityItem,
  MandiPriceResponse,
  GovernmentScheme,
  CropDoctorDiagnosis,
  RiskScoreData,
  HarvestPlannerItem,
  SeasonalPlannerData,
  IrrigationPlanItem,
  DailyBriefingResponse,
  WeatherForecastResponse,
  CropStageInfo,
  FarmerProfile,
  AuthSession,
  Language,
  UserAccount
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>)
  };
  if (typeof document !== 'undefined') {
    const csrfMatch = document.cookie.match(/(?:^|;\s*)kisanmitra_csrf=([^;]*)/);
    if (csrfMatch) headers['X-CSRF-Token'] = decodeURIComponent(csrfMatch[1]);
  }
  return headers;
}

// ----------------- Auth API -----------------

export async function loginUser(
  identifier: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username_or_mobile: identifier,
      mobile: identifier,
      password,
      remember_me: rememberMe
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid credentials. Please try again.' }));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  return data;
}

export async function registerUser(
  payloadOrMobile:
    | string
    | {
        full_name: string;
        mobile?: string;
        email?: string;
        password: string;
        state?: string;
        district?: string;
        village?: string;
        language?: Language;
      },
  password?: string,
  fullName?: string,
  language: Language = 'hi'
): Promise<AuthSession> {
  let bodyPayload: any;
  if (typeof payloadOrMobile === 'string') {
    bodyPayload = {
      mobile: payloadOrMobile,
      password: password || '',
      full_name: fullName || 'किसान मित्र',
      language: language
    };
  } else {
    bodyPayload = payloadOrMobile;
  }

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(bodyPayload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const data = await res.json();
  return data;
}

export async function fetchCurrentUser(): Promise<UserAccount> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {
    // ignore
  }
}

export async function forgotPassword(
  mobileOrEmail: string,
  otp: string,
  newPassword: string
): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile_or_email: mobileOrEmail,
      otp,
      new_password: newPassword
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to reset password' }));
    throw new Error(err.detail || 'Failed to reset password');
  }
  return res.json();
}

// ----------------- Profile API -----------------

export async function fetchFullProfile(userId?: number): Promise<FullFarmerProfile> {
  const url = userId ? `${API_BASE}/api/profile/full?user_id=${userId}` : `${API_BASE}/api/profile/full`;
  const res = await fetch(url, { headers: getAuthHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch farmer profile');
  return res.json();
}

export async function saveFullProfile(profile: Partial<FullFarmerProfile>, userId?: number): Promise<FullFarmerProfile> {
  const url = userId ? `${API_BASE}/api/profile/full?user_id=${userId}` : `${API_BASE}/api/profile/full`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

// ----------------- Fields API -----------------

export async function fetchFields(userId?: number): Promise<FieldItem[]> {
  const url = userId ? `${API_BASE}/api/fields?user_id=${userId}` : `${API_BASE}/api/fields`;
  const res = await fetch(url, { headers: getAuthHeaders(), credentials: 'include' });
  if (!res.ok) return [];
  return res.json();
}

export async function createField(field: FieldCreateInput, userId?: number): Promise<FieldItem> {
  const url = userId ? `${API_BASE}/api/fields?user_id=${userId}` : `${API_BASE}/api/fields`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(field)
  });
  if (!res.ok) throw new Error('Failed to create field');
  return res.json();
}

export async function deleteField(fieldId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/fields/${fieldId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete field');
}

// ----------------- Finance API -----------------

export async function fetchFinanceSummary(userId?: number): Promise<FinanceSummary> {
  const url = userId ? `${API_BASE}/api/finance/summary?user_id=${userId}` : `${API_BASE}/api/finance/summary`;
  const res = await fetch(url, { headers: getAuthHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch finance summary');
  return res.json();
}

export async function fetchExpenses(userId?: number): Promise<ExpenseItem[]> {
  const url = userId ? `${API_BASE}/api/finance/expenses?user_id=${userId}` : `${API_BASE}/api/finance/expenses`;
  const res = await fetch(url, { headers: getAuthHeaders(), credentials: 'include' });
  if (!res.ok) return [];
  return res.json();
}

export async function addExpense(expense: { field_id?: number; category: string; amount: number; description?: string; date: string; is_projected?: boolean }): Promise<ExpenseItem> {
  const res = await fetch(`${API_BASE}/api/finance/expenses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(expense)
  });
  if (!res.ok) throw new Error('Failed to save expense');
  return res.json();
}

export async function deleteExpense(expenseId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/finance/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete expense');
}

// ----------------- Farm Diary API -----------------

export async function fetchActivities(userId?: number): Promise<FarmActivityItem[]> {
  const url = userId ? `${API_BASE}/api/diary/activities?user_id=${userId}` : `${API_BASE}/api/diary/activities`;
  const res = await fetch(url, { headers: getAuthHeaders(), credentials: 'include' });
  if (!res.ok) return [];
  return res.json();
}

export async function logActivity(activity: { field_id?: number; activity_type: string; title: string; notes?: string; date: string; cost?: number }): Promise<FarmActivityItem> {
  const res = await fetch(`${API_BASE}/api/diary/activities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(activity)
  });
  if (!res.ok) throw new Error('Failed to record activity');
  return res.json();
}

export async function deleteActivity(activityId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/diary/activities/${activityId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to remove activity');
}

// ----------------- Mandi Prices API -----------------

export async function fetchMandiPrices(crop = 'wheat', quantity = 50): Promise<MandiPriceResponse> {
  const params = new URLSearchParams({ crop, quantity: String(quantity) });
  const res = await fetch(`${API_BASE}/api/mandi-prices?${params}`, { credentials: 'include' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Could not load live market prices.' }));
    throw new Error(error.detail || 'Could not load live market prices.');
  }
  return res.json();
}

// ----------------- Government Schemes API -----------------

export async function fetchSchemes(): Promise<GovernmentScheme[]> {
  const res = await fetch(`${API_BASE}/api/schemes`);
  if (!res.ok) return [];
  return res.json();
}

// ----------------- AI Crop Doctor API -----------------

export async function diagnoseCrop(cropName: string, symptomHint?: string, imageBase64?: string): Promise<CropDoctorDiagnosis> {
  const res = await fetch(`${API_BASE}/api/crop-doctor/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop_name: cropName, symptom_hint: symptomHint, image_base64: imageBase64 })
  });
  if (!res.ok) throw new Error('Failed to diagnose crop issue');
  return res.json();
}

// ----------------- Smart Irrigation & Harvest API -----------------

export async function fetchIrrigationPlan(userId?: number): Promise<{ location: string; plans: IrrigationPlanItem[]; general_tip_en: string; general_tip_hi: string }> {
  const url = userId ? `${API_BASE}/api/irrigation/planner?user_id=${userId}` : `${API_BASE}/api/irrigation/planner`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch irrigation plan');
  return res.json();
}

export async function fetchHarvestPlan(): Promise<HarvestPlannerItem[]> {
  const res = await fetch(`${API_BASE}/api/harvest/planner`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch harvest plan');
  return res.json();
}

// ----------------- Risk Score API -----------------

export async function fetchRiskScore(fieldId?: number): Promise<RiskScoreData> {
  const url = fieldId ? `${API_BASE}/api/risk-score?field_id=${fieldId}` : `${API_BASE}/api/risk-score`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to calculate farm risk score');
  return res.json();
}

// ----------------- Seasonal Planner API -----------------

export async function fetchSeasonalPlan(crop = 'wheat', season?: string): Promise<SeasonalPlannerData> {
  const url = season ? `${API_BASE}/api/seasonal/planner?crop=${crop}&season=${season}` : `${API_BASE}/api/seasonal/planner?crop=${crop}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch seasonal planner');
  return res.json();
}

// ----------------- Weather & Dashboard Briefing API -----------------

export async function fetchDailyBriefing(userId?: number): Promise<DailyBriefingResponse> {
  const url = userId ? `${API_BASE}/api/dashboard/briefing?user_id=${userId}` : `${API_BASE}/api/dashboard/briefing`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch daily briefing');
  return res.json();
}

export async function fetchWeatherForecast(location?: string, days = 7): Promise<WeatherForecastResponse> {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  params.append('days', days.toString());
  const res = await fetch(`${API_BASE}/api/weather/forecast?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch weather forecast');
  return res.json();
}

// ----------------- AI Copilot Chat API -----------------

export async function sendChatMessage(
  message: string,
  farmerId?: number,
  languageHint?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      message,
      farmer_id: farmerId || 1,
      language_hint: languageHint
    })
  });
  if (!res.ok) throw new Error('Failed to get answer from Kisan Mitra AI');
  return res.json();
}

export async function fetchChatHistory(farmerId?: number): Promise<any[]> {
  const url = farmerId ? `${API_BASE}/api/chat/history?farmer_id=${farmerId}` : `${API_BASE}/api/chat/history`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

// ----------------- Legacy Compatibility -----------------

export async function fetchProfile(farmerId?: number): Promise<FarmerProfile> {
  const url = farmerId ? `${API_BASE}/api/profile?farmer_id=${farmerId}` : `${API_BASE}/api/profile`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch farmer profile');
  return res.json();
}

export async function saveProfile(profile: Partial<FarmerProfile>, farmerId?: number): Promise<FarmerProfile> {
  const url = farmerId ? `${API_BASE}/api/profile?farmer_id=${farmerId}` : `${API_BASE}/api/profile`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

export async function fetchCropCalendar(farmerId?: number): Promise<CropStageInfo> {
  const url = farmerId ? `${API_BASE}/api/crop/calendar?farmer_id=${farmerId}` : `${API_BASE}/api/crop/calendar`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch crop calendar');
  return res.json();
}
