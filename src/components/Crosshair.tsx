import React from "react";
import { View, StyleSheet } from "react-native";

export function Crosshair() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.horizontal} />
      <View style={styles.vertical} />
      <View style={styles.centerDot} />
    </View>
  );
}

const CROSSHAIR_SIZE = 40;
const LINE_THICKNESS = 2;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontal: {
    position: "absolute",
    width: CROSSHAIR_SIZE,
    height: LINE_THICKNESS,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 1,
  },
  vertical: {
    position: "absolute",
    width: LINE_THICKNESS,
    height: CROSSHAIR_SIZE,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 1,
  },
  centerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
});
