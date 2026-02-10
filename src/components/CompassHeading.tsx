import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CompassHeadingProps {
  heading: number | null;
}

function getCardinalDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function CompassHeading({ heading }: CompassHeadingProps) {
  if (heading === null) {
    return (
      <View style={styles.pill}>
        <Text style={styles.text}>Calibrating...</Text>
      </View>
    );
  }

  const cardinal = getCardinalDirection(heading);
  const rounded = Math.round(heading);

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>
        {cardinal} {rounded}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
