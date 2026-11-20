'use client';

import { BarChart3, Search } from 'lucide-react';

const crops = [
  { value: 'wheat', label: 'गेहूँ (Wheat)' },
  { value: 'mustard', label: 'सरसों (Mustard)' },
  { value: 'rice', label: 'धान (Rice)' },
  { value: 'cotton', label: 'कपास (Cotton)' },
  { value: 'potato', label: 'आलू (Potato)' },
  { value: 'tomato', label: 'टमाटर (Tomato)' },
  { value: 'onion', label: 'प्याज (Onion)' },
  { value: 'chickpea', label: 'चना (Chickpea)' },
];

interface MandiFiltersProps {
  crop: string;
  quantity: number;
  loading: boolean;
  isHindi: boolean;
  onCropChange: (crop: string) => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => void;
}

export default function MandiFilters({
  crop,
  quantity,
  loading,
  isHindi,
  onCropChange,
  onQuantityChange,
  onSubmit,
}: MandiFiltersProps) {
  return (
    <form
      className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_auto] sm:items-end sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="space-y-1.5 text-xs font-semibold text-slate-600">
        <span>{isHindi ? 'फसल चुनें' : 'Select crop'}</span>
        <select
          value={crop}
          onChange={(event) => onCropChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15"
        >
          {crops.map((item) => (
            <option value={item.value} key={item.value}>{item.label}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5 text-xs font-semibold text-slate-600">
        <span>{isHindi ? 'मात्रा (क्विंटल)' : 'Quantity (quintals)'}</span>
        <input
          type="number"
          min={1}
          max={5000}
          step={1}
          value={quantity}
          onChange={(event) => onQuantityChange(Math.min(5000, Math.max(1, Number(event.target.value) || 1)))}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <BarChart3 className="h-4 w-4 animate-pulse" /> : <Search className="h-4 w-4" />}
        {isHindi ? 'भाव खोजें' : 'Find prices'}
      </button>
    </form>
  );
}
