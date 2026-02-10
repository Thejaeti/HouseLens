export interface Coords {
  lat: number;
  lon: number;
}

export interface LookupResult {
  address: string;
  zillowUrl: string;
  targetCoords: Coords;
}

export type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LookupResult }
  | { status: "error"; error: string };
