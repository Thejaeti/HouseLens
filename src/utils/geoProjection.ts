import { Coords } from "../types";
import { EARTH_RADIUS } from "../constants";

/**
 * Projects a point from (lat, lon) along a compass heading for a given distance.
 * Uses the Haversine destination formula.
 * @param lat - Starting latitude in degrees
 * @param lon - Starting longitude in degrees
 * @param heading - Compass heading in degrees (0 = North, 90 = East)
 * @param distanceMeters - Distance to project in meters
 */
export function projectPoint(
  lat: number,
  lon: number,
  heading: number,
  distanceMeters: number
): Coords {
  const angularDistance = distanceMeters / EARTH_RADIUS;
  const bearingRad = (heading * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const destLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const destLonRad =
    lonRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLatRad)
    );

  return {
    lat: (destLatRad * 180) / Math.PI,
    lon: (destLonRad * 180) / Math.PI,
  };
}
