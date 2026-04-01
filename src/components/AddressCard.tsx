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

interface AddressCardProps {
  state: LookupState;
  onDismiss: () => void;
  onSave?: (result: LookupResult) => void;
  isSaved?: boolean;
}

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

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave?.(state.result);
  };

  return (
    <View style={styles.card}>
      <View style={styles.addressRow}>
        <Text style={styles.address} numberOfLines={3}>
          {address}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.heartButton}>
          <Text style={styles.heartText}>{isSaved ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    marginHorizontal: 20,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#ccc",
    fontSize: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  address: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  heartButton: {
    padding: 4,
  },
  heartText: {
    fontSize: 24,
    color: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
  },
  viewOnLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
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
