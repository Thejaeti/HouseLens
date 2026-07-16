import { useEffect, useRef, useState } from "react";
import { DeviceMotion } from "expo-sensors";

// Fallback EMA alpha — used only when iOS sensor fusion isn't available.
// At 60 Hz, α=0.1 ≈ 167ms time constant: rejects hand shake, tracks tilts.
const EMA_ALPHA = 0.1;

/**
 * Camera pitch in degrees:
 *   0°  = camera at the horizon
 *  >0°  = camera above the horizon (phone tilted back)
 *  <0°  = camera below the horizon (phone angled down)
 */
export function useDevicePitch(): number {
  const [pitch, setPitch] = useState(0);
  const smoothRef = useRef<{ y: number; z: number } | null>(null);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16); // ~60 Hz

    const sub = DeviceMotion.addListener((data) => {
      const aig = data.accelerationIncludingGravity;
      if (!aig) return;

      let gy: number;
      let gz: number;

      const ua = data.acceleration;
      if (ua != null) {
        // iOS sensor fusion: subtract user acceleration to isolate gravity.
        // Already free of hand-motion noise — no further smoothing needed.
        gy = aig.y - ua.y;
        gz = aig.z - ua.z;
      } else {
        // No sensor fusion — smooth the raw accelerometer manually.
        if (!smoothRef.current) {
          smoothRef.current = { y: aig.y, z: aig.z };
        } else {
          smoothRef.current.y += EMA_ALPHA * (aig.y - smoothRef.current.y);
          smoothRef.current.z += EMA_ALPHA * (aig.z - smoothRef.current.z);
        }
        gy = smoothRef.current.y;
        gz = smoothRef.current.z;
      }

      // In portrait: gy ≈ ±9.81 when upright; gz > 0 when camera tilts above horizon.
      // abs(gy) avoids sign-flip bugs from varying accelerometer conventions.
      setPitch((Math.atan2(gz, Math.abs(gy)) * 180) / Math.PI);
    });

    return () => sub.remove();
  }, []);

  return pitch;
}
