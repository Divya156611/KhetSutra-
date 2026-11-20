'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, login } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isHindi = language === 'hi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg(isHindi ? 'कृपया मोबाइल नंबर या ईमेल दर्ज करें।' : 'Please enter mobile number or email.');
      return;
    }
    if (!password) {
      setErrorMsg(isHindi ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password, rememberMe);
      // login method will push to /dashboard
    } catch (err: any) {
      setErrorMsg(err.message || (isHindi ? 'लॉगिन विफल। कृपया विवरण जांचें।' : 'Login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-forest text-white shadow-lg shadow-forest/20 mb-2">
            <Sprout className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'किसान मित्र एआई में लॉगिन करें' : 'Login to Kisan Mitra AI'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isHindi
              ? 'स्मार्ट खेती। सही निर्णय। अपने कृषि खाते में प्रवेश करें।'
              : 'Smart Farming. Smarter Decisions. Access your farm copilot.'}
          </p>

          {/* Language Switcher Pill */}
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

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile or Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isHindi ? 'मोबाइल नंबर या ईमेल' : 'Mobile Number or Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isHindi ? '9876543210 या farmer@example.com' : '9876543210 or farmer@example.com'}
                  required
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:border-forest text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  {isHindi ? 'पासवर्ड' : 'Password'}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-forest hover:text-emerald-700 hover:underline"
                >
                  {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                </Link>
              </div>
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
                  className="w-full text-xs pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-forest/20 focus:border-forest text-slate-900 transition-all"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-forest focus:ring-forest/20 border-slate-300"
                />
                <span className="text-xs text-slate-600 font-medium">
                  {isHindi ? 'मुझे याद रखें (30 दिन)' : 'Remember me (30 days)'}
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
                <span>{isHindi ? 'सत्यापित हो रहा है...' : 'Verifying credentials...'}</span>
              ) : (
                <>
                  <span>{isHindi ? 'लॉगिन करें' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Redirect */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isHindi ? 'नया खाता बनाना चाहते हैं?' : "Don't have an account?"}{' '}
              <Link
                href="/signup"
                className="font-bold text-forest hover:text-emerald-700 hover:underline"
              >
                {isHindi ? 'यहाँ रजिस्टर करें (नया किसान)' : 'Register Here'}
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'सुरक्षित प्रमाणीकरण • 256-बिट डेटा एन्क्रिप्शन' : 'End-to-End Secure JWT & Bcrypt Architecture'}</span>
        </div>
      </div>
    </div>
  );
}
