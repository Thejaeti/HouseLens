import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Coords } from "../types";
import { bearingTo, distanceTo } from "../utils/geoBearing";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";
import { NeighborhoodProperty } from "../data/neighborhoodProperties";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Same FOV + focal constants as AROverlay
const CAMERA_FOV_H = 65;
const CAMERA_FOV_V = 50;
const FOCAL_H =
  (SCREEN_WIDTH / 2) / Math.tan(((CAMERA_FOV_H / 2) * Math.PI) / 180);
const FOCAL_V =
  (SCREEN_HEIGHT / 2) / Math.tan(((CAMERA_FOV_V / 2) * Math.PI) / 180);

// Yard signs only appear within 40 m
const MAX_DISTANCE_M = 40;

// Fixed card size — landscape 4:3 ratio, same dark style as Camera tab
const CARD_W = 220;
const CARD_H = 165; // 220 / (4/3) ≈ 165

const DEG = Math.PI / 180;

// Sign top is ~1.4 m above ground — only 0.1 m below eye level, so it
// projects near the centre of the camera frame at typical viewing angles.
const SIGN_TOP_H_M = 1.4;
const EYE_HEIGHT_M = 1.5;

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeAngle(a: number): number {
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
}

/** Nearest node on the street polyline to a building centroid */
function nearestStreetNode(
  building: Coords,
  nodes: readonly [number, number][]
): Coords {
  let best = nodes[0];
  let bestDist = Infinity;
  for (const n of nodes) {
    const d = distanceTo(building, { lat: n[0], lon: n[1] });
    if (d < bestDist) {
      bestDist = d;
      best = n;
    }
  }
  return { lat: best[0], lon: best[1] };
}

function lerpCoords(a: Coords, b: Coords, t: number): Coords {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lon: a.lon + (b.lon - a.lon) * t,
  };
}

function formatValue(v: number | null): string {
  if (v == null) return "$$";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(v / 1000)}k`;
}

function formatStats(
  beds: number | null,
  baths: number | null,
  sqft: number | null
): string {
  const b = beds != null ? `${beds} bd` : "—";
  const ba = baths != null ? `${baths} ba` : "—";
  const s = sqft != null ? `${sqft.toLocaleString()} sqft` : "—";
  return `${b}  ·  ${ba}  ·  ${s}`;
}

// ─── types ────────────────────────────────────────────────────────────────────

interface SignEntry {
  id: string;
  prop: NeighborhoodProperty;
  distance: number;
  screenX: number;
  screenY: number;
  scale: number;
}

interface Props {
  userCoords: Coords;
  heading: number;
  pitch: number;
  properties: NeighborhoodProperty[];
}

// ─── component ────────────────────────────────────────────────────────────────

export function ARYardSignOverlay({ userCoords, heading, pitch, properties }: Props) {
  const clampedPitch = Math.max(-70, Math.min(70, pitch));
  const halfFovH = CAMERA_FOV_H / 2;

  let entries: SignEntry[] = properties
    .map((prop): SignEntry | null => {
      const building: Coords = { lat: prop.coords.lat, lon: prop.coords.lon };

      // Place sign 75% of the way from building centroid to nearest street node
      const streetNode = nearestStreetNode(building, prop.streetNodes);
      const signPos = lerpCoords(building, streetNode, 0.75);

      const distance = distanceTo(userCoords, signPos);
      if (distance > MAX_DISTANCE_M) return null;

      // ── bearing / horizontal cull ──────────────────────────────────────────
      const bearing = bearingTo(userCoords, signPos);
      const relH = normalizeAngle(bearing - heading);
      if (Math.abs(relH) > halfFovH + 5) return null;

      // ── screen X ──────────────────────────────────────────────────────────
      const screenX =
        SCREEN_WIDTH / 2 + FOCAL_H * Math.tan(relH * DEG);

      // ── screen Y ──────────────────────────────────────────────────────────
      // Project the sign's top edge (≈ eye-level) to get the anchor point.
      // screenY = where the top of the sign board appears on screen.
      // Card hangs DOWN from this anchor (same pattern as AROverlay) so the
      // card stays visible even when the phone is tilted slightly downward.
      const heightDiff = SIGN_TOP_H_M - EYE_HEIGHT_M; // ≈ -0.1 m
      const vertAngle = Math.atan2(heightDiff, distance) / DEG;
      const dV = vertAngle - clampedPitch;
      const screenY =
        SCREEN_HEIGHT / 2 - FOCAL_V * Math.tan(dV * DEG);

      // ── distance-based scale (same formula as AROverlay) ──────────────────
      const distFactor = Math.min(distance / MAX_DISTANCE_M, 1);
      const scale = 0.6 + (1 - distFactor) * 0.4; // 1.0 at 0 m → 0.6 at 40 m

      return { id: prop.id, prop, distance, screenX, screenY, scale };
    })
    .filter((x): x is SignEntry => x !== null);

  // Render far-to-near so closer signs appear on top
  entries.sort((a, b) => b.distance - a.distance);

  // screenY is the top anchor; card hangs down ~(PIN_HEIGHT + CARD_H) below it.
  // Keep a sign if any part of its card would be on screen.
  const visible = entries.filter(
    (e) => e.screenY > -CARD_H && e.screenY < SCREEN_HEIGHT
  );

  if (visible.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {visible.map((e) => {
        const { prop, distance, screenX, screenY, scale } = e;
        const cardW = CARD_W * scale;
        const cardH = CARD_H * scale;

        return (
          <View
            key={e.id}
            style={[
              styles.wrapper,
              {
                left: screenX - cardW / 2,
                // screenY = top of sign board in camera frame;
                // card hangs down from here (same pattern as AROverlay)
                top: screenY,
                width: cardW,
              },
            ]}
            pointerEvents="auto"
          >
            {/* Card hangs down from the anchor */}
            <View style={[styles.card, { width: cardW, height: cardH }]}>
              {/* Line 1: address — town */}
              <Text style={styles.addressText} numberOfLines={1} adjustsFontSizeToFit>
                {prop.address}
                <Text style={styles.townText}> — {prop.town}</Text>
              </Text>

              {/* Line 2: beds · baths · sqft */}
              <Text style={styles.statsText} numberOfLines={1} adjustsFontSizeToFit>
                {formatStats(prop.beds, prop.baths, prop.sqft)}
              </Text>

              {/* Line 3: estimated value */}
              <Text style={styles.valueText} numberOfLines={1}>
                {formatValue(prop.estimatedValue)}
              </Text>

              {/* Platform buttons */}
              <View style={styles.platformRow}>
                {PLATFORMS.map((platform) => (
                  <TouchableOpacity
                    key={platform.name}
                    style={[
                      styles.platformButton,
                      { backgroundColor: platform.color },
                    ]}
                    onPress={() => openPlatform(platform, prop.fullAddress)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.platformText}>{platform.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  wrapper: {
    position: "absolute",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 217, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  addressText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  townText: {
    color: "#4A90D9",
    fontWeight: "500",
  },
  statsText: {
    color: "#ccc",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  valueText: {
    color: "#5EC46A",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  platformRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "nowrap",
    justifyContent: "center",
  },
  platformButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  platformText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
