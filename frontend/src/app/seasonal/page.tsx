'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchSeasonalPlan } from '../../lib/api';
import { SeasonalPlannerData } from '../../types';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Droplets,
  Wind,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';

export default function SeasonalPlannerPage() {
  const { language } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedSeason, setSelectedSeason] = useState('Rabi');
  const [activeTab, setActiveTab] = useState<'pre_sowing' | 'sowing' | 'vegetative' | 'flowering' | 'harvest'>('vegetative');
  const [data, setData] = useState<SeasonalPlannerData | null>(null);
  const [loading, setLoading] = useState(true);

  const isHindi = language === 'hi';

  const loadPlanner = async () => {
    try {
      setLoading(true);
      const res = await fetchSeasonalPlan(selectedCrop, selectedSeason);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanner();
  }, [selectedCrop, selectedSeason]);

  const tabs = [
    { id: 'pre_sowing', label: isHindi ? '1. बुवाई से पहले' : '1. Before Sowing' },
    { id: 'sowing', label: isHindi ? '2. बुवाई के समय' : '2. During Sowing' },
    { id: 'vegetative', label: isHindi ? '3. वानस्पतिक वृद्धि' : '3. Vegetative Stage' },
    { id: 'flowering', label: isHindi ? '4. फूल व बाली अवस्था' : '4. Flowering & Booting' },
    { id: 'harvest', label: isHindi ? '5. कटाई एवं भंडारण' : '5. Harvesting & Storage' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-forest" />
            <span>{isHindi ? 'मौसमी कृषि मार्गदर्शिका (Seasonal Intelligence)' : 'Seasonal Farming Intelligence'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isHindi
              ? 'रबी, खरीफ एवं जायद मौसम अनुसार बुवाई से लेकर कटाई तक ICAR व KVK सत्यापित वैज्ञानिक सलाह।'
              : 'End-to-end seasonal intelligence from pre-sowing soil prep to harvest & storage.'}
          </p>
        </div>

        {/* Season & Crop Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:border-forest bg-white shadow-xs"
          >
            <option value="Rabi">रबी मौसम (Rabi Season)</option>
            <option value="Kharif">खरीफ मौसम (Kharif Season)</option>
            <option value="Zaid">जायद मौसम (Zaid Season)</option>
          </select>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:border-forest bg-white shadow-xs capitalize"
          >
            <option value="wheat">गेहूँ (Wheat)</option>
            <option value="mustard">सरसों (Mustard)</option>
            <option value="rice">धान (Rice)</option>
            <option value="cotton">कपास (Cotton)</option>
            <option value="potato">आलू (Potato)</option>
            <option value="tomato">टमाटर (Tomato)</option>
            <option value="onion">प्याज (Onion)</option>
            <option value="maize">मक्का (Maize)</option>
            <option value="chickpea">चना (Chickpea)</option>
            <option value="sugarcane">गन्ना (Sugarcane)</option>
          </select>
        </div>
      </div>

      {/* Season Intelligence Banner */}
      {data && (
        <div className="bg-gradient-to-r from-forest to-emerald-800 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/20">
            <div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-golden text-stone-900 uppercase">
                {isHindi ? data.season_hi : data.season}
              </span>
              <h2 className="text-xl font-bold mt-1">
                {isHindi ? `${data.crop_hi} मौसमी चक्र` : `${data.crop} Seasonal Growth Blueprint`}
              </h2>
            </div>
            <div className="text-xs text-emerald-100">
              <span className="font-semibold">{isHindi ? 'अवधि:' : 'Total Duration:'}</span> {data.total_duration_days} दिन | 
              <span className="font-semibold ml-1">{isHindi ? 'वर्तमान अवस्था:' : 'Current:'}</span> {isHindi ? data.current_stage_hi : data.current_stage}
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs text-emerald-50">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
              <span className="font-bold text-white block mb-1">
                {isHindi ? 'मौसम अवधि एवं प्रमुख फसलें:' : 'Active Months & Primary Crops:'}
              </span>
              <span>{isHindi ? data.seasonal_intelligence?.months_hi : data.seasonal_intelligence?.months_en}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
              <span className="font-bold text-white block mb-1">
                {isHindi ? 'महत्वपूर्ण मौसमी चेतावनी:' : 'Critical Agro Advisory:'}
              </span>
              <span>
                {isHindi
                  ? data.seasonal_intelligence?.critical_advisories_hi?.[0]
                  : data.seasonal_intelligence?.critical_advisories_en?.[0]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5 Growth Stage Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        {activeTab === 'pre_sowing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-forest" />
              <span>{isHindi ? 'बुवाई पूर्व खेत तैयारी व बीज चयन' : 'Pre-Sowing Land Preparation & Seed Selection'}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'खेत की जुताई एवं पलेवा (Land Prep)' : 'Field Preparation'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'मिट्टी पलटने वाले हल से 1 गहरी जुताई करें। इसके बाद रोटावेटर चलाकर मिट्टी भुरभुरी बनाएं। बुवाई से 5-7 दिन पूर्व पलेवा देकर इष्टतम नमी सुनिश्चित करें।'
                    : '1 deep ploughing followed by rotavator leveling. Ensure uniform pre-sowing irrigation (Palewa) 5-7 days before seed drill.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'बीज चयन व बीज उपचार (Seed Selection)' : 'Certified Seeds & Treatment'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'ICAR/राज्य कृषि विभाग द्वारा प्रमाणित उन्नत बीज (जैसे गेहूं: HD-2967, DBW-187; सरसों: पूसा बोल्ड) का ही चयन करें। बुवाई से पूर्व बाविस्टिन या थीरम (2.5 ग्राम/किग्रा बीज) से उपचार करें।'
                    : 'Select ICAR certified seeds suited to regional thermal conditions. Treat seed with Trichoderma or Thiram (2.5g/kg) to deter seed-borne pathogens.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sowing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-forest" />
              <span>{isHindi ? 'बुवाई की सही विधि एवं कतार दूरी' : 'Sowing Window & Recommended Spacing'}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'बुवाई का अनुकूल समय' : 'Optimum Sowing Window'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'रबी फसलों के लिए 25 अक्टूबर से 20 नवंबर का समय सर्वोत्तम है। तापमान 20-22°C के बीच होने पर अंकुरण सर्वाधिक प्रतिशत में होता है।'
                    : 'Oct 25 - Nov 20 is the ideal sowing window in North India when mean ambient temperatures stabilize between 20-22°C.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'कतार से कतार व गहराई' : 'Spacing & Seed Depth'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'सीड-कम-फर्टिलाइजर ड्रिल से 20-22.5 सेमी कतार दूरी और 4-5 सेमी गहराई पर बुवाई करें। अत्यधिक गहराई पर बीज डालने से अंकुरण देरी से होता है।'
                    : 'Maintain 20-22.5 cm row-to-row spacing at a uniform depth of 4-5 cm. Deeper placement reduces tillering vigor.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vegetative' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-forest" />
              <span>{isHindi ? 'वानस्पतिक वृद्धि एवं पोषण प्रबंधन' : 'Vegetative Stage & Nutrient Management'}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'पहली सिंचाई - CRI अवस्था (21-25 दिन)' : 'First Irrigation - CRI Stage'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'गेहूं में बुवाई के 21-25 दिन बाद मुकुट जड़ें (Crown Roots) बनती हैं। इस समय हल्की सिंचाई करना अनिवार्य है। बारिश का पूर्वानुमान देखकर ही पानी दें।'
                    : 'Crown root initiation at 21-25 days is critical. Provide light irrigation; postpone if rain is forecast within 48 hours.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'यूरिया टॉप-ड्रेसिंग व खरपतवार' : 'Nutrient Top Dressing & Weed Control'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'पहली सिंचाई के बाद जब पैर जमने लगे तो यूरिया की एक-तिहाई मात्रा (30-35 किग्रा/एकड़) का भुरकाव करें। चौड़ी पत्ती वाले खरपतवार नष्ट करें।'
                    : 'Broadcast 1/3 nitrogen top dressing after first irrigation when soil allows foot traffic. Hand weed or apply verified selective herbicides.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flowering' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Wind className="w-5 h-5 text-forest" />
              <span>{isHindi ? 'फूल व बाली अवस्था: ताप व हवा तनाव से सुरक्षा' : 'Flowering & Heat Stress Monitoring'}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'तेज पछुआ हवा से सुरक्षा' : 'Wind & Lodging Risk'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'बाली बनने के दौरान जब तेज पछुआ हवा (20+ किमी/घंटा) चल रही हो, तब भारी सिंचाई न करें। तेज हवा में गीली मिट्टी होने पर फसल जमीन पर गिर (lodging) सकती है।'
                    : 'Avoid flood irrigation during sustained high winds (20+ km/h). Saturated soil coupled with top-heavy panicles causes severe crop lodging.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'समय पूर्व गर्मी व दाना भराव' : 'Thermal Heat Wave Shield'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'फरवरी-मार्च में यदि तापमान सामान्य से 4-5°C अधिक बढ़े, तो शाम के समय फव्वारा सिंचाई या 0.2% पोटेशियम क्लोराइड का छिड़काव करें जिससे दाना सिकुड़े नहीं।'
                    : 'If early heatwaves spike above 32°C during grain filling, apply light evening sprinkler irrigation to lower canopy temperature.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'harvest' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest" />
              <span>{isHindi ? 'कटाई खिड़की, थ्रेशिंग एवं भंडारण' : 'Harvesting Windows & Grain Storage'}</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'कटाई का सही समय' : 'Weather-Safe Harvesting'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'दाना कड़ा होने और नमी 12-14% से कम होने पर ही कटाई करें। कटाई से 10 दिन पहले सिंचाई पूरी तरह बंद करें। लगातार 3 दिन धूप रहने पर कंबाइन चलाएं।'
                    : 'Harvest when grain moisture drops below 12-14%. Stop irrigation 10-12 days prior. Verify 3 consecutive rain-free forecast days.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isHindi ? 'अनाज भंडारण सावधानियां' : 'Storage Precautions'}
                </span>
                <p className="leading-relaxed">
                  {isHindi
                    ? 'भंडारण से पूर्व अनाज को पक्के फर्श या तिरपाल पर 2-3 दिन कड़ी धूप में सुखाएं। नीम की सूखी पत्तियां या अनुशंसित एल्युमिनियम फॉस्फाइड का उपयोग करें।'
                    : 'Sun dry grain for 48 hours before bagging. Ensure storage bins are disinfected and dry to avoid weevil (घुन) infestation.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
