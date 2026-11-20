'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { fetchHarvestPlan } from '../../lib/api';
import { HarvestPlannerItem } from '../../types';
import {
  Scissors,
  Calendar,
  CloudSun,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  RefreshCw
} from 'lucide-react';

export default function HarvestPlannerPage() {
  const { language } = useApp();
  const [plans, setPlans] = useState<HarvestPlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isHindi = language === 'hi';

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchHarvestPlan();
      setPlans(res);
    } catch {
      setPlans([]);
      setError(isHindi ? 'कटाई योजना लोड नहीं हो सकी। लॉगिन जांचें और फिर प्रयास करें।' : 'Could not load the harvest plan. Check your login and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scissors className="w-6 h-6 text-golden-dark" />
          <span>{isHindi ? 'कटाई योजनाकार (Harvest Planning Assistant)' : 'Harvest Planning Assistant'}</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {isHindi
            ? 'फसल पकने की संभावित तारीख, मौसम आधारित सुरक्षित कटाई खिड़की एवं भंडारण मार्गदर्शन।'
            : 'Estimate physiological maturity dates and monitor rain-free harvesting windows.'}
        </p>
      </div>

      {/* Field Cards */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          {isHindi ? 'आपके खेतों की कटाई योजना लोड हो रही है...' : 'Loading harvest plans for your fields...'}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={loadData} className="font-bold underline">{isHindi ? 'फिर प्रयास करें' : 'Retry'}</button>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <Scissors className="mx-auto mb-3 h-9 w-9 text-forest" />
          <h2 className="text-lg font-bold text-slate-900">{isHindi ? 'अभी कोई खेत दर्ज नहीं है' : 'No farm fields yet'}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {isHindi ? 'कटाई की तारीख और मौसम सलाह पाने के लिए पहले खेत में फसल और बुवाई की तारीख जोड़ें।' : 'Add a field with its crop and sowing date to get a harvest estimate and weather guidance.'}
          </p>
          <Link href="/farms" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" />
            {isHindi ? 'खेत और फसल जोड़ें' : 'Add a field and crop'}
          </Link>
        </div>
      )}

      {!loading && !error && plans.length > 0 && <div className="space-y-6">
        {plans.map((item) => (
          <div
            key={item.field_id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item.field_name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-forest">{item.crop_name}</span> · बुवाई: {item.sowing_date} ({item.days_since_sowing} दिन पूरे / कुल {item.total_duration_days} दिन)
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  item.weather_window_status === 'Optimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.weather_window_status === 'Approaching'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.weather_window_status}
              </span>
            </div>

            {/* Maturity Visual Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700">
                  {isHindi ? 'फसल परिपक्वता (Maturity Status):' : 'Crop Maturity Status:'}
                </span>
                <span className="font-black text-forest text-sm">{item.maturity_percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-forest h-3 rounded-full transition-all duration-500"
                  style={{ width: `${item.maturity_percentage}%` }}
                />
              </div>
            </div>

            {/* Timeline Window Grid */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-forest shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {isHindi ? 'अनुमानित कटाई अवधि:' : 'Expected Harvest Window:'}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {item.estimated_harvest_start} से {item.estimated_harvest_end}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <CloudSun className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {isHindi ? 'अगले 7 दिनों में अधिकतम वर्षा संभावना:' : 'Next 7-Day Rain Risk:'}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {item.rain_probability_next_7_days}% ({item.rain_probability_next_7_days > 40 ? 'वर्षा चेतावनी' : 'मौसम अनुकूल'})
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-bold text-amber-900 block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{isHindi ? 'कटाई एवं सुखाने संबंधी सावधानियां:' : 'Harvesting & Safe Storage Guidelines:'}</span>
              </span>
              <ul className="text-xs text-slate-800 space-y-1 list-disc list-inside">
                {(isHindi ? item.recommendations_hi : item.recommendations_en).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
