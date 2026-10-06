import React from 'react';
import { useApp } from '../context/AppContext';
import { OfflineStatusIndicator } from '../components/common/OfflineStatusIndicator';
import {
  AlertTriangle,
  Building2,
  Ambulance,
  PhoneCall,
  HeartPulse,
  MapPin,
  CreditCard,
  Stethoscope,
  RefreshCw,
  Clock,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    openSOSModal,
    setCurrentPage,
    userLocation,
    detectLocation,
    isDetectingLocation,
    activeEmergency,
    hospitals,
    contacts,
    medicalProfile,
    profileCompletionPercentage,
    initiateDemoCall,
  } = useApp();

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const nearestHospital = hospitals[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Real-Time Medical Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Emergency Assistance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access immediate response controls, facility triage monitors, and your medical profile.
          </p>
        </div>

        {/* Location & Ready Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh GPS location"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Locating...' : 'Refresh GPS'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>SYSTEM READY</span>
          </div>
        </div>
      </div>

      {/* Offline Availability Status Indicator Banner */}
      <OfflineStatusIndicator variant="card" />

      {/* Featured SOS Master Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                Primary Emergency Action
              </span>
              {activeEmergency && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 animate-pulse">
                  Dispatch Active
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeEmergency ? 'Active Emergency In Progress' : 'Instant Emergency SOS Dispatch'}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {activeEmergency
                ? `Incident #${activeEmergency.id} (${activeEmergency.categoryLabel}) is currently ${activeEmergency.status}. Assigned ambulance ${activeEmergency.ambulanceUnitCode}.`
                : 'Select your acute condition to initiate instant hospital alert and live ambulance dispatch with verified patient telemetry.'}
            </p>

            {/* Status breakdown grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Location Status
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{userLocation.address}</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Primary Contact
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{primaryContact ? primaryContact.name : 'None added'}</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Triage Facility
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>{nearestHospital ? `${nearestHospital.name} (${nearestHospital.distanceKm} km)` : 'Regional ER'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Action: Large SOS button */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-rose-50/60 rounded-3xl border border-rose-100">
            {activeEmergency ? (
              <div className="text-center space-y-4 w-full">
                <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <AlertTriangle className="w-10 h-10 fill-current" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-rose-950">Active Ticket #{activeEmergency.id}</h4>
                  <p className="text-xs text-rose-700 mt-0.5">Ambulance ETA: {activeEmergency.etaMinutes || 4} mins</p>
                </div>
                <button
                  onClick={() => setCurrentPage('sos')}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                >
                  Open Live Emergency Screen
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3 w-full">
                <button
                  onClick={() => openSOSModal()}
                  className="w-full py-5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 active:scale-95 text-white font-black text-xl tracking-wider rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-transform"
                >
                  <AlertTriangle className="w-7 h-7 fill-current animate-pulse" />
                  <span>EMERGENCY SOS</span>
                </button>
                <p className="text-xs text-slate-500">
                  Tap to launch step-by-step emergency dispatch selector.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8 Requested Quick Action Cards Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>Quick Assistance Actions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 🚨 Emergency SOS */}
          <div
            onClick={() => openSOSModal()}
            className="p-5 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5 fill-current" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                🚨 Emergency SOS
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trigger high-priority alert with instant nearest trauma hospital dispatch notification.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-rose-600 flex items-center gap-1">
              Trigger SOS <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: 🏥 Nearby Hospitals */}
          <div
            onClick={() => setCurrentPage('hospitals')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                🏥 Nearby Hospitals
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live trauma center directory with real ER wait times, ICU bed counts, and directions.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-teal-700 flex items-center gap-1">
              Find Hospitals <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: 🚑 Ambulance */}
          <div
            onClick={() => setCurrentPage('ambulance')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Ambulance className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                🚑 Ambulance Dispatch
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Request ALS/BLS paramedic units with live GPS progression and phone communication.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-sky-600 flex items-center gap-1">
              Request Ambulance <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: 📞 Emergency Contacts */}
          <div
            onClick={() => setCurrentPage('contacts')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                📞 Emergency Contacts
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage your trusted circle with quick direct calls and automated emergency broadcasts.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1">
              Manage Contacts <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 5: 🩺 First Aid */}
          <div
            onClick={() => setCurrentPage('first-aid')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                🩺 First Aid Guides
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clinical step-by-step protocols for CPR, choking, severe bleeding, and burns.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
              View First Aid <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 6: 📍 My Location */}
          <div
            onClick={detectLocation}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                📍 My Location
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {userLocation.address} · Acc: {userLocation.accuracyMeters}m
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-teal-700 flex items-center gap-1">
              Update GPS Coordinates <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 7: 💊 Medical Information */}
          <div
            onClick={() => setCurrentPage('medical-card')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                💊 Medical Information
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Emergency ID card with Blood Group ({medicalProfile.bloodGroup}), allergies, and QR code.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-amber-700 flex items-center gap-1">
              View Medical ID <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 8: 🧑‍⚕️ Medical Assistance */}
          <div
            onClick={() => setCurrentPage('services')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                🧑‍⚕️ Medical Assistance
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Directory for Poison Control, Blood Bank, Urgent Clinics, and 24/7 Pharmacies.
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1">
              Explore Services <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Profile & Hospital Glance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Readiness Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Emergency Profile Completion</span>
            </h4>
            <span className="text-sm font-extrabold text-teal-700 font-mono">
              {profileCompletionPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${profileCompletionPercentage}%` }}
            ></div>
          </div>

          <p className="text-xs text-slate-500">
            {profileCompletionPercentage === 100
              ? 'Your profile is fully configured and optimized for emergency medical personnel.'
              : 'Add alternative emergency contacts and medication dosages to reach 100% readiness.'}
          </p>

          <button
            onClick={() => setCurrentPage('profile')}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>Review Profile Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Nearest Facility Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Nearest Triage Facility: {nearestHospital?.name || 'Local Emergency Center'}</span>
            </h4>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {nearestHospital ? (nearestHospital.isOpen24x7 ? 'OPEN 24/7' : nearestHospital.openStatusText || 'OPEN') : 'DISPATCH READY'}
            </span>
          </div>

          {nearestHospital ? (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Distance</span>
                <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                  {nearestHospital.distanceKm} km
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Status</span>
                <strong className="text-teal-700 font-mono text-sm block mt-0.5">
                  {nearestHospital.openStatusText || (nearestHospital.openNow ? 'Open Now' : 'Available')}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Rating</span>
                <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                  {nearestHospital.rating ? `⭐ ${nearestHospital.rating.toFixed(1)}` : 'Verified'}
                </strong>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <p>Locate verified nearby hospitals based on your live device coordinates.</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {nearestHospital ? (
              <button
                onClick={() => initiateDemoCall(nearestHospital.name, nearestHospital.emergencyDirectLine || nearestHospital.phone || '')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Direct ER Call</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('hospitals')}
                className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Find Nearby Hospitals</span>
              </button>
            )}
            <button
              onClick={() => setCurrentPage('hospitals')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              View Nearby Hospitals →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
