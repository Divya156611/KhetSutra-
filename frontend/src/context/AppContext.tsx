'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FullFarmerProfile, Language, UserAccount } from '../types';
import {
  fetchFullProfile,
  fetchCurrentUser,
  loginUser,
  registerUser,
  logoutUser
} from '../lib/api';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  profile: FullFarmerProfile | null;
  refreshProfile: () => Promise<void>;
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (payload: {
    full_name: string;
    mobile?: string;
    email?: string;
    password: string;
    state?: string;
    district?: string;
    village?: string;
    language?: Language;
  }) => Promise<void>;
  logout: () => Promise<void>;
  t: (key: string) => string;
}

const DICTIONARY: Record<string, { hi: string; en: string }> = {
  // Navigation
  nav_dashboard: { hi: 'डैशबोर्ड (होम)', en: 'Dashboard' },
  nav_farms: { hi: 'मेरे खेत (My Farms)', en: 'My Farms' },
  nav_crop_doctor: { hi: 'एआई फसल डॉक्टर', en: 'Crop Doctor' },
  nav_weather: { hi: 'मौसम व जोखिम', en: 'Weather & Risk' },
  nav_seasonal: { hi: 'मौसमी मार्गदर्शिका', en: 'Seasonal Planner' },
  nav_irrigation: { hi: 'स्मार्ट सिंचाई', en: 'Irrigation Planner' },
  nav_harvest: { hi: 'कटाई योजनाकार', en: 'Harvest Planner' },
  nav_finance: { hi: 'कृषि वित्त व खर्च', en: 'Farm Finance' },
  nav_mandi: { hi: 'मंडी भाव व लाभ', en: 'Mandi Prices' },
  nav_diary: { hi: 'डिजिटल फार्म डायरी', en: 'Farm Diary' },
  nav_schemes: { hi: 'सरकारी योजनाएं', en: 'Govt Schemes' },
  nav_chat: { hi: 'किसान मित्र एआई (Copilot)', en: 'Kisan Mitra AI' },
  nav_reports: { hi: 'कृषि रिपोर्ट', en: 'Farm Reports' },
  nav_profile: { hi: 'प्रोफ़ाइल व सेटिंग्स', en: 'Profile & Settings' },
  nav_more: { hi: 'अधिक', en: 'More' },
  nav_logout: { hi: 'लॉगआउट', en: 'Logout' },

  // Common UI
  app_name: { hi: 'किसान मित्र एआई', en: 'Kisan Mitra AI' },
  tagline: { hi: 'स्मार्ट खेती। सही निर्णय।', en: 'Smart Farming. Smarter Decisions.' },
  loading: { hi: 'लोड हो रहा है...', en: 'Loading...' },
  save: { hi: 'सुरक्षित करें', en: 'Save' },
  cancel: { hi: 'रद्द करें', en: 'Cancel' },
  delete: { hi: 'हटाएं', en: 'Delete' },
  add_new: { hi: '+ नया जोड़ें', en: '+ Add New' },
  action_needed: { hi: 'आज का मुख्य कृषि कार्य', en: "Today's Primary Farm Action" },
  safe: { hi: 'सुरक्षित', en: 'Safe' },
  caution: { hi: 'सावधानी', en: 'Caution' },
  warning: { hi: 'चेतावनी', en: 'Warning' },
  critical: { hi: 'गंभीर', en: 'Critical' },
};

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguageState] = useState<Language>('hi');
  const [profile, setProfile] = useState<FullFarmerProfile | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const isAuthenticated = !!user;

  // Initialize Auth & Language
  useEffect(() => {
    // 1. Language
    const savedLang = localStorage.getItem('khetsutra_lang') as Language;
    if (savedLang === 'hi' || savedLang === 'en') {
      setLanguageState(savedLang);
    }

    // 2. Cookie session is the source of truth
    fetchCurrentUser()
      .then((userData) => {
        setUser(userData);
        if (userData.profile) setProfile(userData.profile);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoadingAuth(false));

    refreshProfile();
  }, []);

  // Route Protection & Redirection
  useEffect(() => {
    if (isLoadingAuth) return;

    const isPublic = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

    if (!isAuthenticated && !isPublic && pathname !== '/') {
      router.push('/login');
    } else if (isAuthenticated && isPublic) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoadingAuth, pathname, router]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('khetsutra_lang', lang);
  };

  const refreshProfile = useCallback(async () => {
    try {
      const data = await fetchFullProfile();
      setProfile(data);
      if (data && (data.language === 'hi' || data.language === 'en')) {
        setLanguageState(data.language);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const login = async (identifier: string, password: string, rememberMe = false) => {
    const res = await loginUser(identifier, password, rememberMe);
    setUser({
      id: res.user_id,
      full_name: res.full_name,
      mobile: res.mobile,
      language: res.language
    });
    await refreshProfile();
    router.push('/dashboard');
  };

  const signup = async (payload: {
    full_name: string;
    mobile?: string;
    email?: string;
    password: string;
    state?: string;
    district?: string;
    village?: string;
    language?: Language;
  }) => {
    const res = await registerUser(payload);
    setUser({
      id: res.user_id,
      full_name: res.full_name,
      mobile: res.mobile,
      language: res.language
    });
    await refreshProfile();
    router.push('/dashboard');
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    router.push('/login');
  };

  const t = (key: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        profile,
        refreshProfile,
        user,
        isAuthenticated,
        isLoadingAuth,
        login,
        signup,
        logout,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
