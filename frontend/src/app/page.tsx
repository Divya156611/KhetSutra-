'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Sprout } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth } = useApp();

  useEffect(() => {
    if (isLoadingAuth) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
      <div className="w-14 h-14 rounded-3xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shadow-sm">
        <Sprout className="w-8 h-8 animate-pulse text-forest" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold text-slate-800">किसान मित्र एआई (Kisan Mitra AI)</h2>
        <p className="text-xs text-slate-500 font-medium">लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
      </div>
      <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="w-full h-full bg-forest animate-pulse" />
      </div>
    </div>
  );
}
