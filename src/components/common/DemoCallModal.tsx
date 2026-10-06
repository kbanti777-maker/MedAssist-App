import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldAlert } from 'lucide-react';

export const DemoCallModal: React.FC = () => {
  const { callModalInfo, closeDemoCall } = useApp();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!callModalInfo) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callModalInfo]);

  if (!callModalInfo) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl flex flex-col items-center">
        {/* Demo banner */}
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] font-medium text-amber-200">Simulation Mode · No Live Call Dispatched</span>
        </div>

        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-teal-500/30 flex items-center justify-center mb-4 text-teal-400">
          <Phone className="w-10 h-10 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-center text-white">{callModalInfo.targetName}</h3>
        <p className="text-sm font-mono text-slate-400 mt-1">{callModalInfo.phoneNumber}</p>
        <p className="text-xs text-teal-400 font-medium mt-2 tracking-wide uppercase">Connected · {formatTimer(seconds)}</p>

        {/* Action icons */}
        <div className="grid grid-cols-2 gap-4 w-full mt-8">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-colors ${
              isMuted ? 'bg-slate-800 border-rose-500/40 text-rose-400' : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
            <span className="text-xs font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-colors ${
              isSpeaker ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{isSpeaker ? 'Speaker On' : 'Speaker Off'}</span>
          </button>
        </div>

        {/* End Call */}
        <button
          onClick={closeDemoCall}
          className="mt-8 w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all"
        >
          <PhoneOff className="w-5 h-5" />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
};
