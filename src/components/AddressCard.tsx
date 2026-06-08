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
  isSaved?: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Normalize an address string for loose matching (lowercase, strip zip, collapse spaces). */
function normalizeAddr(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\d{5}(-\d{4})?\b/g, "") // strip zip codes
    .replace(/[,\s]+/g, " ")
    .trim();
}

function findProperty(geocodedAddress: string): NeighborhoodProperty | null {
  const needle = normalizeAddr(geocodedAddress);
  return (
    NEIGHBORHOOD_PROPERTIES.find((p) =>
      needle.startsWith(normalizeAddr(p.fullAddress))
    ) ?? null
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

/** Split a full address string into street line and city/state line. */
function splitAddress(address: string): { street: string; cityState: string } {
  const commaIdx = address.indexOf(",");
  if (commaIdx === -1) return { street: address, cityState: "" };
  const street = address.slice(0, commaIdx).trim();
  // Take up to the next two comma-separated parts (city, state) — drop zip
  const rest = address
    .slice(commaIdx + 1)
    .split(",")
    .slice(0, 2)
    .map((s) => s.trim())
    .join(", ");
  return { street, cityState: rest };
}

// ── component ─────────────────────────────────────────────────────────────────

export function AddressCard({ state, onDismiss, onSave, isSaved }: AddressCardProps) {
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
  const { street, cityState } = splitAddress(address);

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave?.(state.result);
  };

  return (
    <View style={styles.card}>

      {/* ── Address header — red background, matches Drive tab sign style ── */}
      <View style={styles.addressHeader}>
        <View style={styles.addressTextBlock}>
          <Text style={styles.streetText} numberOfLines={1} adjustsFontSizeToFit>
            {street}
          </Text>
          {cityState !== "" && (
            <Text style={styles.cityStateText} numberOfLines={1}>
              {cityState}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.heartButton}>
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
