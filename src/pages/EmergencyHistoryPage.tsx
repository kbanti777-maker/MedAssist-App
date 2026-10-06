import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Calendar,
  MapPin,
  Building2,
  Ambulance,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const EmergencyHistoryPage: React.FC = () => {
  const { pastRequests, setCurrentPage, showToast } = useApp();

  const handleExportHistory = () => {
    showToast('Incident Report Exported', 'Medical dispatch timeline downloaded as JSON/PDF.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Clinical Records & Audit Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Emergency Dispatch History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete incident records of past SOS activations and paramedic dispatches.
          </p>
        </div>

        <button
          onClick={handleExportHistory}
          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary</span>
        </button>
      </div>

      {pastRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Emergency Incidents Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no emergency dispatch logs in this local session.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
          {pastRequests.map((req) => {
            const isResolved = req.status === 'resolved';

            return (
              <div key={req.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    isResolved ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        #{req.id}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-bold text-rose-700">{req.categoryLabel}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {req.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Pickup Location
                      </span>
                      <p className="font-semibold text-slate-800 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{req.location.address}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Destination Hospital
                      </span>
                      <p className="font-semibold text-slate-800 flex items-start gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span>{req.hospitalName || 'Verified Emergency Hospital'}</span>
                      </p>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 text-xs text-slate-600">
                      <strong className="text-slate-800 block mb-0.5">Clinical Response Notes:</strong>
                      {req.notes}
                    </div>
                  )}

                  {req.ambulanceUnitCode && (
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Ambulance className="w-4 h-4 text-sky-600" />
                        <span>Unit: {req.ambulanceUnitCode}</span>
                      </span>
                      <span className="font-semibold text-emerald-700">Response Logged</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
