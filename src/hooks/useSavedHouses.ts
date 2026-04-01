import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LookupResult } from "../types";

const STORAGE_KEY = "houselens_saved_houses";

export interface SavedHouse {
  id: string;
  address: string;
  targetCoords: { lat: number; lon: number };
  savedAt: string;
}

function resultToSavedHouse(result: LookupResult): SavedHouse {
  return {
    id: `${result.targetCoords.lat}_${result.targetCoords.lon}`,
    address: result.address,
    targetCoords: result.targetCoords,
    savedAt: new Date().toISOString(),
  };
}

export function useSavedHouses() {
  const [savedHouses, setSavedHouses] = useState<SavedHouse[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved houses from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setSavedHouses(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  // Persist whenever the list changes
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedHouses));
    }
  }, [savedHouses, loaded]);

  const saveHouse = useCallback(
    (result: LookupResult) => {
      setSavedHouses((prev) => {
        const house = resultToSavedHouse(result);
        // Don't add duplicates (same address)
        if (prev.some((h) => h.address === house.address)) return prev;
        return [house, ...prev];
      });
    },
    []
  );

  const removeHouse = useCallback((address: string) => {
    setSavedHouses((prev) => prev.filter((h) => h.address !== address));
  }, []);

  const isSaved = useCallback(
    (address: string) => savedHouses.some((h) => h.address === address),
    [savedHouses]
  );

  return { savedHouses, saveHouse, removeHouse, isSaved };
}
