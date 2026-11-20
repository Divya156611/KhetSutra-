'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchFields, createField, deleteField } from '../../lib/api';
import { FieldItem, FieldCreateInput } from '../../types';
import {
  Trees,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Droplets,
  Sprout,
  CheckCircle2,
  X,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function MyFarmsPage() {
  const { language, profile } = useApp();
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FieldCreateInput>({
    field_name: '',
    area: 2.0,
    crop_name: 'wheat',
    crop_variety: '',
    sowing_date: new Date().toISOString().split('T')[0],
    soil_type: 'loamy',
    irrigation_method: 'canal',
    previous_crop: 'rice'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchFields();
      setFields(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.field_name.trim()) return;
    try {
      setSaving(true);
      await createField(formData);
      setShowAddModal(false);
      setFormData({
        field_name: '',
        area: 2.0,
        crop_name: 'wheat',
        crop_variety: '',
        sowing_date: new Date().toISOString().split('T')[0],
        soil_type: 'loamy',
        irrigation_method: 'canal',
        previous_crop: 'rice'
      });
      await loadData();
    } catch (err) {
      alert('Error creating field');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'hi' ? 'क्या आप इस खेत को हटाना चाहते हैं?' : 'Are you sure you want to remove this field?')) return;
    try {
      await deleteField(id);
      setFields(fields.filter(f => f.id !== id));
    } catch (err) {
      alert('Error deleting field');
    }
  };

  const isHindi = language === 'hi';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trees className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'मेरे खेत प्रबंध (My Farms)' : 'My Farms & Fields'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isHindi
              ? 'अपने सभी खेतों का विवरण, फसल चक्र व वर्तमान विकास अवस्था ट्रैक करें।'
              : 'Track crop life cycle, acreage, soil types, and active stages across all fields.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-forest hover:bg-forest-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? '+ नया खेत जोड़ें' : '+ Add New Field'}</span>
        </button>
      </div>

      {/* Field List */}
      <div className="grid md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div
            key={field.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{field.field_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                      {field.crop_name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {field.area} एकड़ | {field.crop_variety || 'उन्नत किस्म'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(field.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stage Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">
                    {isHindi ? 'वर्तमान अवस्था: ' : 'Growth Stage: '}
                    <span className="text-forest">{field.stage_hindi || field.current_stage}</span>
                  </span>
                  <span className="font-bold text-slate-900">{field.progress_percentage || 30}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-forest to-fresh h-2 rounded-full transition-all"
                    style={{ width: `${field.progress_percentage || 30}%` }}
                  />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                  <Calendar className="w-3.5 h-3.5 text-forest" />
                  <span>बुवाई: {field.sowing_date}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                  <Layers className="w-3.5 h-3.5 text-forest" />
                  <span>मिट्टी: {field.soil_type}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                  <Droplets className="w-3.5 h-3.5 text-forest" />
                  <span>सिंचाई: {field.irrigation_method}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                  <Sprout className="w-3.5 h-3.5 text-forest" />
                  <span>पिछली फसल: {field.previous_crop || 'fallow'}</span>
                </div>
              </div>
            </div>

            {/* Field Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/irrigation`}
                className="text-xs font-semibold text-forest hover:text-emerald-700 flex items-center gap-1"
              >
                <span>{isHindi ? 'सिंचाई परामर्श' : 'Irrigation Advice'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href={`/crop-doctor`}
                className="text-xs font-semibold text-slate-600 hover:text-forest flex items-center gap-1"
              >
                <span>{isHindi ? 'रोग जांच' : 'Check Diseases'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-lg">
                {isHindi ? 'नया खेत जोड़ें (Add Field)' : 'Add New Agricultural Field'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHindi ? 'खेत का नाम (Field Name)' : 'Field Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. उत्तर खेत (North Plot)"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'क्षेत्रफल (Area in Acres)' : 'Area (Acres)'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 1.0 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'फसल (Crop)' : 'Crop'} *
                  </label>
                  <select
                    value={formData.crop_name}
                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden capitalize"
                  >
                    <option value="wheat">गेहूँ (Wheat)</option>
                    <option value="mustard">सरसों (Mustard)</option>
                    <option value="rice">धान / चावल (Rice)</option>
                    <option value="cotton">कपास (Cotton)</option>
                    <option value="potato">आलू (Potato)</option>
                    <option value="tomato">टमाटर (Tomato)</option>
                    <option value="onion">प्याज (Onion)</option>
                    <option value="maize">मक्का (Maize)</option>
                    <option value="chickpea">चना (Chickpea)</option>
                    <option value="sugarcane">गन्ना (Sugarcane)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'किस्म (Variety)' : 'Variety (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="HD-2967 / DBW-187"
                    value={formData.crop_variety}
                    onChange={(e) => setFormData({ ...formData, crop_variety: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'बुवाई तिथि (Sowing Date)' : 'Sowing Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.sowing_date}
                    onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'मिट्टी का प्रकार' : 'Soil Type'}
                  </label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
                  >
                    <option value="loamy">दोमट (Loamy)</option>
                    <option value="clay">चिकनी (Clay)</option>
                    <option value="sandy">बलुई (Sandy)</option>
                    <option value="black">काली मिट्टी (Black Soil)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'सिंचाई साधन' : 'Irrigation Method'}
                  </label>
                  <select
                    value={formData.irrigation_method}
                    onChange={(e) => setFormData({ ...formData, irrigation_method: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
                  >
                    <option value="canal">नहर (Canal)</option>
                    <option value="borewell">ट्यूबवेल / बोरवेल</option>
                    <option value="drip">ड्रिप सिंचाई (Drip)</option>
                    <option value="sprinkler">स्प्रिंकलर (Sprinkler)</option>
                    <option value="rainfed">वर्षा आधारित (Rainfed)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-forest hover:bg-forest-800 rounded-xl shadow-md transition-all"
                >
                  {saving ? (isHindi ? 'जोड़ रहे हैं...' : 'Saving...') : (isHindi ? 'खेत जोड़ें' : 'Add Field')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
