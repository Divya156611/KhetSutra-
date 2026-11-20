'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, X, Edit3, AlertCircle } from 'lucide-react';
import { VoiceAssistant } from '../lib/speech';

interface VoiceMicButtonProps {
  onSendMessage: (text: string) => void;
  language?: string;
  disabled?: boolean;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  onSendMessage,
  language = 'hi',
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const startVoice = () => {
    setErrorMessage(null);
    setTranscript('');
    setInterimText('');

    const langCode = language === 'en' ? 'en-IN' : 'hi-IN';

    VoiceAssistant.startListening(
      langCode,
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimText('');
          setIsListening(false);
          setShowReviewModal(true);
        } else {
          setInterimText(text);
        }
      },
      (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    setIsListening(true);
  };

  const stopVoice = () => {
    VoiceAssistant.stopListening();
    setIsListening(false);
    if (interimText || transcript) {
      setTranscript(transcript || interimText);
      setShowReviewModal(true);
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
      setTranscript('');
      setInterimText('');
      setShowReviewModal(false);
    }
  };

  const handleCancel = () => {
    setTranscript('');
    setInterimText('');
    setShowReviewModal(false);
  };

  return (
    <>
      {/* The Big Microphone Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          disabled={disabled}
          onClick={isListening ? stopVoice : startVoice}
          title={isListening ? 'बोलना बंद करें' : 'बोलकर पूछें (Voice Assistant)'}
          className={`relative group w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isListening
              ? 'bg-rose-600 text-white mic-active scale-110 shadow-rose-600/40'
              : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-700/35'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 animate-pulse" />
          ) : (
            <Mic className="w-8 h-8" />
          )}

          {/* Pulse badge */}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
            </span>
          )}
        </button>

        <span className="text-xs font-semibold text-emerald-900 mt-2">
          {isListening ? 'सुन रहे हैं... (Listening)' : 'बोलकर पूछें (Tap to Speak)'}
        </span>

        {/* Live speech feedback pill */}
        {isListening && interimText && (
          <div className="mt-2 text-xs font-medium bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full border border-emerald-300 max-w-xs text-center truncate animate-pulse">
            "{interimText}"
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg max-w-xs text-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Speech Review & Edit Modal (Lets farmer edit text before sending) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-sm text-gray-900">
                  अपनी आवाज की जांच करें (Review Voice Text)
                </h4>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 mb-3">
              यदि कोई शब्द गलत सुना गया हो तो आप इसे एडिट कर सकते हैं:
            </p>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="आपका प्रश्न यहाँ है..."
              className="w-full text-sm font-medium text-gray-900 p-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-gray-50"
            />

            <div className="flex items-center justify-end gap-2.5 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!transcript.trim()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>पूछें (Send Question)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
