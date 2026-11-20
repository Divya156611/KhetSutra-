'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trees,
  Bot,
  CloudSun,
  Menu,
  X,
  Stethoscope,
  CalendarDays,
  Droplets,
  Scissors,
  IndianRupee,
  Store,
  BookOpen,
  Landmark,
  FileSpreadsheet,
  UserCog
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { language, t } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password');
  if (isAuthPage) return null;

  const mainTabs = [
    { href: '/dashboard', label: language === 'hi' ? 'होम' : 'Home', icon: LayoutDashboard },
    { href: '/farms', label: language === 'hi' ? 'खेत' : 'Farms', icon: Trees },
    { href: '/mandi', label: t('nav_mandi'), icon: Store },
    { href: '/chat', label: language === 'hi' ? 'किसान मित्र' : 'Copilot', icon: Bot, highlight: true },
  ];

  const moreItems = [
    { href: '/weather', label: t('nav_weather'), icon: CloudSun },
    { href: '/calendar', label: language === 'hi' ? 'फसल कैलेंडर' : 'Crop calendar', icon: CalendarDays },
    { href: '/crop-doctor', label: t('nav_crop_doctor'), icon: Stethoscope },
    { href: '/irrigation', label: t('nav_irrigation'), icon: Droplets },
    { href: '/harvest', label: t('nav_harvest'), icon: Scissors },
    { href: '/seasonal', label: t('nav_seasonal'), icon: CalendarDays },
    { href: '/finance', label: t('nav_finance'), icon: IndianRupee },
    { href: '/diary', label: t('nav_diary'), icon: BookOpen },
    { href: '/schemes', label: t('nav_schemes'), icon: Landmark },
    { href: '/reports', label: t('nav_reports'), icon: FileSpreadsheet },
    { href: '/profile', label: t('nav_profile'), icon: UserCog },
  ];

  return (
    <>
      {/* More Drawer Modal */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <span className="font-bold text-slate-800 text-base">
                {language === 'hi' ? 'सभी कृषि सेवाएं (All Features)' : 'All Agricultural Services'}
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-forest text-white border-forest'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-50 hover:border-forest/30'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-forest'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                tab.highlight
                  ? 'text-white bg-forest font-semibold px-4 py-1.5 rounded-xl shadow-xs'
                  : isActive
                  ? 'text-forest font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-500 hover:text-slate-800 ${
            isMoreOpen ? 'text-forest font-semibold' : ''
          }`}
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5">{language === 'hi' ? 'अधिक' : 'More'}</span>
        </button>
      </nav>
    </>
  );
}
