import * as Linking from "expo-linking";

interface ListingPlatform {
  name: string;
  color: string;
  buildUrl: (address: string) => string;
}

export const PLATFORMS: ListingPlatform[] = [
  {
    name: "Zillow",
    color: "#006AFF",
    buildUrl: (address) =>
      `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`,
  },
  {
    name: "Redfin",
    color: "#A02021",
    buildUrl: (address) =>
      `https://www.google.com/search?q=${encodeURIComponent(`redfin ${address}`)}`,
  },
  {
    name: "Realtor.com",
    color: "#D92228",
    buildUrl: (address) =>
      `https://www.google.com/search?q=${encodeURIComponent(`realtor.com ${address}`)}`,
  },
];

export async function openPlatform(
  platform: ListingPlatform,
  address: string
): Promise<void> {
  const url = platform.buildUrl(address);
  await Linking.openURL(url);
}
