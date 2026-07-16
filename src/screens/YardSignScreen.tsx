import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { CameraView } from "expo-camera";
import { useLocation } from "../hooks/useLocation";
import { useCompassHeading } from "../hooks/useCompassHeading";
import { useDevicePitch } from "../hooks/useDevicePitch";
import { ARYardSignOverlay } from "../components/ARYardSignOverlay";
import { NEIGHBORHOOD_PROPERTIES } from "../data/neighborhoodProperties";

export function YardSignScreen() {
  const { coords } = useLocation();
  const { heading } = useCompassHeading();
  const pitch = useDevicePitch();

  const ready = coords !== null && heading !== null;

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />

      {ready && (
        <ARYardSignOverlay
          userCoords={coords!}
          heading={heading!}
          pitch={pitch}
          properties={NEIGHBORHOOD_PROPERTIES}
        />
      )}

      {!ready && (
        <View style={styles.waitingBadge}>
          <Text style={styles.waitingText}>Waiting for GPS & compass…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  waitingBadge: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  waitingText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
