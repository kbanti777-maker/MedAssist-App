import React from 'react';
import { Hospital } from '../../types';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  ExternalLink,
  Navigation,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface RealHospitalDetailsModalProps {
  hospital: Hospital | null;
  isOpen: boolean;
  onClose: () => void;
  onGetDirections: (hospital: Hospital) => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const RealHospitalDetailsModal: React.FC<RealHospitalDetailsModalProps> = ({
  hospital,
  isOpen,
  onClose,
  onGetDirections,
  userCoords,
}) => {
  if (!isOpen || !hospital) return null;

  const directionsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}&destination_place_id=${hospital.placeId || ''}`
    : hospital.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Hero Photo */}
        <div className="relative bg-slate-900 text-white min-h-[160px] p-6 flex flex-col justify-end">
          {hospital.photos && hospital.photos.length > 0 ? (
            <>
              <img
                src={hospital.photos[0]}
                alt={hospital.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 opacity-90" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-semibold backdrop-blur-xs flex items-center gap-1 border border-teal-400/20">
                <Building2 className="w-3.5 h-3.5" />
                {hospital.type || 'Hospital'}
              </span>

              {hospital.openStatusText && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-xs border ${
                    hospital.openNow === true || hospital.isOpen24x7
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                      : hospital.openNow === false
                      ? 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                      : 'bg-slate-700/50 text-slate-200 border-slate-600/30'
                  }`}
                >
                  {hospital.openStatusText}
                </span>
              )}

              {hospital.distanceKm !== undefined && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
                  📍 {hospital.distanceKm} km away
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {hospital.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Rating */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Rating</span>
              <div className="flex items-center gap-1 mt-1">
                {hospital.rating ? (
                  <>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="font-bold text-slate-900 text-sm">{hospital.rating.toFixed(1)}</span>
                    {hospital.reviewCount ? (
                      <span className="text-xs text-slate-400">({hospital.reviewCount.toLocaleString()})</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-xs text-slate-400">Not available</span>
                )}
              </div>
            </div>

            {/* Distance */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Distance</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block">
                {hospital.distanceKm} km
              </span>
            </div>

            {/* Operating Status */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-xs font-medium text-slate-500 block">Operating Hours</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block">
                {hospital.isOpen24x7 ? '24 Hours Emergency' : hospital.openStatusText || 'Not available'}
              </span>
            </div>
          </div>

          {/* Contact & Address Details */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Address
                </span>
                <p className="text-sm text-slate-800 font-medium mt-0.5">{hospital.address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
              <Phone className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Phone Number
                </span>
                {hospital.phone ? (
                  <a
                    href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
                    className="text-sm text-teal-700 hover:text-teal-800 font-bold hover:underline mt-0.5 inline-block"
                  >
                    {hospital.phone}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 font-normal mt-0.5">Not available</p>
                )}
              </div>
            </div>

            {/* Website */}
            {hospital.websiteUri && (
              <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                <Globe className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Website
                  </span>
                  <a
                    href={hospital.websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-700 hover:text-teal-800 font-semibold hover:underline truncate block mt-0.5"
                  >
                    {hospital.websiteUri}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Full Weekday Operating Hours (if provided by Places API) */}
          {hospital.openingHoursDescriptions && hospital.openingHoursDescriptions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Weekly Schedule</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-700 space-y-1">
                {hospital.openingHoursDescriptions.map((desc, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 border-b border-slate-100 last:border-none">
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified API Notice */}
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2 text-xs text-teal-900">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>
              Real-time hospital details retrieved live from Google Places API for your coordinates.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Hospital</span>
            </a>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>View on Google Maps</span>
          </a>

          <button
            onClick={() => {
              onGetDirections(hospital);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md flex items-center gap-1.5 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Show Route on Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
