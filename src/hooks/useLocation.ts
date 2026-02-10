import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { Coords } from "../types";

interface UseLocationResult {
  coords: Coords | null;
  error: string | null;
}

export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 1,
          },
          (location) => {
            if (mounted) {
              setCoords({
                lat: location.coords.latitude,
                lon: location.coords.longitude,
              });
            }
          }
        );
        subscriptionRef.current = sub;
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to get location"
          );
        }
      }
    })();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return { coords, error };
}
