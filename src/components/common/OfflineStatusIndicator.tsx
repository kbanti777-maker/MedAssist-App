import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  CreditCard,
  PhoneCall,
  Building2,
  Info,
  Radio,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface OfflineStatusIndicatorProps {
  variant?: 'card' | 'banner' | 'pill';
  className?: string;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  variant = 'card',
  className = '',
}) => {
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulateOffline,
    setIsOfflineModalOpen,
  } = useApp();

  const offlineFeatures = [
    {
      name: 'First Aid & CPR Step Guides',
      desc: '100% stored on device; instant access without cellular reception',
      icon: HeartPulse,
      status: 'Available Offline',
    },
    {
      name: 'Emergency Medical ID & QR',
      desc: 'Blood group, allergies & critical conditions accessible locally',
      icon: CreditCard,
      status: 'Available Offline',
    },
    {
      name: 'Emergency Contacts & Dialing',
      desc: 'Cached numbers initiate standard voice calls via carrier signal',
      icon: PhoneCall,
      status: 'Available Offline',
    },
    {
      name: 'Hospital Directory & Hotlines',
      desc: 'Addresses, phone lines, and trauma ratings saved in local cache',
      icon: Building2,
      status: 'Available Offline',
    },
  ];

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-2 p-1.5 px-3 rounded-2xl border text-xs transition-all ${
        isOnline
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
      } ${className}`}>
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )}
        <span className="font-semibold">
          {isOnline ? 'Offline Cache Active' : 'Offline Mode (Emergency Cache)'}
        </span>
        <button
          onClick={() => setIsOfflineModalOpen(true)}
          className="text-[11px] underline font-bold ml-1 hover:text-slate-900"
        >
          Details
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-xs ${
        isOnline
          ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
          : 'bg-gradient-to-br from-amber-50/70 to-orange-50/40 border-amber-300 ring-2 ring-amber-400/20'
      } ${className}`}
    >
      {/* Header with Connection Status and Toggle Simulation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isOnline
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Offline Availability Status
              </h3>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-200 text-amber-900 font-bold'
                }`}
              >
                {isOnline ? 'Online (Synced)' : 'Offline Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isOnline
                ? 'Essential life-saving resources are pre-cached locally on this device.'
                : 'Zero connectivity detected. Offline emergency fallback active.'}
            </p>
          </div>
        </div>

        {/* Test Simulator Toggle Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleSimulateOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Toggle simulated offline mode to inspect accessibility"
          >
            {isSimulatedOffline ? (
              <>
                <ToggleRight className="w-4 h-4 text-white" />
                <span>Simulating Offline</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-500" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs"
            title="View offline breakdown modal"
            aria-label="View offline breakdown"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 4 Key Features That Remain Accessible Offline */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Offline Accessible Features</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">100% Cached</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {offlineFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.name}
                className="p-3 rounded-2xl bg-white/90 border border-slate-200/90 flex items-start gap-3 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {feat.name}
                    </p>
                    <span className="text-[9px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                      Offline OK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connectivity Limitation Notice */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">
              Features Requiring Active Network:{' '}
            </span>
            <span>
              Real-time ambulance GPS telemetry map updates and live hospital bed counters require an active internet connection. All clinical guides and medical identity cards remain completely functional offline.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
