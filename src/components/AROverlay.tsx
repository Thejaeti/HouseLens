import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Coords } from "../types";
import { SavedHouse } from "../hooks/useSavedHouses";
import { bearingTo, distanceTo } from "../utils/geoBearing";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";
import {
  NEIGHBORHOOD_PROPERTIES,
  NeighborhoodProperty,
} from "../data/neighborhoodProperties";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CAMERA_FOV_H = 65;
const CAMERA_FOV_V = 50;
const FOCAL_H = (SCREEN_WIDTH / 2) / Math.tan((CAMERA_FOV_H / 2) * Math.PI / 180);
const FOCAL_V = (SCREEN_HEIGHT / 2) / Math.tan((CAMERA_FOV_V / 2) * Math.PI / 180);
const MAX_DISTANCE = 500;
const CARD_WIDTH = 180;
const CARD_HEIGHT = 115; // updated for taller card
const MIN_CARD_GAP = 10;

interface AROverlayProps {
  userCoords: Coords;
  heading: number;
  pitch: number;
  savedHouses: SavedHouse[];
}

// ── helpers (same logic as AddressCard / SavedHousesScreen) ───────────────────

function normalizeAddr(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\d{5}(-\d{4})?\b/g, "")
    .replace(/[,\s]+/g, " ")
    .trim();
}

function findProperty(address: string): NeighborhoodProperty | null {
  const tokens = normalizeAddr(address).split(" ");
  const houseNum = tokens[0];
  const streetWord = tokens[1] ?? "";
  if (!houseNum || !streetWord) return null;
  return (
    NEIGHBORHOOD_PROPERTIES.find((p) => {
      const pt = normalizeAddr(p.fullAddress).split(" ");
      return pt[0] === houseNum && (pt[1] ?? "").startsWith(streetWord.slice(0, 5));
    }) ?? null
  );
}

function splitAddress(address: string): { street: string; city: string } {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return { street: address, city: "" };
  const firstIsNumOnly = /^\d+$/.test(parts[0]);
  if (firstIsNumOnly && parts.length >= 2) {
    return { street: `${parts[0]} ${parts[1]}`, city: parts[2] ?? "" };
  }
  return { street: parts[0], city: parts[1] ?? "" };
}

function fmtBedBath(p: NeighborhoodProperty): string {
  const parts: string[] = [];
  if (p.beds !== null) parts.push(`${p.beds}bd`);
  if (p.baths !== null) parts.push(`${p.baths}ba`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function fmtSqft(p: NeighborhoodProperty): string {
  return p.sqft !== null ? `${p.sqft.toLocaleString()} sqft` : "—";
}

function fmtValue(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(v / 1000)}K`;
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function normalizeAngle(diff: number): number {
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

// ── component ─────────────────────────────────────────────────────────────────

export function AROverlay({ userCoords, heading, pitch, savedHouses }: AROverlayProps) {
  const halfFovH = CAMERA_FOV_H / 2;

  let labels = savedHouses
    .map((house) => {
      const bearing = bearingTo(userCoords, house.targetCoords);
      const distance = distanceTo(userCoords, house.targetCoords);
      const relativeBearing = normalizeAngle(bearing - heading);
      return { house, distance, relativeBearing };
    })
    .filter(
      (h) => Math.abs(h.relativeBearing) <= halfFovH && h.distance <= MAX_DISTANCE
    )
    .sort((a, b) => b.distance - a.distance)
    .map(({ house, distance, relativeBearing }) => {
      const screenX = SCREEN_WIDTH / 2 + FOCAL_H * Math.tan(relativeBearing * Math.PI / 180);
      const clampedPitch = Math.max(-70, Math.min(70, pitch));
      const dV = 0 - clampedPitch;
      const screenY = SCREEN_HEIGHT / 2 - FOCAL_V * Math.tan(dV * Math.PI / 180);
      const distanceFactor = Math.min(distance / MAX_DISTANCE, 1);
      const scale = 0.8 + (1 - distanceFactor) * 0.4;
      return { house, distance, screenX, screenY, scale };
    });

  // Collision avoidance
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i];
      const b = labels[j];
      const dx = Math.abs(a.screenX - b.screenX);
      const dy = Math.abs(a.screenY - b.screenY);
      if (dx < CARD_WIDTH && dy < CARD_HEIGHT + MIN_CARD_GAP) {
        const pushNeeded = (CARD_HEIGHT + MIN_CARD_GAP - dy) / 2;
        if (a.screenY <= b.screenY) {
          a.screenY -= pushNeeded;
          b.screenY += pushNeeded;
        } else {
          a.screenY += pushNeeded;
          b.screenY -= pushNeeded;
        }
      }
    }
  }

  const visibleLabels = labels.filter(
    (l) => l.screenY > -100 && l.screenY < SCREEN_HEIGHT
  );

  if (visibleLabels.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {visibleLabels.map(({ house, distance, screenX, screenY, scale }) => {
        const property = findProperty(house.address);
        const { street, city } = splitAddress(house.address);

        return (
          <View
            key={house.id}
            style={[
              styles.label,
              {
                left: screenX - CARD_WIDTH / 2,
                top: screenY,
                transform: [{ scale }],
              },
            ]}
            pointerEvents="box-none"
          >
            {/* stem */}
            <View style={styles.pin} />

            {/* card */}
            <View style={styles.card}>

              {/* red address header */}
              <View style={styles.addressHeader}>
                <View style={styles.addressTextBlock}>
                  <Text style={styles.streetText} numberOfLines={1} adjustsFontSizeToFit>
                    {street}
                  </Text>
                  {city !== "" && (
                    <Text style={styles.cityText} numberOfLines={1}>
                      {city}
                    </Text>
                  )}
                </View>
                <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
              </View>

              {/* stats + buttons */}
              <View style={styles.cardBody}>
                {property !== null && (
                  <View style={styles.statsRow}>
                    <Text style={styles.statText}>{fmtBedBath(property)}</Text>
                    <Text style={styles.statDivider}>·</Text>
                    <Text style={styles.statText}>{fmtSqft(property)}</Text>
                    <Text style={styles.statDivider}>·</Text>
                    <Text style={styles.statValue}>{fmtValue(property.estimatedValue)}</Text>
                  </View>
                )}

                <View style={styles.platformRow}>
                  {PLATFORMS.map((platform) => (
                    <TouchableOpacity
                      key={platform.name}
                      style={[styles.platformButton, { backgroundColor: platform.color }]}
                      onPress={() => openPlatform(platform, house.address)}
                    >
                      <Text style={styles.platformText}>{platform.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    position: "absolute",
    width: CARD_WIDTH,
    alignItems: "center",
  },
  pin: {
    width: 2,
    height: 14,
    backgroundColor: "#d62828",
    marginBottom: -1,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  // ── address header ──
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d62828",
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 6,
  },
  addressTextBlock: {
    flex: 1,
  },
  streetText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  cityText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    marginTop: 1,
  },
  distanceText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "700",
  },
  // ── card body ──
  cardBody: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 6,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  statText: {
    color: "#fff",
    fontSize: 10,
  },
  statDivider: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
  },
  statValue: {
    color: "#ff6b6b",
    fontSize: 10,
    fontWeight: "700",
  },
  platformRow: {
    flexDirection: "row",
    gap: 4,
  },
  platformButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
});
