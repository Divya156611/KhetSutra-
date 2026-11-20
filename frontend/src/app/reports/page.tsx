'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchFinanceSummary, fetchFields, fetchRiskScore } from '../../lib/api';
import { FinanceSummary, FieldItem, RiskScoreData } from '../../types';
import {
  FileSpreadsheet,
  Download,
  IndianRupee,
  Trees,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Printer
} from 'lucide-react';

export default function ReportsPage() {
  const { language, profile } = useApp();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [risk, setRisk] = useState<RiskScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const isHindi = language === 'hi';

  useEffect(() => {
    Promise.all([
      fetchFinanceSummary().catch(() => null),
      fetchFields().catch(() => []),
      fetchRiskScore().catch(() => null)
    ]).then(([fin, flds, r]) => {
      if (fin) setSummary(fin);
      if (flds) setFields(flds);
      if (r) setRisk(r);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'समग्र कृषि प्रदर्शन रिपोर्ट (Farm Reports)' : 'Comprehensive Farm Reports'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isHindi
              ? 'वर्तमान मौसम का लागत, उत्पादन अनुमान, जोखिम विश्लेषण व खेत सारांश।'
              : 'Seasonal performance executive summary, cost analytics, and agronomic risk assessment.'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>{isHindi ? 'प्रिंट / PDF सेव करें' : 'Print / Save PDF'}</span>
        </button>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Farm Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="text-xs font-bold text-forest uppercase tracking-wider">KhetSutra Farm Audit Report</div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {profile?.full_name || 'राहुल शर्मा'}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              ग्राम: {profile?.village || 'तिगांव'}, जिला: {profile?.district || 'फरीदाबाद'} (हरियाणा)
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>दिनांक: {new Date().toLocaleDateString('hi-IN')}</div>
            <div className="font-semibold text-slate-700 mt-0.5">सत्र: रबी 2026-27</div>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">
              {isHindi ? 'कुल कृषि रकबा' : 'Total Acreage'}
            </span>
            <span className="text-xl font-black text-slate-900">
              {profile?.total_landholding || 5} एकड़
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{fields.length} सक्रिय खेत</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">
              {isHindi ? 'वर्तमान निवेश' : 'Total Invested'}
            </span>
            <span className="text-xl font-black text-slate-900">
              ₹{summary?.total_investment.toLocaleString('en-IN') || 0}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">₹{summary?.cost_per_acre || 0}/एकड़</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] text-emerald-800 font-bold uppercase block mb-1">
              {isHindi ? 'अनुमानित शुद्ध लाभ' : 'Estimated Net Profit'}
            </span>
            <span className="text-xl font-black text-forest">
              ₹{summary?.estimated_profit.toLocaleString('en-IN') || 0}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">{summary?.profit_margin_percent}% मार्जिन</span>
          </div>
        </div>

        {/* Fields Breakdown Table */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-3">
            {isHindi ? '1. सक्रिय खेत एवं फसल विकास स्थिति' : '1. Field Holdings & Phenological Status'}
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">खेत का नाम</th>
                  <th className="p-3">फसल / किस्म</th>
                  <th className="p-3">क्षेत्रफल</th>
                  <th className="p-3">वर्तमान अवस्था</th>
                  <th className="p-3">बुवाई तारीख</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fields.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{f.field_name}</td>
                    <td className="p-3 capitalize">{f.crop_name} ({f.crop_variety || 'उन्नत'})</td>
                    <td className="p-3">{f.area} एकड़</td>
                    <td className="p-3 text-forest font-semibold">{f.stage_hindi || f.current_stage}</td>
                    <td className="p-3">{f.sowing_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Category Table */}
        {summary && (
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              {isHindi ? '2. परिचालन खर्च विवरण (Expense Breakdown)' : '2. Operational Expenditure Distribution'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(summary.expenses_by_category).map(([c, val]) => (
                <div key={c} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="capitalize font-semibold text-slate-700">{c}</span>
                  <span className="font-bold text-slate-900">₹{val.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agronomic Risk Section */}
        {risk && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                {isHindi ? '3. समग्र मौसम एवं कृषि जोखिम सूचकांक:' : '3. Agro-Meteorological Risk Index:'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${risk.level_color}`}>
                {risk.risk_level} ({risk.overall_score}/100)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isHindi ? risk.recommendations_hi[0] : risk.recommendations_en[0]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
