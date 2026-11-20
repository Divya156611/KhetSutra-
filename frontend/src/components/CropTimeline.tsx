'use client';

import React from 'react';
import { CropStageInfo } from '../types';
import { CheckCircle2, Clock, Calendar, Droplets, AlertCircle } from 'lucide-react';

interface CropTimelineProps {
  stageData: CropStageInfo;
}

export const CropTimeline: React.FC<CropTimelineProps> = ({ stageData }) => {
  const currentStageName = stageData.current_stage;
  const daysElapsed = stageData.days_since_sowing;

  return (
    <div className="space-y-6">
      {/* Current Active Stage Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-2xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
              वर्तमान अवस्था (Active Stage)
            </span>
            <span className="text-xs text-emerald-100 font-medium">
              बुवाई को {daysElapsed} दिन हुए
            </span>
          </div>

          <span className="text-xs text-emerald-200">
            बुवाई तिथि: {stageData.sowing_date}
          </span>
        </div>

        <h3 className="text-2xl font-black tracking-tight mb-1">
          {stageData.stage_hindi}
        </h3>
        <p className="text-xs text-emerald-100 font-medium mb-3">
          {stageData.current_stage}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-emerald-600/60 text-xs">
          <div className="flex items-start gap-2 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-600/40">
            <Droplets className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-200 block mb-0.5">पानी की आवश्यकता:</span>
              <span>{stageData.stage_water_need}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-600/40">
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-200 block mb-0.5">सलाह:</span>
              <span>{stageData.stage_description}</span>
            </div>
          </div>
        </div>

        {stageData.next_stage && (
          <div className="mt-3 text-xs text-emerald-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              अगली अवस्था <strong>{stageData.next_stage}</strong> लगभग{' '}
              <strong>{stageData.next_stage_in_days} दिनों</strong> में शुरू होगी।
            </span>
          </div>
        )}
      </div>

      {/* Stage Timeline List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <h4 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          संपूर्ण फसल विकास चक्र (Crop Growth Stages)
        </h4>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-100">
          {stageData.all_stages.map((stage, idx) => {
            const isCompleted = daysElapsed > stage.end_day;
            const isCurrent = daysElapsed >= stage.start_day && daysElapsed <= stage.end_day;
            const isUpcoming = daysElapsed < stage.start_day;

            return (
              <div key={idx} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-700 ring-4 ring-emerald-100 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h5 className="font-bold text-sm text-gray-900">
                      {stage.stage_hi}{' '}
                      <span className="text-xs font-normal text-gray-500">
                        ({stage.stage})
                      </span>
                    </h5>

                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      दिन {stage.start_day}–{stage.end_day}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    {stage.advice_hi}
                  </p>

                  <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                    <Droplets className="w-3 h-3 text-emerald-600" />
                    <span>{stage.water_need}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
