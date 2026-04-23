import * as Linking from "expo-linking";

interface ListingPlatform {
  name: string;
  color: string;
  appScheme?: string;
  buildUrl: (address: string) => string;
}

function realtorSlug(address: string): string {
  return address.replace(/,/g, "").trim().replace(/\s+/g, "-");
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
    appScheme: "redfin://",
    buildUrl: () => `https://www.redfin.com/`,
  },
  {
    name: "Realtor.com",
    color: "#D92228",
    appScheme: "realtor://",
    buildUrl: (address) =>
      `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(realtorSlug(address))}`,
  },
];

export async function openPlatform(
  platform: ListingPlatform,
  address: string
): Promise<void> {
  if (platform.appScheme) {
    try {
      await Linking.openURL(platform.appScheme);
      return;
    } catch {
      // App not installed — fall through to web URL
    }
  }
  await Linking.openURL(platform.buildUrl(address));
}
