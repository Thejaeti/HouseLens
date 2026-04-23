import { Coords } from "../types";

export interface MockListing {
  id: string;
  address: string;
  coords: Coords;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
}

const STREET_NAMES = [
  "Oak", "Maple", "Elm", "Cedar", "Pine", "Birch", "Willow", "Ash",
  "Walnut", "Sycamore", "Chestnut", "Poplar", "Spruce", "Hickory", "Magnolia",
];
const STREET_TYPES = ["St", "Ave", "Rd", "Ln", "Dr", "Ct", "Way"];

function randomListingDetails() {
  const price = Math.round((275_000 + Math.random() * 775_000) / 5000) * 5000;
  return {
    price,
    beds: 2 + Math.floor(Math.random() * 4),
    baths: 1 + Math.floor(Math.random() * 3),
    sqft: Math.round((1000 + Math.random() * 2500) / 50) * 50,
  };
}

/** Random-coord fallback, used if OSM fetch fails. */
export function generateMockListings(
  center: Coords,
  count: number = 15
): MockListing[] {
  const listings: MockListing[] = [];
  const latMetersPerDegree = 111_111;
  const lonMetersPerDegree = 111_111 * Math.cos((center.lat * Math.PI) / 180);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = 60 + Math.random() * 750;
    const latOffset = (distance * Math.cos(angle)) / latMetersPerDegree;
    const lonOffset = (distance * Math.sin(angle)) / lonMetersPerDegree;
    const number = Math.floor(Math.random() * 1900) + 100;
    const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
    const streetType = STREET_TYPES[Math.floor(Math.random() * STREET_TYPES.length)];
    listings.push({
      id: `mock-${i}`,
      address: `${number} ${streetName} ${streetType}`,
      coords: { lat: center.lat + latOffset, lon: center.lon + lonOffset },
      ...randomListingDetails(),
    });
  }
  return listings;
}

interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  geometry?: Array<{ lat: number; lon: number }>;
}

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Projects a point onto the line segment between a and b, returning the
 * closest point on the segment. Good enough in local meters via a flat-earth
 * approximation at these distances.
 */
function projectOntoSegment(p: Coords, a: Coords, b: Coords): Coords {
  const latMetersPerDegree = 111_111;
  const lonMetersPerDegree = 111_111 * Math.cos((p.lat * Math.PI) / 180);

  const toXY = (c: Coords) => ({
    x: (c.lon - p.lon) * lonMetersPerDegree,
    y: (c.lat - p.lat) * latMetersPerDegree,
  });
  const P = { x: 0, y: 0 };
  const A = toXY(a);
  const B = toXY(b);
  const ABx = B.x - A.x;
  const ABy = B.y - A.y;
  const lenSq = ABx * ABx + ABy * ABy;
  if (lenSq === 0) return a;
  let t = ((P.x - A.x) * ABx + (P.y - A.y) * ABy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const px = A.x + t * ABx;
  const py = A.y + t * ABy;
  return {
    lat: p.lat + py / latMetersPerDegree,
    lon: p.lon + px / lonMetersPerDegree,
  };
}

function snapToNearestRoad(
  point: Coords,
  roads: Array<Array<Coords>>
): Coords | null {
  let best: { coords: Coords; dist: number } | null = null;
  for (const road of roads) {
    for (let i = 0; i < road.length - 1; i++) {
      const snapped = projectOntoSegment(point, road[i], road[i + 1]);
      const d = haversineMeters(point, snapped);
      if (best === null || d < best.dist) {
        best = { coords: snapped, dist: d };
      }
    }
  }
  return best && best.dist < 50 ? best.coords : null;
}

/**
 * Fetches real addresses + residential roads near the given point from
 * OpenStreetMap via Overpass, then places signs at the curbside (building
 * projected to nearest road). Falls back to random coords on failure.
 */
export async function fetchNearbyListings(
  center: Coords,
  count: number = 15
): Promise<MockListing[]> {
  const radius = 1200;
  const query = `
    [out:json][timeout:20];
    (
      node(around:${radius},${center.lat},${center.lon})["addr:housenumber"]["addr:street"];
      way(around:${radius},${center.lat},${center.lon})["addr:housenumber"]["addr:street"];
      way(around:${radius},${center.lat},${center.lon})["highway"~"^(residential|tertiary|secondary|primary|service|unclassified|living_street)$"];
    );
    out center geom tags;
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("overpass request failed");
    const data = await response.json();
    const elements: OsmElement[] = data.elements ?? [];

    const roads: Array<Array<Coords>> = [];
    const addresses: Array<{ id: number; address: string; coords: Coords }> = [];

    for (const el of elements) {
      const tags = el.tags ?? {};
      if (tags["highway"] && el.geometry) {
        roads.push(el.geometry.map((p) => ({ lat: p.lat, lon: p.lon })));
      } else if (tags["addr:housenumber"] && tags["addr:street"]) {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (typeof lat === "number" && typeof lon === "number") {
          addresses.push({
            id: el.id,
            address: `${tags["addr:housenumber"]} ${tags["addr:street"]}`,
            coords: { lat, lon },
          });
        }
      }
    }

    if (addresses.length === 0) throw new Error("no addresses found");

    const shuffled = addresses.sort(() => Math.random() - 0.5);
    const listings: MockListing[] = [];
    const seenAddresses = new Set<string>();

    for (const addr of shuffled) {
      if (listings.length >= count) break;
      if (seenAddresses.has(addr.address)) continue;
      seenAddresses.add(addr.address);

      const snapped = roads.length > 0
        ? snapToNearestRoad(addr.coords, roads)
        : null;

      listings.push({
        id: `osm-${addr.id}`,
        address: addr.address,
        coords: snapped ?? addr.coords,
        ...randomListingDetails(),
      });
    }

    if (listings.length === 0) throw new Error("no usable listings");
    return listings;
  } catch {
    return generateMockListings(center, count);
  }
}

export function formatPrice(price: number): string {
  return "$" + price.toLocaleString();
}

export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(price >= 10_000_000 ? 0 : 1)}M`;
  }
  return `$${Math.round(price / 1000)}K`;
}
