import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  requestAllPermissions,
  PermissionResult,
} from "./src/utils/permissions";
import { CameraScreen } from "./src/screens/CameraScreen";

type AppState = "loading" | "granted" | "denied";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [permResult, setPermResult] = useState<PermissionResult | null>(null);

  useEffect(() => {
    (async () => {
      const result = await requestAllPermissions();
      setPermResult(result);
      setAppState(result.camera && result.location ? "granted" : "denied");
    })();
  }, []);

  const retryPermissions = async () => {
    setAppState("loading");
    const result = await requestAllPermissions();
    setPermResult(result);
    setAppState(result.camera && result.location ? "granted" : "denied");
  };

  if (appState === "loading") {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Requesting permissions...</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (appState === "denied") {
    const missing: string[] = [];
    if (permResult && !permResult.camera) missing.push("Camera");
    if (permResult && !permResult.location) missing.push("Location");

    return (
      <View style={styles.center}>
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.message}>
          HouseLens needs {missing.join(" and ")} access to work. Please grant
          permissions in Settings.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryPermissions}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <CameraScreen />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#4A90D9",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
