import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";

interface UseCompassHeadingResult {
  heading: number | null;
  accuracy: number | null;
}

// EMA alpha: ~130ms time constant at 50Hz compass rate. Smoother than a
// boxcar mean of the same length because it has no trailing-edge ripple.
const HEADING_ALPHA = 0.15;

export function useCompassHeading(): UseCompassHeadingResult {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const smoothedRef = useRef<number | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sub = await Location.watchHeadingAsync((headingData) => {
          if (!mounted) return;

          // Prefer true heading (accounts for magnetic declination) so bearings
          // match the GPS-based house directions. Fall back to magnetic if unavailable.
          const raw = headingData.trueHeading >= 0
            ? headingData.trueHeading
            : headingData.magHeading;

          if (smoothedRef.current === null) {
            smoothedRef.current = raw;
          } else {
            // Step along the shortest arc to avoid 0/360 wraparound jumps.
            let diff = raw - smoothedRef.current;
            while (diff > 180) diff -= 360;
            while (diff < -180) diff += 360;
            smoothedRef.current = (smoothedRef.current + HEADING_ALPHA * diff + 360) % 360;
          }

          setHeading(smoothedRef.current);
          setAccuracy(headingData.accuracy);
        });
        subscriptionRef.current = sub;
      } catch {
        // Heading not available on this device
      }
    })();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return { heading, accuracy };
}
