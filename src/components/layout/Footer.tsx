import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, resetDemoData, openSOSModal } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 lg:pb-12 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">MedAssist</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive emergency medical assistance portal. Connecting citizens with trauma centers, real-time paramedic units, trusted contacts, and rapid clinical protocols.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant UI Mock · 256-bit Encrypted</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => openSOSModal()}
                  className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                >
                  Emergency SOS System
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('hospitals')}
                  className="hover:text-white transition-colors"
                >
                  Nearby Hospitals & ER Wait Times
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('ambulance')}
                  className="hover:text-white transition-colors"
                >
                  Request Ambulance Assistance
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('medical-card')}
                  className="hover:text-white transition-colors"
                >
                  Emergency Medical Card (QR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contacts')}
                  className="hover:text-white transition-colors"
                >
                  Emergency Contacts Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Clinical & First Aid</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentPage('first-aid')}
                  className="hover:text-white transition-colors"
                >
                  Hands-Only CPR Protocol
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('first-aid')}
                  className="hover:text-white transition-colors"
                >
                  Choking & Airway Relief
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('services')}
                  className="hover:text-white transition-colors"
                >
                  Poison Control Hotline (1-800-222-1222)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('services')}
                  className="hover:text-white transition-colors"
                >
                  Regional Blood Bank & Plasma
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('history')}
                  className="hover:text-white transition-colors"
                >
                  Emergency Incident History
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Control */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">System & Simulation</h4>
            <p className="text-xs text-slate-400">
              Interactive demonstration environment. All hospital feeds, ambulance dispatches, and emergency metrics operate with simulated safety constraints.
            </p>
            <div className="pt-2">
              <button
                onClick={resetDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Reset Simulation Data</span>
              </button>
            </div>
            <div className="pt-1">
              <button
                onClick={() => setCurrentPage('admin')}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
              >
                Access Hospital Operations Console
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="border-t border-slate-800/80 pt-6 pb-4">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
            <HeartPulse className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Important Healthcare Notice: </strong>
              This platform is intended to assist users in finding emergency resources. It does not replace professional medical advice, clinical diagnosis, or emergency dispatch services. In a true life-threatening crisis, dial your regional emergency number (911 in North America, 112 in the European Union) immediately.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
          <p>© {new Date().getFullYear()} MedAssist Emergency Medical Assistance Portal. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
