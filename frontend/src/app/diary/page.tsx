'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchActivities, logActivity, deleteActivity, fetchFields } from '../../lib/api';
import { FarmActivityItem, FieldItem } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sprout,
  Droplets,
  Bug,
  Sparkles,
  Scissors,
  CheckCircle2,
  X
} from 'lucide-react';

export default function FarmDiaryPage() {
  const { language } = useApp();
  const [activities, setActivities] = useState<FarmActivityItem[]>([]);
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    field_id: undefined as number | undefined,
    activity_type: 'irrigation',
    title: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    cost: 0
  });

  const isHindi = language === 'hi';

  const loadData = async () => {
    try {
      setLoading(true);
      const [actData, fldData] = await Promise.all([
        fetchActivities(),
        fetchFields().catch(() => [])
      ]);
      setActivities(actData);
      setFields(fldData);
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
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      await logActivity(form);
      setShowModal(false);
      setForm({
        field_id: undefined,
        activity_type: 'irrigation',
        title: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        cost: 0
      });
      await loadData();
    } catch (err) {
      alert('Error saving activity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isHindi ? 'क्या आप इस प्रविष्टि को हटाना चाहते हैं?' : 'Remove this activity entry?')) return;
    try {
      await deleteActivity(id);
      await loadData();
    } catch (err) {
      alert('Error deleting activity');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'irrigation': return Droplets;
      case 'sowing': return Sprout;
      case 'pest_obs':
      case 'disease_obs': return Bug;
      case 'harvest': return Scissors;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'डिजिटल फार्म डायरी (Farm Digital Diary)' : 'Farm Digital Diary'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isHindi
              ? 'बुवाई, सिंचाई, खाद छिड़काव व कीट निगरानी का डिजिटल रिकॉर्ड। एआई इस इतिहास से सटीक सलाह देता है।'
              : 'Historical field activity timeline leveraged by AI Copilot for personalized recommendations.'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-forest hover:bg-forest-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? '+ कार्य दर्ज करें' : '+ Log Activity'}</span>
        </button>
      </div>

      {/* Activities Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {activities.map((act) => {
          const Icon = getActivityIcon(act.activity_type);

          return (
            <div key={act.id} className="relative group">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center ring-4 ring-slate-50">
                <Icon className="w-3 h-3" />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{act.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {act.date} · {act.field_name || 'सभी खेत'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {act.cost > 0 && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        ₹{act.cost}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(act.id)}
                      className="p-1 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {act.notes && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {act.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-lg">
                {isHindi ? 'खेत कार्य दर्ज करें' : 'Record Farm Activity'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'कार्य प्रकार' : 'Activity Type'} *
                </label>
                <select
                  value={form.activity_type}
                  onChange={(e) => setForm({ ...form, activity_type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                >
                  <option value="irrigation">सिंचाई (Irrigation)</option>
                  <option value="fertilizer">उर्वरक अनुप्रयोग (Fertilizer)</option>
                  <option value="spray">स्प्रे / कीटनाशक (Spraying)</option>
                  <option value="pest_obs">कीट व रोग निरीक्षण (Pest Scouting)</option>
                  <option value="sowing">बुवाई (Sowing)</option>
                  <option value="harvest">कटाई व थ्रेशिंग (Harvesting)</option>
                  <option value="other">अन्य कृषि कार्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'खेत चुनें' : 'Select Field'}
                </label>
                <select
                  value={form.field_id || ''}
                  onChange={(e) => setForm({ ...form, field_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                >
                  <option value="">सभी खेत (General / All Fields)</option>
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.field_name} ({f.crop_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'शीर्षक' : 'Title / Activity Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. दूसरी सिंचाई पूरी की"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'टिप्पणी / विवरण' : 'Notes / Observations'}
                </label>
                <textarea
                  rows={3}
                  placeholder="खेत की स्थिति, कीट का असर, या प्रयुक्त सामग्री..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHindi ? 'खर्च (₹ में)' : 'Cost (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
                  />
                </div>
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
                  {saving ? (isHindi ? 'दर्ज हो रहा है...' : 'Saving...') : (isHindi ? 'दर्ज करें' : 'Save Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
