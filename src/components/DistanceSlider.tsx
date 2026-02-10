import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { MIN_DISTANCE, MAX_DISTANCE } from "../constants";

interface DistanceSliderProps {
  distance: number;
  onDistanceChange: (value: number) => void;
}

export function DistanceSlider({
  distance,
  onDistanceChange,
}: DistanceSliderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Distance: {Math.round(distance)}m</Text>
      <Slider
        style={styles.slider}
        minimumValue={MIN_DISTANCE}
        maximumValue={MAX_DISTANCE}
        step={1}
        value={distance}
        onValueChange={onDistanceChange}
        minimumTrackTintColor="#4A90D9"
        maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
        thumbTintColor="#fff"
      />
      <View style={styles.labels}>
        <Text style={styles.rangeLabel}>{MIN_DISTANCE}m</Text>
        <Text style={styles.rangeLabel}>{MAX_DISTANCE}m</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    width: "100%",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  rangeLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
});
