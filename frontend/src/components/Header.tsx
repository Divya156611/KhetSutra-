'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { Languages, MapPin, Sparkles, User, Sprout, LogOut, LogIn } from 'lucide-react';

export default function Header() {
  const { language, setLanguage, profile, user, isAuthenticated, logout } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const isHindi = language === 'hi';
  const farmerName = user?.full_name || profile?.full_name || (isHindi ? 'किसान' : 'Farmer');
  const shortName = farmerName.split(' ')[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Mobile Brand / Greeting */}
      <div className="flex items-center gap-3">
        <Link href={isAuthenticated ? '/dashboard' : '/login'} className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-forest text-lg tracking-tight">खेतसूत्र</span>
        </Link>

        {isAuthenticated && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-forest" />
            <span className="font-medium text-slate-800">
              {profile ? `${profile.village}, ${profile.district}` : 'तिगांव, फरीदाबाद'}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-forest text-xs font-semibold text-slate-700 hover:text-forest bg-white transition-all shadow-xs cursor-pointer"
          title="Switch Language / भाषा बदलें"
        >
          <Languages className="w-4 h-4 text-forest" />
          <span>{isHindi ? 'English' : 'हिन्दी'}</span>
        </button>

        {/* AI Copilot shortcut button */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 bg-gradient-to-r from-forest to-emerald-700 hover:from-forest-800 hover:to-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-golden" />
          <span className="hidden sm:inline">{isHindi ? 'किसान मित्र एआई' : 'Kisan Mitra AI'}</span>
        </Link>

        {/* User Pill or Login Button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors"
              title={isHindi ? 'प्रोफाइल देखें' : 'View Profile'}
            >
              <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate hidden md:inline">
                {shortName}
              </span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              title={isHindi ? 'लॉगआउट करें' : 'Logout'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isHindi ? 'लॉगिन' : 'Sign In'}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
