'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage, signup } = useApp();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('Faridabad');
  const [village, setVillage] = useState('Tigaon');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isHindi = language === 'hi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg(isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }
    if (!mobile.trim() && !email.trim()) {
      setErrorMsg(isHindi ? 'कृपया मोबाइल नंबर या ईमेल दर्ज करें।' : 'Please enter a mobile number or email.');
      return;
    }
    if (mobile.trim() && !/^\d{10}$/.test(mobile.trim())) {
      setErrorMsg(isHindi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(isHindi ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg(isHindi ? 'कृपया नियम व शर्तों को स्वीकार करें।' : 'Please accept the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        full_name: fullName.trim(),
        mobile: mobile.trim() || undefined,
        email: email.trim() || undefined,
        password,
        state,
        district,
        village,
        language
      });
      // signup redirects to /dashboard
    } catch (err: any) {
      setErrorMsg(err.message || (isHindi ? 'पंजीकरण विफल। कृपया पुनः प्रयास करें।' : 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-forest text-white shadow-lg shadow-forest/20 mb-2">
            <Sprout className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'किसान मित्र एआई में नया किसान खाता बनाएं' : 'Create Kisan Mitra AI Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isHindi
              ? 'स्मार्ट कृषि निर्णय, मौसम पूर्वानुमान व फसल सुरक्षा के लिए आज ही जुड़ें।'
              : 'Join Kisan Mitra AI for real-time agronomic insights and AI farm management.'}
          </p>

          {/* Language Switcher */}
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-semibold mt-2 border border-slate-200">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-full transition-all ${
                isHindi ? 'bg-forest text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full transition-all ${
                !isHindi ? 'bg-forest text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isHindi ? 'किसान का पूरा नाम' : 'Farmer Full Name'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isHindi ? 'उदाहरण: राहुल शर्मा' : 'e.g. Rahul Sharma'}
                  required
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:border-forest text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Mobile & Email in 2 columns */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isHindi ? 'मोबाइल नंबर' : 'Mobile Number'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    required
                    maxLength={10}
                    className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:border-forest text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isHindi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:border-forest text-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Location (State, District, Village) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  {isHindi ? 'राज्य' : 'State'}
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-forest text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  {isHindi ? 'जिला' : 'District'}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-forest text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  {isHindi ? 'गांव' : 'Village'}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-forest text-slate-900"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isHindi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6)'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full text-xs pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-forest text-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-forest text-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms Agree */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded-md text-forest focus:ring-forest/20 border-slate-300"
                />
                <span className="text-xs text-slate-600">
                  {isHindi
                    ? 'मैं खेतसूत्र के नियम, शर्तें और कृषि डेटा गोपनीयता नीति स्वीकार करता हूँ।'
                    : 'I agree to the KhetSutra terms, conditions, and farm data privacy policy.'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-forest hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>{isHindi ? 'खाता बनाया जा रहा है...' : 'Creating your account...'}</span>
              ) : (
                <>
                  <span>{isHindi ? 'खाता बनाएं एवं शुरू करें' : 'Create Account & Begin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Redirect */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isHindi ? 'पहले से पंजीकृत हैं?' : 'Already have an account?'}{' '}
              <Link
                href="/login"
                className="font-bold text-forest hover:text-emerald-700 hover:underline"
              >
                {isHindi ? 'यहाँ लॉगिन करें' : 'Log In Here'}
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'सुरक्षित प्रमाणीकरण • आपका डेटा निजी व गोपनीय है' : 'Multi-tenant isolation & bcrypt security'}</span>
        </div>
      </div>
    </div>
  );
}
