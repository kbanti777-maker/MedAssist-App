import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  MapControl,
  ControlPosition,
} from '@vis.gl/react-google-maps';
import { Hospital } from '../../types';
import { Building2, Navigation, MapPin, LocateFixed, Layers, Plus, Minus } from 'lucide-react';

interface HospitalsMapProps {
  apiKey?: string;
  userCoords: { latitude: number; longitude: number };
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onRouteCalculated?: (info: { durationText: string; distanceText: string } | null) => void;
}

// Controller component inside Map that handles camera bounds, routes, and polylines
const MapController: React.FC<{
  userCoords: { latitude: number; longitude: number };
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onRouteCalculated?: (info: { durationText: string; distanceText: string } | null) => void;
}> = ({ userCoords, hospitals, selectedHospital, onRouteCalculated }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const hasInitiallyFittedRef = useRef(false);

  // Fit bounds to user location + all nearby hospital markers
  useEffect(() => {
    if (!map) return;

    // When no hospital is selected or on initial load, fit all markers
    if (!selectedHospital) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: userCoords.latitude, lng: userCoords.longitude });

      hospitals.forEach((h) => {
        if (h.coordinates && typeof h.coordinates.lat === 'number') {
          bounds.extend(h.coordinates);
        }
      });

      // Avoid zooming too tightly if only 1 point
      if (hospitals.length === 0) {
        map.setCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, 60);
      }
      hasInitiallyFittedRef.current = true;
    }
  }, [map, userCoords.latitude, userCoords.longitude, hospitals, selectedHospital]);

  // Compute and render route when a hospital is selected
  useEffect(() => {
    if (!map) return;

    // Clean up existing polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!selectedHospital) {
      onRouteCalculated?.(null);
      return;
    }

    const origin = { lat: userCoords.latitude, lng: userCoords.longitude };
    const destination = selectedHospital.coordinates;

    if (routesLib) {
      const request = {
        origin,
        destination,
        travelMode: 'DRIVING' as any,
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
      };

      (routesLib.Route as any)
        ?.computeRoutes(request)
        .then(({ routes }: { routes: any[] }) => {
          if (!routes || routes.length === 0) {
            throw new Error('No route found');
          }
          const primaryRoute = routes[0];

          if (typeof primaryRoute.createPolylines === 'function') {
            const newPolylines = primaryRoute.createPolylines();
            newPolylines.forEach((p: google.maps.Polyline) => {
              p.setOptions({
                strokeColor: '#0f766e', // Teal emergency route line
                strokeWeight: 6,
                strokeOpacity: 0.9,
              });
              p.setMap(map);
            });
            polylinesRef.current = newPolylines;
          }

          if (primaryRoute.viewport) {
            map.fitBounds(primaryRoute.viewport, 50);
          } else {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            map.fitBounds(bounds, 50);
          }

          const durationMillis = primaryRoute.durationMillis || primaryRoute.legs?.[0]?.durationMillis || 0;
          const distanceMeters = primaryRoute.distanceMeters || primaryRoute.legs?.[0]?.distanceMeters || 0;
          const mins = Math.max(1, Math.round(durationMillis / 60000));
          const km = (distanceMeters / 1000).toFixed(1);

          onRouteCalculated?.({
            durationText: mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} mins`,
            distanceText: `${km} km`,
          });
        })
        .catch(() => {
          // Draw direct fallback line
          const fallbackLine = new google.maps.Polyline({
            path: [origin, destination],
            geodesic: true,
            strokeColor: '#0f766e',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map,
          });
          polylinesRef.current = [fallbackLine];

          const bounds = new google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          map.fitBounds(bounds, 50);
        });
    } else {
      // Direct polyline fallback
      const fallbackLine = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: '#0f766e',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });
      polylinesRef.current = [fallbackLine];

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds, 50);
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, selectedHospital, userCoords.latitude, userCoords.longitude, onRouteCalculated]);

  return null;
};

// Control component for center on my location, layer type, and zoom controls
const MapControlsBar: React.FC<{
  userCoords: { latitude: number; longitude: number };
}> = ({ userCoords }) => {
  const map = useMap();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const handleCenterUser = () => {
    if (!map) return;
    map.panTo({ lat: userCoords.latitude, lng: userCoords.longitude });
    map.setZoom(15);
  };

  const handleZoomIn = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 14) + 1);
  };

  const handleZoomOut = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 14) - 1);
  };

  const handleToggleMapType = () => {
    if (!map) return;
    const nextType = mapType === 'roadmap' ? 'satellite' : mapType === 'satellite' ? 'terrain' : 'roadmap';
    setMapType(nextType);
    map.setMapTypeId(nextType);
  };

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div className="m-3 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl shadow-lg border border-slate-200">
        <button
          type="button"
          onClick={handleCenterUser}
          className="p-2 rounded-xl hover:bg-teal-50 text-teal-800 transition-colors flex items-center justify-center group"
          title="Center on my location"
          aria-label="Center on my location"
        >
          <LocateFixed className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
        </button>
        <button
          type="button"
          onClick={handleToggleMapType}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center"
          title={`Switch map view (current: ${mapType})`}
          aria-label="Toggle map view"
        >
          <Layers className="w-4 h-4 text-slate-600" />
        </button>
        <div className="h-px bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-bold transition-colors flex items-center justify-center"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-bold transition-colors flex items-center justify-center"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </MapControl>
  );
};

export const HospitalsMap: React.FC<HospitalsMapProps> = ({
  apiKey: propApiKey,
  userCoords,
  hospitals,
  selectedHospital,
  onSelectHospital,
  onRouteCalculated,
}) => {
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string>(
    () => propApiKey || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || ''
  );

  useEffect(() => {
    if (propApiKey) {
      setResolvedKey(propApiKey);
    } else if (!resolvedKey) {
      const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
      if (envKey) {
        setResolvedKey(envKey);
      } else {
        fetch('/api/config/maps')
          .then((res) => res.json())
          .then((data) => {
            if (data?.apiKey) setResolvedKey(data.apiKey);
          })
          .catch(() => {});
      }
    }
  }, [propApiKey, resolvedKey]);

  if (!resolvedKey) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-100 rounded-3xl p-6 text-center border border-slate-200">
        <MapPin className="w-10 h-10 text-amber-500 mb-2" />
        <h3 className="font-bold text-slate-800 text-lg">Google Maps is not configured yet</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Add your <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to the environment variables to activate live maps.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-inner border border-slate-200 relative bg-slate-100">
      <APIProvider apiKey={resolvedKey} libraries={['places', 'marker', 'routes', 'geometry', 'core']}>
        <Map
          defaultCenter={{ lat: userCoords.latitude, lng: userCoords.longitude }}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          fullscreenControl={false}
          streetViewControl={false}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Synchronizer and Route Renderer */}
          <MapController
            userCoords={userCoords}
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            onRouteCalculated={onRouteCalculated}
          />

          {/* Interactive Controls: Center on Location, Layers, Zoom */}
          <MapControlsBar userCoords={userCoords} />

          {/* USER'S ACTUAL CURRENT LOCATION MARKER */}
          <AdvancedMarker
            position={{ lat: userCoords.latitude, lng: userCoords.longitude }}
            title="You are here"
            zIndex={100}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-md border border-slate-700 pointer-events-none">
                You are here
              </span>
            </div>
          </AdvancedMarker>

          {/* REAL NEARBY HOSPITAL MARKERS */}
          {hospitals.map((hosp) => {
            const isSelected = selectedHospital?.id === hosp.id;
            return (
              <AdvancedMarker
                key={hosp.id}
                position={hosp.coordinates}
                title={hosp.name}
                onClick={() => onSelectHospital(hosp)}
                zIndex={isSelected ? 90 : 20}
              >
                <div
                  onMouseEnter={() => setHoveredHospital(hosp)}
                  onMouseLeave={() => setHoveredHospital(null)}
                  className={`cursor-pointer transition-all duration-200 transform ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full shadow-lg border-2 transition-colors ${
                      isSelected
                        ? 'bg-rose-600 border-white text-white ring-4 ring-rose-400/40'
                        : 'bg-teal-700 border-white text-white hover:bg-teal-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>

                  {/* Marker label preview */}
                  {(isSelected || hoveredHospital?.id === hosp.id) && (
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded-md shadow-lg border border-slate-700 pointer-events-none z-50">
                      {hosp.name.length > 24 ? hosp.name.slice(0, 22) + '...' : hosp.name}
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow for Selected Hospital */}
          {selectedHospital && selectedHospital.coordinates && (
            <InfoWindow
              position={selectedHospital.coordinates}
              onCloseClick={() => onSelectHospital(null as any)}
              headerContent={
                <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pr-1">
                  <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="truncate max-w-[200px]">{selectedHospital.name}</span>
                </div>
              }
            >
              <div className="p-1 space-y-1.5 text-xs max-w-xs">
                <div className="flex items-center gap-2 text-teal-800 font-bold">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedHospital.distanceKm} km away</span>
                  {selectedHospital.rating && (
                    <span className="text-amber-600 font-semibold ml-auto flex items-center gap-0.5">
                      ⭐ {selectedHospital.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                  {selectedHospital.address}
                </p>
                {selectedHospital.openStatusText && (
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      selectedHospital.openNow || selectedHospital.isOpen24x7
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedHospital.openStatusText}
                  </span>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
