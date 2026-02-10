import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { HEADING_SAMPLES } from "../constants";

interface UseCompassHeadingResult {
  heading: number | null;
  accuracy: number | null;
}

/**
 * Computes the circular mean of an array of angles in degrees.
 * This avoids the wraparound problem (e.g., averaging 350 and 10 gives 0, not 180).
 */
function circularMean(angles: number[]): number {
  let sinSum = 0;
  let cosSum = 0;
  for (const angle of angles) {
    const rad = (angle * Math.PI) / 180;
    sinSum += Math.sin(rad);
    cosSum += Math.cos(rad);
  }
  const meanRad = Math.atan2(sinSum / angles.length, cosSum / angles.length);
  return ((meanRad * 180) / Math.PI + 360) % 360;
}

export function useCompassHeading(): UseCompassHeadingResult {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const samplesRef = useRef<number[]>([]);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sub = await Location.watchHeadingAsync((headingData) => {
          if (!mounted) return;

          const raw = headingData.magHeading;
          const samples = samplesRef.current;

          samples.push(raw);
          if (samples.length > HEADING_SAMPLES) {
            samples.shift();
          }

          setHeading(circularMean(samples));
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
