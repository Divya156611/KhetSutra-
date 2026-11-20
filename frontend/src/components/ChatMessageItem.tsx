'use client';

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  ShieldCheck,
  Clock,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { VoiceAssistant } from '../lib/speech';
import { ChatMessage } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  language?: string;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, language = 'hi' }) => {
  const [showWhy, setShowWhy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isUser = message.role === 'user';

  const handleAudio = () => {
    if (isPlaying) {
      VoiceAssistant.stopSpeaking();
      setIsPlaying(false);
    } else {
      const textToSpeak = message.voice_text || message.content;
      VoiceAssistant.speak(
        textToSpeak,
        language === 'en' ? 'en-IN' : 'hi-IN',
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-start gap-2 max-w-[85%] md:max-w-[75%]">
          <div className="bg-emerald-800 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-md">
            <p className="text-sm font-medium leading-relaxed">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Bubble
  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start gap-2.5 max-w-[95%] md:max-w-[85%]">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Message Container */}
        <div className="bg-white rounded-2xl rounded-tl-xs border border-emerald-100 shadow-sm overflow-hidden flex-1">
          {/* Header Bar */}
          <div className="bg-emerald-50/60 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950">KisanMitra Copilot</span>
              {message.confidence && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    message.confidence.toLowerCase().includes('high')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {message.confidence} Confidence
                </span>
              )}
            </div>

            {/* TTS Button */}
            <button
              onClick={handleAudio}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-emerald-700 text-white animate-pulse'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>रोकें</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>आवाज में सुनें</span>
                </>
              )}
            </button>
          </div>

          {/* Main Answer Content */}
          <div className="p-4">
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line font-normal">
              {message.content}
            </div>

            {/* "Why this advice?" Expandable Section */}
            {message.why_this_advice && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowWhy(!showWhy)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    यह सलाह क्यों दी गई? (Why this advice?)
                  </span>
                  {showWhy ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-emerald-700" />
                  )}
                </button>

                {showWhy && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-2 animate-in fade-in duration-150">
                    <div>
                      <strong className="text-gray-900">निर्णय का कारण (Rationale):</strong>
                      <p className="mt-0.5">{message.why_this_advice}</p>
                    </div>

                    {message.tools_used && message.tools_used.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        <span>उपयोग किए गए टूल्स: {message.tools_used.join(', ')}</span>
                      </div>
                    )}

                    {message.weather_updated_at && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>मौसम डेटा अपडेट: {message.weather_updated_at}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer pill */}
            <div className="mt-3.5 pt-2 border-t border-gray-100 flex items-start gap-1.5 text-[11px] text-gray-500">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {message.disclaimer ||
                  'यह सलाह मौसम व फसल नियमों पर आधारित निर्णय सहायता है। रासायनिक दवाओं व गंभीर निर्णयों के लिए स्थानीय कृषि अधिकारी से सलाह लें।'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
