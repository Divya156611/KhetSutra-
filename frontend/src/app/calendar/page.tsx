'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchCropCalendar } from '../../lib/api';
import { CropStageInfo } from '../../types';
import { CropTimeline } from '../../components/CropTimeline';
import { CalendarDays, Sprout, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { language } = useApp();
  const [stageData, setStageData] = useState<CropStageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const isHindi = language === 'hi';

  useEffect(() => {
    fetchCropCalendar()
      .then((data) => setStageData(data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'फसल विकास कैलेंडर (Crop Lifecycle)' : 'Crop Lifecycle Calendar'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isHindi
              ? 'बुवाई से लेकर कटाई तक फसल की सभी वृद्धि अवस्थाएं व जल संवेदनशीलता।'
              : 'Complete stage-by-stage crop lifecycle timeline and irrigation requirements.'}
          </p>
        </div>

        <Link
          href="/seasonal"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold self-start sm:self-auto"
        >
          <span>{isHindi ? 'विस्तृत मौसमी मार्गदर्शिका' : 'Seasonal Planner'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {stageData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <CropTimeline stageData={stageData} />
        </div>
      )}
    </div>
  );
}
