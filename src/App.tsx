import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoCallModal } from './components/common/DemoCallModal';
import { EmergencySOSModal } from './components/emergency/EmergencySOSModal';
import { ActiveSOSBanner } from './components/emergency/ActiveSOSBanner';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { OfflineBreakdownModal } from './components/common/OfflineBreakdownModal';
import { GeminiChatbotModal } from './components/ai/GeminiChatbotModal';
import { FloatingChatbotButton } from './components/ai/FloatingChatbotButton';

import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { EmergencySOSPage } from './pages/EmergencySOSPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { AmbulancePage } from './pages/AmbulancePage';
import { ContactsPage } from './pages/ContactsPage';
import { MedicalCardPage } from './pages/MedicalCardPage';
import { FirstAidPage } from './pages/FirstAidPage';
import { EmergencyServicesPage } from './pages/EmergencyServicesPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { EmergencyHistoryPage } from './pages/EmergencyHistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const AppContent: React.FC = () => {
  const { currentPage, isChatbotOpen, setIsChatbotOpen } = useApp();
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'sos':
        return <EmergencySOSPage />;
      case 'hospitals':
        return <HospitalsPage />;
      case 'ambulance':
        return <AmbulancePage />;
      case 'contacts':
        return <ContactsPage />;
      case 'medical-card':
        return <MedicalCardPage />;
      case 'first-aid':
        return <FirstAidPage />;
      case 'services':
        return <EmergencyServicesPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'history':
        return <EmergencyHistoryPage />;
      case 'admin':
        return <AdminDashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 font-sans">
      {/* Google Maps Quota Exhaustion In-App Notice */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Active SOS Persistent Top Banner */}
      <ActiveSOSBanner />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full animate-in fade-in-50 duration-200">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Thumb Nav */}
      <MobileNav />

      {/* Floating Gemini AI Launcher Button */}
      <FloatingChatbotButton />

      {/* Modals & Overlays */}
      <EmergencySOSModal />
      <DemoCallModal />
      <GlobalSearchModal />
      <NotificationsModal />
      <OfflineBreakdownModal />
      <GeminiChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
