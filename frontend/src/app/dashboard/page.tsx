'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import {
  fetchDailyBriefing,
  fetchWeatherForecast,
  fetchFields,
  fetchRiskScore,
  fetchFinanceSummary
} from '../../lib/api';
import {
  DailyBriefingResponse,
  WeatherForecastResponse,
  FieldItem,
  RiskScoreData,
  FinanceSummary
} from '../../types';
import {
  Sprout,
  Droplets,
  Wind,
  CloudRain,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Store,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trees,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const { language, profile } = useApp();
  const [briefing, setBriefing] = useState<DailyBriefingResponse | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [riskData, setRiskData] = useState<RiskScoreData | null>(null);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [bData, fData, fldData, rData, finData] = await Promise.all([
        fetchDailyBriefing().catch(() => null),
        fetchWeatherForecast().catch(() => null),
        fetchFields().catch(() => []),
        fetchRiskScore().catch(() => null),
        fetchFinanceSummary().catch(() => null),
      ]);

      if (bData) setBriefing(bData);
      if (fData) setForecast(fData);
      if (fldData) setFields(fldData);
      if (rData) setRiskData(rData);
      if (finData) setFinance(finData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const isHindi = language === 'hi';
  const curr = forecast?.current;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Welcome & Greeting Bar */}
      <div className="bg-gradient-to-r from-forest-900 via-forest to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sprout className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-2 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-fresh animate-pulse" />
              <span>{isHindi ? 'किसान मित्र एआई कृषि केंद्र' : 'Kisan Mitra AI Farm Dashboard'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isHindi ? `नमस्ते, ${profile?.full_name?.split(' ')[0] || 'किसान'} जी!` : `Welcome back, ${profile?.full_name?.split(' ')[0] || 'Farmer'}!`}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              {isHindi
                ? `आपके खेत (${profile?.village || 'तिगांव'}, ${profile?.district || 'फरीदाबाद'}) का मौसम अनुकूल है। आज का प्रमुख निर्णय नीचे देखें।`
                : `Conditions at your farm in ${profile?.village || 'Tigaon'}, ${profile?.district || 'Faridabad'} are active. See your primary agro decision below.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-medium border border-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'ताज़ा करें' : 'Refresh'}</span>
            </button>
            <Link
              href="/chat"
              className="flex items-center gap-2 bg-golden hover:bg-golden-dark text-stone-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-stone-900" />
              <span>{isHindi ? 'किसान मित्र एआई' : 'Ask Kisan Mitra'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Farm analytics overview */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-emerald-50" />
        <div className="relative mb-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-forest">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            {isHindi ? 'आपके खेत का सारांश' : 'Your Farm Analytics'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isHindi ? 'आपके दर्ज खेतों और खर्चों का एक नज़र में विवरण' : 'A quick view of your recorded fields and expenses'}
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center md:rounded-none md:border-0 md:border-r">
            <Trees className="mx-auto mb-2 h-5 w-5 text-forest" />
            <div className="text-2xl font-black tabular-nums text-forest">
              {loading ? '—' : fields.length}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isHindi ? 'दर्ज खेत' : 'Fields recorded'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center md:rounded-none md:border-0 md:border-r">
            <Sprout className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <div className="text-2xl font-black tabular-nums text-forest">
              {loading || !profile ? '—' : `${profile.total_landholding} ${profile.land_unit || (isHindi ? 'एकड़' : 'Acres')}`}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isHindi ? 'कुल भूमि' : 'Total land'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center md:rounded-none md:border-0 md:border-r">
            <BarChart3 className="mx-auto mb-2 h-5 w-5 text-teal-600" />
            <div className="text-2xl font-black tabular-nums text-forest">
              {loading ? '—' : fields.length
                ? `${Math.round(fields.reduce((sum, field) => sum + (field.progress_percentage ?? 0), 0) / fields.length)}%`
                : '—'}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isHindi ? 'औसत फसल वृद्धि' : 'Average crop growth'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center md:rounded-none md:border-0">
            <IndianRupee className="mx-auto mb-2 h-5 w-5 text-amber-600" />
            <div className="text-2xl font-black tabular-nums text-forest">
              {loading || !finance ? '—' : `₹${Math.round(finance.total_investment).toLocaleString('en-IN')}`}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isHindi ? 'दर्ज कुल खर्च' : 'Recorded expenses'}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Today's Primary Farm Action Card */}
      {briefing && (
        <div
          className={`rounded-3xl p-6 border transition-all shadow-md ${
            briefing.primary_urgency === 'danger' || briefing.primary_urgency === 'warning'
              ? 'bg-amber-50/90 border-amber-300'
              : briefing.primary_urgency === 'caution'
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-emerald-50/90 border-emerald-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/10">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  briefing.primary_urgency === 'danger' || briefing.primary_urgency === 'warning'
                    ? 'bg-red-600 text-white'
                    : briefing.primary_urgency === 'caution'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {briefing.primary_urgency === 'danger' || briefing.primary_urgency === 'warning'
                  ? isHindi ? 'चेतावनी (Urgent)' : 'Action Required'
                  : briefing.primary_urgency === 'caution'
                  ? isHindi ? 'सावधानी (Caution)' : 'Caution'
                  : isHindi ? 'सुरक्षित (Safe)' : 'Safe Window'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isHindi ? 'आज का मुख्य कृषि निर्णय' : "Today's Primary Decision"}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              <span>{isHindi ? 'विश्वसनीयता: ' : 'Confidence: '}</span>
              <span className="font-semibold text-forest">{briefing.confidence}</span>
              <span className="ml-2 text-slate-400">| {briefing.data_updated_at}</span>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {briefing.primary_action}
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed">
                {briefing.briefing_text}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>{briefing.irrigation_advice}</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{briefing.spray_advice}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  {isHindi ? 'यह निर्णय क्यों?' : 'Why this decision?'}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHindi
                    ? 'मौसम पूर्वानुमान, फसल की मुकुट जड़ (CRI) अवस्था व वाष्पीकरण दर के सटीक विश्लेषण पर आधारित।'
                    : 'Derived from 7-day meteorological forecasts, crop growth sensitivity, and evapotranspiration data.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/irrigation"
                  className="text-xs font-bold text-forest hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>{isHindi ? 'विस्तृत सिंचाई योजना' : 'Irrigation Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Two Column Layout: Farm Overview & Weather Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: My Farm Overview (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Fields Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-forest flex items-center justify-center">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isHindi ? 'मेरे खेत एवं फसल अवस्था' : 'My Fields & Growth Stages'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHindi
                      ? `कुल क्षेत्रफल: ${profile?.total_landholding || 5} एकड़ | सक्रिय खेत: ${fields.length}`
                      : `Total Area: ${profile?.total_landholding || 5} Acres | Active Fields: ${fields.length}`}
                  </p>
                </div>
              </div>

              <Link
                href="/farms"
                className="text-xs font-semibold text-forest hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200"
              >
                <span>{isHindi ? 'खेत प्रबंध' : 'Manage'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Field Cards Grid */}
            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{f.field_name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold uppercase">
                          {f.crop_name}
                        </span>
                        <span className="text-xs text-slate-500">({f.area} एकड़)</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        <span className="font-medium text-forest">{f.stage_hindi || f.current_stage}</span>
                        <span className="text-slate-400 ml-1">· बुवाई: {f.sowing_date} ({f.days_since_sowing || 32} दिन)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">{f.progress_percentage || 25}%</span>
                      <span className="text-[10px] text-slate-500 block">{isHindi ? 'फसल चक्र' : 'Crop Cycle'}</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-forest to-fresh h-2 rounded-full transition-all duration-500"
                      style={{ width: `${f.progress_percentage || 25}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Services Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/crop-doctor"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-forest/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-forest flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">{isHindi ? 'फसल डॉक्टर' : 'Crop Doctor'}</span>
                <span className="text-[10px] text-slate-500">{isHindi ? 'पत्ता जांच व रोग निदान' : 'Visual Diagnosis'}</span>
              </div>
            </Link>

            <Link
              href="/mandi"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-forest/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">{isHindi ? 'मंडी भाव' : 'Mandi Prices'}</span>
                <span className="text-[10px] text-slate-500">{isHindi ? 'निकटतम मंडियां व लाभ' : 'Live Net Returns'}</span>
              </div>
            </Link>

            <Link
              href="/finance"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-forest/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">{isHindi ? 'कृषि वित्त' : 'Farm Finance'}</span>
                <span className="text-[10px] text-slate-500">{isHindi ? 'लागत व अनुमानित मुनाफा' : 'Expense & Profit'}</span>
              </div>
            </Link>

            <Link
              href="/seasonal"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-forest/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">{isHindi ? 'मौसमी योजना' : 'Seasonal Guide'}</span>
                <span className="text-[10px] text-slate-500">{isHindi ? 'रबी, खरीफ व जायद' : 'ICAR Best Practices'}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Right: Weather & Risk Summary (1 Col) */}
        <div className="space-y-6">
          {/* Live Weather Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {isHindi ? 'मौसम अवलोकन (Weather)' : 'Live Farm Weather'}
              </h3>
              <Link href="/weather" className="text-xs font-semibold text-forest hover:underline">
                {isHindi ? '7-दिन' : '7-Day'} →
              </Link>
            </div>

            {curr && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {Math.round(curr.temperature)}°C
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {curr.weather_condition} (आभास: {Math.round(curr.apparent_temperature)}°C)
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Thermometer className="w-7 h-7" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <CloudRain className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">{isHindi ? 'बारिश' : 'Rain'}</span>
                    <span className="text-xs font-bold text-slate-800">{curr.rain_probability}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <Droplets className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">{isHindi ? 'नमी' : 'Humidity'}</span>
                    <span className="text-xs font-bold text-slate-800">{curr.humidity}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <Wind className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 block">{isHindi ? 'हवा' : 'Wind'}</span>
                    <span className="text-xs font-bold text-slate-800">{curr.wind_speed} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Farm Risk Indicator Card */}
          {riskData && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-forest" />
                  <span className="font-bold text-slate-900 text-sm">
                    {isHindi ? 'खेत समग्र जोखिम स्कोर' : 'Farm Risk Assessment'}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${riskData.level_color}`}>
                  {riskData.risk_level}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-slate-900">{riskData.overall_score}</span>
                <span className="text-xs text-slate-500">/ 100 (सुरक्षित क्षेत्र)</span>
              </div>

              <div className="space-y-2 text-xs">
                {riskData.factors.slice(0, 2).map((fac, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold block">{isHindi ? fac.factor_name_hi : fac.factor_name_en}</span>
                      <span>{isHindi ? fac.description_hi : fac.description_en}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
