'use client';

import Link from 'next/link';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ForgotPasswordPage() {
  const { language, setLanguage } = useApp();
  const isHindi = language === 'hi';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center space-y-5">
        <div className="inline-flex w-16 h-16 items-center justify-center rounded-3xl bg-forest text-white">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isHindi ? 'पासवर्ड रीसेट उपलब्ध नहीं है' : 'Password reset unavailable'}
        </h1>
        <p className="text-sm text-slate-600">
          {isHindi
            ? 'सुरक्षित ईमेल या एसएमएस सत्यापन सक्रिय होने तक पासवर्ड यहां बदला नहीं जा सकता।'
            : 'Password recovery cannot be performed until secure email or SMS verification is configured.'}
        </p>
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => setLanguage('hi')} className="px-3 py-1 rounded-full text-xs border">हिन्दी</button>
          <button type="button" onClick={() => setLanguage('en')} className="px-3 py-1 rounded-full text-xs border">English</button>
        </div>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl bg-forest text-white px-5 py-3 text-sm font-bold">
          <ShieldCheck className="w-4 h-4" />
          {isHindi ? 'लॉगिन पर वापस जाएं' : 'Back to login'}
        </Link>
      </div>
    </div>
  );
}
