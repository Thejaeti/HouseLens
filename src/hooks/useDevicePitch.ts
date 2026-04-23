import { useEffect, useRef, useState } from "react";
import { DeviceMotion } from "expo-sensors";

// Low-pass filter the raw accelerometer to isolate gravity from hand motion.
// At ~60fps, 0.05 gives a time constant of ~330ms — slow enough to reject
// shake, fast enough to track intentional tilts.
const GRAVITY_SMOOTHING = 0.05;

/**
 * Returns a smoothed device pitch in degrees.
 * 0 = phone pointing at horizon
 * positive = phone tilted up (looking at sky)
 * negative = phone tilted down (looking at ground)
 */
export function useDevicePitch(): number {
  const [pitch, setPitch] = useState(0);
  const gravityRef = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16);

    const sub = DeviceMotion.addListener((data) => {
      const g = data.accelerationIncludingGravity;
      if (!g) return;

      if (gravityRef.current === null) {
        gravityRef.current = { x: g.x, y: g.y, z: g.z };
      } else {
        gravityRef.current.x += GRAVITY_SMOOTHING * (g.x - gravityRef.current.x);
        gravityRef.current.y += GRAVITY_SMOOTHING * (g.y - gravityRef.current.y);
        gravityRef.current.z += GRAVITY_SMOOTHING * (g.z - gravityRef.current.z);
      }

      // Convention-agnostic: atan2(z, |y|) = 0 at horizon regardless of whether
      // Expo reports y as +9.8 or -9.8 when the phone is held vertically.
      // Sign of pitch follows z: on iOS, z > 0 when camera tilts up toward sky.
      const { y, z } = gravityRef.current;
      const rawPitch = (Math.atan2(z, Math.abs(y)) * 180) / Math.PI;
      setPitch(rawPitch);
    });

    return () => sub.remove();
  }, []);

  return pitch;
}
