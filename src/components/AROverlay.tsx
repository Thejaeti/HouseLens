import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Coords } from "../types";
import { SavedHouse } from "../hooks/useSavedHouses";
import { bearingTo, distanceTo } from "../utils/geoBearing";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CAMERA_FOV_H = 65; // horizontal FOV in degrees
const CAMERA_FOV_V = 60; // vertical FOV in degrees
const MAX_DISTANCE = 500;
const CARD_HEIGHT = 90; // approximate height of a label card
const MIN_CARD_GAP = 10;

interface AROverlayProps {
  userCoords: Coords;
  heading: number;
  pitch: number;
  savedHouses: SavedHouse[];
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

export function AROverlay({ userCoords, heading, pitch, savedHouses }: AROverlayProps) {
  const halfFovH = CAMERA_FOV_H / 2;
  const halfFovV = CAMERA_FOV_V / 2;

  // Calculate positions for all visible houses
  let labels = savedHouses
    .map((house) => {
      const bearing = bearingTo(userCoords, house.targetCoords);
      const distance = distanceTo(userCoords, house.targetCoords);
      const relativeBearing = normalizeAngle(bearing - heading);

      return { house, distance, relativeBearing };
    })
    .filter(
      (h) =>
        Math.abs(h.relativeBearing) <= halfFovH && h.distance <= MAX_DISTANCE
    )
    .sort((a, b) => b.distance - a.distance)
    .map(({ house, distance, relativeBearing }) => {
      // Horizontal position from bearing
      const screenX =
        (relativeBearing / halfFovH) * (SCREEN_WIDTH / 2) + SCREEN_WIDTH / 2;

      // Vertical position from pitch
      // pitch > 0 = phone tilted up → houses move down on screen
      // pitch < 0 = phone tilted down → houses move up on screen
      // Scale: each degree of pitch moves the label proportionally across the screen
      const pixelsPerDegree = SCREEN_HEIGHT / CAMERA_FOV_V;
      const verticalOffset = pitch * pixelsPerDegree * 1.4;
      const baseY = SCREEN_HEIGHT * 0.5 + verticalOffset;

      // Closer houses slightly lower on screen
      const distanceFactor = Math.min(distance / MAX_DISTANCE, 1);
      const screenY = baseY + (1 - distanceFactor) * 20;

      const scale = 0.8 + (1 - distanceFactor) * 0.4;

      return { house, distance, screenX, screenY, scale };
    });

  // Collision avoidance: push overlapping labels apart vertically
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i];
      const b = labels[j];
      const dx = Math.abs(a.screenX - b.screenX);
      const dy = Math.abs(a.screenY - b.screenY);

      // If cards overlap horizontally and vertically
      if (dx < 160 && dy < CARD_HEIGHT + MIN_CARD_GAP) {
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
      {visibleLabels.map(({ house, distance, screenX, screenY, scale }) => (
        <View
          key={house.id}
          style={[
            styles.label,
            {
              left: screenX - 85,
              top: screenY,
              transform: [{ scale }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.pin} />
          <View style={styles.labelCard}>
            <Text style={styles.addressText} numberOfLines={2}>
              {house.address}
            </Text>
            <Text style={styles.distanceText}>
              {formatDistance(distance)}
            </Text>
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    position: "absolute",
    width: 170,
    alignItems: "center",
  },
  pin: {
    width: 2,
    height: 16,
    backgroundColor: "rgba(74, 144, 217, 0.8)",
    marginBottom: -1,
  },
  labelCard: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 217, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  addressText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },
  distanceText: {
    color: "#4A90D9",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 6,
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
