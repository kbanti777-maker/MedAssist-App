import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import { Home, Building2, AlertTriangle, Ambulance, CreditCard } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentPage, setCurrentPage, openSOSModal, activeEmergency } = useApp();

  const items: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    // Center is SOS
    { id: 'ambulance', label: 'Ambulance', icon: Ambulance },
    { id: 'medical-card', label: 'Medical ID', icon: CreditCard },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Item 1: Home */}
        <button
          onClick={() => setCurrentPage(items[0].id)}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            currentPage === items[0].id ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{items[0].label}</span>
        </button>

        {/* Item 2: Hospitals */}
        <button
          onClick={() => setCurrentPage(items[1].id)}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            currentPage === items[1].id ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{items[1].label}</span>
        </button>

        {/* Center: SOS Emergency Button */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={() => openSOSModal()}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform ${
              activeEmergency
                ? 'bg-rose-700 ring-4 ring-rose-300 animate-emergency-beacon'
                : 'bg-rose-600 hover:bg-rose-700 ring-4 ring-white shadow-rose-600/40'
            }`}
            aria-label="Trigger Emergency SOS"
          >
            <AlertTriangle className="w-7 h-7 fill-current" />
          </button>
          <span className="text-[10px] font-black text-rose-700 tracking-wider mt-0.5 uppercase">
            SOS
          </span>
        </div>

        {/* Item 3: Ambulance */}
        <button
          onClick={() => setCurrentPage(items[2].id)}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            currentPage === items[2].id ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Ambulance className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{items[2].label}</span>
        </button>

        {/* Item 4: Medical ID */}
        <button
          onClick={() => setCurrentPage(items[3].id)}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            currentPage === items[3].id ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{items[3].label}</span>
        </button>
      </div>
    </div>
  );
};
