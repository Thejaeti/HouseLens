import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

interface LookupButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
  autoProgress?: number; // 0 to 1
}

export function LookupButton({
  onPress,
  disabled,
  loading,
  autoProgress = 0,
}: LookupButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.wrapper}>
      {/* Progress ring background */}
      {autoProgress > 0 && (
        <View style={styles.progressRing}>
          <View
            style={[
              styles.progressFill,
              {
                opacity: 0.4 + autoProgress * 0.6,
                transform: [{ scale: 0.3 + autoProgress * 0.7 }],
              },
            ]}
          />
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        <Text style={styles.text}>{loading ? "..." : "Identify"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const BUTTON_SIZE = 72;
const RING_SIZE = 88;

const styles = StyleSheet.create({
  wrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  progressFill: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: "rgba(74, 144, 217, 0.5)",
  },
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
