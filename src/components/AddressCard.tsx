import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LookupState } from "../types";
import { openZillow } from "../utils/zillowUrl";

interface AddressCardProps {
  state: LookupState;
  onDismiss: () => void;
}

export function AddressCard({ state, onDismiss }: AddressCardProps) {
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

  return (
    <View style={styles.card}>
      <Text style={styles.address} numberOfLines={3}>
        {address}
      </Text>
      <TouchableOpacity
        style={styles.zillowButton}
        onPress={() => openZillow(address)}
      >
        <Text style={styles.zillowText}>View on Zillow</Text>
      </TouchableOpacity>
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
  address: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
  },
  zillowButton: {
    backgroundColor: "#4A90D9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  zillowText: {
    color: "#fff",
    fontSize: 16,
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
