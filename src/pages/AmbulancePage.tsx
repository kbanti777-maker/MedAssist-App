import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyCategory, EmergencyStatus } from '../types';
import { ASSET_IMAGES } from '../services/mockData';
import {
  Ambulance,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Radio,
  XCircle,
  FileText,
} from 'lucide-react';

export const AmbulancePage: React.FC = () => {
  const {
    ambulanceUnits,
    activeEmergency,
    requestAmbulance,
    updateEmergencyStatus,
    cancelAmbulanceRequest,
    userLocation,
    medicalProfile,
    contacts,
    initiateDemoCall,
  } = useApp();

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  const [patientName, setPatientName] = useState(medicalProfile.fullName || '');
  const [category, setCategory] = useState<EmergencyCategory>('breathing');
  const [pickupLocation, setPickupLocation] = useState(userLocation.address || '');
  const [contactNumber, setContactNumber] = useState(primaryContact?.phone || '');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestAmbulance({
        patientName,
        category,
        pickupLocation,
        contactNumber,
        additionalNotes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedUnit = activeEmergency?.ambulanceUnitCode
    ? ambulanceUnits.find((u) => u.unitCode === activeEmergency.ambulanceUnitCode)
    : null;

  // Tracker stages
  const trackerStages: { key: EmergencyStatus; label: string; desc: string }[] = [
    { key: 'received', label: 'Request Received', desc: 'Central Dispatch verified coordinates' },
    { key: 'assigned', label: 'Ambulance Assigned', desc: 'Unit selected & paramedic team notified' },
    { key: 'en_route', label: 'Ambulance En Route', desc: 'Vehicle traveling with active sirens & GPS' },
    { key: 'arrived', label: 'Arrived on Scene', desc: 'Paramedics on site at pickup location' },
  ];

  const currentStageIndex = activeEmergency
    ? trackerStages.findIndex((s) => s.key === activeEmergency.status)
    : -1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Mobile Emergency Medical Services
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Request Ambulance Assistance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rapid paramedic dispatch with real-time route telemetry and triage coordination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => initiateDemoCall('Ambulance Central Dispatch (911)', '911')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Paramedic Line (911)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Active Tracker OR Request Form */}
        <div className="lg:col-span-7 space-y-6">
          {activeEmergency ? (
            /* ACTIVE AMBULANCE TRACKER */
            <div className="bg-white rounded-3xl border-2 border-sky-200 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Ambulance className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      Live Telemetry Stream
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      Dispatch #{activeEmergency.id} · {activeEmergency.categoryLabel}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Est. Arrival</span>
                  <span className="text-lg font-black font-mono text-rose-600">
                    ~{activeEmergency.etaMinutes || 4} MINS
                  </span>
                </div>
              </div>

              {/* Status Stepper Tracker */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Dispatch Progress Status
                </h4>

                <div className="relative border-l-2 border-sky-100 ml-4 pl-6 space-y-6">
                  {trackerStages.map((stage, idx) => {
                    const isPassed = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div key={stage.key} className="relative">
                        {/* Circle Indicator */}
                        <button
                          onClick={() => updateEmergencyStatus(stage.key)}
                          className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-sky-600 border-white text-white ring-4 ring-sky-200 shadow-md'
                              : isPassed
                              ? 'bg-emerald-500 border-white text-white'
                              : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={`Click to manually set status to: ${stage.label}`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                          )}
                        </button>

                        <div className="cursor-pointer" onClick={() => updateEmergencyStatus(stage.key)}>
                          <p
                            className={`text-sm font-bold leading-tight ${
                              isCurrent
                                ? 'text-sky-900'
                                : isPassed
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Tip: Tap on any milestone circle to advance or change dispatch progress for demonstration.
                </p>
              </div>

              {/* Driver and Vehicle Demo Information */}
              {assignedUnit && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase border-b border-slate-200/60 pb-2">
                    <span>Assigned Vehicle & Crew Profile</span>
                    <span className="font-mono text-slate-600">{assignedUnit.unitCode}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Paramedic In-Charge</span>
                      <strong className="text-slate-900 font-semibold">{assignedUnit.paramedicLead}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vehicle Driver</span>
                      <strong className="text-slate-900 font-semibold">{assignedUnit.driverName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">License Plate</span>
                      <strong className="text-slate-900 font-mono font-semibold">{assignedUnit.plateNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Base Station</span>
                      <strong className="text-slate-900 font-semibold">{assignedUnit.baseHospital}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => initiateDemoCall(assignedUnit.unitCode, assignedUnit.phone)}
                      className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Direct Driver Radio Call</span>
                    </button>
                    <button
                      onClick={cancelAmbulanceRequest}
                      className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* NEW AMBULANCE REQUEST FORM */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Patient & Triage Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete this form to dispatch the nearest emergency unit to your exact location.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Patient Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Patient Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Field 2: Emergency Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Emergency Type *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                  >
                    <option value="breathing">Breathing Problem / Choking / Severe Asthma</option>
                    <option value="chest_discomfort">Chest Discomfort / Heart Attack Suspected</option>
                    <option value="accident">Severe Vehicular / Workplace Accident</option>
                    <option value="injury">Heavy Bleeding / Fracture / Head Trauma</option>
                    <option value="sudden_illness">Sudden Illness / Stroke / Unconscious</option>
                    <option value="fire">Burn Injury / Smoke Inhalation</option>
                    <option value="other">General Acute Emergency</option>
                  </select>
                </div>

                {/* Field 3: Pickup Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pickup Location & Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Street address, building, floor or landmark"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Field 4: Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Field 5: Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Additional Information / Medical Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="e.g. Patient is conscious, has penicillin allergy, second floor apartment without elevator"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-black text-sm uppercase tracking-wide rounded-2xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Ambulance className="w-5 h-5" />
                  <span>{isSubmitting ? 'Requesting...' : 'Request Ambulance Now'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Ambulance Fleet Availability Monitor */}
        <div className="lg:col-span-5 space-y-6">
          {/* Photo card of response vehicle */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm aspect-16/10 bg-slate-100">
            <img
              src={ASSET_IMAGES.ambulance}
              alt="High-tech emergency ambulance fleet"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
              <div>
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                  Regional Fleet Network
                </span>
                <p className="text-sm font-bold text-white">
                  Advanced Paramedic Support · Real-Time GPS Tracking
                </p>
              </div>
            </div>
          </div>

          {/* Active Fleet Units */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-600" />
                <span>Station Fleet Availability</span>
              </h4>
              <span className="text-xs font-mono text-teal-700 font-bold">
                {ambulanceUnits.filter((u) => u.status === 'Available').length} Units Ready
              </span>
            </div>

            <div className="space-y-3">
              {ambulanceUnits.map((unit) => {
                const isReady = unit.status === 'Available';
                return (
                  <div
                    key={unit.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold">{unit.unitCode}</strong>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {unit.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{unit.type}</p>
                      <p className="text-slate-400 text-[10px]">{unit.baseHospital}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-slate-700 font-semibold block">
                        ~{unit.currentEtaMinutes}m ETA
                      </span>
                      <button
                        onClick={() => initiateDemoCall(unit.unitCode, unit.phone)}
                        className="text-teal-700 font-bold hover:underline text-[11px] mt-1 inline-flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> Call
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
