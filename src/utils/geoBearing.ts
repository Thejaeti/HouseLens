import { Coords } from "../types";
import { EARTH_RADIUS } from "../constants";

const DEG = Math.PI / 180;

/**
 * Calculates the bearing (compass direction) from point A to point B.
 * Returns degrees 0-360 where 0 = North, 90 = East.
 */
export function bearingTo(from: Coords, to: Coords): number {
  const lat1 = from.lat * DEG;
  const lat2 = to.lat * DEG;
  const dLon = (to.lon - from.lon) * DEG;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (Math.atan2(y, x) / DEG + 360) % 360;
}

/**
 * Calculates the distance in meters between two coordinates (Haversine).
 */
export function distanceTo(from: Coords, to: Coords): number {
  const lat1 = from.lat * DEG;
  const lat2 = to.lat * DEG;
  const dLat = (to.lat - from.lat) * DEG;
  const dLon = (to.lon - from.lon) * DEG;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
