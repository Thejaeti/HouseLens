import { useEffect, useRef, useState } from "react";
import { DeviceMotion } from "expo-sensors";

const SMOOTHING = 0.15; // lower = smoother but laggier, higher = more responsive

/**
 * Returns a smoothed device pitch in degrees.
 * 0 = phone pointing at horizon
 * positive = phone tilted up (looking at sky)
 * negative = phone tilted down (looking at ground)
 */
export function useDevicePitch(): number {
  const [pitch, setPitch] = useState(0);
  const smoothedRef = useRef(0);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16); // ~60fps for smoother updates

    const sub = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        const rawPitch = (data.rotation.beta * 180) / Math.PI - 90;

        // Exponential smoothing to eliminate jitter
        smoothedRef.current =
          smoothedRef.current + SMOOTHING * (rawPitch - smoothedRef.current);

        setPitch(smoothedRef.current);
      }
    });

    return () => sub.remove();
  }, []);

  return pitch;
}
