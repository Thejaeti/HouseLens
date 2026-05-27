import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { SavedHouse } from "../hooks/useSavedHouses";
import { useLocation } from "../hooks/useLocation";
import { Coords } from "../types";

interface MapScreenProps {
  savedHouses: SavedHouse[];
  focusHouse?: SavedHouse | null;
}

function buildMapHtml(
  houses: SavedHouse[],
  initialUser: Coords | null,
  focus?: SavedHouse | null
): string {
  const centerTarget = focus ?? (houses.length > 0 ? houses[0] : null);
  const centerLat = centerTarget
    ? centerTarget.targetCoords.lat
    : (initialUser?.lat ?? 37.7749);
  const centerLon = centerTarget
    ? centerTarget.targetCoords.lon
    : (initialUser?.lon ?? -122.4194);
  const zoom = focus ? 17 : 15;

  const houseIcon = `L.divIcon({
    className: '',
    html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 42" width="24" height="36"><path d="M12 0 C5.4 0 0 5.4 0 12 C0 21 12 36 12 36 C12 36 24 21 24 12 C24 5.4 18.6 0 12 0 Z" fill="#d62828" stroke="#a01e1e" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })`;

  const markers = houses
    .map(
      (h) =>
        `L.marker([${h.targetCoords.lat}, ${h.targetCoords.lon}], { icon: ${houseIcon} })
          .addTo(map)
          .bindPopup(\`<b>${h.address.replace(/`/g, "'").replace(/\\/g, "\\\\")}</b>\`);`
    )
    .join("\n");

  const userInit = initialUser
    ? `
      window.userMarker = L.circleMarker([${initialUser.lat}, ${initialUser.lon}], {
        radius: 9,
        fillColor: "#4A90D9",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map);`
    : "";

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
        ${userInit}

        window.updateUserLocation = function(lat, lon) {
          if (window.userMarker) {
            window.userMarker.setLatLng([lat, lon]);
          } else {
            window.userMarker = L.circleMarker([lat, lon], {
              radius: 9,
              fillColor: "#4A90D9",
              color: "#fff",
              weight: 3,
              opacity: 1,
              fillOpacity: 1,
            }).addTo(map);
          }
        };
      </script>
    </body>
    </html>
  `;
}

export function MapScreen({ savedHouses, focusHouse }: MapScreenProps) {
  const { coords } = useLocation();
  const webViewRef = useRef<WebView>(null);
  const initialCoordsRef = useRef<Coords | null>(null);

  if (coords && !initialCoordsRef.current) {
    initialCoordsRef.current = coords;
  }

  useEffect(() => {
    if (!coords || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(
      `if (window.updateUserLocation) { window.updateUserLocation(${coords.lat}, ${coords.lon}); } true;`
    );
  }, [coords]);

  if (!coords && savedHouses.length === 0) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Waiting for GPS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        key={focusHouse?.id ?? "all"}
        source={{
          html: buildMapHtml(savedHouses, initialCoordsRef.current, focusHouse),
        }}
        scrollEnabled={false}
        javaScriptEnabled
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
  loading: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
});
