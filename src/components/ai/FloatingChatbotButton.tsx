import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Bot } from 'lucide-react';

export const FloatingChatbotButton: React.FC = () => {
  const { isChatbotOpen, setIsChatbotOpen } = useApp();

  if (isChatbotOpen) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-600 hover:to-slate-800 text-white rounded-2xl shadow-xl shadow-teal-900/30 border border-teal-500/30 transition-all hover:scale-105 active:scale-95"
        title="Open MedAssist AI Clinical Triage Chatbot"
        aria-label="Open AI Triage Assistant"
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-lg bg-teal-500/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900"></span>
        </div>

        <div className="text-left hidden sm:block">
          <span className="text-[10px] font-mono text-teal-300 font-bold block leading-none uppercase">
            Gemini AI
          </span>
          <span className="text-xs font-extrabold tracking-tight text-white block mt-0.5">
            AI Triage Assistant
          </span>
        </div>

        <span className="sm:hidden text-xs font-bold">
          AI Triage
        </span>
      </button>
    </div>
  );
};
