'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { saveFullProfile } from '../../lib/api';
import { FullFarmerProfile } from '../../types';
import {
  UserCog,
  Save,
  CheckCircle2,
  MapPin,
  Layers,
  Droplets,
  Languages,
  ShieldCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function ProfilePage() {
  const { language, setLanguage, profile, refreshProfile, logout } = useApp();
  const [formData, setFormData] = useState<Partial<FullFarmerProfile>>({});
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const isHindi = language === 'hi';

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveFullProfile(formData);
      await refreshProfile();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-forest" />
          <span>{isHindi ? 'किसान प्रोफ़ाइल व सेटिंग्स (Profile & Settings)' : 'Farmer Profile & Settings'}</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {isHindi
            ? 'अपनी व्यक्तिगत जानकारी, भूमि विवरण व पसंदीदा भाषा अपडेट करें।'
            : 'Update your personal credentials, farm location, soil profile, and interface language.'}
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
          <span>{isHindi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Farmer profile updated successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Section 1: Personal & Language */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-4">
            {isHindi ? '1. व्यक्तिगत जानकारी एवं भाषा' : '1. Personal Details & Language'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'पूरा नाम (Full Name)' : 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Number'} *
              </label>
              <input
                type="text"
                required
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'पसंदीदा भाषा (Interface Language)' : 'Preferred Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('hi');
                    setFormData({ ...formData, language: 'hi' });
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.language === 'hi'
                      ? 'bg-forest text-white border-forest shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setFormData({ ...formData, language: 'en' });
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.language === 'en'
                      ? 'bg-forest text-white border-forest shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-4">
            {isHindi ? '2. खेत का स्थान (Farm Location)' : '2. Farm Location'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'राज्य (State)' : 'State'}
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'जिला (District)' : 'District'} *
              </label>
              <input
                type="text"
                required
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'गांव / कस्बा (Village)' : 'Village'} *
              </label>
              <input
                type="text"
                required
                value={formData.village || ''}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'पिन कोड (PIN Code)' : 'PIN Code'}
              </label>
              <input
                type="text"
                value={formData.pincode || ''}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Farm Holding & Agronomy */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-4">
            {isHindi ? '3. कृषि भूमि एवं प्राथमिक संसाधन' : '3. Landholding & Primary Agronomic Methods'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'कुल कृषि भूमि (Total Landholding)' : 'Total Landholding (Acres)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.total_landholding || 5}
                onChange={(e) => setFormData({ ...formData, total_landholding: parseFloat(e.target.value) || 1 })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'प्राथमिक मिट्टी का प्रकार' : 'Primary Soil Type'}
              </label>
              <select
                value={formData.primary_soil_type || 'loamy'}
                onChange={(e) => setFormData({ ...formData, primary_soil_type: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              >
                <option value="loamy">दोमट (Loamy)</option>
                <option value="clay">चिकनी (Clay)</option>
                <option value="sandy">बलुई (Sandy)</option>
                <option value="black">काली मिट्टी (Black Soil)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                {isHindi ? 'प्राथमिक सिंचाई साधन' : 'Primary Irrigation Method'}
              </label>
              <select
                value={formData.primary_irrigation_method || 'canal'}
                onChange={(e) => setFormData({ ...formData, primary_irrigation_method: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-forest"
              >
                <option value="canal">नहर (Canal)</option>
                <option value="borewell">ट्यूबवेल / बोरवेल (Tubewell)</option>
                <option value="drip">ड्रिप सिंचाई (Drip)</option>
                <option value="sprinkler">स्प्रिंकलर (Sprinkler)</option>
                <option value="rainfed">वर्षा आधारित (Rainfed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
          <span>
            {isHindi
              ? 'गोपनीयता नीति: आपकी निजी जानकारी व खेत डेटा सुरक्षित है और किसी अन्य उपयोगकर्ता को नहीं दिखाया जाता।'
              : 'Data Privacy Assurance: Farmer data is strictly isolated and never exposed to other accounts.'}
          </span>
        </div>

        {/* Submit & Logout */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={async () => {
              if (confirm(isHindi ? 'क्या आप वाकई लॉगआउट करना चाहते हैं?' : 'Are you sure you want to logout?')) {
                setLoggingOut(true);
                await logout();
              }
            }}
            disabled={loggingOut}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isHindi ? 'खाते से लॉगआउट करें' : 'Log Out Account'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest hover:bg-forest-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? (isHindi ? 'सहेज रहे हैं...' : 'Saving...') : (isHindi ? 'प्रोफ़ाइल सुरक्षित करें' : 'Save Profile')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
