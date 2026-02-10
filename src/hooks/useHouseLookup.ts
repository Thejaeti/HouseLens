import { useState, useCallback } from "react";
import { Coords, LookupState } from "../types";
import { projectPoint } from "../utils/geoProjection";
import { reverseGeocode } from "../utils/geocoding";
import { buildZillowUrl } from "../utils/zillowUrl";

interface UseHouseLookupResult {
  state: LookupState;
  lookup: (coords: Coords, heading: number, distance: number) => Promise<void>;
  reset: () => void;
}

export function useHouseLookup(): UseHouseLookupResult {
  const [state, setState] = useState<LookupState>({ status: "idle" });

  const lookup = useCallback(
    async (coords: Coords, heading: number, distance: number) => {
      setState({ status: "loading" });

      try {
        const targetCoords = projectPoint(
          coords.lat,
          coords.lon,
          heading,
          distance
        );

        const address = await reverseGeocode(targetCoords);

        if (!address) {
          setState({ status: "error", error: "Could not determine address" });
          return;
        }

        const zillowUrl = buildZillowUrl(address);
        setState({
          status: "success",
          result: { address, zillowUrl, targetCoords },
        });
      } catch (err) {
        setState({
          status: "error",
          error: err instanceof Error ? err.message : "Lookup failed",
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, lookup, reset };
}
