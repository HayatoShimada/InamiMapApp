import { GeoPoint } from 'firebase/firestore';

// Type definitions for location data
export interface LocationObject {
  latitude: number;
  longitude: number;
}

export interface LocationMap {
  _latitude?: number;
  _longitude?: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  lon?: number;
}

/**
 * Convert various location formats to Firebase GeoPoint
 */
export function toGeoPoint(location: GeoPoint | LocationObject | LocationMap | null | undefined): GeoPoint | null {
  if (!location) {
    return null;
  }
  
  // Already a GeoPoint
  if (location instanceof GeoPoint) {
    return location;
  }
  
  // Extract latitude and longitude from various formats
  let lat: number | undefined;
  let lng: number | undefined;
  
  if ('latitude' in location && 'longitude' in location) {
    lat = location.latitude as number;
    lng = location.longitude as number;
  } else if ('_latitude' in location && '_longitude' in location) {
    lat = location._latitude as number;
    lng = location._longitude as number;
  } else if ('lat' in location && ('lng' in location || 'lon' in location)) {
    lat = location.lat as number;
    lng = (location.lng || location.lon) as number;
  }
  
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return new GeoPoint(lat, lng);
  }
  
  return null;
}

/**
 * Convert GeoPoint to plain object
 */
export function fromGeoPoint(geoPoint: GeoPoint | null | undefined): LocationObject | null {
  if (!geoPoint) return null;
  
  if (geoPoint instanceof GeoPoint) {
    return {
      latitude: geoPoint.latitude,
      longitude: geoPoint.longitude
    };
  }
  
  // Handle case where it might already be a plain object
  return toGeoPoint(geoPoint as any) ? {
    latitude: (geoPoint as any).latitude || (geoPoint as any)._latitude,
    longitude: (geoPoint as any).longitude || (geoPoint as any)._longitude
  } : null;
}

/**
 * Extract coordinates from Google Maps URL
 */
export function extractCoordinatesFromGoogleMapsUrl(url: string): LocationObject | null {
  if (!url) return null;
  
  // Pattern for coordinates in Google Maps URLs
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,  // @lat,lng format
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,  // !3dlat!4dlng format
    /place\/.*@(-?\d+\.\d+),(-?\d+\.\d+)/,  // place with coordinates
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[2]) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
  }
  
  return null;
}

/**
 * Get default Inami town center coordinates
 */
export function getInamiCenter(): GeoPoint {
  return new GeoPoint(36.5569, 136.9628);
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(lat: number | undefined, lng: number | undefined): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}