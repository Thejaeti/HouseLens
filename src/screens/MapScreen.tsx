import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Linking from "expo-linking";
import { SavedHouse } from "../hooks/useSavedHouses";
import { useLocation } from "../hooks/useLocation";
import { Coords } from "../types";
import {
  NEIGHBORHOOD_PROPERTIES,
  NeighborhoodProperty,
} from "../data/neighborhoodProperties";
import { PLATFORMS } from "../utils/listingUrls";

interface MapScreenProps {
  savedHouses: SavedHouse[];
  focusHouse?: SavedHouse | null;
}

// ── helpers (same as AddressCard / AROverlay) ─────────────────────────────────

function normalizeAddr(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\d{5}(-\d{4})?\b/g, "")
    .replace(/[,\s]+/g, " ")
    .trim();
}

function findProperty(address: string): NeighborhoodProperty | null {
  const tokens = normalizeAddr(address).split(" ");
  const houseNum = tokens[0];
  const streetWord = tokens[1] ?? "";
  if (!houseNum || !streetWord) return null;
  return (
    NEIGHBORHOOD_PROPERTIES.find((p) => {
      const pt = normalizeAddr(p.fullAddress).split(" ");
      return pt[0] === houseNum && (pt[1] ?? "").startsWith(streetWord.slice(0, 5));
    }) ?? null
  );
}

function splitAddress(address: string): { street: string; city: string } {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return { street: address, city: "" };
  const firstIsNumOnly = /^\d+$/.test(parts[0]);
  if (firstIsNumOnly && parts.length >= 2) {
    return { street: `${parts[0]} ${parts[1]}`, city: parts[2] ?? "" };
  }
  return { street: parts[0], city: parts[1] ?? "" };
}

function fmtBedBath(p: NeighborhoodProperty): string {
  const parts: string[] = [];
  if (p.beds !== null) parts.push(`${p.beds} bd`);
  if (p.baths !== null) parts.push(`${p.baths} ba`);
  return parts.length > 0 ? parts.join(" · ") : "";
}

function fmtSqft(p: NeighborhoodProperty): string {
  return p.sqft !== null ? `${p.sqft.toLocaleString()} sqft` : "";
}

function fmtValue(v: number | null): string {
  if (v === null) return "";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(v / 1000)}K`;
}

// ── per-house card data injected into WebView ─────────────────────────────────

interface HouseCardData {
  id: string;
  lat: number;
  lon: number;
  street: string;
  city: string;
  bedBath: string;
  sqft: string;
  value: string;
  platforms: { name: string; color: string; url: string }[];
}

function buildCardData(houses: SavedHouse[]): HouseCardData[] {
  return houses.map((h) => {
    const { street, city } = splitAddress(h.address);
    const prop = findProperty(h.address);
    const bedBath = prop ? fmtBedBath(prop) : "";
    const sqft   = prop ? fmtSqft(prop) : "";
    const value  = prop ? fmtValue(prop.estimatedValue) : "";
    const platforms = PLATFORMS.map((p) => ({
      name: p.name,
      color: p.color,
      url: p.buildUrl(h.address),
    }));
    return {
      id: h.id,
      lat: h.targetCoords.lat,
      lon: h.targetCoords.lon,
      street,
      city,
      bedBath,
      sqft,
      value,
      platforms,
    };
  });
}

// ── HTML builder ──────────────────────────────────────────────────────────────

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

  const cardData = buildCardData(houses);
  const cardDataJson = JSON.stringify(cardData);

  const userInit = initialUser
    ? `window.userMarker = L.circleMarker([${initialUser.lat}, ${initialUser.lon}], {
        radius: 9, fillColor: "#4A90D9", color: "#fff",
        weight: 3, opacity: 1, fillOpacity: 1,
      }).addTo(map);`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100vw; height: 100vh; }

    /* ── strip Leaflet's default popup chrome ── */
    .leaflet-popup-content-wrapper {
      padding: 0;
      border-radius: 16px;
      overflow: hidden;
      background: transparent;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .leaflet-popup-content { margin: 0; width: auto !important; }
    .leaflet-popup-close-button {
      color: rgba(255,255,255,0.8) !important;
      top: 6px !important; right: 8px !important;
      font-size: 20px !important; font-weight: 400 !important;
      line-height: 1 !important;
    }
    .leaflet-popup-tip { background: #d62828; }

    /* ── card — matches camera tab AddressCard ── */
    .hl-card { width: 280px; font-family: -apple-system, sans-serif; background: rgba(0,0,0,0.75); }
    .hl-header {
      background: #d62828;
      padding: 10px 32px 10px 14px; /* right room for X button */
      display: flex; align-items: center; gap: 8px;
    }
    .hl-addr-block { flex: 1; min-width: 0; }
    .hl-street { color: #fff; font-size: 17px; font-weight: 700; line-height: 1.2;
                 white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hl-city   { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 2px; }
    .hl-body   { padding: 10px 14px 14px; display: flex; flex-direction: column; gap: 10px; }
    .hl-stats  {
      display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
      font-size: 14px;
    }
    .hl-stat-text { color: #fff; }
    .hl-stat-div  { color: rgba(255,255,255,0.4); }
    .hl-value     { color: #ff6b6b; font-weight: 700; }
    .hl-view-label {
      color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .hl-btns { display: flex; gap: 8px; }
    .hl-btn {
      padding: 10px 14px; border-radius: 20px; border: none;
      color: #fff; font-size: 13px; font-weight: 700;
      cursor: pointer; white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${centerLat}, ${centerLon}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var houseIcon = L.divIcon({
      className: '',
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 42" width="24" height="36"><path d="M12 0 C5.4 0 0 5.4 0 12 C0 21 12 36 12 36 C12 36 24 21 24 12 C24 5.4 18.6 0 12 0 Z" fill="#d62828" stroke="#a01e1e" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>',
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -38],
    });

    function openUrl(url) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'openUrl', url: url }));
    }

    function buildPopupHtml(d) {
      var statsHtml = '';
      var parts = [];
      if (d.bedBath) parts.push('<span class="hl-stat-text">' + d.bedBath + '</span>');
      if (d.sqft)   parts.push('<span class="hl-stat-text">' + d.sqft + '</span>');
      if (d.value)  parts.push('<span class="hl-value">' + d.value + '</span>');
      if (parts.length > 0) {
        statsHtml = '<div class="hl-stats">' +
          parts.join('<span class="hl-stat-div"> · </span>') +
          '</div>';
      }

      var btnsHtml = d.platforms.map(function(p) {
        return '<button class="hl-btn" style="background:' + p.color + '" ' +
               'onclick="openUrl(' + JSON.stringify(p.url) + ')">' + p.name + '</button>';
      }).join('');

      return '<div class="hl-card">' +
        '<div class="hl-header">' +
          '<div class="hl-addr-block">' +
            '<div class="hl-street">' + d.street + '</div>' +
            (d.city ? '<div class="hl-city">' + d.city + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="hl-body">' +
          statsHtml +
          '<div class="hl-view-label">View listing on:</div>' +
          '<div class="hl-btns">' + btnsHtml + '</div>' +
        '</div>' +
      '</div>';
    }

    var cardData = ${cardDataJson};
    cardData.forEach(function(d) {
      L.marker([d.lat, d.lon], { icon: houseIcon })
        .addTo(map)
        .bindPopup(buildPopupHtml(d), { maxWidth: 320, minWidth: 280 });
    });

    ${userInit}

    window.updateUserLocation = function(lat, lon) {
      if (window.userMarker) {
        window.userMarker.setLatLng([lat, lon]);
      } else {
        window.userMarker = L.circleMarker([lat, lon], {
          radius: 9, fillColor: "#4A90D9", color: "#fff",
          weight: 3, opacity: 1, fillOpacity: 1,
        }).addTo(map);
      }
    };
  </script>
</body>
</html>`;
}

// ── screen component ──────────────────────────────────────────────────────────

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

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "openUrl" && msg.url) {
        Linking.openURL(msg.url);
      }
    } catch {
      // ignore malformed messages
    }
  };

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
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { fontSize: 16, color: "#999" },
});
