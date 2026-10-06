import { Hospital } from '../types';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

/**
 * Calculates geographic distance (in kilometers) between two coordinates
 * using the accurate Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Requests the user's actual device location via the browser Geolocation API.
 * Returns exact latitude, longitude, and accuracy in meters.
 */
export function getDeviceLocation(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Math.round(position.coords.accuracy || 0),
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Fallback network location detection using Google Geolocation API
 */
export async function getNetworkLocation(): Promise<LocationCoords> {
  const res = await fetch('/api/maps/network-location', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to detect network location');
  const data = await res.json();
  if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters,
    };
  }
  throw new Error('Invalid coordinates returned from network');
}

/**
 * Reverse geocodes coordinates to a human-readable address.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`/api/maps/geocode?lat=${lat}&lng=${lng}`);
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Forward geocodes an address/city/pincode to coordinates.
 */
export async function forwardGeocode(
  query: string
): Promise<{ latitude: number; longitude: number; formattedAddress: string } | null> {
  try {
    const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return {
        latitude: loc.lat,
        longitude: loc.lng,
        formattedAddress: data.results[0].formatted_address,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Transforms a raw Google Places API (New) object into our verified Hospital model.
 * Never fabricates unavailable information.
 */
export function transformPlaceToHospital(
  place: any,
  userLat: number,
  userLng: number
): Hospital {
  const lat = place.location?.latitude ?? 0;
  const lng = place.location?.longitude ?? 0;
  const distanceKm = Number(calculateHaversineDistanceKm(userLat, userLng, lat, lng).toFixed(1));

  const name =
    typeof place.displayName === 'object'
      ? place.displayName?.text || 'Medical Facility'
      : place.displayName || 'Medical Facility';

  const address = place.formattedAddress || 'Address not listed';

  // Real phone number (national or international)
  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || undefined;

  // Real opening status
  const openNow = place.regularOpeningHours?.openNow ?? place.currentOpeningHours?.openNow;
  const weekdayDescriptions: string[] = place.regularOpeningHours?.weekdayDescriptions || [];
  const isOpen24x7 = weekdayDescriptions.some((d) => d.toLowerCase().includes('open 24 hours'));

  let openStatusText: string;
  if (isOpen24x7) {
    openStatusText = 'Open 24 Hours';
  } else if (openNow === true) {
    openStatusText = 'Open Now';
  } else if (openNow === false) {
    openStatusText = 'Closed';
  } else {
    openStatusText = 'Hours not listed';
  }

  // Real photos
  const photos: string[] = [];
  if (Array.isArray(place.photos) && place.photos.length > 0) {
    place.photos.slice(0, 3).forEach((p: any) => {
      if (p.name) {
        photos.push(`/api/maps/photo?name=${encodeURIComponent(p.name)}&maxHeightPx=600&maxWidthPx=800`);
      }
    });
  }

  // Type categorization based on real place types
  const types: string[] = place.types || [];
  let displayType = 'Hospital';
  if (types.includes('general_hospital')) {
    displayType = 'General Hospital';
  } else if (types.includes('trauma_center')) {
    displayType = 'Trauma Center';
  } else if (types.includes('medical_clinic')) {
    displayType = 'Medical Clinic';
  }

  // Real Google Maps direct link
  const googleMapsUri =
    place.googleMapsUri ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${place.id}`;

  return {
    id: place.id || `hosp-${Math.random().toString(36).substring(2, 9)}`,
    placeId: place.id,
    name,
    distanceKm,
    address,
    coordinates: { lat, lng },
    phone,
    emergencyDirectLine: phone,
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    reviewCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    isOpen24x7,
    openNow,
    openStatusText,
    hasEmergencyDepartment: isOpen24x7 || types.includes('hospital'),
    type: displayType,
    websiteUri: place.websiteUri,
    googleMapsUri,
    openingHoursDescriptions: weekdayDescriptions,
    photos,
    imageUrl: photos[0],
    isRealPlace: true,
  };
}

/**
 * Searches for real hospitals around the given coordinates using Google Places API (New).
 * Features progressive radius expansion:
 * Starts at 5 km -> expands to 10 km -> expands to 20 km if fewer than 3 hospitals are found.
 */
export async function searchRealNearbyHospitals(
  userLat: number,
  userLng: number,
  onRadiusStep?: (radiusKm: number) => void
): Promise<Hospital[]> {
  const radiiToTry = [5000, 10000, 20000];
  let accumulatedPlacesMap = new Map<string, any>();

  for (let i = 0; i < radiiToTry.length; i++) {
    const radiusMeters = radiiToTry[i];
    const radiusKm = radiusMeters / 1000;
    if (onRadiusStep) {
      onRadiusStep(radiusKm);
    }

    try {
      const response = await fetch('/api/maps/places-nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: userLat,
          longitude: userLng,
          radius: radiusMeters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const places = data.places || [];
        places.forEach((p: any) => {
          if (p.id && !accumulatedPlacesMap.has(p.id)) {
            accumulatedPlacesMap.set(p.id, p);
          }
        });
      }
    } catch (err) {
      console.warn(`Search at radius ${radiusKm}km encountered error:`, err);
    }

    // If we found at least 3 hospitals or finished maximum radius (20km), break
    if (accumulatedPlacesMap.size >= 3) {
      break;
    }
  }

  // Convert raw Places to Hospital objects
  const hospitals: Hospital[] = Array.from(accumulatedPlacesMap.values()).map((p) =>
    transformPlaceToHospital(p, userLat, userLng)
  );

  // Default sorting: Nearest first
  hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

  return hospitals;
}

/**
 * Manual location fallback search (City, Area, or Pincode)
 */
export async function searchHospitalsByManualQuery(
  query: string,
  userLat?: number,
  userLng?: number
): Promise<{ hospitals: Hospital[]; centerCoords?: { lat: number; lng: number } }> {
  try {
    const res = await fetch('/api/maps/places-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        latitude: userLat,
        longitude: userLng,
      }),
    });

    if (!res.ok) {
      throw new Error(`Manual search failed with status ${res.status}`);
    }

    const data = await res.json();
    const rawPlaces = data.places || [];

    if (rawPlaces.length === 0) {
      return { hospitals: [] };
    }

    // Determine reference center coordinates for distance calculation
    const centerLat = userLat ?? rawPlaces[0].location?.latitude ?? 0;
    const centerLng = userLng ?? rawPlaces[0].location?.longitude ?? 0;

    const hospitals = rawPlaces.map((p: any) =>
      transformPlaceToHospital(p, centerLat, centerLng)
    );

    hospitals.sort((a: Hospital, b: Hospital) => a.distanceKm - b.distanceKm);

    return {
      hospitals,
      centerCoords: {
        lat: rawPlaces[0].location?.latitude ?? centerLat,
        lng: rawPlaces[0].location?.longitude ?? centerLng,
      },
    };
  } catch (err) {
    console.error('Error during manual hospital search:', err);
    return { hospitals: [] };
  }
}

/**
 * Computes live route and estimated duration using Google Routes API.
 */
export async function computeLiveRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{
  durationText: string;
  distanceText: string;
  encodedPolyline?: string;
  durationSeconds?: number;
  distanceMeters?: number;
} | null> {
  try {
    const res = await fetch('/api/maps/compute-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;

    // Parse duration (e.g. "985s")
    const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
    const distanceMeters = route.distanceMeters || 0;

    const mins = Math.max(1, Math.round(durationSeconds / 60));
    const durationText = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} mins`;
    const distanceKm = (distanceMeters / 1000).toFixed(1);
    const distanceText = `${distanceKm} km`;

    return {
      durationText,
      distanceText,
      encodedPolyline: route.polyline?.encodedPolyline,
      durationSeconds,
      distanceMeters,
    };
  } catch {
    return null;
  }
}
