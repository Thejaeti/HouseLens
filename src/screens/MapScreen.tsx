import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { SavedHouse } from "../hooks/useSavedHouses";

interface MapScreenProps {
  savedHouses: SavedHouse[];
  focusHouse?: SavedHouse | null;
}

function buildMapHtml(houses: SavedHouse[], focus?: SavedHouse | null): string {
  const center = focus || houses[0];
  const centerLat = center.targetCoords.lat;
  const centerLon = center.targetCoords.lon;
  const zoom = focus ? 17 : 15;

  const markers = houses
    .map(
      (h) =>
        `L.marker([${h.targetCoords.lat}, ${h.targetCoords.lon}])
          .addTo(map)
          .bindPopup(\`<b>${h.address.replace(/`/g, "'").replace(/\\/g, "\\\\")}</b>\`);`
    )
    .join("\n");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${centerLat}, ${centerLon}], ${zoom});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        ${markers}
      </script>
    </body>
    </html>
  `;
}

export function MapScreen({ savedHouses, focusHouse }: MapScreenProps) {
  if (savedHouses.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🗺</Text>
        <Text style={styles.emptyTitle}>No pins yet</Text>
        <Text style={styles.emptySubtitle}>
          Save houses from the Camera tab and they'll appear as pins here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        key={focusHouse?.id || "all"}
        source={{ html: buildMapHtml(savedHouses, focusHouse) }}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  empty: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
