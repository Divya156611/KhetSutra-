'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchFinanceSummary, addExpense, deleteExpense } from '../../lib/api';
import { FinanceSummary } from '../../types';
import {
  IndianRupee,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  X
} from 'lucide-react';

export default function FarmFinancePage() {
  const { language } = useApp();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    category: 'fertilizers',
    amount: 1500,
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_projected: false
  });

  const isHindi = language === 'hi';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchFinanceSummary();
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    try {
      setSaving(true);
      await addExpense(form);
      setShowModal(false);
      setForm({
        category: 'fertilizers',
        amount: 1500,
        description: '',
        date: new Date().toISOString().split('T')[0],
        is_projected: false
      });
      await loadData();
    } catch (err) {
      alert('Error recording expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isHindi ? 'क्या आप इस खर्च को हटाना चाहते हैं?' : 'Delete this expense entry?')) return;
    try {
      await deleteExpense(id);
      await loadData();
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'कृषि वित्त प्रबंधक (Farm Finance Manager)' : 'Farm Finance Manager'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isHindi
              ? 'बीज, खाद, कीटनाशक, डीजल व मजदूरी खर्च ट्रैक करें। प्रति एकड़ लागत व शुद्ध मुनाफे का सटीक हिसाब।'
              : 'Record farm operational expenditures, analyze cost-per-acre, and track projected net profits.'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-forest hover:bg-forest-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? '+ नया खर्च दर्ज करें' : '+ Record Expense'}</span>
        </button>
      </div>

      {/* Finance Overview Cards Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              {isHindi ? 'कुल वास्तविक निवेश' : 'Total Investment'}
            </span>
            <div className="text-2xl font-black text-slate-900">
              ₹{summary.total_investment.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ₹{summary.cost_per_acre.toLocaleString('en-IN')} / एकड़
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              {isHindi ? 'अनुमानित कुल लागत' : 'Projected Total Cost'}
            </span>
            <div className="text-2xl font-black text-slate-900">
              ₹{(summary.actual_expenses + summary.projected_expenses).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isHindi ? 'कटाई भाड़ा सहित' : 'Includes harvesting buffer'}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              {isHindi ? 'अनुमानित कुल आय' : 'Projected Revenue'}
            </span>
            <div className="text-2xl font-black text-emerald-700 flex items-center">
              ₹{summary.estimated_revenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              {summary.total_acres} एकड़ उत्पादन आधार
            </div>
          </div>

          <div className="bg-gradient-to-br from-forest-900 to-forest text-white rounded-3xl p-5 shadow-md">
            <span className="text-[11px] font-bold text-emerald-200 uppercase block mb-1">
              {isHindi ? 'अनुमानित शुद्ध लाभ' : 'Estimated Net Profit'}
            </span>
            <div className="text-2xl font-black text-white">
              ₹{summary.estimated_profit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-golden font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{summary.profit_margin_percent}% लाभ मार्जिन</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown & Transaction History */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            {isHindi ? 'मद अनुसार खर्च विवरण' : 'Expenses by Category'}
          </h3>

          <div className="space-y-3">
            {summary && Object.entries(summary.expenses_by_category).map(([cat, amt]) => {
              const total = summary.total_investment || 1;
              const pct = Math.round((amt / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="capitalize text-slate-700">{cat}</span>
                    <span className="text-slate-900">₹{amt.toLocaleString('en-IN')} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-forest h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Expenses (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {isHindi ? 'हाल ही में दर्ज खर्च (Transactions)' : 'Recent Expense Entries'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              कुल {summary?.recent_transactions?.length || 0} प्रविष्टियां
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recent_transactions?.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 capitalize">
                    {t.category}: {t.description || 'कृषि व्यय'}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {t.date} · {t.field_name}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 text-sm">
                    ₹{t.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-lg">
                {isHindi ? 'नया खर्च दर्ज करें' : 'Record Farm Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'खर्च की श्रेणी' : 'Category'} *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                >
                  <option value="seeds">बीज (Seeds)</option>
                  <option value="fertilizers">उर्वरक / खाद (Fertilizers)</option>
                  <option value="pesticides">कीटनाशक (Pesticides)</option>
                  <option value="machinery">ट्रैक्टर व मशीनरी भाड़ा</option>
                  <option value="labour">मजदूरी (Labour)</option>
                  <option value="irrigation">सिंचाई डीजल / बिजली शुल्क</option>
                  <option value="transport">परिवहन (Transport)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'राशि (Amount in ₹)' : 'Amount (₹)'} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'विवरण' : 'Description / Notes'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. 2 बोरी डीएपी व 1 बोरी यूरिया"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'तारीख' : 'Date'} *
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-bold text-white bg-forest hover:bg-forest-800 rounded-xl shadow-md"
                >
                  {saving ? (isHindi ? 'सहेज रहे हैं...' : 'Saving...') : (isHindi ? 'सहेजें' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
