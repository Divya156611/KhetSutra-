'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trees,
  Stethoscope,
  CloudSun,
  CalendarDays,
  Droplets,
  Scissors,
  IndianRupee,
  Store,
  BookOpen,
  Landmark,
  Bot,
  FileSpreadsheet,
  UserCog,
  Sprout
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, t } = useApp();

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password');
  if (isAuthPage) return null;

  const navGroups = [
    {
      label: language === 'hi' ? 'मुख्य' : 'Overview',
      items: [{ href: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard }],
    },
    {
      label: language === 'hi' ? 'मेरी खेती' : 'My farm',
      items: [
        { href: '/farms', label: t('nav_farms'), icon: Trees },
        { href: '/weather', label: t('nav_weather'), icon: CloudSun },
        { href: '/irrigation', label: t('nav_irrigation'), icon: Droplets },
        { href: '/harvest', label: t('nav_harvest'), icon: Scissors },
        { href: '/seasonal', label: t('nav_seasonal'), icon: CalendarDays },
        { href: '/calendar', label: language === 'hi' ? 'फसल कैलेंडर' : 'Crop calendar', icon: CalendarDays },
        { href: '/diary', label: t('nav_diary'), icon: BookOpen },
      ],
    },
    {
      label: language === 'hi' ? 'बाजार और सहायता' : 'Market & support',
      items: [
        { href: '/mandi', label: t('nav_mandi'), icon: Store },
        { href: '/finance', label: t('nav_finance'), icon: IndianRupee },
        { href: '/crop-doctor', label: t('nav_crop_doctor'), icon: Stethoscope },
        { href: '/chat', label: t('nav_chat'), icon: Bot },
        { href: '/schemes', label: t('nav_schemes'), icon: Landmark },
      ],
    },
    {
      label: language === 'hi' ? 'खाता' : 'Account',
      items: [
        { href: '/reports', label: t('nav_reports'), icon: FileSpreadsheet },
        { href: '/profile', label: t('nav_profile'), icon: UserCog },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-forest-900 border-r border-forest-800 text-white shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-forest-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-fresh flex items-center justify-center text-forest-900 shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>खेतसूत्र</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-golden text-stone-900">PRO</span>
            </div>
            <div className="text-[11px] text-emerald-300 font-medium tracking-wide">
              {language === 'hi' ? 'स्मार्ट खेती। सही निर्णय।' : 'Smart Farming. Smarter Decisions.'}
            </div>
          </div>
        </Link>
      </div>

      <nav aria-label={language === 'hi' ? 'मुख्य नेविगेशन' : 'Main navigation'} className="flex-1 overflow-y-auto px-3 py-4 text-sm font-medium">
        {navGroups.map((group) => (
          <div className="mb-5 last:mb-0" key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400/75">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-fresh text-forest-950 font-semibold shadow-sm'
                        : 'text-emerald-100 hover:bg-forest-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest-950 stroke-[2.5]' : 'text-emerald-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-forest-800 text-[11px] text-emerald-400/80 text-center">
        <span>ICAR & IMD Aligned Decision System</span>
      </div>
    </aside>
  );
}
