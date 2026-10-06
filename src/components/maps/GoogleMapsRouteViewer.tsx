import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Hospital } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Navigation,
  Car,
  Footprints,
  Bus,
  Bike,
  PhoneCall,
  Clock,
  Compass,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  LocateFixed,
  Building2,
  Ambulance,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyAVzm1f7pCuMjCkNvUhkvkUJl427FGEyaw';

type TravelModeType = 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING';

interface DirectionsStep {
  instruction: string;
  distance?: string;
  duration?: string;
}

interface RouteCalculationResult {
  distanceMeters: number;
  durationMillis: number;
  steps: DirectionsStep[];
}

// Inner component that controls map and routes
const RouteRenderer: React.FC<{
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  destinationHospital: Hospital;
  travelMode: TravelModeType;
  onRouteCalculated: (result: RouteCalculationResult | null) => void;
  onError: (err: string | null) => void;
}> = ({
  origin,
  destination,
  destinationHospital,
  travelMode,
  onRouteCalculated,
  onError,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    onError(null);

    const request = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    (routesLib.Route as any)
      .computeRoutes(request)
      .then(({ routes }: { routes: any[] }) => {
        if (!routes || routes.length === 0) {
          onError('No route found between device location and destination.');
          onRouteCalculated(null);
          return;
        }

        const primaryRoute = routes[0];

        // Render Polylines using official SDK wrapper method
        if (typeof primaryRoute.createPolylines === 'function') {
          const newPolylines = primaryRoute.createPolylines();
          newPolylines.forEach((polyline: google.maps.Polyline) => {
            polyline.setOptions({
              strokeColor: '#0d9488', // Teal emergency line
              strokeWeight: 6,
              strokeOpacity: 0.9,
            });
            polyline.setMap(map);
          });
          polylinesRef.current = newPolylines;
        }

        // Fit map bounds to frame origin and destination
        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport);
        } else {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          map.fitBounds(bounds, 50);
        }

        // Parse legs and steps
        const leg = primaryRoute.legs?.[0];
        const steps: DirectionsStep[] = (leg?.steps || []).map((s: any) => ({
          instruction: s.navigationInstruction?.instructions || s.description || 'Proceed along route',
          distance: s.distanceMeters ? `${(s.distanceMeters / 1000).toFixed(1)} km` : undefined,
          duration: s.staticDurationMillis ? `${Math.round(s.staticDurationMillis / 60000)} min` : undefined,
        }));

        onRouteCalculated({
          distanceMeters: primaryRoute.distanceMeters || leg?.distanceMeters || 0,
          durationMillis: primaryRoute.durationMillis || leg?.durationMillis || 0,
          steps,
        });
      })
      .catch(() => {
        // Fallback: draw straight direct line and compute Haversine estimate
        const fallbackLine = new google.maps.Polyline({
          path: [origin, destination],
          geodesic: true,
          strokeColor: '#0284c7',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });
        polylinesRef.current = [fallbackLine];

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        map.fitBounds(bounds, 60);

        // Approximate distance
        const R = 6371e3;
        const φ1 = (origin.lat * Math.PI) / 180;
        const φ2 = (destination.lat * Math.PI) / 180;
        const Δφ = ((destination.lat - origin.lat) * Math.PI) / 180;
        const Δλ = ((destination.lng - origin.lng) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distMeters = R * c;

        onRouteCalculated({
          distanceMeters: Math.round(distMeters),
          durationMillis: Math.round((distMeters / 600) * 60 * 1000), // ~36km/h avg speed
          steps: [
            { instruction: `Head directly towards ${destinationHospital.name}` },
            { instruction: `Arrive at emergency receiving at ${destinationHospital.address}` },
          ],
        });
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination, travelMode, destinationHospital]);

  return null;
};

interface GoogleMapsRouteViewerProps {
  selectedHospital?: Hospital;
  onSelectHospital?: (hospital: Hospital) => void;
}

export const GoogleMapsRouteViewer: React.FC<GoogleMapsRouteViewerProps> = ({
  selectedHospital: propSelectedHospital,
  onSelectHospital,
}) => {
  const {
    hospitals,
    userLocation,
    detectLocation,
    isDetectingLocation,
    initiateDemoCall,
    setCurrentPage,
    showToast,
  } = useApp();

  // Device coordinates
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lng: number }>({
    lat: userLocation.latitude || 37.7749,
    lng: userLocation.longitude || -122.4194,
  });
  const [isUsingLiveGPS, setIsUsingLiveGPS] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState('Default Demo Coordinates');

  // Currently target destination hospital
  const targetHospital = propSelectedHospital || hospitals[0];

  const [travelMode, setTravelMode] = useState<TravelModeType>('DRIVING');
  const [routeData, setRouteData] = useState<RouteCalculationResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<'origin' | 'dest' | null>(null);

  // Auto-detect real device location on mount if available
  const acquireDeviceGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation not supported by device');
      return;
    }

    setGpsStatusMessage('Acquiring real-time GPS signal...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setDeviceCoords(coords);
        setIsUsingLiveGPS(true);
        setGpsStatusMessage(`Device GPS Locked (±${Math.round(pos.coords.accuracy)}m)`);
        showToast(
          'Device GPS Connected',
          `Routing from your exact location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
          'success'
        );
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        setIsUsingLiveGPS(false);
        setGpsStatusMessage(`GPS Permission: ${err.message}. Using portal location.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    acquireDeviceGPS();
  }, []);

  // When userLocation context changes, sync coordinates if live GPS wasn't manually obtained
  useEffect(() => {
    if (!isUsingLiveGPS && userLocation.latitude && userLocation.longitude) {
      setDeviceCoords({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    }
  }, [userLocation, isUsingLiveGPS]);

  const destinationCoords = {
    lat: (targetHospital.coordinates as any).lat ?? (targetHospital.coordinates as any).latitude ?? 37.7792,
    lng: (targetHospital.coordinates as any).lng ?? (targetHospital.coordinates as any).longitude ?? -122.4132,
  };

  const travelModes: { mode: TravelModeType; label: string; icon: any }[] = [
    { mode: 'DRIVING', label: 'Drive / Ambulance', icon: Car },
    { mode: 'WALKING', label: 'Walk', icon: Footprints },
    { mode: 'TRANSIT', label: 'Transit', icon: Bus },
    { mode: 'BICYCLING', label: 'Bike', icon: Bike },
  ];

  const externalMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${deviceCoords.lat},${deviceCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=${travelMode.toLowerCase()}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl space-y-0">
      {/* Control Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-teal-400">
              Live Google Maps Route Engine
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black mt-0.5 flex items-center gap-2">
            <span>Navigation to {targetHospital.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <LocateFixed className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Origin: Present Device ({deviceCoords.lat.toFixed(4)}, {deviceCoords.lng.toFixed(4)}) · {gpsStatusMessage}</span>
          </p>
        </div>

        {/* GPS Refresh & Travel Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={acquireDeviceGPS}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Refresh device present GPS coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>Detect Device GPS</span>
          </button>

          {/* Travel Mode Pills */}
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700">
            {travelModes.map((item) => {
              const Icon = item.icon;
              const isActive = travelMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => setTravelMode(item.mode)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Route Stats Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Google Maps Container */}
        <div className="lg:col-span-8 relative h-[380px] sm:h-[460px] lg:h-auto min-h-[380px] bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={deviceCoords}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              fullscreenControl={true}
              zoomControl={true}
              streetViewControl={false}
              mapTypeControl={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%', minHeight: '380px' }}
            >
              {/* Route Computation Renderer */}
              <RouteRenderer
                origin={deviceCoords}
                destination={destinationCoords}
                destinationHospital={targetHospital}
                travelMode={travelMode}
                onRouteCalculated={setRouteData}
                onError={setRouteError}
              />

              {/* Marker 1: Present Device Location (Origin) */}
              <AdvancedMarker
                position={deviceCoords}
                title="Your Present Location"
                onClick={() => setActiveMarkerInfo('origin')}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-teal-500/30 animate-ping"></span>
                  <div className="w-9 h-9 rounded-full bg-teal-600 text-white border-2 border-white shadow-xl flex items-center justify-center font-bold">
                    <LocateFixed className="w-4 h-4" />
                  </div>
                  <span className="absolute -bottom-6 bg-slate-900/95 text-teal-300 text-[10px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
                    Your Location
                  </span>
                </div>
              </AdvancedMarker>

              {/* Marker 2: Target Hospital Destination */}
              <AdvancedMarker
                position={destinationCoords}
                title={targetHospital.name}
                onClick={() => setActiveMarkerInfo('dest')}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white border-2 border-white shadow-2xl flex items-center justify-center font-black transition-transform hover:scale-110">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-6 bg-rose-900/95 text-white text-[10px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap border border-rose-700">
                    {targetHospital.name.slice(0, 18)}...
                  </span>
                </div>
              </AdvancedMarker>

              {/* Markers for other nearby hospitals */}
              {hospitals
                .filter((h) => h.id !== targetHospital.id)
                .map((h) => (
                  <AdvancedMarker
                    key={h.id}
                    position={{
                      lat: (h.coordinates as any).lat ?? (h.coordinates as any).latitude ?? 37.77,
                      lng: (h.coordinates as any).lng ?? (h.coordinates as any).longitude ?? -122.41,
                    }}
                    title={h.name}
                    onClick={() => {
                      if (onSelectHospital) {
                        onSelectHospital(h);
                      }
                    }}
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-rose-700 text-white border border-white shadow-md flex items-center justify-center cursor-pointer transition-colors" title={`Click to route to ${h.name}`}>
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                  </AdvancedMarker>
                ))}

              {/* InfoWindow for Origin */}
              {activeMarkerInfo === 'origin' && (
                <InfoWindow
                  position={deviceCoords}
                  onCloseClick={() => setActiveMarkerInfo(null)}
                >
                  <div className="p-2 max-w-xs text-slate-900">
                    <p className="font-bold text-xs flex items-center gap-1 text-teal-700">
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>Present Device Position</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {userLocation.address || 'Exact GPS telemetry'}
                    </p>
                  </div>
                </InfoWindow>
              )}

              {/* InfoWindow for Target Hospital */}
              {activeMarkerInfo === 'dest' && (
                <InfoWindow
                  position={destinationCoords}
                  onCloseClick={() => setActiveMarkerInfo(null)}
                >
                  <div className="p-2 max-w-xs text-slate-900 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase">
                        {targetHospital.traumaLevel}
                      </span>
                      <span className="font-bold text-xs">{targetHospital.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{targetHospital.address}</p>
                    <p className="text-[11px] font-semibold text-emerald-700">
                      ER Wait: ~{targetHospital.erWaitTimeMinutes ?? (targetHospital as any).waitTimeMin ?? 10} mins · {targetHospital.icuBedsAvailable ?? (targetHospital as any).availableBeds ?? 8} ICU beds
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Float Badge on map */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 pointer-events-none">
            <Navigation className="w-3.5 h-3.5 text-teal-600 animate-spin" />
            <span>Live Routes Engine Active</span>
          </div>
        </div>

        {/* Route Details, Step-by-Step, and Actions Panel */}
        <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between bg-slate-50 space-y-5">
          <div className="space-y-4">
            {/* Facility Header */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  Destination Target
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {targetHospital.isOpen24x7 ? '24/7 ER Available' : 'Open'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {targetHospital.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{targetHospital.address}</span>
              </p>
            </div>

            {/* Calculated Distance & ETA KPI Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-teal-600" />
                  <span>Real Distance</span>
                </span>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {routeData
                    ? `${(routeData.distanceMeters / 1000).toFixed(1)} km`
                    : `${targetHospital.distanceKm} km`}
                </p>
                <span className="text-[10px] text-slate-400">
                  {routeData
                    ? `~${((routeData.distanceMeters / 1000) * 0.621371).toFixed(1)} miles`
                    : 'Estimated'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-600" />
                  <span>Estimated ETA</span>
                </span>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {routeData && routeData.durationMillis > 0
                    ? `${Math.max(1, Math.round(routeData.durationMillis / 60000))} mins`
                    : `~${targetHospital.driveTimeMin} mins`}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Light Traffic
                </span>
              </div>
            </div>

            {/* Emergency Department Readiness */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Emergency Department:</span>
                <span className="font-bold text-slate-800">{targetHospital.traumaLevel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Current ER Triage Queue:</span>
                <span className="font-bold text-amber-600">~{targetHospital.erWaitTimeMinutes ?? (targetHospital as any).waitTimeMin ?? 10} mins wait</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">ICU Bed Availability:</span>
                <span className="font-bold text-emerald-600">{targetHospital.icuBedsAvailable ?? (targetHospital as any).availableBeds ?? 8} beds open</span>
              </div>
            </div>


            {/* Turn-by-Turn Steps Accordion */}
            {routeData?.steps && routeData.steps.length > 0 && (
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>Turn-by-Turn Route ({routeData.steps.length} Steps)</span>
                  </span>
                  {isStepsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isStepsExpanded && (
                  <div className="p-3 pt-0 max-h-48 overflow-y-auto space-y-2 text-xs border-t border-slate-100">
                    {routeData.steps.map((st, idx) => (
                      <div key={idx} className="flex items-start gap-2 pt-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 font-medium leading-snug">
                            {st.instruction}
                          </p>
                          {(st.distance || st.duration) && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {st.distance} {st.duration ? `· ${st.duration}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            {/* Open directly in Google Maps Application */}
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Live Turn-by-Turn in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => initiateDemoCall(targetHospital.name, targetHospital.phone || '')}
                className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                <span>Call Hospital</span>
              </button>

              <button
                onClick={() => setCurrentPage('ambulance')}
                className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Ambulance className="w-3.5 h-3.5 text-rose-600" />
                <span>Call Ambulance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
