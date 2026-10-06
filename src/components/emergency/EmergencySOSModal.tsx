import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmergencyCategory } from '../../types';
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
  ShieldCheck,
  X,
  PhoneCall,
  UserCheck
} from 'lucide-react';

interface CategoryOption {
  key: EmergencyCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    key: 'accident',
    label: 'Accident & Trauma',
    desc: 'Vehicular collision, fall from height, severe physical impact',
    icon: Car,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    key: 'breathing',
    label: 'Breathing Problem',
    desc: 'Severe shortness of breath, choking, severe asthma attack',
    icon: Wind,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    key: 'chest_discomfort',
    label: 'Chest Discomfort',
    desc: 'Crushing chest pressure, suspected heart attack, radiation to arm/jaw',
    icon: Heart,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    key: 'injury',
    label: 'Acute Injury / Bleeding',
    desc: 'Uncontrolled bleeding, deep lacerations, visible bone fracture',
    icon: Bandage,
    color: 'text-orange-600 border-orange-200 bg-orange-50',
  },
  {
    key: 'sudden_illness',
    label: 'Sudden Illness',
    desc: 'Stroke symptoms (FAST), loss of consciousness, severe allergic reaction',
    icon: Activity,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    key: 'fire',
    label: 'Fire & Burn Emergency',
    desc: 'Thermal burns, smoke inhalation, structural hazard',
    icon: Flame,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    key: 'other',
    label: 'Other Medical Emergency',
    desc: 'Any critical life-threatening condition requiring urgent response',
    icon: HelpCircle,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
  },
];

export const EmergencySOSModal: React.FC = () => {
  const {
    isSOSModalOpen,
    closeSOSModal,
    triggerEmergency,
    userLocation,
    contacts,
    medicalProfile,
    initiateDemoCall,
    hospitals,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('accident');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  if (!isSOSModalOpen) return null;

  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

  const handleProceed = () => {
    setStep('confirm');
  };

  const handleConfirmSOS = async () => {
    setIsSubmitting(true);
    try {
      await triggerEmergency(selectedCategory, customNotes);
    } finally {
      setIsSubmitting(false);
      setStep('select');
    }
  };

  const handleClose = () => {
    setStep('select');
    closeSOSModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Emergency Assistance Dispatch</h2>
              <p className="text-xs text-rose-100">Step {step === 'select' ? '1 of 2: Select Emergency Type' : '2 of 2: Review & Confirm'}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Select Emergency Category
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Choose the category that best describes the acute situation to alert proper triage teams:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.key;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`flex items-start gap-3 p-3 text-left rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-600'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border shrink-0 ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-rose-950' : 'text-slate-900'}`}>
                            {cat.label}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient Emergency Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Immediate Patient Notes / Specific Hazard (Optional)
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Patient is conscious, floor 3 apartment 304, bleeding from head"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 placeholder:text-slate-400"
                />
              </div>

              {/* Status Verification Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" /> Current Coordinates
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                    {userLocation.address}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Primary Contact
                  </span>
                  <span className="font-semibold text-slate-800">
                    {primaryContact?.name || 'Not configured'} ({primaryContact?.phone})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceed}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/25 transition-all flex items-center gap-2"
                >
                  <span>Review & Confirm SOS</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2.5">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-rose-950">Confirm Emergency Dispatch</h3>
                <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
                  Clicking confirm will generate an immediate emergency triage ticket, prepare nearest ambulance unit dispatch, and notify your emergency contacts with your live GPS location.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-sm">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Selected Triage</span>
                  <span className="font-bold text-rose-700">
                    {CATEGORIES.find(c => c.key === selectedCategory)?.label}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Patient Name</span>
                  <span className="font-semibold text-slate-900">{medicalProfile.fullName}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Blood Group & Allergies</span>
                  <span className="font-semibold text-slate-900">
                    {medicalProfile.bloodGroup} · {medicalProfile.allergies.join(', ') || 'No known allergies'}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Dispatch Destination</span>
                  <span className="font-semibold text-teal-700">
                    {hospitals[0] ? `${hospitals[0].name} (${hospitals[0].distanceKm} km)` : 'Nearest Emergency Hospital'}
                  </span>
                </div>
              </div>

              {/* Demo Mode Notice */}
              <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Demo Mode Active: This initiates a realistic simulated dispatch workflow. Emergency responders are simulated for testing and demonstration.
                </span>
              </div>

              {/* Confirmation buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="w-1/3 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSOS}
                  className="w-2/3 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Dispatching...' : 'CONFIRM EMERGENCY DISPATCH'}</span>
                </button>
              </div>

              {/* Quick direct phone call bypass */}
              <div className="text-center pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    initiateDemoCall('Metro Emergency Central Dispatch (911)', '911');
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Or tap here to test simulated direct 911 hotline call
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
