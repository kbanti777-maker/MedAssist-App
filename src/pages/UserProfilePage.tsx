import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  PhoneCall,
  CreditCard,
  Building2,
  Clock,
  Lock,
  LogOut,
  Bell,
  Eye,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const {
    medicalProfile,
    contacts,
    hospitals,
    savedHospitalIds,
    pastRequests,
    profileCompletionPercentage,
    setCurrentPage,
    showToast,
  } = useApp();

  const [shareLocationWithFamily, setShareLocationWithFamily] = useState(true);
  const [receiveHospitalAlerts, setReceiveHospitalAlerts] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  const savedHospitals = hospitals.filter((h) => savedHospitalIds.includes(h.id));

  const handleSimulateLogout = () => {
    showToast('Session Securely Locked', 'Medical profile encrypted and secured locally.', 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Patient Identity & Security Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            User Profile & Health Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal data, privacy preferences, and connected emergency accounts.
          </p>
        </div>

        <button
          onClick={handleSimulateLogout}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Profile</span>
        </button>
      </div>

      {/* Profile Overview Card & Completion Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              {medicalProfile.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{medicalProfile.fullName}</h2>
              <p className="text-xs text-slate-500">
                DOB: {medicalProfile.dateOfBirth} ({medicalProfile.age} years) · Blood Group: <strong>{medicalProfile.bloodGroup}</strong>
              </p>
              <p className="text-xs text-teal-700 font-medium mt-0.5">
                Insurer: {medicalProfile.insuranceProvider} · Policy #{medicalProfile.policyNumber}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Readiness Score</span>
            <span className="text-2xl font-black font-mono text-teal-700">
              {profileCompletionPercentage}%
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${profileCompletionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Profile is configured for immediate dispatch telemetry.</span>
          </p>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emergency Contacts Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Emergency Contacts</span>
              <PhoneCall className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {contacts.length}
            </p>
            <p className="text-xs text-slate-500">
              Primary: {contacts.find((c) => c.isPrimary)?.name || 'Not set'}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('contacts')}
            className="mt-4 text-xs font-bold text-purple-600 hover:underline flex items-center justify-between"
          >
            <span>Manage Contacts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Saved Hospitals Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Saved Hospitals</span>
              <Building2 className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {savedHospitals.length}
            </p>
            <p className="text-xs text-slate-500 truncate">
              Favorite: {savedHospitals[0]?.name || 'None saved'}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('hospitals')}
            className="mt-4 text-xs font-bold text-teal-700 hover:underline flex items-center justify-between"
          >
            <span>View Saved Hospitals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Incident History Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Incident History</span>
              <Clock className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono">
              {pastRequests.length} Logs
            </p>
            <p className="text-xs text-slate-500">
              Last event: {pastRequests[0]?.timestamp || 'None recorded'}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('history')}
            className="mt-4 text-xs font-bold text-rose-600 hover:underline flex items-center justify-between"
          >
            <span>Review Incident Log</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Privacy and App Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-700" />
          <span>Privacy & Notification Settings</span>
        </h3>

        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Share Live Coordinates with Contacts</p>
              <p className="text-xs text-slate-500">Broadcasts exact GPS location during SOS activation.</p>
            </div>
            <input
              type="checkbox"
              checked={shareLocationWithFamily}
              onChange={(e) => setShareLocationWithFamily(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Trauma Center Bed Capacity Alerts</p>
              <p className="text-xs text-slate-500">Receive notifications when nearest ER wait time exceeds 20 minutes.</p>
            </div>
            <input
              type="checkbox"
              checked={receiveHospitalAlerts}
              onChange={(e) => setReceiveHospitalAlerts(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Local Offline Cache Encryption</p>
              <p className="text-xs text-slate-500">Retains first aid protocols and medical card even without cellular network.</p>
            </div>
            <input
              type="checkbox"
              checked={offlineSync}
              onChange={(e) => setOfflineSync(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Security & Data Protection Guarantee */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-400" />
          <h4 className="text-sm font-bold">Health Information Privacy Guarantee</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your personal medical records and emergency contacts are encrypted with client-side zero-knowledge tokens. MedAssist does not monetize or disclose protected health information to non-emergency commercial entities.
        </p>
      </div>
    </div>
  );
};
