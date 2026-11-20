'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchIrrigationPlan, logActivity } from '../../lib/api';
import { IrrigationPlanItem } from '../../types';
import {
  Droplets,
  CloudRain,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function IrrigationPlannerPage() {
  const { language } = useApp();
  const [plans, setPlans] = useState<IrrigationPlanItem[]>([]);
  const [tip, setTip] = useState({ en: '', hi: '' });
  const [loading, setLoading] = useState(true);
  const [loggingId, setLoggingId] = useState<number | null>(null);

  const isHindi = language === 'hi';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchIrrigationPlan();
      setPlans(res.plans || []);
      setTip({ en: res.general_tip_en, hi: res.general_tip_hi });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkDone = async (plan: IrrigationPlanItem) => {
    try {
      setLoggingId(plan.field_id);
      await logActivity({
        field_id: plan.field_id,
        activity_type: 'irrigation',
        title: `${plan.field_name} - सिंचाई संपन्न (${plan.method})`,
        notes: `सिंचाई अवस्था: ${plan.stage_hindi}। जल स्रोत: ${plan.method}`,
        date: new Date().toISOString().split('T')[0],
        cost: 1200.0
      });
      alert(isHindi ? 'सिंचाई सफलतापूर्वक फार्म डायरी में दर्ज की गई!' : 'Irrigation recorded in Farm Diary!');
    } catch (err) {
      alert('Error recording irrigation');
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-blue-600" />
          <span>{isHindi ? 'स्मार्ट सिंचाई योजनाकार (Smart Irrigation Planner)' : 'Smart Irrigation Planner'}</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {isHindi
            ? 'मौसम पूर्वानुमान, फसल की विकास अवस्था व मिट्टी के प्रकार पर आधारित वैज्ञानिक सिंचाई अनुशंसाएं।'
            : 'Scientific irrigation schedule dynamically adjusted to 7-day precipitation forecasts and soil water retention.'}
        </p>
      </div>

      {/* Evapotranspiration Tip Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">{isHindi ? 'जल संरक्षण एवं वाष्पीकरण सुझाव:' : 'Water Conservation Advisory:'}</span>
          <span>{isHindi ? tip.hi : tip.en}</span>
        </div>
      </div>

      {/* Field-by-Field Plans */}
      <div className="space-y-6">
        {plans.map((p) => {
          const isWarning = p.urgency === 'warning';
          const isCaution = p.urgency === 'caution';

          return (
            <div
              key={p.field_id}
              className={`rounded-3xl p-6 border shadow-xs transition-all ${
                isWarning
                  ? 'bg-amber-50/90 border-amber-300'
                  : isCaution
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{p.field_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {p.crop_name} ({p.area} एकड़)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    <span>{isHindi ? 'वर्तमान अवस्था: ' : 'Stage: '}</span>
                    <span className="font-semibold text-forest">{isHindi ? p.stage_hindi : p.current_stage}</span>
                    <span className="ml-2">· मिट्टी: {p.soil_type} · स्रोत: {p.method}</span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto ${
                    isWarning
                      ? 'bg-amber-600 text-white'
                      : isCaution
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {isHindi ? p.irrigation_action_hi : p.irrigation_action}
                </div>
              </div>

              {/* Action Body */}
              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    {isHindi ? 'वैज्ञानिक कारण (Agronomic Reason):' : 'Agronomic Rationale:'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {p.reason}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80">
                  <span className="text-xs font-bold text-forest block mb-1">
                    {isHindi ? 'अनुशंसित कदम (Action Steps):' : 'Actionable Recommendation:'}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {p.recommendation}
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-forest" />
                  <span>{isHindi ? p.water_need_hi : p.water_need}</span>
                </div>

                <button
                  onClick={() => handleMarkDone(p)}
                  disabled={loggingId === p.field_id}
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {loggingId === p.field_id
                      ? (isHindi ? 'दर्ज हो रहा है...' : 'Saving...')
                      : (isHindi ? 'सिंचाई संपन्न दर्ज करें' : 'Log as Completed')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
