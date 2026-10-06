import React from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_EMERGENCY_SERVICES } from '../services/mockData';
import {
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  Ambulance,
  Building2,
  AlertTriangle,
  Droplet,
  Pill,
  Stethoscope,
} from 'lucide-react';

export const EmergencyServicesPage: React.FC = () => {
  const { initiateDemoCall } = useApp();

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Ambulance':
        return Ambulance;
      case 'Hospital ER':
        return Building2;
      case 'Poison Control':
        return AlertTriangle;
      case 'Blood Bank':
        return Droplet;
      case 'Pharmacy':
        return Pill;
      default:
        return Stethoscope;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Regional Healthcare Infrastructure
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Emergency Services Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct communication channels to emergency ambulance units, poison hotlines, 24/7 pharmacies, and blood banks.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_EMERGENCY_SERVICES.map((srv) => {
          const Icon = getServiceIcon(srv.category);

          return (
            <div
              key={srv.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  {srv.badge && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md uppercase">
                      {srv.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{srv.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900 font-mono">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{srv.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{srv.hours}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{srv.address}</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => initiateDemoCall(srv.name, srv.phone)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {srv.category}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        All service lines above use simulated VoIP phone interfaces for evaluation. Always contact regional 911/112 in live critical emergencies.
      </div>
    </div>
  );
};
