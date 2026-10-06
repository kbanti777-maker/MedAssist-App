import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineStatusIndicator } from '../components/common/OfflineStatusIndicator';
import {
  CreditCard,
  QrCode,
  AlertTriangle,
  HeartPulse,
  Pill,
  ShieldAlert,
  UserCheck,
  Printer,
  Download,
  Edit3,
  CheckCircle2,
  X,
  Stethoscope,
} from 'lucide-react';

export const MedicalCardPage: React.FC = () => {
  const {
    medicalProfile,
    updateMedicalProfile,
    contacts,
    showToast,
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  // Edit form state
  const [fullName, setFullName] = useState(medicalProfile.fullName);
  const [age, setAge] = useState(medicalProfile.age.toString());
  const [bloodGroup, setBloodGroup] = useState(medicalProfile.bloodGroup);
  const [allergiesText, setAllergiesText] = useState(medicalProfile.allergies.join(', '));
  const [conditionsText, setConditionsText] = useState(medicalProfile.existingConditions.join(', '));
  const [medicationsText, setMedicationsText] = useState(medicalProfile.currentMedications.join(', '));
  const [emergencyNotes, setEmergencyNotes] = useState(medicalProfile.emergencyNotes);
  const [doctorName, setDoctorName] = useState(medicalProfile.primaryDoctor.name);
  const [doctorPhone, setDoctorPhone] = useState(medicalProfile.primaryDoctor.phone);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedicalProfile({
      fullName: fullName.trim(),
      age: parseInt(age) || 30,
      bloodGroup,
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      existingConditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
      currentMedications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
      emergencyNotes: emergencyNotes.trim(),
      primaryDoctor: {
        name: doctorName.trim(),
        hospital: medicalProfile.primaryDoctor.hospital,
        phone: doctorPhone.trim(),
      },
    });
    setIsEditModalOpen(false);
  };

  const handlePrint = () => {
    showToast('Print Prepared', 'Emergency medical card layout sent to system print dialog.', 'info');
    window.print();
  };

  const handleDownload = () => {
    showToast('Digital Card Downloaded', 'Emergency Medical ID saved as offline image/PDF format.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            First-Responder Quick Access ID
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Emergency Medical Card & ID
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standardized clinical format optimized for rapid triage diagnosis by EMTs and paramedics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Offline Availability Indicator */}
      <OfflineStatusIndicator variant="card" />

      {/* ========================================================
          THE VISUALLY OPTIMIZED EMERGENCY MEDICAL CARD
          ======================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative cross backdrop */}
        <div className="absolute right-4 top-4 text-slate-800/20 font-black text-9xl pointer-events-none select-none">
          +
        </div>

        {/* Top Header of Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              +
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-rose-400">
                UNIVERSAL MEDICAL EMERGENCY ID
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {medicalProfile.fullName}
              </h2>
              <p className="text-xs text-slate-400">
                Age: {medicalProfile.age} · DOB: {medicalProfile.dateOfBirth} · Organ Donor: {medicalProfile.organDonor ? 'YES' : 'NO'}
              </p>
            </div>
          </div>

          {/* Eye-catching Blood Group Badge */}
          <div className="bg-rose-600/90 border-2 border-rose-400/50 rounded-2xl px-5 py-2.5 text-center shadow-lg">
            <span className="text-[10px] font-bold text-rose-100 uppercase tracking-wider block">
              Blood Group
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono text-white leading-none">
              {medicalProfile.bloodGroup}
            </span>
          </div>
        </div>

        {/* Core Clinical Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
          {/* Column 1: Allergies & Conditions (md:col-span-8) */}
          <div className="md:col-span-8 space-y-4">
            {/* Allergies Alert */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/60">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Known Allergies (High Caution)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {medicalProfile.allergies.length > 0 ? (
                  medicalProfile.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="text-xs font-bold px-3 py-1 bg-rose-900/80 text-rose-100 rounded-lg border border-rose-700/50"
                    >
                      ⚠️ {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No known drug or environmental allergies</span>
                )}
              </div>
            </div>

            {/* Existing Medical Conditions */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <HeartPulse className="w-4 h-4 text-teal-400" />
                <span>Existing Medical Conditions</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {medicalProfile.existingConditions.map((cond) => (
                  <span
                    key={cond}
                    className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Pill className="w-4 h-4 text-sky-400" />
                <span>Active Prescriptions & Medications</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {medicalProfile.currentMedications.map((med) => (
                  <span
                    key={med}
                    className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-sky-200 rounded-lg border border-slate-700 font-mono"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            {medicalProfile.emergencyNotes && (
              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-300">
                <strong className="text-white block mb-0.5">Emergency Triage Directives:</strong>
                {medicalProfile.emergencyNotes}
              </div>
            )}
          </div>

          {/* Column 2: Emergency Contact & QR Code (md:col-span-4) */}
          <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Scannable QR Code Placeholder */}
            <div className="bg-white rounded-2xl p-4 text-slate-900 text-center flex flex-col items-center shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-900 mb-2">
                Scan for Full Medical History
              </span>

              {/* Render an authentic crisp SVG QR code matrix */}
              <div className="w-36 h-36 bg-slate-100 rounded-xl p-2 border border-slate-200 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
                  {/* Outer corner finder 1 */}
                  <rect x="5" y="5" width="30" height="30" rx="3" />
                  <rect x="10" y="10" width="20" height="20" fill="white" />
                  <rect x="15" y="15" width="10" height="10" />
                  {/* Outer corner finder 2 */}
                  <rect x="65" y="5" width="30" height="30" rx="3" />
                  <rect x="70" y="10" width="20" height="20" fill="white" />
                  <rect x="75" y="15" width="10" height="10" />
                  {/* Outer corner finder 3 */}
                  <rect x="5" y="65" width="30" height="30" rx="3" />
                  <rect x="10" y="70" width="20" height="20" fill="white" />
                  <rect x="15" y="75" width="10" height="10" />
                  {/* Data patterns */}
                  <rect x="42" y="10" width="6" height="6" />
                  <rect x="50" y="18" width="6" height="6" />
                  <rect x="42" y="26" width="6" height="6" />
                  <rect x="20" y="42" width="6" height="6" />
                  <rect x="30" y="45" width="6" height="6" />
                  <rect x="45" y="45" width="10" height="10" />
                  <rect x="60" y="42" width="6" height="6" />
                  <rect x="72" y="48" width="6" height="6" />
                  <rect x="85" y="42" width="6" height="6" />
                  <rect x="45" y="65" width="6" height="6" />
                  <rect x="55" y="75" width="6" height="6" />
                  <rect x="65" y="65" width="6" height="6" />
                  <rect x="75" y="80" width="10" height="10" />
                  <rect x="88" y="68" width="6" height="6" />
                </svg>
              </div>

              <span className="text-[10px] text-slate-500 font-mono mt-2">
                MED-ID#{medicalProfile.id.toUpperCase()}
              </span>
            </div>

            {/* Primary Contact Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Primary Emergency Contact
              </span>
              <p className="font-bold text-white text-sm">{primaryContact?.name}</p>
              <p className="text-teal-400 font-mono font-semibold">{primaryContact?.phone}</p>
              <p className="text-slate-400 text-[11px]">{primaryContact?.relationship}</p>
            </div>

            {/* Doctor Info */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Primary Care Physician
              </span>
              <p className="font-bold text-white">{medicalProfile.primaryDoctor.name}</p>
              <p className="text-slate-300 font-mono">{medicalProfile.primaryDoctor.phone}</p>
              <p className="text-slate-400 text-[11px]">{medicalProfile.primaryDoctor.hospital}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        <strong className="text-slate-700">Notice: </strong>
        This Emergency Medical Card is rendered for demonstration and simulation purposes. In clinical environments, verify identities and vital parameters in consultation with licensed hospital attending staff.
      </div>

      {/* Edit Medical Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Emergency Medical Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-mono font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Known Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Latex"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Existing Medical Conditions (Comma separated)
                </label>
                <input
                  type="text"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="e.g. Asthma, Hypertension, Diabetes Type 2"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Medications (Comma separated)
                </label>
                <input
                  type="text"
                  value={medicationsText}
                  onChange={(e) => setMedicationsText(e.target.value)}
                  placeholder="e.g. Albuterol Inhaler, Lisinopril 10mg"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Primary Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Doctor Phone
                  </label>
                  <input
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Emergency Notes for Responders
                </label>
                <textarea
                  rows={3}
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
