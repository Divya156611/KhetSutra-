'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { diagnoseCrop } from '../../lib/api';
import { CropDoctorDiagnosis } from '../../types';
import {
  Stethoscope,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Info,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function CropDoctorPage() {
  const { language } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [symptomHint, setSymptomHint] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<CropDoctorDiagnosis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const isHindi = language === 'hi';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runDiagnosis = async () => {
    try {
      setAnalyzing(true);
      const res = await diagnoseCrop(selectedCrop, symptomHint, previewImage || undefined);
      setDiagnosis(res);
    } catch (err) {
      alert('Error running crop diagnosis');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-forest" />
          <span>{isHindi ? 'एआई फसल डॉक्टर (AI Crop Doctor)' : 'AI Crop Doctor'}</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {isHindi
            ? 'फसल की पत्ती या पौधे की तस्वीर अपलोड करें। एआई कीट व रोग की पहचान कर सुरक्षित उपचार सुझाएगा।'
            : 'Upload a leaf or affected crop photo. Visual AI identifies pathology and verified ICAR remedies.'}
        </p>
      </div>

      {/* Upload and Crop Selector Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Input Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isHindi ? '1. फसल चुनें (Select Crop)' : '1. Select Affected Crop'} *
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden capitalize font-semibold"
            >
              <option value="wheat">गेहूँ (Wheat)</option>
              <option value="mustard">सरसों (Mustard)</option>
              <option value="potato">आलू (Potato)</option>
              <option value="tomato">टमाटर (Tomato)</option>
              <option value="rice">धान (Rice)</option>
              <option value="cotton">कपास (Cotton)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isHindi ? '2. लक्षण विवरण (वैकल्पिक)' : '2. Describe Symptoms (Optional)'}
            </label>
            <input
              type="text"
              placeholder={isHindi ? "उदा. पत्तियों पर पीली धारियां दिख रही हैं..." : "e.g. Yellow stripes on leaves..."}
              value={symptomHint}
              onChange={(e) => setSymptomHint(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-forest focus:outline-hidden"
            />
          </div>

          {/* Photo Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isHindi ? '3. पौधे या पत्ती की फोटो लें' : '3. Capture or Upload Crop Photo'}
            </label>

            <label className="border-2 border-dashed border-slate-300 hover:border-forest rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition-all text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              {previewImage ? (
                <div className="space-y-2">
                  <img
                    src={previewImage}
                    alt="Crop Preview"
                    className="max-h-40 rounded-xl mx-auto object-cover border border-slate-200"
                  />
                  <span className="text-[11px] text-forest font-semibold block">
                    {isHindi ? 'फोटो बदलें' : 'Change Photo'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-forest flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHindi ? 'फोटो खींचें या गैलरी से चुनें' : 'Snap Photo or Upload File'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    JPG, PNG (स्पष्ट पत्ता या फल की फोटो लें)
                  </span>
                </>
              )}
            </label>
          </div>

          <button
            onClick={runDiagnosis}
            disabled={analyzing}
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isHindi ? 'एआई विश्लेषण जारी है...' : 'AI Analyzing Symptoms...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-golden" />
                <span>{isHindi ? 'रोग निदान शुरू करें' : 'Diagnose Plant Pathology'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Diagnosis Result Card */}
        <div>
          {diagnosis ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isHindi ? 'निदान रिपोर्ट' : 'Diagnosis Report'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    diagnosis.severity === 'Critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {diagnosis.severity} Risk
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isHindi ? diagnosis.detected_issue_hi : diagnosis.detected_issue_en}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-forest font-semibold">
                    {isHindi ? 'सटीकता:' : 'Confidence:'} {diagnosis.confidence}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{diagnosis.crop}</span>
                </div>
              </div>

              {/* Symptoms */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  {isHindi ? 'प्रमुख दृश्य लक्षण (Visual Symptoms):' : 'Key Visual Symptoms:'}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHindi ? diagnosis.symptoms_hi : diagnosis.symptoms_en}
                </p>
              </div>

              {/* Preventive Measures */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-forest block mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  <span>{isHindi ? 'अनुशंसित निवारक उपचार (ICAR Guidance):' : 'Recommended Management Measures:'}</span>
                </span>
                <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  {isHindi ? diagnosis.preventive_measures_hi : diagnosis.preventive_measures_en}
                </div>
              </div>

              {/* Expert Advice Badge */}
              {diagnosis.expert_advice_needed && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {isHindi
                      ? 'कृषि वैज्ञानिक सत्यापन आवश्यक: रासायनिक मात्रा हेतु नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।'
                      : 'Field verification recommended: Consult your nearest Krishi Vigyan Kendra (KVK) for certified pesticide application.'}
                  </span>
                </div>
              )}

              {/* Mandatory Disclaimer */}
              <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                {isHindi ? diagnosis.disclaimer_hi : diagnosis.disclaimer_en}
              </p>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white">
              <Stethoscope className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <span className="text-xs font-bold text-slate-600">
                {isHindi ? 'कोई जांच रिपोर्ट नहीं है' : 'No Diagnosis Performed Yet'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 max-w-xs">
                {isHindi
                  ? 'बाईं ओर फसल चुनकर "रोग निदान शुरू करें" पर क्लिक करें।'
                  : 'Select your crop on the left and click Diagnose to receive pathology analysis.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
