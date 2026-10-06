import React from 'react';
import { useApp } from '../context/AppContext';
import { ASSET_IMAGES } from '../services/mockData';
import {
  AlertTriangle,
  Building2,
  Ambulance,
  PhoneCall,
  HeartPulse,
  CreditCard,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  Activity,
  CheckCircle2,
  Phone,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    openSOSModal,
    setCurrentPage,
    initiateDemoCall,
    userLocation,
    hospitals,
    contacts,
  } = useApp();

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const nearestHospital = hospitals[0];

  return (
    <div className="space-y-16 pb-12">
      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-16 bg-gradient-to-b from-teal-50/60 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                <span>Active 24/7 Regional Emergency Response System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
                Emergency Medical Assistance, When You Need It Most
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Quickly connect with emergency services, nearby hospitals, ambulance assistance and trusted emergency contacts.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openSOSModal()}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2.5 transition-all"
                >
                  <AlertTriangle className="w-5 h-5 fill-current" />
                  <span>Get Emergency Help</span>
                </button>

                <button
                  onClick={() => setCurrentPage('hospitals')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-xs flex items-center gap-2 transition-colors"
                >
                  <Building2 className="w-5 h-5 text-teal-700" />
                  <span>Find Nearby Hospitals</span>
                </button>
              </div>

              {/* Live Location & Triage Status Indicator */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {userLocation.address}
                  </span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Avg ER Response: <strong>4.2 mins</strong></span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Medical ID Active</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual & SOS Interactive Card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Emergency SOS Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-rose-100 ring-1 ring-rose-500/10 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></div>
                    <span className="text-xs font-bold tracking-wider uppercase text-rose-700">
                      Emergency SOS Terminal
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">DEMO VERIFIED</span>
                </div>

                <div className="text-center py-2">
                  <p className="text-xs text-slate-500 mb-4">
                    In a severe medical crisis, tap below to initiate guided triage with nearest hospital alert.
                  </p>
                  <button
                    onClick={() => openSOSModal()}
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-lg tracking-wide rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
                  >
                    <AlertTriangle className="w-6 h-6 fill-current animate-pulse" />
                    <span>EMERGENCY SOS</span>
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Safety protected · Confirmation modal prevents accidental dispatches
                  </p>
                </div>

                {/* Quick glance live status */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Nearest ER</span>
                    <strong className="text-slate-800 font-semibold truncate block mt-0.5">
                      {nearestHospital?.name || 'Nearest Verified ER'}
                    </strong>
                    <span className="text-teal-700 text-[11px] font-bold">
                      {nearestHospital ? `${nearestHospital.distanceKm} km away` : 'Locating...'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">1st Contact</span>
                    <strong className="text-slate-800 font-semibold truncate block mt-0.5">
                      {primaryContact?.name || 'Eleanor Harrison'}
                    </strong>
                    <button
                      onClick={() => initiateDemoCall(primaryContact?.name || 'Contact', primaryContact?.phone || '555')}
                      className="text-teal-700 text-[11px] font-bold hover:underline"
                    >
                      Call Contact
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Card with Verified Asset */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-100">
                <img
                  src={ASSET_IMAGES.hero}
                  alt="Modern emergency medical paramedics and response fleet"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                  <p className="text-xs font-semibold text-white">
                    Integrated Trauma Response Network · Active Fleet Standby
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          EMERGENCY HELPLINE BAR
          ========================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                24/7 National Emergency Helplines
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Immediate Direct Dial Channels
              </h3>
              <p className="text-xs text-slate-400">
                Tap any hotline to simulate direct emergency dispatch connection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => initiateDemoCall('National Emergency Dispatch (911)', '911')}
                className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-between gap-3 text-left"
              >
                <div>
                  <span className="text-[10px] text-rose-200 block uppercase font-bold">Emergency Police & ER</span>
                  <span className="text-lg font-black font-mono">911</span>
                </div>
                <Phone className="w-5 h-5 text-rose-100" />
              </button>

              <button
                onClick={() => initiateDemoCall('Poison Control Center', '1-800-222-1222')}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-between gap-3 text-left"
              >
                <div>
                  <span className="text-[10px] text-teal-300 block uppercase font-bold">Poison Control</span>
                  <span className="text-sm font-bold font-mono">1-800-222-1222</span>
                </div>
                <Phone className="w-5 h-5 text-teal-400" />
              </button>

              <button
                onClick={() => initiateDemoCall('Crisis & Lifeline', '988')}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-between gap-3 text-left"
              >
                <div>
                  <span className="text-[10px] text-sky-300 block uppercase font-bold">Suicide & Crisis</span>
                  <span className="text-lg font-bold font-mono">988</span>
                </div>
                <Phone className="w-5 h-5 text-sky-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          KEY CAPABILITIES: 6 CORE RESOURCE CARDS
          ========================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            All-In-One Emergency Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Medical Assistance Tools
          </h2>
          <p className="text-sm text-slate-600">
            Engineered for rapid response during critical moments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Emergency Helpline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Emergency Helpline & SOS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One-tap priority dispatch with condition categorization, real-time location streaming, and responder routing.
              </p>
            </div>
            <button
              onClick={() => openSOSModal()}
              className="mt-6 inline-flex items-center text-xs font-bold text-rose-600 group-hover:text-rose-700 gap-1.5"
            >
              <span>Activate SOS Terminal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 2: Ambulance */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Ambulance className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Ambulance Assistance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct ambulance booking with live 4-stage dispatch tracking (Assigned, En Route, Arrived) and driver details.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('ambulance')}
              className="mt-6 inline-flex items-center text-xs font-bold text-sky-600 group-hover:text-sky-700 gap-1.5"
            >
              <span>Request Paramedic Unit</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 3: Nearby Hospitals */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Nearby Hospitals & ER Wait Times
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by Level 1 Trauma Center, 24/7 status, live ER waiting times, ICU bed availability, and interactive map view.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('hospitals')}
              className="mt-6 inline-flex items-center text-xs font-bold text-teal-700 group-hover:text-teal-800 gap-1.5"
            >
              <span>Explore Hospital Finder</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 4: Emergency Contacts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Emergency Contacts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure primary family members, doctors, and guardians with instant call and coordinate alert triggers.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('contacts')}
              className="mt-6 inline-flex items-center text-xs font-bold text-purple-600 group-hover:text-purple-700 gap-1.5"
            >
              <span>Manage Emergency Contacts</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 5: First Aid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                First Aid Clinical Protocols
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step guidance for CPR, choking, bleeding, burns, and fainting with critical "What NOT to do" safety warnings.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('first-aid')}
              className="mt-6 inline-flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700 gap-1.5"
            >
              <span>View First Aid Library</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 6: Medical Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Emergency Medical ID & QR
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-visibility responder card displaying Blood Group, Allergies, Critical Conditions, and scannable QR code.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('medical-card')}
              className="mt-6 inline-flex items-center text-xs font-bold text-amber-700 group-hover:text-amber-800 gap-1.5"
            >
              <span>Access Emergency ID Card</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS (4-STEP WORKFLOW)
          ========================================= */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Emergency Protocol Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How MedAssist Works in Seconds
            </h2>
            <p className="text-sm text-slate-600">
              A streamlined, high-legibility workflow engineered for high-stress situations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Detect / Select Emergency
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose the incident type (Accident, Breathing, Cardiac, Bleeding) or press SOS for instantaneous triage protocol initialization.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Find Nearby Help
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our geo-engine pinpoints nearest Level 1/2 Trauma centers, available ICU beds, and calculates fastest live transit time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Contact Emergency Services
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct phone routing to regional paramedics, poison control, or automated alert transmission to trusted family contacts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Get Assistance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track en-route paramedic telemetry live while accessing step-by-step first aid guides and verified medical identity cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          CALL TO ACTION / TRUST FOOTER
          ========================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Be Prepared Before An Incident Occurs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Keep Your Emergency Medical Profile Updated
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Responders can save crucial minutes if your blood group, medication list, and emergency contacts are entered ahead of time.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setCurrentPage('medical-card')}
                className="px-6 py-3 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm shadow-md transition-colors"
              >
                Set Up Medical ID Card
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="px-6 py-3 rounded-2xl bg-teal-700/60 hover:bg-teal-700 border border-teal-500/40 text-white font-bold text-sm transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
