'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchWeatherForecast, fetchRiskScore } from '../../lib/api';
import { WeatherForecastResponse, RiskScoreData } from '../../types';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Calendar,
  CloudRain,
  ShieldAlert,
  RefreshCw,
  Info
} from 'lucide-react';

export default function WeatherPage() {
  const { language, profile } = useApp();
  const [forecast, setForecast] = useState<WeatherForecastResponse | null>(null);
  const [risk, setRisk] = useState<RiskScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const isHindi = language === 'hi';

  const loadData = async () => {
    try {
      setLoading(true);
      const [f, r] = await Promise.all([
        fetchWeatherForecast().catch(() => null),
        fetchRiskScore().catch(() => null)
      ]);
      if (f) setForecast(f);
      if (r) setRisk(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const curr = forecast?.current;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'मौसम पूर्वानुमान व कृषि जोखिम (Weather & Risk)' : 'Weather Forecast & Agro-Risk'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            स्थान: <strong className="text-slate-900">{forecast?.location || `${profile?.village}, ${profile?.district}`}</strong> (7-Day High Resolution Agro-Met Forecast)
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-300 hover:border-forest text-slate-700 hover:text-forest px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isHindi ? 'रिफ्रेश करें' : 'Refresh'}</span>
        </button>
      </div>

      {/* Current Conditions Card */}
      {curr && (
        <div className="bg-gradient-to-r from-forest to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/20 text-emerald-100 uppercase">
                {isHindi ? 'वर्तमान मौसम स्थिति' : 'Current Farm Meteorology'}
              </span>
              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-5xl font-black">{Math.round(curr.temperature)}°C</span>
                <span className="text-emerald-100 text-base font-semibold">
                  {curr.weather_condition}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {isHindi ? 'आभासी तापमान: ' : 'Apparent Temp: '} {Math.round(curr.apparent_temperature)}°C · अपडेट: {curr.updated_at}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                <CloudRain className="w-5 h-5 text-blue-200 mx-auto mb-1" />
                <span className="text-[10px] text-emerald-200 block">{isHindi ? 'बारिश संभावना' : 'Rain Prob'}</span>
                <span className="text-sm font-bold text-white">{curr.rain_probability}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                <Droplets className="w-5 h-5 text-cyan-200 mx-auto mb-1" />
                <span className="text-[10px] text-emerald-200 block">{isHindi ? 'आर्द्रता / नमी' : 'Humidity'}</span>
                <span className="text-sm font-bold text-white">{curr.humidity}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                <Wind className="w-5 h-5 text-emerald-200 mx-auto mb-1" />
                <span className="text-[10px] text-emerald-200 block">{isHindi ? 'हवा गति' : 'Wind Speed'}</span>
                <span className="text-sm font-bold text-white">{curr.wind_speed} km/h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isHindi ? '7-दिवसीय दैनिक पूर्वानुमान एवं फसल प्रभाव' : '7-Day Agricultural Impact Forecast'}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {forecast?.daily.map((day, idx) => (
            <div
              key={day.date}
              className={`bg-white rounded-3xl p-5 border shadow-xs space-y-3 ${
                idx === 0 ? 'border-forest/50 ring-2 ring-forest/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {idx === 0 ? (isHindi ? 'आज (Today)' : 'Today') : day.day_name}
                  </span>
                  <span className="text-[10px] text-slate-400">{day.date}</span>
                </div>
                <span className="text-xs font-semibold text-slate-600">{day.weather_condition}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{isHindi ? 'अधिकतम / न्यूनतम' : 'Max / Min'}</span>
                  <span className="font-black text-slate-800 text-base">
                    {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°C
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{isHindi ? 'बारिश' : 'Rain'}</span>
                  <span className={`font-bold ${day.rain_probability > 30 ? 'text-blue-600' : 'text-slate-700'}`}>
                    {day.rain_probability}% ({day.precipitation_sum}mm)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-forest block mb-0.5">{isHindi ? 'कृषि प्रभाव:' : 'Crop Implication:'}</span>
                <span>{day.crop_implication}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors Section */}
      {risk && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-forest" />
              <span>{isHindi ? 'खेत स्तर के विस्तृत जोखिम कारक' : 'Detailed Field Agro-Risk Factors'}</span>
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${risk.level_color}`}>
              {risk.risk_level} Risk
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {risk.factors.map((f, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{isHindi ? f.factor_name_hi : f.factor_name_en}</span>
                  <span className="text-forest">{f.score}/100</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {isHindi ? f.description_hi : f.description_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
