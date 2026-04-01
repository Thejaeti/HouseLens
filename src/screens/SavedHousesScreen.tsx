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

interface SavedHousesScreenProps {
  savedHouses: SavedHouse[];
  onRemove: (address: string) => void;
  onShowOnMap?: (house: SavedHouse) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function HouseCard({
  house,
  onRemove,
  onShowOnMap,
}: {
  house: SavedHouse;
  onRemove: () => void;
  onShowOnMap?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onShowOnMap} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.address} numberOfLines={2}>
          {house.address}
        </Text>
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.date}>Saved {formatDate(house.savedAt)}</Text>
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
    </TouchableOpacity>
  );
}

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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  address: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    lineHeight: 22,
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    color: "#999",
    fontSize: 13,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    marginBottom: 12,
  },
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
