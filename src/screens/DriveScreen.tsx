import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useLocation } from "../hooks/useLocation";
import { useCompassHeading } from "../hooks/useCompassHeading";
import { Coords } from "../types";
import {
  NEIGHBORHOOD_PROPERTIES,
  NeighborhoodProperty,
} from "../data/neighborhoodProperties";
import { PLATFORMS, openPlatform } from "../utils/listingUrls";

const NEIGHBORHOOD_CENTER: Coords = { lat: 42.3070, lon: -72.6844 };
const SIGN_SETBACK_M = 7.62; // 25 feet

// ── Geo helpers ──────────────────────────────────────────────────────────────

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Project point p onto segment a→b using a local flat-earth approximation.
 * Returns the closest point on the segment to p.
 */
function projectOntoSegment(p: Coords, a: Coords, b: Coords): Coords {
  const latMPD = 111_111;
  const lonMPD = 111_111 * Math.cos((p.lat * Math.PI) / 180);
  // Local XY with p at origin
  const ax = (a.lon - p.lon) * lonMPD;
  const ay = (a.lat - p.lat) * latMPD;
  const bx = (b.lon - p.lon) * lonMPD;
  const by = (b.lat - p.lat) * latMPD;
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return a;
  // t = dot(p - a, b - a) / |b - a|² — p is at origin so p - a = -a
  let t = ((-ax) * dx + (-ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return {
    lat: p.lat + (ay + t * dy) / latMPD,
    lon: p.lon + (ax + t * dx) / lonMPD,
  };
}

/**
 * Returns the ideal yard-sign position for a property:
 *   - snap the building centroid to the nearest point on the street polyline
 *   - step SIGN_SETBACK_M meters from the street toward the building
 */
function signCoords(property: NeighborhoodProperty): Coords {
  const building = property.coords;
  const nodes = property.streetNodes;

  let best: { point: Coords; dist: number } | null = null;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a: Coords = { lat: nodes[i][0], lon: nodes[i][1] };
    const b: Coords = { lat: nodes[i + 1][0], lon: nodes[i + 1][1] };
    const pt = projectOntoSegment(building, a, b);
    const d = haversineMeters(building, pt);
    if (!best || d < best.dist) best = { point: pt, dist: d };
  }

  if (!best) return building;

  const streetPt = best.point;
  const totalDist = best.dist;
  if (totalDist <= SIGN_SETBACK_M) return streetPt;

  // Interpolate SIGN_SETBACK_M meters from street toward building centroid.
  const f = SIGN_SETBACK_M / totalDist;
  return {
    lat: streetPt.lat + f * (building.lat - streetPt.lat),
    lon: streetPt.lon + f * (building.lon - streetPt.lon),
  };
}

// ── Formatting ───────────────────────────────────────────────────────────────

function fmtBedBath(p: NeighborhoodProperty): string {
  const parts: string[] = [];
  if (p.beds !== null) parts.push(`${p.beds} bd`);
  if (p.baths !== null) parts.push(`${p.baths} ba`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function fmtSqft(p: NeighborhoodProperty): string {
  return p.sqft !== null ? `${p.sqft.toLocaleString()} sqft` : "—";
}

function fmtValue(v: number | null): string {
  if (v === null) return "$$$";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(v / 1000)}K`;
}

function fmtDetail(p: NeighborhoodProperty): string {
  const parts: string[] = [];
  if (p.beds !== null) parts.push(`${p.beds} bd`);
  if (p.baths !== null) parts.push(`${p.baths} ba`);
  if (p.sqft !== null) parts.push(`${p.sqft.toLocaleString()} sqft`);
  return parts.length > 0 ? parts.join(" · ") : "Details TBD";
}

// ── Map HTML ─────────────────────────────────────────────────────────────────

function buildMapHtml(
  properties: NeighborhoodProperty[],
  initial: Coords
): string {
  const propsJson = JSON.stringify(
    properties.map((p, i) => {
      const pos = signCoords(p);
      return {
        i,
        lat: pos.lat,
        lon: pos.lon,
        address: p.address,
        town: p.town,
        fullAddress: p.fullAddress,
        line1: fmtBedBath(p),
        line2: fmtSqft(p),
        line3: fmtValue(p.estimatedValue),
        detail: fmtDetail(p),
      };
    })
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"><\/script>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    html, body, #map { height: 100%; width: 100%; }
    .maplibregl-ctrl-attrib { font-size: 8px; opacity: 0.6; }
    .user-dot-wrap { position: relative; width: 36px; height: 36px; }
    .user-dot {
      position: absolute; top: 9px; left: 9px;
      width: 18px; height: 18px;
      background: #4A90D9; border: 3px solid #fff; border-radius: 50%;
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

    var properties = ${propsJson};

    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [${initial.lon}, ${initial.lat}],
      zoom: 17.5,
      pitch: 60,
      bearing: 0,
      attributionControl: { compact: true },
    });

    // ── Sign image factory ────────────────────────────────────────────────────
    // 4 : 3 sign panel (width : height).  Each sign is rasterised to an
    // ImageData object and registered in MapLibre's sprite atlas so the symbol
    // layer can render it directly on the GPU tile mesh.  ImageData (raw RGBA
    // bytes) is the most reliable format for map.addImage() inside WKWebView —
    // passing an HTMLCanvasElement directly can silently fail in some contexts.
    var DPR = Math.min(window.devicePixelRatio || 2, 3);
    // Logical pixel dimensions — panel is 4:3 (64 × 48), stake below.
    var SW = 64, SH_HEAD = 18, SH_BODY = 30, SH_STAKE = 6;
    var SH_PANEL = SH_HEAD + SH_BODY;          // 48  (= SW × 3/4)
    var SH = SH_PANEL + SH_STAKE;             // 54

    // Shrinks ctx.font until the text fits inside maxW, down to minSz pt.
    function fitText(ctx, text, maxW, maxSz, minSz, bold) {
      var sz = maxSz;
      ctx.font = (bold ? 'bold ' : '') + sz + 'px Arial, sans-serif';
      while (sz > minSz && ctx.measureText(text).width > maxW) {
        sz -= 0.5;
        ctx.font = (bold ? 'bold ' : '') + sz + 'px Arial, sans-serif';
      }
    }

    function makeSignImage(p) {
      var PW = Math.round(SW * DPR);
      var PH = Math.round(SH * DPR);
      var c = document.createElement('canvas');
      c.width = PW; c.height = PH;
      var ctx = c.getContext('2d');
      ctx.scale(DPR, DPR);

      // ── Panels ─────────────────────────────────────────────────────────────
      // Red header (top SH_HEAD px)
      ctx.fillStyle = '#d62828';
      ctx.fillRect(0, 0, SW, SH_HEAD);
      // White body (next SH_BODY px)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, SH_HEAD, SW, SH_BODY);
      // Border around the sign panel only (not the stake)
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, SW - 1, SH_PANEL - 1);
      // Stake post
      ctx.fillStyle = '#555555';
      ctx.fillRect(SW / 2 - 1, SH_PANEL, 2, SH_STAKE);

      // ── Text ───────────────────────────────────────────────────────────────
      var TW = SW - 6;      // max text width (3 px padding each side)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Red header: 2 equal zones of 9 px each
      ctx.fillStyle = '#ffffff';
      fitText(ctx, p.address, TW, 7, 4, true);
      ctx.fillText(p.address, SW / 2, 4.5);     // zone 1 centre
      fitText(ctx, p.town,    TW, 6, 4, false);
      ctx.fillText(p.town,    SW / 2, 13.5);    // zone 2 centre

      // White body: 3 equal zones of 10 px each
      var B0 = SH_HEAD;     // top of white body
      ctx.fillStyle = '#111111';
      // Line 1 — sqft  (p.line2)
      fitText(ctx, p.line2, TW, 7, 4, false);
      ctx.fillText(p.line2, SW / 2, B0 + 5);
      // Line 2 — beds / baths  (p.line1)
      fitText(ctx, p.line1, TW, 7, 4, false);
      ctx.fillText(p.line1, SW / 2, B0 + 15);
      // Line 3 — estimated value  (p.line3, in red)
      ctx.fillStyle = '#cc0000';
      fitText(ctx, p.line3, TW, 7, 4, true);
      ctx.fillText(p.line3, SW / 2, B0 + 25);

      // Return raw RGBA bytes — most reliable input for map.addImage()
      return ctx.getImageData(0, 0, PW, PH);
    }

    map.on('load', function() {

      // ── GPS blue dot (DOM marker, always at map center — inherently stable) ─
      var userEl = document.createElement('div');
      userEl.className = 'user-dot-wrap';
      userEl.innerHTML = '<div class="user-dot"></div>';
      window.userMarker = new maplibregl.Marker({ element: userEl })
        .setLngLat([${initial.lon}, ${initial.lat}])
        .addTo(map);

      // ── Property signs — GPU symbol layer ─────────────────────────────────
      // Build one canvas icon per property and register it with the map's
      // sprite atlas, then display everything through a single symbol layer.
      // Symbol layers are rendered on the GPU in the same pass as the base
      // tiles, so they cannot drift or jitter relative to the map.
      var features = [];
      properties.forEach(function(p) {
        var id = 'sign-' + p.i;
        map.addImage(id, makeSignImage(p), { pixelRatio: DPR });
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
          properties: {
            iconId: id,
            address: p.address,
            fullAddress: p.fullAddress,
            line1: p.line1,
            line2: p.line2,
            line3: p.line3,
            detail: p.detail,
          },
        });
      });

      map.addSource('signs', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: features },
      });

      map.addLayer({
        id: 'signs-layer',
        type: 'symbol',
        source: 'signs',
        layout: {
          'icon-image': ['get', 'iconId'],
          // anchor at bottom so the stake tip sits on the sign coordinate
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });

      // Tap a sign → popup (uses data-attributes + event delegation so no
      // inline onclick escaping is needed)
      map.on('click', 'signs-layer', function(e) {
        if (!e.features || !e.features.length) return;
        var p = e.features[0].properties;
        var coords = e.features[0].geometry.coordinates;
        var valueHtml = (p.line3 !== '$$$')
          ? '<div style="font-size:14px;color:#222;font-weight:600;margin-bottom:2px;">' + p.line3 + '</div>'
          : '';
        var html =
          '<div style="min-width:190px;">' +
          '<div style="font-weight:700;font-size:14px;margin-bottom:4px;">' + p.address + '</div>' +
          valueHtml +
          '<div style="font-size:11px;color:#666;margin-bottom:10px;">' + p.detail + '</div>' +
          '<div style="display:flex;gap:4px;">' +
          '<button class="pb" data-pl="Zillow" data-ad="' + p.fullAddress + '" style="flex:1;background:#006AFF;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:700;">Zillow</button>' +
          '<button class="pb" data-pl="Redfin" data-ad="' + p.fullAddress + '" style="flex:1;background:#A02021;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:700;">Redfin</button>' +
          '<button class="pb" data-pl="Realtor.com" data-ad="' + p.fullAddress + '" style="flex:1;background:#D92228;color:#fff;border:none;border-radius:6px;padding:6px 4px;font-size:10px;font-weight:700;">Realtor</button>' +
          '</div></div>';

        var popup = new maplibregl.Popup({ offset: [0, -(SH_HEAD + SH_BODY)] })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);

        setTimeout(function() {
          var el = popup.getElement();
          if (el) el.addEventListener('click', function(evt) {
            var btn = evt.target.closest('.pb');
            if (btn) sendMsg(btn.dataset.pl, btn.dataset.ad);
          });
        }, 0);
      });

      map.on('mouseenter', 'signs-layer', function() { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'signs-layer', function() { map.getCanvas().style.cursor = ''; });
    });

    // Pan + rotate the map to follow GPS position and compass heading.
    // Symbol-layer signs are GPU-rendered with the map tiles, so they stay
    // locked to their geographic coordinates even as the map rotates —
    // unlike the old DOM markers which orbited the screen centre.
    window.followUser = function(lat, lon, bearing) {
      map.easeTo({ center: [lon, lat], bearing: bearing, duration: 400 });
      if (window.userMarker) window.userMarker.setLngLat([lon, lat]);
    };
  <\/script>
</body>
</html>`;
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function DriveScreen() {
  const { coords } = useLocation();
  const { heading } = useCompassHeading();
  const initialCoordsRef = useRef<Coords | null>(null);
  const webViewRef = useRef<WebView>(null);

  if (coords && !initialCoordsRef.current) {
    initialCoordsRef.current = coords;
  }
  const mapCenter = initialCoordsRef.current ?? NEIGHBORHOOD_CENTER;

  useEffect(() => {
    if (!coords || !webViewRef.current) return;
    const bearing = heading ?? 0;
    webViewRef.current.injectJavaScript(
      `if (window.followUser) { window.followUser(${coords.lat}, ${coords.lon}, ${bearing}); } true;`
    );
  }, [coords, heading]);

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

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: buildMapHtml(NEIGHBORHOOD_PROPERTIES, mapCenter) }}
        onMessage={handleMessage}
        scrollEnabled={false}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
      />
      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.bannerText}>Winterberry Ln & Birch Ln · Florence, MA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
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
