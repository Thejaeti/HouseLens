// Real OSM coordinates for Winterberry Lane + Birch Lane, Florence MA 01062.
// Coordinates: OpenStreetMap building centroids.
// Beds/baths/sqft: real data from Redfin, Movoto, Compass, or public listings.
//   null = not yet confirmed from a real source — displays as "—" in the UI.
// estimatedValue: null for all until a live data source is wired in — displays as "$$$".

export interface NeighborhoodProperty {
  id: string;
  address: string;       // "31 Winterberry Ln"
  town: string;          // "Florence"
  fullAddress: string;   // "31 Winterberry Ln, Florence, MA"
  coords: { lat: number; lon: number };
  streetNodes: readonly [number, number][];
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  estimatedValue: number | null;
}

export const WINTERBERRY_NODES: readonly [number, number][] = [
  [42.3029943, -72.6849590],
  [42.3030947, -72.6849537],
  [42.3032816, -72.6850065],
  [42.3040827, -72.6853092],
  [42.3042297, -72.6853569],
  [42.3043783, -72.6854052],
  [42.3046120, -72.6854350],
  [42.3047710, -72.6854310],
  [42.3049970, -72.6853760],
  [42.3051490, -72.6853110],
  [42.3053128, -72.6852166],
  [42.3055135, -72.6850404],
  [42.3057180, -72.6847929],
  [42.3059921, -72.6844630],
  [42.3061820, -72.6842769],
  [42.3063437, -72.6842045],
  [42.3065526, -72.6841717],
  [42.3067244, -72.6842031],
  [42.3068870, -72.6842621],
  [42.3070099, -72.6843342], // junction with Birch Lane
  [42.3071600, -72.6844570],
  [42.3073212, -72.6846400],
  [42.3075011, -72.6849089],
  [42.3076095, -72.6851635],
  [42.3076549, -72.6853450],
  [42.3076760, -72.6854808],
];

export const BIRCH_NODES: readonly [number, number][] = [
  [42.3070099, -72.6843342],
  [42.3071411, -72.6840310],
  [42.3073232, -72.6838005],
  [42.3075368, -72.6836195],
  [42.3077621, -72.6835170],
  [42.3079588, -72.6834757],
  [42.3081930, -72.6834827],
  [42.3084143, -72.6834983],
  [42.3086248, -72.6834744],
  [42.3088000, -72.6834200],
  [42.3090375, -72.6833489],
  [42.3092190, -72.6833205],
  [42.3093701, -72.6833647],
];

export const NEIGHBORHOOD_PROPERTIES: NeighborhoodProperty[] = [
  // ── WINTERBERRY LANE ──────────────────────────────────────────────────────
  // null = not yet confirmed from a real source
  {
    id: "w31", address: "31 Winterberry Ln", town: "Florence",
    fullAddress: "31 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3038128, lon: -72.6848237 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w35", address: "35 Winterberry Ln", town: "Florence",
    fullAddress: "35 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3043393, lon: -72.6847632 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w36", address: "36 Winterberry Ln", town: "Florence",
    fullAddress: "36 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3046200, lon: -72.6858574 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w39", address: "39 Winterberry Ln", town: "Florence",
    fullAddress: "39 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3047907, lon: -72.6844629 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w40", address: "40 Winterberry Ln", town: "Florence",
    fullAddress: "40 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3049712, lon: -72.6858279 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w43", address: "43 Winterberry Ln", town: "Florence",
    fullAddress: "43 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3052292, lon: -72.6847580 },
    streetNodes: WINTERBERRY_NODES,
    beds: 3, baths: 2.5, sqft: 2177, estimatedValue: null, // Compass
  },
  {
    id: "w44", address: "44 Winterberry Ln", town: "Florence",
    fullAddress: "44 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3053863, lon: -72.6857055 },
    streetNodes: WINTERBERRY_NODES,
    beds: 4, baths: 3, sqft: 2752, estimatedValue: null, // Movoto
  },
  {
    id: "w47", address: "47 Winterberry Ln", town: "Florence",
    fullAddress: "47 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3056572, lon: -72.6835549 },
    streetNodes: WINTERBERRY_NODES,
    beds: 4, baths: 2.5, sqft: 1872, estimatedValue: null, // Redfin
  },
  {
    id: "w48", address: "48 Winterberry Ln", town: "Florence",
    fullAddress: "48 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3059576, lon: -72.6855625 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w51", address: "51 Winterberry Ln", town: "Florence",
    fullAddress: "51 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3060612, lon: -72.6837382 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w52", address: "52 Winterberry Ln", town: "Florence",
    fullAddress: "52 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3061429, lon: -72.6849189 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w55", address: "55 Winterberry Ln", town: "Florence",
    fullAddress: "55 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3064428, lon: -72.6836274 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w56", address: "56 Winterberry Ln", town: "Florence",
    fullAddress: "56 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3069317, lon: -72.6849584 },
    streetNodes: WINTERBERRY_NODES,
    beds: 3, baths: 2.5, sqft: 1794, estimatedValue: null, // Redfin
  },
  {
    id: "w59", address: "59 Winterberry Ln", town: "Florence",
    fullAddress: "59 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3068495, lon: -72.6835354 },
    streetNodes: WINTERBERRY_NODES,
    beds: 4, baths: 2.5, sqft: 2338, estimatedValue: null, // Redfin
  },
  {
    id: "w60", address: "60 Winterberry Ln", town: "Florence",
    fullAddress: "60 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3072756, lon: -72.6855043 },
    streetNodes: WINTERBERRY_NODES,
    beds: 4, baths: 2, sqft: 2702, estimatedValue: null, // Movoto
  },
  {
    id: "w64", address: "64 Winterberry Ln", town: "Florence",
    fullAddress: "64 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3071979, lon: -72.6859458 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w67", address: "67 Winterberry Ln", town: "Florence",
    fullAddress: "67 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3079913, lon: -72.6845864 },
    streetNodes: WINTERBERRY_NODES,
    beds: 4, baths: 2.5, sqft: 2678, estimatedValue: null, // Redfin
  },
  {
    id: "w68", address: "68 Winterberry Ln", town: "Florence",
    fullAddress: "68 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3067760, lon: -72.6866369 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w77", address: "77 Winterberry Ln", town: "Florence",
    fullAddress: "77 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3083515, lon: -72.6852858 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w81", address: "81 Winterberry Ln", town: "Florence",
    fullAddress: "81 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3090878, lon: -72.6860861 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "w85", address: "85 Winterberry Ln", town: "Florence",
    fullAddress: "85 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3081836, lon: -72.6866309 },
    streetNodes: WINTERBERRY_NODES,
    beds: 4, baths: 3.5, sqft: 4649, estimatedValue: null, // Skylimit listing
  },
  {
    id: "w89", address: "89 Winterberry Ln", town: "Florence",
    fullAddress: "89 Winterberry Ln, Florence, MA",
    coords: { lat: 42.3076377, lon: -72.6870943 },
    streetNodes: WINTERBERRY_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },

  // ── BIRCH LANE ────────────────────────────────────────────────────────────
  {
    id: "b5", address: "5 Birch Ln", town: "Florence",
    fullAddress: "5 Birch Ln, Florence, MA",
    coords: { lat: 42.3073002, lon: -72.6829179 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b8", address: "8 Birch Ln", town: "Florence",
    fullAddress: "8 Birch Ln, Florence, MA",
    coords: { lat: 42.3080272, lon: -72.6839099 },
    streetNodes: BIRCH_NODES,
    beds: 3, baths: 2, sqft: 1732, estimatedValue: null, // Redfin
  },
  {
    id: "b9", address: "9 Birch Ln", town: "Florence",
    fullAddress: "9 Birch Ln, Florence, MA",
    coords: { lat: 42.3076937, lon: -72.6827060 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b12", address: "12 Birch Ln", town: "Florence",
    fullAddress: "12 Birch Ln, Florence, MA",
    coords: { lat: 42.3086194, lon: -72.6841078 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b13", address: "13 Birch Ln", town: "Florence",
    fullAddress: "13 Birch Ln, Florence, MA",
    coords: { lat: 42.3081547, lon: -72.6823919 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b16", address: "16 Birch Ln", town: "Florence",
    fullAddress: "16 Birch Ln, Florence, MA",
    coords: { lat: 42.3092070, lon: -72.6845948 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b17", address: "17 Birch Ln", town: "Florence",
    fullAddress: "17 Birch Ln, Florence, MA",
    coords: { lat: 42.3085146, lon: -72.6822641 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b20", address: "20 Birch Ln", town: "Florence",
    fullAddress: "20 Birch Ln, Florence, MA",
    coords: { lat: 42.3095967, lon: -72.6841828 },
    streetNodes: BIRCH_NODES,
    beds: 3, baths: 2.5, sqft: 2432, estimatedValue: null, // Redfin
  },
  {
    id: "b21", address: "21 Birch Ln", town: "Florence",
    fullAddress: "21 Birch Ln, Florence, MA",
    coords: { lat: 42.3088508, lon: -72.6817213 },
    streetNodes: BIRCH_NODES,
    beds: 4, baths: 3, sqft: 2606, estimatedValue: null, // Redfin
  },
  {
    id: "b24", address: "24 Birch Ln", town: "Florence",
    fullAddress: "24 Birch Ln, Florence, MA",
    coords: { lat: 42.3101657, lon: -72.6832213 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
  {
    id: "b25", address: "25 Birch Ln", town: "Florence",
    fullAddress: "25 Birch Ln, Florence, MA",
    coords: { lat: 42.3094046, lon: -72.6820017 },
    streetNodes: BIRCH_NODES,
    beds: 4, baths: 3, sqft: 2567, estimatedValue: null, // search snippet
  },
  {
    id: "b33", address: "33 Birch Ln", town: "Florence",
    fullAddress: "33 Birch Ln, Florence, MA",
    coords: { lat: 42.3101929, lon: -72.6816366 },
    streetNodes: BIRCH_NODES,
    beds: null, baths: null, sqft: null, estimatedValue: null,
  },
];
