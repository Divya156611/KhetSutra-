import { CalendarDays, MapPin, TrendingUp } from 'lucide-react';
import type { MandiPriceItem } from '../../types';

interface MandiPriceCardProps {
  market: MandiPriceItem;
  quantity: number;
  isBestPrice: boolean;
  isHindi: boolean;
}

function formatRupees(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function MandiPriceCard({
  market,
  quantity,
  isBestPrice,
  isHindi,
}: MandiPriceCardProps) {
  const range = market.max_price - market.min_price;
  const marker = range > 0
    ? Math.min(100, Math.max(0, ((market.modal_price - market.min_price) / range) * 100))
    : 50;

  return (
    <article className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
      isBestPrice ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200'
    }`}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-forest" />
              <span className="truncate">{market.district}, {market.state}</span>
            </div>
            <h2 className="mt-2 truncate text-lg font-extrabold tracking-tight text-slate-900">
              {market.mandi}
            </h2>
            {market.variety && (
              <p className="mt-1 truncate text-xs text-slate-500">{market.commodity} · {market.variety}</p>
            )}
          </div>

          {isBestPrice && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
              <TrendingUp className="h-3 w-3" />
              {isHindi ? 'सर्वोच्च मॉडल भाव' : 'Top modal price'}
            </span>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-forest-900 to-forest p-4 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
            {isHindi ? 'मॉडल भाव' : 'Modal price'}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums">{formatRupees(market.modal_price)}</span>
            <span className="text-xs font-medium text-emerald-100">{isHindi ? 'प्रति क्विंटल' : 'per quintal'}</span>
          </div>
          <div className="mt-4">
            <div className="relative h-2 rounded-full bg-white/25">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-lime-200 to-emerald-300 opacity-90" />
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-forest bg-white shadow"
                style={{ left: `${marker}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-emerald-100">
              <span>{isHindi ? 'न्यूनतम' : 'Min'} {formatRupees(market.min_price)}</span>
              <span>{isHindi ? 'अधिकतम' : 'Max'} {formatRupees(market.max_price)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {isHindi ? 'रिपोर्ट:' : 'Reported:'} {market.arrival_date}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
            {quantity} {isHindi ? 'क्विंटल' : 'quintals'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6">
        <span className="text-xs font-semibold text-slate-600">
          {isHindi ? 'अनुमानित सकल बिक्री' : 'Estimated gross value'}
        </span>
        <span className="text-lg font-extrabold tabular-nums text-forest">
          {formatRupees(market.modal_price * quantity)}
        </span>
      </div>
    </article>
  );
}
