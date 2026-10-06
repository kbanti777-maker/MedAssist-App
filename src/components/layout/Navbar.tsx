import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  Bell,
  Search,
  AlertTriangle,
  User,
  Shield,
  Activity,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    openSOSModal,
    unreadCount,
    setIsNotificationsOpen,
    setIsSearchOpen,
    activeEmergency,
    isOnline,
    setIsOfflineModalOpen,
    setIsChatbotOpen,
  } = useApp();

  const navLinks: { id: NavigationPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'hospitals', label: 'Hospitals' },
    { id: 'ambulance', label: 'Ambulance' },
    { id: 'first-aid', label: 'First Aid' },
    { id: 'medical-card', label: 'Medical Card' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'services', label: 'Services' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-sm group-hover:bg-teal-700 transition-colors">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
            MedAssist
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-teal-700 bg-teal-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Search hospitals, first aid, contacts (Cmd+K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* AI Chatbot Triage Button */}
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 transition-colors shadow-2xs"
            title="Open Gemini AI Clinical Triage Chatbot"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">AI Triage</span>
          </button>

          {/* Admin console button */}
          <button
            onClick={() => setCurrentPage('admin')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              currentPage === 'admin'
                ? 'border-slate-800 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Open Healthcare Operations Admin"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Admin</span>
          </button>

          {/* Offline Status Button */}
          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className={`p-2 rounded-xl border transition-colors ${
              !isOnline
                ? 'border-amber-400 bg-amber-50 text-amber-700 animate-pulse'
                : 'border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-slate-50'
            }`}
            title={isOnline ? 'Offline Cache Ready (Click for details)' : 'Operating Offline (Emergency Cache active)'}
            aria-label="Offline Availability"
          >
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </button>

          {/* User Profile */}
          <button
            onClick={() => setCurrentPage('profile')}
            className={`p-2 rounded-xl border transition-colors ${
              currentPage === 'profile'
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="My Profile & Emergency ID"
            aria-label="Profile"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Prominent Emergency SOS button (Permanently visible) */}
          <button
            onClick={() => openSOSModal()}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap ${
              activeEmergency
                ? 'bg-rose-700 hover:bg-rose-800 ring-2 ring-rose-400 animate-emergency-beacon'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 fill-current" />
            <span className="tracking-wide">SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
