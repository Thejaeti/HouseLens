# HouseLens Project Status — July 15, 2026

## How Long It's Been

The last code change was **May 5, 2026** — about 10 weeks ago. That session was mostly about setting up Zach for async collaboration (writing him a setup guide, pushing docs to GitHub). Zach has not made any commits since then.

The last session where we actually built features was **April 23, 2026** — nearly 3 months ago.

The project started on **February 9, 2026** — so the app is about 5 months old total, with active development happening across 3 sessions in February, April, and early May.

---

## What the App Does Today

HouseLens is a React Native / Expo app that lets you point your phone at a house and find out about it. It has three tabs:

1. **Camera tab** — point your phone at a house, tap "Identify" (or wait 5 seconds for auto-lookup), and it identifies the address using your GPS location, compass heading, and an estimated distance slider. Shows links to view the property on Zillow, Redfin, and Realtor.com. Saved houses appear as floating AR-style labels on the camera view.

2. **Saved tab** — houses you've hearted are saved here with AsyncStorage. Tapping a saved house jumps to the Map tab centered on it.

3. **Drive tab** — a Waze-like 3D tilted map (MapLibre GL + OpenFreeMap) that shows virtual "For Sale" yard signs at real addresses nearby (pulled from OpenStreetMap via Overpass API). Signs show price and have popup cards with Zillow/Redfin/Realtor buttons. Map auto-rotates to match your compass heading.

Currently uses **demo/mock listing data** — real addresses from OpenStreetMap but fake prices and details.

---

## What Was Being Worked On Most Recently

### Last feature work (April 23)
- Built the Drive tab from scratch
- Fixed AR overlay vertical positioning (partially — cards can now reach the bottom of the screen, but it's still not perfect)
- Added native app deep-linking for Zillow/Redfin/Realtor (Zillow works well, Redfin and Realtor open app homepages but don't deep-link to the specific address)
- Switched pitch tracking from Euler angles to gravity-vector-based calculation
- Added iOS bundle identifier for eventual TestFlight builds

### Last conversations (May)
- Wrote a setup guide for Zach to work on the project independently via GitHub + Claude
- Discussed TestFlight distribution — guide is written, waiting on Zach's wife to add Jonathan and Zach to her Apple Developer team
- Chatted about monetization strategies (see below)

---

## Monetization Ideas We Discussed

A `MONETIZATION_IDEAS.md` file exists in the project. The main options:

- **Freemium subscriptions** — free users get ~5 lookups/day, paid users ($3/month or $20/year) get unlimited
- **Premium data tier** — paid users see price estimates, tax info, sale history (needs a real estate data API)
- **Agent referrals** — "Connect with an agent" button, referral fees of $500+ per closed deal
- **Mortgage leads** — "Get pre-approved" prompts, mortgage companies pay for qualified leads
- **Display ads** — real estate is one of the highest-paying ad categories
- **Sponsored listings** — local agents pay to appear in the app

The realistic assessment: subscriptions alone would be modest ($600/month at ~200 paying users), but agent referrals could be significant even with a small user base (50 referrals/month at $500 each = $25k/month). The app's AR camera view is visually compelling and could do well in short-form video for organic growth.

---

## Known Issues and Unfinished Work

- **AR overlay positioning** — better than before but still not perfect. A pitch debug readout is intentionally left on the camera screen for future tuning.
- **Demo data** — the app uses fake listings. Integrating a real estate data API (RentCast, ATTOM, etc.) would be needed for real use.
- **Redfin/Realtor deep-linking** — opens the apps but lands on homepages, not the specific property.
- **TestFlight distribution** — guide is written but hasn't been executed yet. Blocked on Apple Developer team access from Zach's wife.
- **Zach's async setup** — guide was written and shared, but unclear if Zach has followed it yet.

---

## What Would Make Sense to Pick Up

If jumping back in, the highest-impact next steps would probably be:

1. **Get on TestFlight** — so you and Zach can test without dev servers and tunnels
2. **Integrate a real listings API** — replace demo data with actual for-sale listings
3. **Polish the Drive tab** — it's a strong concept that could be the app's signature feature
4. **Clean up for external testers** — remove debug readouts, demo banners, etc.
