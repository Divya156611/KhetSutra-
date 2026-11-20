'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchSchemes } from '../../lib/api';
import { GovernmentScheme } from '../../types';
import {
  Landmark,
  ExternalLink,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function GovernmentSchemesPage() {
  const { language } = useApp();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);

  const isHindi = language === 'hi';

  useEffect(() => {
    fetchSchemes().then((data) => {
      setSchemes(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-forest" />
          <span>{isHindi ? 'सरकारी कृषि योजनाएं (Government Schemes)' : 'Government Agricultural Schemes'}</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {isHindi
            ? 'पीएम-किसान, फसल बीमा, केसीसी एवं कृषि यंत्र सब्सिडी की आधिकारिक पात्रता, जरूरी दस्तावेज व आवेदन लिंक।'
            : 'Official eligibility requirements, document checklists, and application links for major central schemes.'}
        </p>
      </div>

      {/* Schemes Grid */}
      <div className="space-y-6">
        {schemes.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {s.scheme_code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {isHindi ? s.name_hi : s.name_en}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">{s.ministry}</div>
              </div>

              {s.benefit_amount && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 self-start sm:self-auto">
                  {s.benefit_amount}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {isHindi ? s.description_hi : s.description_en}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-forest" />
                  <span>{isHindi ? 'पात्रता (Eligibility):' : 'Eligibility:'}</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {isHindi ? s.eligibility_hi : s.eligibility_en}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-forest" />
                  <span>{isHindi ? 'आवश्यक दस्तावेज (Documents):' : 'Required Documents:'}</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {isHindi ? s.documents_hi : s.documents_en}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>सत्यापित: {s.last_verified}</span>
              </div>

              <a
                href={s.official_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-forest hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200"
              >
                <span>{isHindi ? 'आधिकारिक पोर्टल पर जाएं' : 'Official Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
