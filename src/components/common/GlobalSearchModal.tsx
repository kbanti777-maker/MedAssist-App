import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_FIRST_AID_GUIDES, INITIAL_EMERGENCY_SERVICES } from '../../services/mockData';
import {
  Search,
  X,
  Building2,
  BookOpen,
  PhoneCall,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    hospitals,
    contacts,
    setSelectedHospital,
    setIsHospitalDetailsOpen,
    setCurrentPage,
    initiateDemoCall,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedHospitals = hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        (h.type && h.type.toLowerCase().includes(q)) ||
        (h.services && h.services.some((s) => s.toLowerCase().includes(q)))
    );

    const matchedFirstAid = INITIAL_FIRST_AID_GUIDES.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );

    const matchedServices = INITIAL_EMERGENCY_SERVICES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );

    const matchedContacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.relationship.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );

    const totalCount =
      matchedHospitals.length +
      matchedFirstAid.length +
      matchedServices.length +
      matchedContacts.length;

    return {
      totalCount,
      hospitals: matchedHospitals,
      firstAid: matchedFirstAid,
      services: matchedServices,
      contacts: matchedContacts,
    };
  }, [query, hospitals, contacts]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, trauma centers, first aid protocols, contacts..."
            className="w-full text-base bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {!query && (
            <div className="py-8 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Quick Portal Search</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Try typing "CPR", "Trauma", "Poison", "Pediatric", or the name of a contact.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {['CPR Basics', 'Nearby ER', 'Poison Control', 'Burn Treatment', 'Ambulance'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && searchResults?.totalCount === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Check the spelling or try searching for a medical symptom or department.</p>
            </div>
          )}

          {searchResults && searchResults.totalCount > 0 && (
            <div className="space-y-5">
              {/* Hospitals */}
              {searchResults.hospitals.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" /> Hospitals & Medical Facilities ({searchResults.hospitals.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.hospitals.map((hosp) => (
                      <div
                        key={hosp.id}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                            {hosp.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {hosp.type} · {hosp.distanceKm} km away · {hosp.traumaLevel}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setIsHospitalDetailsOpen(true);
                              setIsSearchOpen(false);
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:border-slate-300"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              setIsSearchOpen(false);
                              initiateDemoCall(hosp.name, hosp.emergencyDirectLine || hosp.phone || '');
                            }}
                            className="p-1.5 text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                            title="Call ER"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* First Aid Guides */}
              {searchResults.firstAid.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" /> First Aid Protocols ({searchResults.firstAid.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.firstAid.map((guide) => (
                      <button
                        key={guide.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentPage('first-aid');
                        }}
                        className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">{guide.title}</p>
                          <p className="text-xs text-slate-500 truncate">{guide.summary}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Services */}
              {searchResults.services.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-sky-600" /> Emergency Services ({searchResults.services.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">{srv.name}</p>
                          <p className="text-xs text-slate-500">{srv.category} · {srv.hours}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            initiateDemoCall(srv.name, srv.phone);
                          }}
                          className="px-3 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {searchResults.contacts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" /> Emergency Contacts ({searchResults.contacts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.contacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {c.name} {c.isPrimary && <span className="text-[10px] text-teal-700 font-bold ml-1">(Primary)</span>}
                          </p>
                          <p className="text-xs text-slate-500">{c.relationship} · {c.phone}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            initiateDemoCall(c.name, c.phone);
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
