import * as Linking from "expo-linking";

/**
 * Builds a Zillow search URL for the given address.
 */
export function buildZillowUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.zillow.com/homes/${encoded}_rb/`;
}

/**
 * Opens the Zillow listing for the given address in the browser or Zillow app.
 */
export async function openZillow(address: string): Promise<void> {
  const url = buildZillowUrl(address);
  await Linking.openURL(url);
}
