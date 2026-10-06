import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyCategory, EmergencyStatus } from '../types';
import {
  AlertTriangle,
  Car,
  Wind,
  Heart,
  Bandage,
  Activity,
  Flame,
  HelpCircle,
  MapPin,
  Building2,
  Ambulance,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface CategoryOption {
  key: EmergencyCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { key: 'accident', label: 'Accident', desc: 'Traffic collision, severe fall, high impact', icon: Car },
  { key: 'breathing', label: 'Breathing problem', desc: 'Severe shortness of breath, choking', icon: Wind },
  { key: 'chest_discomfort', label: 'Chest discomfort', desc: 'Crushing pain, suspected heart attack', icon: Heart },
  { key: 'injury', label: 'Injury', desc: 'Deep wound, heavy bleeding, suspected fracture', icon: Bandage },
  { key: 'sudden_illness', label: 'Sudden illness', desc: 'Fainting, stroke symptoms, seizure', icon: Activity },
  { key: 'fire', label: 'Fire-related emergency', desc: 'Thermal burn, smoke inhalation', icon: Flame },
  { key: 'other', label: 'Other emergency', desc: 'Any other urgent medical hazard', icon: HelpCircle },
];

export const EmergencySOSPage: React.FC = () => {
  const {
    activeEmergency,
    triggerEmergency,
    updateEmergencyStatus,
    cancelEmergency,
    userLocation,
    hospitals,
    contacts,
    initiateDemoCall,
    ambulanceUnits,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('accident');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nearestHospital = hospitals[0];
  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const assignedAmbulance = activeEmergency?.ambulanceUnitCode
    ? ambulanceUnits.find((a) => a.unitCode === activeEmergency.ambulanceUnitCode)
    : ambulanceUnits[0];

  const handleRequestAssistance = async () => {
    setIsSubmitting(true);
    try {
      await triggerEmergency(selectedCategory);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progression steps
  const steps: { key: EmergencyStatus; label: string }[] = [
    { key: 'received', label: 'Request Received' },
    { key: 'assigned', label: 'Ambulance Assigned' },
    { key: 'en_route', label: 'Ambulance En Route' },
    { key: 'arrived', label: 'Arrived' },
  ];

  const currentStepIndex = activeEmergency
    ? steps.findIndex((s) => s.key === activeEmergency.status)
    : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* If No Active Emergency: Show Clean, Ultra-Simple Selector */}
      {!activeEmergency ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Emergency Assistance Terminal
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Select the nature of your emergency below. Fast, large-target interface designed for quick access in urgent situations.
            </p>
          </div>

          {/* Emergency Category Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/80 shadow-md ring-2 ring-rose-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isSelected ? 'text-rose-950' : 'text-slate-900'}`}>
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Trigger Dispatch Button */}
          <div className="pt-4">
            <button
              onClick={handleRequestAssistance}
              disabled={isSubmitting}
              className="w-full py-5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-xl rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-transform"
            >
              <AlertTriangle className="w-6 h-6 fill-current animate-pulse" />
              <span>{isSubmitting ? 'INITIALIZING DISPATCH...' : 'CONFIRM & REQUEST ASSISTANCE'}</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Demo Mode: Safe simulated request. Real emergency services are not automatically called.
            </p>
          </div>

          {/* Direct Hotlines fallback */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Immediate Phone Dialers (Simulated):</span>
            <div className="flex gap-2">
              <button
                onClick={() => initiateDemoCall('Emergency Services (911)', '911')}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
              >
                Call 911
              </button>
              <button
                onClick={() => initiateDemoCall('Poison Control', '1-800-222-1222')}
                className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700"
              >
                Poison Control
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* AFTER SELECTION: Emergency Assistance Requested Screen */
        <div className="space-y-6">
          {/* Main Success/Alert Banner */}
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-white animate-pulse" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-black text-rose-200 bg-white/10 px-3 py-1 rounded-full">
                Incident #{activeEmergency.id} · Priority 1
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                Emergency Assistance Requested
              </h1>
              <p className="text-sm text-rose-100 max-w-md mx-auto mt-1">
                Triage alerts active for <strong>{activeEmergency.categoryLabel}</strong>. Responders have been alerted with your location.
              </p>
            </div>

            {/* Stepper Status Tracker */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {steps.map((st, idx) => {
                  const isPassed = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <button
                      key={st.key}
                      onClick={() => updateEmergencyStatus(st.key)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-white text-rose-800 font-extrabold shadow-md ring-2 ring-white/60'
                          : isPassed
                          ? 'bg-rose-800/80 border-rose-500 text-rose-100'
                          : 'bg-rose-900/40 border-rose-700/60 text-rose-300/70'
                      }`}
                    >
                      <span className="text-[10px] block opacity-80 uppercase tracking-wider">
                        Step 0{idx + 1}
                      </span>
                      <span className="text-xs font-bold block mt-0.5">{st.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-rose-200/90 mt-2">
                (Click any step above to simulate real-time tracker progression)
              </p>
            </div>
          </div>

          {/* 3 Prominently Labeled Call Buttons (Requested) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => initiateDemoCall('Emergency Services (911)', '911')}
              className="py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <PhoneCall className="w-5 h-5 shrink-0" />
              <span>Call Emergency Services</span>
            </button>

            <button
              onClick={() =>
                initiateDemoCall(
                  assignedAmbulance?.unitCode || 'Paramedic Unit 402',
                  assignedAmbulance?.phone || '(555) 911-0402'
                )
              }
              className="py-4 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Ambulance className="w-5 h-5 shrink-0" />
              <span>Call Ambulance</span>
            </button>

            <button
              onClick={() =>
                initiateDemoCall(
                  primaryContact?.name || 'Primary Contact',
                  primaryContact?.phone || '+1 (555) 892-4411'
                )
              }
              className="py-4 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <PhoneCall className="w-5 h-5 shrink-0" />
              <span>Contact Emergency Contact</span>
            </button>
          </div>

          {/* 5 Vital Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Current Location */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Current Location</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{userLocation.address}</p>
              <p className="text-xs text-slate-500 font-mono">
                GPS: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)} (Accuracy: {userLocation.accuracyMeters}m)
              </p>
            </div>

            {/* 2. Nearest Hospital */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Nearest Hospital</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {nearestHospital?.name || 'Assigned Regional Trauma Center'}
              </p>
              <p className="text-xs text-slate-500">
                {nearestHospital ? `${nearestHospital.distanceKm} km away · ${nearestHospital.openStatusText || 'Emergency Ready'}` : 'Routing to closest emergency facility based on GPS triage.'}
              </p>
            </div>

            {/* 3. Ambulance Availability */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <Ambulance className="w-4 h-4 text-sky-600" />
                <span>Ambulance Assigned</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {assignedAmbulance?.unitCode} ({assignedAmbulance?.type})
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Estimated Arrival: <strong>~{activeEmergency.etaMinutes || 4} mins</strong></span>
              </p>
            </div>

            {/* 4. Emergency Contact */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Primary Emergency Contact</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {primaryContact.name} ({primaryContact.relationship})
              </p>
              <p className="text-xs text-slate-500 font-mono">{primaryContact.phone}</p>
            </div>
          </div>

          {/* Action Row: Resolve or Cancel */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={cancelEmergency}
              className="px-4 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Cancel Emergency Request
            </button>

            <button
              onClick={() => updateEmergencyStatus('resolved')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Emergency Resolved</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
