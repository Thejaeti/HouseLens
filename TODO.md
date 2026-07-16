# HouseLens To-Do

_Last updated: July 16, 2026. Items are ordered by suggested sequence, not difficulty._

## 1. Verify the July 16 merge on a real phone — **Jonathan, ~2 minutes**

The current published update merges Zach's May–June work with the July 16 fixes. It passes type-checking and bundles cleanly, but nobody has run the combined result on a device yet. Everything below waits on this.

- Force-quit and reopen HouseLens **twice** (first launch downloads the update, second runs it).
- Camera tab: tap Identify at a house → address card should appear with heart + Zillow/Redfin/Realtor buttons. Heart it, un-heart it, heart it again.
- Check the Saved tab and Map tab show the hearted house.
- Poke at Zach's new tabs: **Settings** (note: auto-lookup is now a toggle there, default OFF) and **Yard Signs**.
- Report anything weird — a loose description is fine.

## 2. Business direction conversation — **Jonathan + Zach**

Decide which product this is before building more:

- **Option A — consumer "point at a house" app:** needs a listings API (RentCast etc.), monetizes weakly (Zillow is free one tap away). Best treated as a growth funnel, not revenue.
- **Option B — investor tool ("driving for dollars" niche):** competes with DealMachine (~$100–500/mo, proven willingness to pay). Needs county assessor + owner data instead of MLS. Zach is effectively the target user.
- See `MONETIZATION_IDEAS.md` for the original brainstorm and the market research doc (added alongside this file) for the competitive landscape.
- Cheap validation before committing time: TestFlight to 20–50 people; Zach asks ~5 investor contacts "would you pay $50/month for this?"; post one short-form video of the AR camera view and watch the reaction.

## 3. AR vertical positioning tuning session — **Jonathan + Claude, ~15 min, phone in hand**

The long-standing "labels not quite on the house" issue. The pitch debug readout on the camera screen is intentionally still there for this.

- Live session: point at houses, read the pitch numbers to Claude, adjust constants (`CAMERA_FOV_V` and the 1.4 multiplier in the AR overlay), republish, repeat until it looks right.
- Zach also reworked the overlays in June, so first re-check how bad it still is.
- When done: remove the debug readout from the camera screen.

## 4. Drive tab: refresh listings as you move — **Claude, after item 1**

- Pre-merge, the Drive tab fetched nearby addresses once at the first GPS fix and never again — drive a few blocks and you leave all the signs behind.
- Zach substantially rewrote `DriveScreen.tsx` in June, so first verify this is still true, then add re-fetching when the user moves ~500m+ from the last fetch center (mind Overpass API rate limits — it's a free shared service).

## 5. TestFlight distribution — **blocked, needs a decision**

- Blocked since ~May on Apple Developer team access via Zach's wife.
- Alternative: Jonathan buys his own Apple Developer membership ($99/year) — unblocks this in days. Given item 2, this may be worth just doing.
- Guide already written: `APP_STORE_SUBMISSION.md`.
- Note: the first native build will pick up the July 16 Android permissions cleanup automatically.

## 6. Real data integration — **after item 2 decides the direction**

- **Option A path:** RentCast or similar listings API (free tier is small — ~50 requests/month; real usage costs money).
- **Option B path:** county assessor / public-records data (owner names, tax values, sale history). More accessible than MLS. Zach's hand-entered Northgate data in `src/data/neighborhoodProperties.ts` shows exactly what this looks like — the job is automating what he did manually.
- Either way: replace the fake prices in `src/data/mockListings.ts` and remove the "Demo listings" banner when real data lands.

## 7. Small stuff (grab-bag, low priority)

- **Redfin deep link** opens the app/site homepage, not the property. Real fix needs listing IDs from whichever data API item 6 lands on — fold it in there.
- **Name check:** before any public launch, search "HouseLens" for existing apps/trademarks in the real-estate space.
- **Set git identity** on Jonathan's Mac so commits stop warning: `git config --global user.name "Jonathan Roberts"` and `git config --global user.email "thejaeti@gmail.com"`.
- `.DS_Store` files are committed/lying around — add to `.gitignore`.
