import React from 'react';
import { Hospital } from '../../types';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
  X,
  Star,
} from 'lucide-react';

interface SelectedHospitalPanelProps {
  hospital: Hospital;
  userCoords: { latitude: number; longitude: number } | null;
  routeInfo: {
    durationText: string;
    distanceText: string;
    loading: boolean;
  } | null;
  onClose: () => void;
  onViewDetails: (hospital: Hospital) => void;
  onNavigateOnMap: (hospital: Hospital) => void;
}

export const SelectedHospitalPanel: React.FC<SelectedHospitalPanelProps> = ({
  hospital,
  userCoords,
  routeInfo,
  onClose,
  onViewDetails,
  onNavigateOnMap,
}) => {
  const directionsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}&destination_place_id=${hospital.placeId || ''}`
    : hospital.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`;

  return (
    <div className="bg-white rounded-3xl border-2 border-teal-600/30 p-5 shadow-lg space-y-4 relative overflow-hidden animate-in fade-in-50 duration-200">
      {/* Top Header: DESTINATION badge & close button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">
            Selected Destination
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Deselect hospital"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hospital Name & Category */}
      <div>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          {hospital.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {hospital.type && (
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              {hospital.type}
            </span>
          )}
          {hospital.rating !== undefined && (
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{hospital.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Real Address */}
      <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{hospital.address}</span>
      </div>

      {/* Real Distance & Live Route Travel Time */}
      <div className="grid grid-cols-2 gap-3">
        {/* Distance */}
        <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
          <span className="text-[11px] font-semibold text-teal-900 uppercase tracking-wider block">
            Distance
          </span>
          <p className="text-base font-extrabold text-teal-950 mt-0.5">
            {hospital.distanceKm} km away
          </p>
        </div>

        {/* Estimated Travel Time (Routes API) */}
        <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
          <span className="text-[11px] font-semibold text-teal-900 uppercase tracking-wider block">
            Estimated Route Time
          </span>
          <p className="text-base font-extrabold text-teal-950 mt-0.5">
            {routeInfo?.loading ? (
              <span className="text-xs text-teal-700 animate-pulse">Calculating route...</span>
            ) : routeInfo?.durationText ? (
              routeInfo.durationText
            ) : (
              <span className="text-xs text-slate-500 font-medium">Route time unavailable</span>
            )}
          </p>
        </div>
      </div>

      {/* Hospital Information Section */}
      <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Hospital Information
        </span>

        {/* Emergency Department availability */}
        <div className="flex items-center justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Emergency Department:</span>
          <span className="font-semibold text-slate-900">
            {hospital.hasEmergencyDepartment
              ? 'Available (Verified)'
              : 'Contact facility to confirm'}
          </span>
        </div>

        {/* Opening Status */}
        <div className="flex items-center justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Opening Status:</span>
          <span
            className={`font-bold ${
              hospital.openNow === true || hospital.isOpen24x7
                ? 'text-emerald-700'
                : hospital.openNow === false
                ? 'text-rose-700'
                : 'text-slate-700'
            }`}
          >
            {hospital.openStatusText || 'Unknown'}
          </span>
        </div>

        {/* Real Phone Number */}
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-500">Phone:</span>
          {hospital.phone ? (
            <a
              href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
              className="font-bold text-teal-700 hover:text-teal-800 underline"
            >
              {hospital.phone}
            </a>
          ) : (
            <span className="text-slate-400 italic">Not available</span>
          )}
        </div>
      </div>

      {/* Buttons: [Get Directions] [Call Hospital] [View on Google Maps] */}
      <div className="space-y-2 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Get Directions */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Directions</span>
          </a>

          {/* Call Hospital (Only if real phone exists!) */}
          {hospital.phone ? (
            <a
              href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Hospital</span>
            </a>
          ) : (
            <button
              onClick={() => onViewDetails(hospital)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>View Details</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(hospital)}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 py-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Full details & hours</span>
          </button>

          <a
            href={hospital.googleMapsUri || directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 py-1"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
