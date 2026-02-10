import * as Location from "expo-location";
import { Coords } from "../types";

/**
 * Reverse geocodes coordinates to a street address.
 * Uses expo-location (Apple/Google) as primary, Nominatim as fallback.
 */
export async function reverseGeocode(coords: Coords): Promise<string | null> {
  // Primary: expo-location reverse geocode
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lon,
    });

    if (results.length > 0) {
      const place = results[0];
      const parts = [
        place.streetNumber,
        place.street,
        place.city,
        place.region,
        place.postalCode,
      ].filter(Boolean);

      if (parts.length >= 2) {
        return parts.join(", ");
      }
    }
  } catch {
    // Fall through to Nominatim
  }

  // Fallback: OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "HouseLens/1.0" },
    });
    const data = await response.json();

    if (data.display_name) {
      return data.display_name;
    }
  } catch {
    // Both methods failed
  }

  return null;
}
