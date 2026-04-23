import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useLocation } from "../hooks/useLocation";
import { useCompassHeading } from "../hooks/useCompassHeading";
import { Coords } from "../types";
import {
  MockListing,
  formatPriceShort,
  fetchNearbyListings,
} from "../data/mockListings";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";

function buildMapHtml(listings: MockListing[], initial: Coords): string {
  const listingsJson = JSON.stringify(
    listings.map((l) => ({
      lat: l.coords.lat,
      lon: l.coords.lon,
      address: l.address,
      price: l.price,
      priceShort: formatPriceShort(l.price),
      beds: l.beds,
      baths: l.baths,
      sqft: l.sqft,
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    html, body, #map { height: 100%; width: 100%; }
    .maplibregl-ctrl-attrib { font-size: 8px; opacity: 0.6; }
    .sign {
      background: #fff;
      border: 2px solid #222;
      border-radius: 3px;
      width: 70px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      overflow: hidden;
      box-shadow: 0 3px 6px rgba(0,0,0,0.5);
      position: relative;
      cursor: pointer;
    }
    .sign::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 10px;
      background: #444;
    }
    .sign-header {
      background: #d62828;
      color: #fff;
      text-align: center;
      padding: 2px 0;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.6px;
    }
    .sign-price {
      color: #111;
      text-align: center;
      padding: 4px 0;
      font-size: 13px;
      font-weight: 800;
    }
    .user-dot-wrap {
      position: relative;
      width: 36px;
      height: 36px;
    }
    .user-dot {
      position: absolute;
      top: 9px; left: 9px;
      width: 18px;
      height: 18px;
      background: #4A90D9;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(74,144,217,0.25), 0 2px 6px rgba(0,0,0,0.4);
    }
    .maplibregl-popup-content {
      padding: 10px 12px;
      font-family: -apple-system, system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function sendMsg(platform, address) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'openPlatform', platform: platform, address: address }));
    }

    const listings = ${listingsJson};

    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [${initial.lon}, ${initial.lat}],
      zoom: 17.5,
      pitch: 60,
      bearing: 0,
      attributionControl: { compact: true },
    });

    map.on('load', function() {
      const userEl = document.createElement('div');
      userEl.className = 'user-dot-wrap';
      userEl.innerHTML = '<div class="user-dot"></div>';
      window.userMarker = new maplibregl.Marker({ element: userEl })
        .setLngLat([${initial.lon}, ${initial.lat}])
        .addTo(map);

      listings.forEach(function(l) {
        const el = document.createElement('div');
        el.className = 'sign';
        el.innerHTML = '<div class="sign-header">FOR SALE</div><div class="sign-price">' + l.priceShort + '</div>';

        const addrJs = l.address.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'");
        const popupHtml =
          '<div style="min-width: 190px;">' +
            '<div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">' + l.address + '</div>' +
            '<div style="font-size: 14px; color: #222; font-weight: 600; margin-bottom: 2px;">$' + l.price.toLocaleString() + '</div>' +
            '<div style="font-size: 11px; color: #666; margin-bottom: 10px;">' + l.beds + ' bd · ' + l.baths + ' ba · ' + l.sqft.toLocaleString() + ' sqft</div>' +
            '<div style="display: flex; gap: 4px;">' +
              '<button onclick="sendMsg(\\'Zillow\\', \\'' + addrJs + '\\')" style="flex:1; background:#006AFF; color:#fff; border:none; border-radius:6px; padding:6px 4px; font-size:10px; font-weight:700;">Zillow</button>' +
              '<button onclick="sendMsg(\\'Redfin\\', \\'' + addrJs + '\\')" style="flex:1; background:#A02021; color:#fff; border:none; border-radius:6px; padding:6px 4px; font-size:10px; font-weight:700;">Redfin</button>' +
              '<button onclick="sendMsg(\\'Realtor.com\\', \\'' + addrJs + '\\')" style="flex:1; background:#D92228; color:#fff; border:none; border-radius:6px; padding:6px 4px; font-size:10px; font-weight:700;">Realtor</button>' +
            '</div>' +
          '</div>';

        new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([l.lon, l.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml))
          .addTo(map);
      });
    });

    window.followUser = function(lat, lon, bearing) {
      map.easeTo({
        center: [lon, lat],
        bearing: bearing,
        duration: 400,
      });
    };
  </script>
</body>
</html>`;
}

export function DriveScreen() {
  const { coords } = useLocation();
  const { heading } = useCompassHeading();
  const [listings, setListings] = useState<MockListing[] | null>(null);
  const initialCoordsRef = useRef<Coords | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (coords && !listings && !initialCoordsRef.current) {
      initialCoordsRef.current = coords;
      fetchNearbyListings(coords, 15).then(setListings);
    }
  }, [coords, listings]);

  useEffect(() => {
    if (!coords || !listings || !webViewRef.current) return;
    const bearing = heading ?? 0;
    webViewRef.current.injectJavaScript(`
      if (window.followUser) { window.followUser(${coords.lat}, ${coords.lon}, ${bearing}); }
      true;
    `);
  }, [coords, heading, listings]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "openPlatform" && data.platform && data.address) {
        const platform = PLATFORMS.find((p) => p.name === data.platform);
        if (platform) openPlatform(platform, data.address);
      }
    } catch {
      // ignore malformed messages
    }
  };

  if (!coords || !listings || !initialCoordsRef.current) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Finding addresses near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: buildMapHtml(listings, initialCoordsRef.current) }}
        onMessage={handleMessage}
        scrollEnabled={false}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
      />
      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.bannerText}>Demo listings · not real homes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { fontSize: 16, color: "#666" },
  banner: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bannerText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});
