import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LookupState, LookupResult } from "../types";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";
import {
  NEIGHBORHOOD_PROPERTIES,
  NeighborhoodProperty,
} from "../data/neighborhoodProperties";

interface AddressCardProps {
  state: LookupState;
  onDismiss: () => void;
  onSave?: (result: LookupResult) => void;
  onRemove?: (address: string) => void;
  isSaved?: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Normalize: lowercase, strip zip, collapse commas/spaces to single space. */
function normalizeAddr(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\d{5}(-\d{4})?\b/g, "")
    .replace(/[,\s]+/g, " ")
    .trim();
}

/**
 * Match by house number + first word of street name only.
 * This handles "Winterberry Lane" (Apple Maps) vs "Winterberry Ln" (our data),
 * and avoids false positives on different streets.
 */
function findProperty(geocodedAddress: string): NeighborhoodProperty | null {
  const tokens = normalizeAddr(geocodedAddress).split(" ");
  const houseNum = tokens[0];            // "43"
  const streetWord = tokens[1] ?? "";    // "winterberry"
  if (!houseNum || !streetWord) return null;

  return (
    NEIGHBORHOOD_PROPERTIES.find((p) => {
      const pt = normalizeAddr(p.fullAddress).split(" ");
      return pt[0] === houseNum && (pt[1] ?? "").startsWith(streetWord.slice(0, 5));
    }) ?? null
  );
}

function fmtBedBath(p: NeighborhoodProperty): string {
  const parts: string[] = [];
  if (p.beds !== null) parts.push(`${p.beds} bd`);
  if (p.baths !== null) parts.push(`${p.baths} ba`);
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

/**
 * Split geocoded address into street + city.
 * Handles both "43 Winterberry Ln, Florence, MA" (combined)
 * and "43, Winterberry Lane, Florence, MA, 01062" (iOS split) formats.
 * No state shown.
 */
function splitAddress(address: string): { street: string; city: string } {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return { street: address, city: "" };

  const firstIsNumOnly = /^\d+$/.test(parts[0]);
  if (firstIsNumOnly && parts.length >= 3) {
    // iOS format: ["43", "Winterberry Lane", "Florence", "MA", "01062"]
    return { street: `${parts[0]} ${parts[1]}`, city: parts[2] };
  }
  // Combined format: ["43 Winterberry Ln", "Florence", "MA", ...]
  return { street: parts[0], city: parts[1] ?? "" };
}

// ── component ─────────────────────────────────────────────────────────────────

export function AddressCard({ state, onDismiss, onSave, onRemove, isSaved }: AddressCardProps) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#4A90D9" size="small" />
        <Text style={styles.loadingText}>Looking up address...</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>{state.error}</Text>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { address } = state.result;
  const property = findProperty(address);
  const { street, city } = splitAddress(address);

  const handleHeartPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSaved) {
      onRemove?.(address);
    } else {
      onSave?.(state.result);
    }
  };

  return (
    <View style={styles.card}>

      {/* ── Address header — red background, matches Drive tab sign style ── */}
      <View style={styles.addressHeader}>
        <View style={styles.addressTextBlock}>
          <Text style={styles.streetText} numberOfLines={1} adjustsFontSizeToFit>
            {street}
          </Text>
          {city !== "" && (
            <Text style={styles.cityStateText} numberOfLines={1}>
              {city}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleHeartPress} style={styles.heartButton}>
          <Text style={styles.heartText}>{isSaved ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Property stats ── */}
      {property !== null && (
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{fmtBedBath(property)}</Text>
          <Text style={styles.statDivider}>·</Text>
          <Text style={styles.statText}>{fmtSqft(property)}</Text>
          <Text style={styles.statDivider}>·</Text>
          <Text style={styles.statValue}>{fmtValue(property.estimatedValue)}</Text>
        </View>
      )}

      {/* ── Listing links ── */}
      <Text style={styles.viewOnLabel}>View listing on:</Text>
      <View style={styles.platformRow}>
        {PLATFORMS.map((platform) => (
          <TouchableOpacity
            key={platform.name}
            style={[styles.platformButton, { backgroundColor: platform.color }]}
            onPress={() => openPlatform(platform, address)}
          >
            <Text style={styles.platformText}>{platform.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    alignItems: "center",
    gap: 10,
    paddingBottom: 14,
  },
  // ── address header ──
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d62828",
    alignSelf: "stretch",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  addressTextBlock: {
    flex: 1,
  },
  streetText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cityStateText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 1,
  },
  heartButton: {
    padding: 4,
  },
  heartText: {
    fontSize: 24,
    color: "#fff",
  },
  // ── stats row ──
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 2,
  },
  statText: {
    color: "#fff",
    fontSize: 14,
  },
  statDivider: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
  statValue: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "700",
  },
  // ── links ──
  loadingText: {
    color: "#ccc",
    fontSize: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    padding: 14,
  },
  viewOnLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  platformRow: {
    flexDirection: "row",
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  platformText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  dismissButton: {
    paddingVertical: 4,
  },
  dismissText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
  },
});
