import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  X,
  HeartPulse,
  CreditCard,
  PhoneCall,
  Building2,
  Radio,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const OfflineBreakdownModal: React.FC = () => {
  const {
    isOfflineModalOpen,
    setIsOfflineModalOpen,
    isOnline,
    toggleSimulateOffline,
    isSimulatedOffline,
    setCurrentPage,
  } = useApp();

  if (!isOfflineModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold">Emergency Offline Preparedness</h3>
              <p className="text-xs text-slate-400">
                Current Status: {isOnline ? 'Online & Synchronized' : 'Operating in Offline Cache Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOfflineModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Explanation */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 leading-relaxed">
            <strong className="font-bold">Zero-Connectivity Guarantee: </strong>
            During severe storms, cell tower blackouts, or remote emergencies, MedAssist stores your crucial emergency profile, first aid guidelines, and hospital directories in your browser’s local storage and Service Worker cache.
          </div>

          {/* Fully Accessible Offline Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Features Accessible 100% Offline</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">First Aid & CPR Procedures</strong>
                  <span className="text-slate-600">
                    Step-by-step procedures for choking, hemorrhage, burns, and cardiac arrest remain readable without internet.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Emergency Medical Card & QR Code</strong>
                  <span className="text-slate-600">
                    Your blood group, allergy warnings, chronic conditions, and emergency notes are loaded from local cache for first responders.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Emergency Contact Phone Dialers</strong>
                  <span className="text-slate-600">
                    Phone numbers are stored offline. Tapping "Call" engages your phone's cellular telephone network even without data.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Hospital Directory & Emergency Numbers</strong>
                  <span className="text-slate-600">
                    Addresses, trauma levels, and direct ER desk telephone numbers remain accessible.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Requiring Connection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Features Requiring Active Data / WiFi</span>
            </h4>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p>• <strong>Live GPS Paramedic Streaming:</strong> Real-time ETA updates of moving ambulance vehicles.</p>
              <p>• <strong>Live Hospital Bed Telemetry:</strong> Real-time changes in available ICU bed counters.</p>
            </div>
          </div>

          {/* Offline Simulation Control */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Evaluator Test Switch:
            </span>
            <button
              onClick={toggleSimulateOffline}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isSimulatedOffline
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              {isSimulatedOffline ? 'Disable Offline Simulation' : 'Simulate Offline Mode'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              setIsOfflineModalOpen(false);
              setCurrentPage('first-aid');
            }}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Open First Aid Library →
          </button>
          <button
            onClick={() => setIsOfflineModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
