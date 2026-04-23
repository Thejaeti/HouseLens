import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SavedHouse } from "./src/hooks/useSavedHouses";
import {
  requestAllPermissions,
  PermissionResult,
} from "./src/utils/permissions";
import { CameraScreen } from "./src/screens/CameraScreen";
import { SavedHousesScreen } from "./src/screens/SavedHousesScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { DriveScreen } from "./src/screens/DriveScreen";
import { useSavedHouses } from "./src/hooks/useSavedHouses";

type AppState = "loading" | "granted" | "denied";

const Tab = createBottomTabNavigator();

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [permResult, setPermResult] = useState<PermissionResult | null>(null);
  const { savedHouses, saveHouse, removeHouse, isSaved } = useSavedHouses();
  const [focusHouse, setFocusHouse] = useState<SavedHouse | null>(null);
  const navigationRef = useRef<any>(null);

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
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#4A90D9",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#e0e0e0",
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Camera"
          options={{
            tabBarLabel: "Camera",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📷</Text>
            ),
          }}
        >
          {() => (
            <>
              <CameraScreen
                onSave={saveHouse}
                isSaved={isSaved}
                savedHouses={savedHouses}
              />
              <StatusBar style="light" />
            </>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Saved"
          options={{
            tabBarLabel: "Saved",
            tabBarBadge: savedHouses.length > 0 ? savedHouses.length : undefined,
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>♥</Text>
            ),
            headerShown: true,
            headerTitle: "Saved Houses",
          }}
        >
          {() => (
            <SavedHousesScreen
              savedHouses={savedHouses}
              onRemove={removeHouse}
              onShowOnMap={(house) => {
                setFocusHouse(house);
                navigationRef.current?.navigate("Map");
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Map"
          options={{
            tabBarLabel: "Map",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🗺</Text>
            ),
            headerShown: true,
            headerTitle: "Saved Houses Map",
          }}
        >
          {() => (
            <MapScreen savedHouses={savedHouses} focusHouse={focusHouse} />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Drive"
          options={{
            tabBarLabel: "Drive",
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🚗</Text>
            ),
            headerShown: true,
            headerTitle: "For Sale Nearby",
          }}
          component={DriveScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
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
