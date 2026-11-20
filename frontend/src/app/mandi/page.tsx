'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, IndianRupee, LoaderCircle, MapPin, ShieldCheck, Sprout, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchMandiPrices } from '../../lib/api';
import type { MandiPriceResponse } from '../../types';
import MandiFilters from '../../components/mandi/MandiFilters';
import MandiPriceCard from '../../components/mandi/MandiPriceCard';

function formatRupees(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function MandiPricesPage() {
  const { language, profile } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [quantity, setQuantity] = useState(50);
  const [data, setData] = useState<MandiPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isHindi = language === 'hi';

  const loadData = useCallback(async (crop: string, amount: number) => {
    try {
      setLoading(true);
      setError('');
      setData(null);
      setData(await fetchMandiPrices(crop, amount));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '';
      setError(message || 'Could not load market prices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData('wheat', 50);
  }, [loadData]);

  const topMarket = data?.mandis.reduce<MandiPriceResponse['mandis'][number] | null>(
    (best, market) => !best || market.modal_price > best.modal_price ? market : best,
    null
  ) ?? null;
  const location = profile?.district && profile?.state
    ? `${profile.district}, ${profile.state}`
    : data?.area;
  const localizedError = isHindi && error.includes('API key')
    ? 'लाइव मंडी भाव चालू करने के लिए backend में data.gov.in API key जोड़ें।'
    : isHindi && error.includes('market-data service')
    ? 'सरकारी मंडी डेटा सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद प्रयास करें।'
    : error;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-agro-950 via-forest-900 to-emerald-800 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full border-[28px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              {isHindi ? 'सरकारी मंडी रिपोर्ट' : 'Government market reports'}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {isHindi ? 'मंडी भाव ट्रैकर' : 'Mandi Price Tracker'}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/85">
              {isHindi
                ? 'अपनी फसल के नवीनतम दर्ज भाव देखें और बिक्री मात्रा के अनुसार सकल मूल्य का अनुमान लगाएं।'
                : 'Check the latest reported prices for your crop and estimate gross value for your sale quantity.'}
            </p>
            {location && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/10 px-3 py-2 text-xs font-medium text-emerald-50">
                <MapPin className="h-4 w-4 text-lime-300" />
                {location}
              </div>
            )}
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl border border-white/15 bg-white/10 text-lime-200 sm:self-auto">
            <Sprout className="h-9 w-9" />
          </div>
        </div>
      </section>

      <MandiFilters
        crop={selectedCrop}
        quantity={quantity}
        loading={loading}
        isHindi={isHindi}
        onCropChange={setSelectedCrop}
        onQuantityChange={setQuantity}
        onSubmit={() => void loadData(selectedCrop, quantity)}
      />

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-xs leading-relaxed text-blue-950">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
        <p>
          {isHindi
            ? 'भाव data.gov.in पर दर्ज मंडी रिपोर्ट से हैं और अपडेट में देरी हो सकती है। सकल मूल्य में परिवहन, गुणवत्ता कटौती, शुल्क या कमीशन शामिल नहीं हैं। बिक्री से पहले मंडी में भाव की पुष्टि करें।'
            : 'Prices are reported through data.gov.in and may be delayed. Gross value excludes transport, quality deductions, fees, and commission. Confirm the rate with the market before selling.'}
        </p>
      </div>

      {loading && (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm" role="status">
          <LoaderCircle className="h-7 w-7 animate-spin text-forest" />
          {isHindi ? 'मंडी के नवीनतम भाव खोजे जा रहे हैं...' : 'Fetching the latest market reports...'}
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="font-bold">{isHindi ? 'भाव अभी उपलब्ध नहीं हैं' : 'Prices are temporarily unavailable'}</h2>
            <p className="mt-1 text-xs leading-relaxed">{localizedError}</p>
            <button
              type="button"
              onClick={() => void loadData(selectedCrop, quantity)}
              className="mt-3 rounded-lg bg-amber-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-800"
            >
              {isHindi ? 'फिर प्रयास करें' : 'Try again'}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && data && data.mandis.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Store className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">
            {isHindi ? 'कोई हालिया मंडी रिपोर्ट नहीं मिली' : 'No recent market reports found'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isHindi ? `${data.area} के लिए ${data.crop} का रिकॉर्ड उपलब्ध नहीं है।` : `No ${data.crop} report is available for ${data.area}.`}
          </p>
        </div>
      )}

      {!loading && !error && data && data.mandis.length > 0 && topMarket && (
        <>
          <section aria-label={isHindi ? 'मंडी सारांश' : 'Market summary'} className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Store className="h-4 w-4 text-forest" />
                {isHindi ? 'रिपोर्ट देने वाली मंडियां' : 'Markets reporting'}
              </div>
              <p className="mt-2 text-2xl font-black tabular-nums text-slate-900">{data.mandis.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <IndianRupee className="h-4 w-4" />
                {isHindi ? 'सबसे ऊँचा मॉडल भाव' : 'Highest modal price'}
              </div>
              <p className="mt-2 text-2xl font-black tabular-nums text-forest">{formatRupees(topMarket.modal_price)}<span className="ml-1 text-xs font-semibold">/qtl</span></p>
              <p className="mt-1 truncate text-[11px] text-emerald-900">{topMarket.mandi}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays className="h-4 w-4 text-forest" />
                {isHindi ? 'नवीनतम रिपोर्ट तारीख' : 'Latest report date'}
              </div>
              <p className="mt-2 text-lg font-black text-slate-900">{data.mandis[0].arrival_date}</p>
              <p className="mt-1 text-[11px] text-slate-500">{data.data_source}</p>
            </div>
          </section>

          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {isHindi ? 'बाजार के भाव' : 'Market prices'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {data.area_scope === 'district'
                  ? (isHindi ? `जिला: ${data.area}` : `District: ${data.area}`)
                  : (isHindi ? `${data.area} राज्य के अन्य मंडी रिकॉर्ड` : `Other reported markets in ${data.area}`)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              {data.crop} · {quantity} {isHindi ? 'क्विंटल' : 'quintals'}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {data.mandis.map((market) => (
              <MandiPriceCard
                key={`${market.mandi}-${market.arrival_date}`}
                market={market}
                quantity={quantity}
                isBestPrice={market === topMarket}
                isHindi={isHindi}
              />
            ))}
          </div>

          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            {isHindi
              ? 'यह जानकारी केवल संदर्भ के लिए है। खरीद/बिक्री से पहले संबंधित मंडी से दर और गुणवत्ता शर्तें जांचें।'
              : 'For reference only. Confirm the rate and quality terms with the mandi before trading.'}
          </p>
        </>
      )}
    </div>
  );
}
