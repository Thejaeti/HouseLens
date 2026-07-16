import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import { CameraView } from "expo-camera";
import { DEFAULT_DISTANCE } from "../constants";
import { useLocation } from "../hooks/useLocation";
import { useCompassHeading } from "../hooks/useCompassHeading";
import { useHouseLookup } from "../hooks/useHouseLookup";
import { useDevicePitch } from "../hooks/useDevicePitch";
import { Crosshair } from "../components/Crosshair";
import { CompassHeading } from "../components/CompassHeading";
import { DistanceSlider } from "../components/DistanceSlider";
import { LookupButton } from "../components/LookupButton";
import { AROverlay } from "../components/AROverlay";
import { AddressCard } from "../components/AddressCard";
import { LookupResult } from "../types";
import { SavedHouse } from "../hooks/useSavedHouses";

const AUTO_LOOKUP_SECONDS = 5;
const HEADING_THRESHOLD = 8;

interface CameraScreenProps {
  onSave?: (result: LookupResult) => void;
  onRemove?: (address: string) => void;
  isSaved?: (address: string) => boolean;
  savedHouses?: SavedHouse[];
  autoLookup?: boolean;
}

export function CameraScreen({ onSave, onRemove, isSaved, savedHouses = [], autoLookup = false }: CameraScreenProps) {
  const [distance, setDistance] = useState(DEFAULT_DISTANCE);
  const { coords } = useLocation();
  const { heading } = useCompassHeading();
  const { state, lookup, reset } = useHouseLookup();
  const pitch = useDevicePitch();
  const [autoProgress, setAutoProgress] = useState(0);
  const lastHeadingRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canLookup = coords !== null && heading !== null;

  const handleLookup = async () => {
    if (!coords || heading === null) return;
    setAutoProgress(0);
    await lookup(coords, heading, distance);
  };

  // The auto-lookup interval below captures handleLookup when the effect runs,
  // which can hold a stale heading. The ref always points at the latest one.
  const handleLookupRef = useRef(handleLookup);
  handleLookupRef.current = handleLookup;

  // Auto-lookup timer — paused whenever a result/error card is on screen
  useEffect(() => {
    if (!canLookup || state.status !== "idle") {
      setAutoProgress(0);
      return;
    }

    if (heading !== null && lastHeadingRef.current !== null) {
      let diff = Math.abs(heading - lastHeadingRef.current);
      if (diff > 180) diff = 360 - diff;
      if (diff > HEADING_THRESHOLD) {
        setAutoProgress(0);
      }
    }
    lastHeadingRef.current = heading;
  }, [heading, canLookup, state.status]);

  useEffect(() => {
    if (!autoLookup || !canLookup || state.status !== "idle") {
      if (timerRef.current) clearInterval(timerRef.current);
      setAutoProgress(0);
      return;
    }

    timerRef.current = setInterval(() => {
      setAutoProgress((prev) => {
        const next = prev + 0.1;
        if (next >= AUTO_LOOKUP_SECONDS) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => handleLookupRef.current(), 0);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoLookup, canLookup, state.status, coords, distance]);

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />

      <View style={styles.overlay} pointerEvents="box-none">
        <Crosshair />

        <View style={styles.topSection}>
          <CompassHeading heading={heading} />
          <Text style={styles.debugText}>pitch: {pitch.toFixed(1)}°</Text>
        </View>

        <View style={styles.bottomSection} pointerEvents="box-none">
          <AddressCard
            state={state}
            onDismiss={reset}
            onSave={onSave}
            onRemove={onRemove}
            isSaved={state.status === "success" ? isSaved?.(state.result.address) : false}
          />

          <DistanceSlider distance={distance} onDistanceChange={setDistance} />

          <View style={styles.buttonRow}>
            <LookupButton
              onPress={handleLookup}
              disabled={!canLookup}
              loading={state.status === "loading"}
              autoProgress={autoProgress / AUTO_LOOKUP_SECONDS}
            />
          </View>
        </View>
      </View>

      {coords && heading !== null && savedHouses.length > 0 && (
        <AROverlay
          userCoords={coords}
          heading={heading}
          pitch={pitch}
          savedHouses={savedHouses}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topSection: {
    paddingTop: 60,
    alignItems: "center",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 16,
    gap: 16,
  },
  buttonRow: {
    alignItems: "center",
    paddingTop: 8,
  },
  debugText: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Courier",
  },
});
