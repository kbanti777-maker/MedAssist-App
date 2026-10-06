import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyContact } from '../types';
import {
  UserPlus,
  PhoneCall,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    initiateDemoCall,
    userLocation,
    showToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<EmergencyContact['relationship']>('Family Member');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Family Member');
    setPhone('');
    setAlternatePhone('');
    setEmail('');
    setIsPrimary(contacts.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setAlternatePhone(contact.alternatePhone || '');
    setEmail(contact.email || '');
    setIsPrimary(contact.isPrimary);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingContact) {
      updateContact({
        ...editingContact,
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        email: email.trim() || undefined,
        isPrimary,
      });
    } else {
      addContact({
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        email: email.trim() || undefined,
        isPrimary,
      });
    }

    setIsModalOpen(false);
  };

  const handleSimulateSMS = (contact: EmergencyContact) => {
    showToast(
      'Emergency SMS Alert Sent (Demo)',
      `Dispatched live GPS coordinates (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}) to ${contact.name}.`,
      'success'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Trusted Safety Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Emergency Contacts Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Designate primary family, guardians, and clinical doctors to receive instant notifications in a medical crisis.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Primary Contact Guidance Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-teal-950">
              Primary Contact Automated Dispatch
            </h3>
            <p className="text-xs text-teal-800 mt-0.5">
              Your primary contact is immediately summoned with your verified GPS coordinates whenever you trigger an Emergency SOS.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-teal-900 bg-teal-100/80 px-3 py-1 rounded-lg self-start sm:self-auto">
          {contacts.length} Contact{contacts.length === 1 ? '' : 's'} Configured
        </span>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`bg-white rounded-3xl border transition-all p-6 flex flex-col justify-between shadow-xs ${
              contact.isPrimary
                ? 'border-teal-500 ring-2 ring-teal-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Header Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {contact.relationship}
                </span>

                {contact.isPrimary ? (
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Primary Contact</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setPrimaryContact(contact.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-teal-700 transition-colors"
                  >
                    Set as Primary
                  </button>
                )}
              </div>

              {/* Name & Phone */}
              <h3 className="text-lg font-bold text-slate-900">{contact.name}</h3>
              <p className="text-sm font-mono text-slate-700 mt-1 font-semibold">{contact.phone}</p>
              {contact.alternatePhone && (
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Alt: {contact.alternatePhone}
                </p>
              )}
              {contact.email && (
                <p className="text-xs text-slate-500 mt-1 truncate">{contact.email}</p>
              )}
            </div>

            {/* Actions Bottom */}
            <div className="pt-6 mt-4 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => initiateDemoCall(contact.name, contact.phone)}
                  className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>

                <button
                  onClick={() => handleSimulateSMS(contact)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  title="Simulate SMS alert with GPS"
                >
                  <Send className="w-3 h-3 text-slate-500" />
                  <span>Send SOS SMS</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => openEditModal(contact)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
                  title="Edit Contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remove ${contact.name} from emergency contacts?`)) {
                      deleteContact(contact.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                  title="Delete Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Connor"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Relationship *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as EmergencyContact['relationship'])}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Primary Doctor">Doctor</option>
                  <option value="Trusted Contact">Trusted Contact</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alternate Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="+1 (555) 987-6543"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@domain.com"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Set as Primary Emergency Contact
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
