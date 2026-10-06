import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital } from '../types';
import {
  getDeviceLocation,
  getNetworkLocation,
  reverseGeocode,
  searchRealNearbyHospitals,
  searchHospitalsByManualQuery,
  computeLiveRoute,
  forwardGeocode,
} from '../services/hospitalService';
import { HospitalsMap } from '../components/hospitals/HospitalsMap';
import { HospitalCard } from '../components/hospitals/HospitalCard';
import { SelectedHospitalPanel } from '../components/hospitals/SelectedHospitalPanel';
import { RealHospitalDetailsModal } from '../components/hospitals/RealHospitalDetailsModal';
import { MapsGroundingSearch } from '../components/ai/MapsGroundingSearch';
import {
  MapPin,
  RefreshCw,
  Search,
  Navigation,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Building2,
  LocateFixed,
  Globe,
  HelpCircle,
} from 'lucide-react';

type LocationState =
  | 'detecting_location'
  | 'searching_hospitals'
  | 'found'
  | 'permission_denied'
  | 'location_unavailable'
  | 'no_hospitals_found'
  | 'missing_key';

type SortOption = 'nearest' | 'rating' | 'open_now';

export const HospitalsPage: React.FC = () => {
  const {
    hospitals: globalHospitals,
    setHospitals: setGlobalHospitals,
    selectedHospital,
    setSelectedHospital,
    userLocation,
    setUserLocation,
    showToast,
  } = useApp();

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Real hospitals state
  const [realHospitals, setRealHospitals] = useState<Hospital[]>([]);
  const [activeCoords, setActiveCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  } | null>(null);

  // Status & Progress states
  const [locationState, setLocationState] = useState<LocationState>('detecting_location');
  const [statusMessage, setStatusMessage] = useState<string>('Finding your location...');
  const [currentRadiusKm, setCurrentRadiusKm] = useState<number>(5);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Sort
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('nearest');

  // Manual search state
  const [manualQuery, setManualQuery] = useState('');
  const [isSearchingManual, setIsSearchingManual] = useState(false);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Selected Hospital Route Information
  const [routeInfo, setRouteInfo] = useState<{
    durationText: string;
    distanceText: string;
    loading: boolean;
  } | null>(null);

  // Details Modal
  const [detailsHospital, setDetailsHospital] = useState<Hospital | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // View tab toggle: Interactive Map vs Grounded AI
  const [activeTab, setActiveTab] = useState<'hospitals' | 'maps_ai'>('hospitals');

  /**
   * Performs the Google Places search once coordinates are resolved
   */
  const executeHospitalSearch = useCallback(
    async (lat: number, lng: number, addressText?: string) => {
      setLocationState('searching_hospitals');
      setStatusMessage('Searching for nearby hospitals...');

      try {
        const hospitals = await searchRealNearbyHospitals(lat, lng, (radiusKm) => {
          setCurrentRadiusKm(radiusKm);
          if (radiusKm > 5) {
            setStatusMessage(`Searching within ${radiusKm} km...`);
          }
        });

        if (hospitals.length === 0) {
          setLocationState('no_hospitals_found');
          setStatusMessage('No nearby hospitals were found within 20 km.');
          setRealHospitals([]);
        } else {
          setRealHospitals(hospitals);
          setGlobalHospitals(hospitals);
          setLocationState('found');
          setStatusMessage('Nearby hospitals found');
          // Auto-select nearest hospital
          setSelectedHospital(hospitals[0]);
        }

        const now = new Date();
        setLastUpdatedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err: any) {
        console.error('Error executing hospital search:', err);
        setLocationState('no_hospitals_found');
        setStatusMessage('Error retrieving hospital data.');
      }
    },
    [setGlobalHospitals, setSelectedHospital]
  );

  /**
   * Primary Action: Request device location via browser Geolocation API
   */
  const requestDeviceLocation = useCallback(async () => {
    setIsRefreshing(true);
    setLocationState('detecting_location');
    setStatusMessage('Finding your location...');

    try {
      // 1. Browser Geolocation (HTML5)
      const coords = await getDeviceLocation();
      setActiveCoords(coords);

      // 2. Reverse geocode to get human-readable location
      const readableAddress = await reverseGeocode(coords.latitude, coords.longitude);
      setUserLocation({
        address: readableAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
      });

      // 3. Search real hospitals
      await executeHospitalSearch(coords.latitude, coords.longitude, readableAddress);
      showToast('Location Detected', 'Your device coordinates were verified.', 'success');
    } catch (err: any) {
      console.warn('Browser geolocation error:', err);

      // Check if user denied permission or if denied in iframe
      if (err.code === 1 || err.name === 'NotAllowedError') {
        setLocationState('permission_denied');
        setStatusMessage('Location access is required to find hospitals near you.');
      } else if (err.code === 2 || err.name === 'PositionUnavailableError') {
        setLocationState('location_unavailable');
        setStatusMessage('Location unavailable. Check device GPS settings.');
      } else {
        setLocationState('location_unavailable');
        setStatusMessage(err.message || 'Unable to retrieve location.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [setUserLocation, executeHospitalSearch, showToast]);

  /**
   * Network Geolocation Fallback (Using Google Geolocation API)
   * Especially helpful when running in iframe where HTML5 prompts may be restricted
   */
  const detectViaNetwork = useCallback(async () => {
    setIsRefreshing(true);
    setLocationState('detecting_location');
    setStatusMessage('Detecting location via network...');

    try {
      const netCoords = await getNetworkLocation();
      setActiveCoords(netCoords);

      const readableAddress = await reverseGeocode(netCoords.latitude, netCoords.longitude);
      setUserLocation({
        address: readableAddress,
        latitude: netCoords.latitude,
        longitude: netCoords.longitude,
        accuracyMeters: netCoords.accuracyMeters,
      });

      await executeHospitalSearch(netCoords.latitude, netCoords.longitude, readableAddress);
      showToast('Location Detected', `Detected near ${readableAddress}`, 'success');
    } catch (err: any) {
      showToast('Network Geolocation Failed', 'Please enter your city manually.', 'warning');
      setLocationState('permission_denied');
    } finally {
      setIsRefreshing(false);
    }
  }, [executeHospitalSearch, setUserLocation, showToast]);

  // Initial mount trigger
  useEffect(() => {
    requestDeviceLocation();
  }, [requestDeviceLocation]);

  /**
   * Manual Search Fallback (City, Area, or Pincode)
   */
  const handleManualSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || manualQuery).trim();
    if (!q) return;

    setIsSearchingManual(true);
    setLocationState('searching_hospitals');
    setStatusMessage(`Searching hospitals near "${q}"...`);

    try {
      const geocoded = await forwardGeocode(q);
      const userLat = geocoded?.latitude ?? activeCoords?.latitude;
      const userLng = geocoded?.longitude ?? activeCoords?.longitude;

      const result = await searchHospitalsByManualQuery(q, userLat, userLng);

      if (result.hospitals.length === 0) {
        setLocationState('no_hospitals_found');
        setStatusMessage(`No hospitals found matching "${q}".`);
        setRealHospitals([]);
      } else {
        setRealHospitals(result.hospitals);
        setGlobalHospitals(result.hospitals);

        const newCoords = result.centerCoords || {
          lat: result.hospitals[0].coordinates.lat,
          lng: result.hospitals[0].coordinates.lng,
        };

        setActiveCoords({
          latitude: newCoords.lat,
          longitude: newCoords.lng,
          accuracyMeters: 50,
        });

        setUserLocation({
          address: geocoded?.formattedAddress || q,
          latitude: newCoords.lat,
          longitude: newCoords.lng,
        });

        setLocationState('found');
        setStatusMessage(`Found ${result.hospitals.length} hospitals near "${q}"`);
        setSelectedHospital(result.hospitals[0]);
      }

      const now = new Date();
      setLastUpdatedTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err: any) {
      showToast('Search Failed', err.message || 'Could not find hospitals for this location.', 'warning');
    } finally {
      setIsSearchingManual(false);
    }
  };

  /**
   * Recalculate live route when selected hospital changes
   */
  useEffect(() => {
    if (!selectedHospital || !activeCoords) {
      setRouteInfo(null);
      return;
    }

    let isCurrent = true;
    setRouteInfo({ durationText: '', distanceText: '', loading: true });

    computeLiveRoute(
      { latitude: activeCoords.latitude, longitude: activeCoords.longitude },
      { latitude: selectedHospital.coordinates.lat, longitude: selectedHospital.coordinates.lng }
    ).then((route) => {
      if (!isCurrent) return;
      if (route) {
        setRouteInfo({
          durationText: route.durationText,
          distanceText: route.distanceText,
          loading: false,
        });
      } else {
        setRouteInfo({
          durationText: '',
          distanceText: `${selectedHospital.distanceKm} km`,
          loading: false,
        });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedHospital, activeCoords]);

  /**
   * Filter and Sort hospitals
   */
  const filteredAndSortedHospitals = useMemo(() => {
    let list = [...realHospitals];

    // Filter by search query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          (h.type && h.type.toLowerCase().includes(q))
      );
    }

    // Sort by: Nearest (default), Rating, Open Now
    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'open_now':
        list.sort((a, b) => {
          const aOpen = a.openNow || a.isOpen24x7 ? 1 : 0;
          const bOpen = b.openNow || b.isOpen24x7 ? 1 : 0;
          if (bOpen !== aOpen) return bOpen - aOpen;
          return a.distanceKm - b.distanceKm;
        });
        break;
      case 'nearest':
      default:
        list.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
    }

    return list;
  }, [realHospitals, searchFilter, sortBy]);

  const handleSelectHospital = (hosp: Hospital) => {
    setSelectedHospital(hosp);
  };

  const handleViewDetails = (hosp: Hospital) => {
    setDetailsHospital(hosp);
    setIsDetailsOpen(true);
  };

  const handleGetDirections = (hosp: Hospital) => {
    setSelectedHospital(hosp);
    showToast(
      'Route Loaded',
      `Live navigation active for ${hosp.name}.`,
      'info'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ==================================================== */}
      {/* 1. HEADER SECTION (Always present at the top) */}
      {/* ==================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Healthcare Facilities & Trauma Centers
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Nearby Hospitals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hospitals near your current location
          </p>
        </div>

        {/* View Mode Toggle: Interactive Split View vs Grounded AI */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'hospitals'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Interactive Map & List</span>
          </button>
          <button
            onClick={() => setActiveTab('maps_ai')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'maps_ai'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-teal-800 hover:text-teal-900 hover:bg-teal-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Google Maps Grounded AI</span>
          </button>
        </div>
      </div>

      {activeTab === 'maps_ai' ? (
        <MapsGroundingSearch />
      ) : (
        <>
          {/* ==================================================== */}
          {/* 2. TOP LOCATION BAR & CONTROLS */}
          {/* ==================================================== */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Location Status Card */}
              <div
                onClick={requestDeviceLocation}
                role="button"
                tabIndex={0}
                className="flex items-start sm:items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 cursor-pointer transition-colors group flex-1"
                title="Click to retry location detection"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    locationState === 'found'
                      ? 'bg-emerald-100 text-emerald-700'
                      : locationState === 'detecting_location' || locationState === 'searching_hospitals'
                      ? 'bg-amber-100 text-amber-700 animate-pulse'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      📍 Current Location
                    </span>
                    {activeCoords?.accuracyMeters && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                        ±{activeCoords.accuracyMeters}m accuracy
                      </span>
                    )}
                    {currentRadiusKm > 5 && locationState === 'found' && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                        Searched {currentRadiusKm} km radius
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {locationState === 'detecting_location'
                      ? 'Finding your location...'
                      : locationState === 'searching_hospitals'
                      ? statusMessage
                      : locationState === 'permission_denied'
                      ? 'Location permission required'
                      : locationState === 'location_unavailable'
                      ? 'Location unavailable'
                      : userLocation.address || 'Using your current location'}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDeviceLocation();
                  }}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-teal-400 group-hover:bg-teal-700 group-hover:text-white text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Location</span>
                </button>
              </div>

              {/* Timestamp Indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                {lastUpdatedTime && (
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Location updated just now ({lastUpdatedTime})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Filter Input & Sort Selector */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* [Search hospitals...] */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search hospitals..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-slate-50/40"
                />
              </div>

              {/* [Nearest] [Open Now] [Highest Rated] */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
                <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Sort by:</span>
                </span>

                <button
                  onClick={() => setSortBy('nearest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'nearest'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Nearest
                </button>

                <button
                  onClick={() => setSortBy('open_now')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'open_now'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Open Now
                </button>

                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'rating'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Highest Rated
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 3. LOCATION ACCESS REQUIRED / DENIED BANNER */}
          {/* ==================================================== */}
          {(locationState === 'permission_denied' || locationState === 'location_unavailable') && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-amber-950 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-amber-900">
                    Location access is required to find hospitals near you.
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800">
                    MedAssist calculates real hospital proximity, response times, and emergency navigation from your actual device. Please grant permission in your browser or enter your city manually.
                  </p>
                </div>
              </div>

              {/* Action Buttons: [Allow Location] [Search Manually] [Auto-Detect via Network] */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={requestDeviceLocation}
                  disabled={isRefreshing}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <LocateFixed className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Allow Location</span>
                </button>

                <button
                  onClick={detectViaNetwork}
                  disabled={isRefreshing}
                  className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
                  title="Detect location using network IP"
                >
                  <Globe className="w-4 h-4 text-teal-700" />
                  <span>Auto-Detect via Network</span>
                </button>

                <button
                  onClick={() => {
                    manualInputRef.current?.focus();
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Search Manually
                </button>
              </div>

              {/* Search hospitals by location input */}
              <div className="pt-3 border-t border-amber-200/60 space-y-2">
                <span className="text-xs font-bold text-amber-900 block">
                  Search hospitals by location:
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleManualSearch();
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={manualInputRef}
                      type="text"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      placeholder="Enter City, Area, or Pincode (e.g. Vijayawada, Hyderabad, Austin, 520008)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-300/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingManual || !manualQuery.trim()}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {isSearchingManual ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Compass className="w-4 h-4" />
                    )}
                    <span>Find Hospitals</span>
                  </button>
                </form>

                {/* Quick City suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="text-amber-800 font-medium text-[11px] mr-1">Quick Select:</span>
                  {['Vijayawada', 'Hyderabad', 'Delhi', 'Bengaluru', 'Mumbai', 'New York', 'Austin'].map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setManualQuery(city);
                        handleManualSearch(city);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-amber-200 text-amber-950 rounded-lg text-xs font-semibold transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 4. SPLIT SCREEN LAYOUT: MAP (~65%), LIST (~35%) */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
            {/* LEFT COLUMN: Large Google Map (~65% width) */}
            <div className="lg:col-span-8 order-1 h-[440px] lg:h-[720px] sticky top-20 rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              {locationState === 'detecting_location' ? (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="relative flex items-center justify-center">
                    <span className="w-16 h-16 rounded-full bg-teal-600/20 animate-ping absolute" />
                    <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-lg">
                      <LocateFixed className="w-6 h-6 animate-spin" />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">
                    Finding your location...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Please approve browser location access to discover real hospitals around you.
                  </p>
                </div>
              ) : locationState === 'searching_hospitals' ? (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">
                    Searching for nearby hospitals...
                  </h4>
                  <p className="text-xs text-teal-700 font-semibold">
                    Searching within {currentRadiusKm} km radius
                  </p>
                </div>
              ) : activeCoords ? (
                <HospitalsMap
                  apiKey={apiKey}
                  userCoords={activeCoords}
                  hospitals={realHospitals}
                  selectedHospital={selectedHospital}
                  onSelectHospital={handleSelectHospital}
                  onRouteCalculated={(info) => {
                    if (info) {
                      setRouteInfo({
                        durationText: info.durationText,
                        distanceText: info.distanceText,
                        loading: false,
                      });
                    }
                  }}
                />
              ) : (
                /* Welcoming interactive state if coordinates not yet acquired */
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-lg">
                      Enable Location to Explore Nearby Hospitals
                    </h4>
                    <p className="text-xs text-slate-500">
                      Grant device location to see live Google Maps pins and distance calculations, or search for any city.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={requestDeviceLocation}
                      className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <LocateFixed className="w-4 h-4" />
                      <span>Find My Location</span>
                    </button>
                    <button
                      onClick={detectViaNetwork}
                      className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Globe className="w-4 h-4 text-teal-700" />
                      <span>Detect via Network</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Nearby Hospital Information / List (~35% width) */}
            <div className="lg:col-span-4 order-2 space-y-4 flex flex-col">
              {/* ==================================================== */}
              {/* SELECTED HOSPITAL PANEL (Top of Right Panel) */}
              {/* ==================================================== */}
              {selectedHospital && (
                <SelectedHospitalPanel
                  hospital={selectedHospital}
                  userCoords={activeCoords}
                  routeInfo={routeInfo}
                  onClose={() => setSelectedHospital(null)}
                  onViewDetails={handleViewDetails}
                  onNavigateOnMap={handleGetDirections}
                />
              )}

              {/* Nearby Hospitals Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Nearby Hospitals
                  </h2>
                  <p className="text-xs text-slate-500">
                    Hospitals near your current location
                  </p>
                </div>

                {locationState === 'found' && (
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{filteredAndSortedHospitals.length} Found</span>
                  </span>
                )}
              </div>

              {/* Loading Skeletons */}
              {(locationState === 'detecting_location' || locationState === 'searching_hospitals') && (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-4 bg-slate-200 rounded w-16" />
                      </div>
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-7 bg-slate-200 rounded w-20" />
                        <div className="h-7 bg-slate-200 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Numbered Hospital Cards List (1., 2., 3., ...) */}
              <div className="space-y-3 overflow-y-auto max-h-[700px] pr-1">
                {filteredAndSortedHospitals.map((hosp, idx) => (
                  <HospitalCard
                    key={hosp.id}
                    hospital={hosp}
                    index={idx + 1}
                    isSelected={selectedHospital?.id === hosp.id}
                    onSelect={handleSelectHospital}
                    onViewDetails={handleViewDetails}
                    onGetDirections={handleGetDirections}
                  />
                ))}

                {/* Empty State when filtered or no results */}
                {locationState === 'found' && filteredAndSortedHospitals.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      No hospitals match your filter &quot;{searchFilter}&quot;
                    </p>
                    <button
                      onClick={() => setSearchFilter('')}
                      className="text-xs text-teal-700 font-bold underline"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}

                {/* If permission denied and no hospitals loaded yet */}
                {realHospitals.length === 0 &&
                  locationState !== 'detecting_location' &&
                  locationState !== 'searching_hospitals' && (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 font-medium">
                        Click &quot;Allow Location&quot; or enter your city above to view verified nearby hospitals.
                      </p>
                      <button
                        onClick={requestDeviceLocation}
                        className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl"
                      >
                        Find Nearby Hospitals
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Real Hospital Details Modal */}
      <RealHospitalDetailsModal
        hospital={detailsHospital}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onGetDirections={handleGetDirections}
        userCoords={activeCoords}
      />
    </div>
  );
};
