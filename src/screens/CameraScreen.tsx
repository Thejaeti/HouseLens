import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";
import { DEFAULT_DISTANCE } from "../constants";
import { useLocation } from "../hooks/useLocation";
import { useCompassHeading } from "../hooks/useCompassHeading";
import { useHouseLookup } from "../hooks/useHouseLookup";
import { Crosshair } from "../components/Crosshair";
import { CompassHeading } from "../components/CompassHeading";
import { DistanceSlider } from "../components/DistanceSlider";
import { LookupButton } from "../components/LookupButton";
import { AddressCard } from "../components/AddressCard";

export function CameraScreen() {
  const [distance, setDistance] = useState(DEFAULT_DISTANCE);
  const { coords } = useLocation();
  const { heading } = useCompassHeading();
  const { state, lookup, reset } = useHouseLookup();

  const canLookup = coords !== null && heading !== null;

  const handleLookup = async () => {
    if (!coords || heading === null) return;
    await lookup(coords, heading, distance);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlay}>
          {/* Crosshair in center */}
          <Crosshair />

          {/* Compass heading at top */}
          <View style={styles.topSection}>
            <CompassHeading heading={heading} />
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomSection}>
            {/* Address card (shown after lookup) */}
            <AddressCard state={state} onDismiss={reset} />

            {/* Distance slider */}
            <DistanceSlider distance={distance} onDistanceChange={setDistance} />

            {/* Identify button */}
            <View style={styles.buttonRow}>
              <LookupButton
                onPress={handleLookup}
                disabled={!canLookup}
                loading={state.status === "loading"}
              />
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topSection: {
    paddingTop: 60,
    alignItems: "center",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    gap: 16,
  },
  buttonRow: {
    alignItems: "center",
    paddingTop: 8,
  },
});
