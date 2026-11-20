'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sendChatMessage } from '../../lib/api';
import { ChatMessage } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  User,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function AICopilotPage() {
  const { language, profile } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isInitializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = language === 'hi';

  const SUGGESTED_QUESTIONS = isHindi ? [
    'क्या कल मुझे अपने गेहूं में पानी देना चाहिए?',
    'क्या इस हफ्ते मेरे गांव में बारिश होगी?',
    'कल कीटनाशक स्प्रे करना सुरक्षित रहेगा क्या?',
    'मेरी फसल में फूल आ रहे हैं, क्या सावधानी रखें?',
    'मौसम और तापमान का मेरी फसल पर क्या असर है?'
  ] : [
    'Should I irrigate my wheat crop tomorrow?',
    'Is rain expected in my village this week?',
    'Is it safe to spray pesticides tomorrow?',
    'What precautions are needed during flowering?',
    'How will current temperature impact my harvest?'
  ];

  // Set initial welcome greeting ONLY ONCE on mount or when language intentionally changes
  useEffect(() => {
    const farmerName = profile?.full_name?.split(' ')[0] || (isHindi ? 'किसान' : 'Farmer');

    const welcomeContent = isHindi
      ? `राम-राम ${farmerName} जी! 🙏 मैं हूँ आपका **किसान मित्र एआई (Kisan Mitra AI)**।\n\nआपकी फसल की बेहतर देखभाल और पैदावार बढ़ाने के लिए मैं हर समय आपके साथ हूँ।\n\nआप मुझसे सिंचाई, बारिश का अनुमान, खाद व स्प्रे, या कीट-रोग संबंधी कोई भी सवाल बेझिझक पूछ सकते हैं।`
      : `Hello ${farmerName} ji! 👋 I am your **Kisan Mitra AI**.\n\nI am here to help you make smarter daily farming decisions for a healthier crop and greater yield.\n\nFeel free to ask me anything about irrigation schedules, rain forecasts, spray timing, or pest precautions.`;

    if (!isInitializedRef.current || messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: welcomeContent,
          voice_text: isHindi
            ? `राम-राम ${farmerName} जी! मैं हूँ आपका किसान मित्र एआई। आप मुझसे फसल और मौसम संबंधी कोई भी सवाल पूछ सकते हैं।`
            : `Hello ${farmerName} ji! I am your Kisan Mitra AI. Feel free to ask any farming or weather questions.`,
          tools_used: ['weather_telemetry', 'crop_stage_engine']
        }
      ]);
      isInitializedRef.current = true;
    }
  }, [language, profile?.full_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, profile?.id, language);
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: res.answer,
        voice_text: res.voice_text,
        confidence: res.confidence,
        why_reason: res.why_this_advice,
        tools_used: res.tools_used
      };
      setMessages((prev) => [...prev, botMsg]);

      // Speak response in voice mode if enabled
      if ('speechSynthesis' in window && res.voice_text) {
        speakText(res.voice_text);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isHindi
            ? 'क्षमा करें, सलाह तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Sorry, could not fetch recommendations. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_~`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHindi ? 'आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता।' : 'Voice recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-forest-700 to-forest text-white flex items-center justify-center shadow-md ring-2 ring-forest/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>{isHindi ? 'किसान मित्र एआई (Kisan Mitra AI)' : 'Kisan Mitra AI Copilot'}</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-forest border border-emerald-200">
                {isHindi ? 'सक्रिय • लाइव' : 'Active • Live'}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'आपका विश्वसनीय डिजिटल कृषि मार्गदर्शक — मौसम, मिट्टी व फसल पर आधारित'
                : 'Your trusted personal farm advisor — grounded in weather, soil, and crop telemetry'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            isInitializedRef.current = false;
            setMessages([]);
          }}
          className="text-xs flex items-center gap-1 text-slate-500 hover:text-forest px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-forest/30 transition-all bg-white"
          title={isHindi ? 'नई बातचीत शुरू करें' : 'Start New Chat'}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isHindi ? 'नई चैट' : 'New Chat'}</span>
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-forest text-slate-700 hover:text-forest whitespace-nowrap shadow-2xs transition-all shrink-0 hover:bg-emerald-50/50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xs space-y-2 text-xs leading-relaxed ${isUser
                  ? 'bg-forest text-white rounded-tr-xs'
                  : 'bg-white border border-emerald-100 text-slate-900 rounded-tl-xs'
                  }`}
              >
                <div className="whitespace-pre-line font-medium text-[13px] text-slate-800">
                  {m.content}
                </div>

                {!isUser && (m.why_reason || m.voice_text) && (
                  <div className="pt-3 border-t border-slate-100 mt-2 space-y-2 text-[11px] text-slate-600">
                    {m.why_reason && (
                      <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-forest mr-1">{isHindi ? 'वैज्ञानिक आधार:' : 'Agronomic Rationale:'}</strong>
                          <span>{m.why_reason}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {m.confidence && (
                        <span className="text-slate-400">
                          {isHindi ? 'सटीकता: ' : 'Confidence: '}
                          <strong className="text-forest">{m.confidence}</strong>
                        </span>
                      )}

                      {m.voice_text && (
                        <button
                          onClick={() => speakText(m.voice_text || m.content)}
                          className="flex items-center gap-1.5 text-forest hover:text-forest-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isHindi ? 'सुनें (आवाज)' : 'Listen (Voice)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest" />
              <span>{isHindi ? 'किसान मित्र एआई खेत और मौसम डेटा का विश्लेषण कर रहा है...' : 'Kisan Mitra AI is evaluating farm and weather telemetry...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 bg-white border border-emerald-200 rounded-2xl p-2 shadow-md flex items-center gap-2 focus-within:ring-2 focus-within:ring-forest/20">
        <button
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl transition-all ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-emerald-50 text-forest hover:bg-emerald-100'
            }`}
          title={isHindi ? 'बोलकर पूछें (माइक)' : 'Voice Input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isHindi ? 'सिंचाई, मौसम या फसल संबंधी सवाल यहां लिखें...' : 'Ask Kisan Mitra AI anything about irrigation, weather, or crops...'}
          className="flex-1 text-xs px-2 py-1.5 focus:outline-hidden text-slate-800 placeholder:text-slate-400"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || loading}
          className="p-2.5 rounded-xl bg-forest hover:bg-forest-800 text-white disabled:opacity-40 transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
