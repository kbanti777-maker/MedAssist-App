import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, Clock, ChevronRight, CheckCircle2, X } from 'lucide-react';

export const ActiveSOSBanner: React.FC = () => {
  const { activeEmergency, setCurrentPage, updateEmergencyStatus, cancelEmergency } = useApp();

  if (!activeEmergency) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white shadow-md border-b border-rose-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm tracking-wide">ACTIVE EMERGENCY #{activeEmergency.id}:</span>
              <span className="text-sm font-medium text-rose-100">{activeEmergency.categoryLabel}</span>
              <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeEmergency.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-rose-200 truncate mt-0.5 flex items-center gap-2">
              <span>Dest: {activeEmergency.hospitalName || 'Trauma Center'}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> ETA: {activeEmergency.etaMinutes || 4} mins
              </span>
              <span>·</span>
              <span>Unit: {activeEmergency.ambulanceUnitCode || 'Medic 402'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentPage('sos')}
            className="px-3.5 py-1.5 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
          >
            <span>Live Triage Screen</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => updateEmergencyStatus('resolved')}
            title="Mark as Resolved"
            className="px-2.5 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Resolve</span>
          </button>

          <button
            onClick={cancelEmergency}
            title="Cancel Dispatch"
            className="p-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 hover:text-white rounded-lg transition-colors"
            aria-label="Cancel emergency"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
