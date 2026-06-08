import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useLocation } from "../hooks/useLocation";
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
        bedbath: (() => {
          const parts: string[] = [];
          if (p.beds !== null) parts.push(`${p.beds} bd`);
          if (p.baths !== null) parts.push(`${p.baths} ba`);
          return parts.join(" · ");
        })(),
        sqft_str: p.sqft !== null ? `${p.sqft.toLocaleString()} sqft` : "",
        value: fmtValue(p.estimatedValue),
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
    #recenter-btn {
      display: none;
      position: absolute;
      bottom: 36px;
      right: 12px;
      z-index: 100;
      background: rgba(0,0,0,0.72);
      color: #fff;
      border: none;
      border-radius: 20px;
      padding: 8px 14px;
      font-family: -apple-system, system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <button id="recenter-btn">📍 My Location</button>
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
    // Logical pixel dimensions — roughly proportional to the AR overlay card.
    var SW = 90, SH_HEAD = 26, SH_BODY = 18, SH_STAKE = 8;
    var SH_PANEL = SH_HEAD + SH_BODY;          // 44
    var SH = SH_PANEL + SH_STAKE;             // 52

    // Shrinks ctx.font until the text fits inside maxW, down to minSz pt.
    function fitText(ctx, text, maxW, maxSz, minSz, bold) {
      var sz = maxSz;
      ctx.font = (bold ? 'bold ' : '') + sz + 'px Arial, sans-serif';
      while (sz > minSz && ctx.measureText(text).width > maxW) {
        sz -= 0.5;
        ctx.font = (bold ? 'bold ' : '') + sz + 'px Arial, sans-serif';
      }
    }

    // Draws a mixed-colour stats row (bed/bath · sqft · value) on one line,
    // matching the camera-tab AddressCard stats row exactly.
    function drawStatsRow(ctx, p, y, maxW) {
      var div = ' · ';
      var segs = [];
      if (p.bedbath) segs.push({ t: p.bedbath, c: '#ffffff' });
      if (p.sqft_str) {
        if (segs.length) segs.push({ t: div, c: 'rgba(255,255,255,0.4)' });
        segs.push({ t: p.sqft_str, c: '#ffffff' });
      }
      if (p.value && p.value !== '$$$') {
        if (segs.length) segs.push({ t: div, c: 'rgba(255,255,255,0.4)' });
        segs.push({ t: p.value, c: '#ff6b6b' });
      }
      if (!segs.length) return;
      // Shrink font until the full row fits
      var sz = 9;
      var measureTotal = function() {
        ctx.font = sz + 'px Arial, sans-serif';
        return segs.reduce(function(w, s) { return w + ctx.measureText(s.t).width; }, 0);
      };
      while (measureTotal() > maxW && sz > 4) sz -= 0.5;
      ctx.font = sz + 'px Arial, sans-serif';
      var totalW = segs.reduce(function(w, s) { return w + ctx.measureText(s.t).width; }, 0);
      var x = SW / 2 - totalW / 2;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      segs.forEach(function(s) {
        ctx.fillStyle = s.c;
        ctx.fillText(s.t, x, y);
        x += ctx.measureText(s.t).width;
      });
      ctx.textAlign = 'center'; // restore default
    }

    function makeSignImage(p) {
      var PW = Math.round(SW * DPR);
      var PH = Math.round(SH * DPR);
      var c = document.createElement('canvas');
      c.width = PW; c.height = PH;
      var ctx = c.getContext('2d');
      ctx.scale(DPR, DPR);

      // ── Card shape — rounded corners, clipped so header inherits them ──────
      var R = 4; // corner radius
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(R, 0);
      ctx.lineTo(SW - R, 0);
      ctx.arcTo(SW, 0,      SW, R,        R);
      ctx.lineTo(SW, SH_PANEL - R);
      ctx.arcTo(SW, SH_PANEL, SW - R, SH_PANEL, R);
      ctx.lineTo(R, SH_PANEL);
      ctx.arcTo(0,  SH_PANEL, 0, SH_PANEL - R, R);
      ctx.lineTo(0, R);
      ctx.arcTo(0,  0, R, 0, R);
      ctx.closePath();
      ctx.clip();

      // Dark body — rgba(0,0,0,0.75) matches AR card backgroundColor exactly
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, SW, SH_PANEL);
      // Red header section (clipped by rounded path above)
      ctx.fillStyle = '#d62828';
      ctx.fillRect(0, 0, SW, SH_HEAD);

      ctx.restore(); // end clip

      // Stake — red (#d62828) to match AR card pin stem colour
      ctx.fillStyle = '#d62828';
      ctx.fillRect(SW / 2 - 1, SH_PANEL, 2, SH_STAKE);

      // ── Text ───────────────────────────────────────────────────────────────
      var TW = SW - 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Header: street bold white, city rgba(255,255,255,0.85) — matches AR card
      var H1 = SH_HEAD * 0.38;
      var H2 = SH_HEAD * 0.78;
      ctx.fillStyle = '#ffffff';
      fitText(ctx, p.address, TW, 10, 6, true);
      ctx.fillText(p.address, SW / 2, H1);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      fitText(ctx, p.town, TW, 8, 5, false);
      ctx.fillText(p.town, SW / 2, H2);

      // Body: single stats row — bed/bath · sqft · value on one line,
      // matching the camera-tab AddressCard layout (value in coral #ff6b6b).
      drawStatsRow(ctx, p, SH_HEAD + SH_BODY / 2, TW);

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
            value: p.value,
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
        var valueHtml = (p.value !== '$$$')
          ? '<div style="font-size:14px;color:#222;font-weight:600;margin-bottom:2px;">' + p.value + '</div>'
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

    // GPS tracking — update the blue dot only, never auto-pan the map.
    var gpsLat = ${initial.lat}, gpsLon = ${initial.lon};

    function haversineM(la1, lo1, la2, lo2) {
      var R = 6371000, toRad = function(d) { return d * Math.PI / 180; };
      var dLa = toRad(la2 - la1), dLo = toRad(lo2 - lo1);
      var a = Math.sin(dLa/2)*Math.sin(dLa/2) +
              Math.cos(toRad(la1))*Math.cos(toRad(la2))*Math.sin(dLo/2)*Math.sin(dLo/2);
      return 2 * R * Math.asin(Math.sqrt(a));
    }

    function checkRecenter() {
      var c = map.getCenter();
      var dist = haversineM(gpsLat, gpsLon, c.lat, c.lng);
      document.getElementById('recenter-btn').style.display = dist > 50 ? 'flex' : 'none';
    }

    map.on('moveend', checkRecenter);

    document.getElementById('recenter-btn').addEventListener('click', function() {
      map.easeTo({ center: [gpsLon, gpsLat], duration: 600 });
    });

    window.followUser = function(lat, lon) {
      gpsLat = lat; gpsLon = lon;
      if (window.userMarker) window.userMarker.setLngLat([lon, lat]);
      checkRecenter();
    };
  <\/script>
</body>
</html>`;
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function DriveScreen() {
  const { coords } = useLocation();
  const initialCoordsRef = useRef<Coords | null>(null);
  const webViewRef = useRef<WebView>(null);

  if (coords && !initialCoordsRef.current) {
    initialCoordsRef.current = coords;
  }
  const mapCenter = initialCoordsRef.current ?? NEIGHBORHOOD_CENTER;

  useEffect(() => {
    if (!coords || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(
      `if (window.followUser) { window.followUser(${coords.lat}, ${coords.lon}); } true;`
    );
  }, [coords]);

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
