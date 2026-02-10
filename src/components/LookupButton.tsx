import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

interface LookupButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}

export function LookupButton({ onPress, disabled, loading }: LookupButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{loading ? "..." : "Identify"}</Text>
    </TouchableOpacity>
  );
}

const BUTTON_SIZE = 72;

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#4A90D9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
