import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiService, GroundedPlace } from '../../services/aiService';
import {
  MapPin,
  Search,
  ExternalLink,
  Building2,
  Sparkles,
  Compass,
  AlertCircle,
  Clock,
  PhoneCall,
  Loader2,
  Navigation,
} from 'lucide-react';

export const MapsGroundingSearch: React.FC = () => {
  const { userLocation, showToast } = useApp();

  const [query, setQuery] = useState('Find 24/7 hospital emergency rooms and trauma care centers nearby.');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [places, setPlaces] = useState<GroundedPlace[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    '24/7 Emergency Rooms & Trauma Centers',
    'Closest Late-Night Emergency Pharmacies',
    'Pediatric Emergency Hospitals',
    'Urgent Care & Immediate Walk-In Clinics',
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await AiService.queryMapsGrounding(activeQuery, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
      });

      setResultText(data.text);
      setPlaces(data.places || []);

      showToast(
        'Google Maps Grounded',
        `Retrieved ${data.places?.length || 0} real-world medical facilities via Gemini 3.5 Flash Maps tool.`,
        'success'
      );
    } catch (err: any) {
      console.error('Maps Grounding error:', err);
      setError(err?.message || 'Unable to retrieve live Google Maps locations.');
      showToast('Search Failed', 'Could not query Google Maps grounding API.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Google Maps Grounded AI</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">gemini-3.5-flash · googleMaps tool</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            Live Verified Hospital & Clinic Finder
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grounded directly against real-world Google Maps geo-data near your coordinates ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate max-w-[200px]">{userLocation.address}</span>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setQuery(preset);
              handleSearch(preset);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-slate-700 whitespace-nowrap transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, emergency clinics, pediatric trauma, or pharmacies..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Grounding Maps...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span>Search Google Maps</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Unable to fetch grounded locations: </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Result synthesis from Gemini */}
      {resultText && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Clinical Facility Evaluation</span>
          </div>
          <div className="whitespace-pre-line text-slate-800 font-medium">
            {resultText}
          </div>
        </div>
      )}

      {/* Extracted Google Maps Links (Mandatory requirement: ALWAYS list groundingChunks URLs as links) */}
      {places.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Google Maps Grounded Locations ({places.length})</span>
            </h4>
            <span className="text-[11px] text-teal-700 font-semibold font-mono">
              Live Google Maps Links
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {places.map((place, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                      {place.title}
                    </h5>
                    <a
                      href={place.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg shrink-0 transition-colors"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {place.address && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{place.address}</span>
                    </p>
                  )}

                  {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        "{place.reviewSnippets[0]}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Google Maps Grounded
                  </span>
                  <a
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State after search */}
      {hasSearched && !isLoading && places.length === 0 && !resultText && !error && (
        <div className="py-8 text-center text-slate-400 text-xs">
          No Google Maps places found for this query. Try a broader search like "hospitals nearby".
        </div>
      )}
    </div>
  );
};
