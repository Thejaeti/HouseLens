import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SavedHouse } from "../hooks/useSavedHouses";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";
import {
  NEIGHBORHOOD_PROPERTIES,
  NeighborhoodProperty,
} from "../data/neighborhoodProperties";

interface SavedHousesScreenProps {
  savedHouses: SavedHouse[];
  onRemove: (address: string) => void;
  onShowOnMap?: (house: SavedHouse) => void;
}

// ── helpers (shared logic with AddressCard) ───────────────────────────────────

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
  if (firstIsNumOnly && parts.length >= 3) {
    return { street: `${parts[0]} ${parts[1]}`, city: parts[2] };
  }
  return { street: parts[0], city: parts[1] ?? "" };
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── card component ────────────────────────────────────────────────────────────

function HouseCard({
  house,
  onRemove,
  onShowOnMap,
}: {
  house: SavedHouse;
  onRemove: () => void;
  onShowOnMap?: () => void;
}) {
  const property = findProperty(house.address);
  const { street, city } = splitAddress(house.address);

  return (
    <TouchableOpacity style={styles.card} onPress={onShowOnMap} activeOpacity={0.7}>

      {/* ── Red address header ── */}
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
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* ── Property stats ── */}
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

        <Text style={styles.date}>Saved {formatDate(house.savedAt)}</Text>

        {/* ── Listing links ── */}
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
    </TouchableOpacity>
  );
}

// ── screen ────────────────────────────────────────────────────────────────────

export function SavedHousesScreen({
  savedHouses,
  onRemove,
  onShowOnMap,
}: SavedHousesScreenProps) {
  if (savedHouses.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>♡</Text>
        <Text style={styles.emptyTitle}>No saved houses yet</Text>
        <Text style={styles.emptySubtitle}>
          Point your camera at a house and tap the heart to save it here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedHouses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <HouseCard
            house={item}
            onRemove={() => onRemove(item.address)}
            onShowOnMap={() => onShowOnMap?.(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  // ── card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
  },
  // ── address header ──
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d62828",
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
  cityText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 1,
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  removeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  // ── card body ──
  cardBody: {
    padding: 14,
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#333",
  },
  statDivider: {
    fontSize: 14,
    color: "#bbb",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#d62828",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  // ── platform buttons ──
  platformRow: {
    flexDirection: "row",
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  platformText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  // ── empty state ──
  empty: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    color: "#ccc",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
