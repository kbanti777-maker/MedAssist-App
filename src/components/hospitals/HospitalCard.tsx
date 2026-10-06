import React from 'react';
import { Hospital } from '../../types';
import {
  Building2,
  MapPin,
  Star,
  Phone,
  Navigation,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface HospitalCardProps {
  hospital: Hospital;
  index?: number;
  isSelected: boolean;
  onSelect: (hospital: Hospital) => void;
  onViewDetails: (hospital: Hospital) => void;
  onGetDirections: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  index,
  isSelected,
  onSelect,
  onViewDetails,
  onGetDirections,
}) => {
  const hasPhone = Boolean(hospital.phone);

  return (
    <div
      onClick={() => onSelect(hospital)}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 sm:p-5 ${
        isSelected
          ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/30 shadow-md'
          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'
      }`}
    >
      {/* Top row: Hospital Name & Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {typeof index === 'number' && (
            <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-teal-800 text-xs font-black flex items-center justify-center shrink-0 mt-1">
              {index}
            </span>
          )}

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isSelected
                ? 'bg-teal-700 text-white'
                : 'bg-teal-100 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors'
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-900 transition-colors">
              {hospital.name}
            </h3>
            {hospital.type && (
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                {hospital.type}
              </span>
            )}
          </div>
        </div>

        {/* Operating status badge */}
        {hospital.openStatusText && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 ${
              hospital.openNow === true || hospital.isOpen24x7
                ? 'bg-emerald-100 text-emerald-800'
                : hospital.openNow === false
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hospital.openNow === true || hospital.isOpen24x7
                  ? 'bg-emerald-600'
                  : hospital.openNow === false
                  ? 'bg-rose-600'
                  : 'bg-slate-500'
              }`}
            />
            {hospital.openStatusText}
          </span>
        )}
      </div>

      {/* Middle row: Distance, Address & Rating */}
      <div className="mt-3 space-y-1.5 text-xs sm:text-sm">
        {/* Distance from current location */}
        <div className="flex items-center gap-1.5 font-bold text-teal-800">
          <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{hospital.distanceKm} km away</span>
        </div>

        {/* Real Address */}
        <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed pl-5.5">
          {hospital.address}
        </p>

        {/* Rating if available */}
        {hospital.rating !== undefined && (
          <div className="flex items-center gap-1 pl-5.5 pt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-bold text-slate-900 text-xs">{hospital.rating.toFixed(1)}</span>
            {hospital.reviewCount !== undefined && hospital.reviewCount > 0 && (
              <span className="text-xs text-slate-400">({hospital.reviewCount.toLocaleString()})</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons: [View Details] [Directions] [Call] */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(hospital);
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-slate-600" />
          <span>View Details</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGetDirections(hospital);
          }}
          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions</span>
        </button>

        {hasPhone && (
          <a
            href={`tel:${hospital.phone!.replace(/[^0-9+]/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        )}

        {hospital.googleMapsUri && (
          <a
            href={hospital.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
            title="Open in Google Maps"
            aria-label="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
