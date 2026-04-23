# HouseLens — App Store Submission Guide

A non-developer-friendly walkthrough for getting HouseLens onto the Apple App Store. You and Zack can read through this together. Estimated total time from start to "live on the store": **2–4 weeks**, most of which is waiting on Apple.

---

## Current State: What's Ready vs. What's Not

### ✅ Already in place
- Expo project with EAS configured (`eas.json` exists)
- Bundle identifier set for Android (`com.thejaeti.houselens`)
- Camera, location, and motion permission descriptions already written in `app.json`
- App icon and splash screen assets in `assets/`
- Working features: camera-based house identification, favorites, saved-houses map, Drive mode with yard signs

### ⚠️ Needs to be done first (before we build for production)
- **Remove the `pitch: XX°` debug readout** from the camera screen — reviewers will notice
- **Remove the "Demo listings · not real homes" banner** on the Drive tab OR decide whether to ship Drive mode at all in v1
- **Decide what to do about AR overlay** — the vertical positioning is "better but not there." Either finish fixing it or hide the feature for v1
- **Add an iOS bundle identifier** in `app.json` (currently only Android is set)
- **Write a privacy policy** and host it on a public URL (Apple requires this)
- **Take real App Store screenshots** using the iPhone simulator or a real device
- **Decide on an App Store category** (likely "Lifestyle" or "Navigation")

---

## Prerequisites (one-time setup)

1. **Apple Developer Account** — Zack's wife's account. She needs to:
   - Add you or Zack as a team member in [developer.apple.com/account](https://developer.apple.com/account) → *People*
   - Grant the **Admin** role so you can create app records and manage certificates
   - Provide the **Team ID** (found in her account membership page — looks like `A1B2C3D4E5`)

2. **Apple ID for App Store Connect** — whoever submits the app needs their own Apple ID, signed in to [App Store Connect](https://appstoreconnect.apple.com)

3. **EAS CLI installed on your Mac**:
   ```bash
   npm install -g eas-cli
   eas login
   ```
   Use your Expo account (you already have one — `thejaeti`).

4. **A privacy policy hosted somewhere public.** Free options:
   - GitHub Pages (free, can be just a simple HTML page)
   - [app-privacy-policy-generator.firebaseapp.com](https://app-privacy-policy-generator.firebaseapp.com) → download → host on GitHub Pages

---

## Phase 1: Pre-Flight Code Changes

Before we build for production, the app needs a couple of changes. I can handle all of these in a session — just list them for me:

1. **Add iOS bundle identifier** to `app.json`:
   ```json
   "ios": {
     "bundleIdentifier": "com.thejaeti.houselens",
     ...
   }
   ```

2. **Remove debug readouts** (the `pitch: XX°` text on the camera screen)

3. **Bump version number** in `app.json` to `1.0.0` (or whatever the launch version is)

4. **Decide on the Drive tab for v1**:
   - **Option A:** Ship it with demo data + a clear banner explaining listings are for demonstration only. Risk: Apple reviewer might flag it as incomplete.
   - **Option B:** Hide the Drive tab in v1, ship it in v2 once we have real listing data wired up. Safer for initial review.
   - **Recommendation:** Option B — ship a focused v1 and add Drive mode in v1.1

5. **Decide on AR overlay for v1**:
   - If the vertical positioning is still glitchy, hide the feature behind a toggle or disable it
   - Reviewers will test it

6. **Make sure all URLs in the app work** — tap every button in every flow on a fresh install and confirm nothing crashes

---

## Phase 2: Apple Developer Setup

On Zack's wife's Apple Developer account (or via the team member she added):

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**

2. Fill in:
   - **Platform:** iOS
   - **Name:** `HouseLens` (if taken, try "HouseLens — Home Finder" or similar)
   - **Primary Language:** English (US)
   - **Bundle ID:** `com.thejaeti.houselens` (must match what's in `app.json`)
   - **SKU:** anything unique, e.g., `HOUSELENS001`
   - **User Access:** Full Access

3. Once created, you'll get to the app's page. Set up:
   - **App Information:**
     - Category: Lifestyle (primary), Navigation (secondary)
     - Content Rights: No third-party content (or declare what Zillow/Redfin/Realtor refs are)
   - **Pricing and Availability:**
     - Price: Free
     - Available in: All countries (or just US to start)
   - **App Privacy:** fill out the privacy questionnaire. Key disclosures:
     - Location data collected (in-app use, not linked to user, not tracked)
     - Camera data (not collected — only used live)
     - Device motion (not collected)
   - **Version 1.0** metadata:
     - **Description:** 3–4 paragraphs explaining what the app does
     - **Keywords:** real estate, home finder, zillow, house search, map, AR, street view
     - **Support URL:** can be a simple GitHub page
     - **Marketing URL:** optional
     - **Screenshots:** need at minimum one set at 6.7" (iPhone 15 Pro Max) and 6.5" (iPhone 11 Pro Max). Six screenshots each, showing key features.

---

## Phase 3: Build with EAS

Once everything above is ready:

```bash
cd "/Users/jonathanroberts/Documents/Claude Code Projects/Real Estate:Zillow App/HouseLens"

# First-time iOS setup — EAS will prompt you to sign in to your Apple Developer account
# and create certificates + provisioning profiles automatically
eas build --platform ios --profile production
```

What happens:
1. EAS will ask for Apple Developer credentials — use the account Zack's wife added you to
2. EAS creates the signing certificates and provisioning profiles on your behalf (saved in your Expo account)
3. Your code is uploaded and built on Expo's servers (~15–25 minutes)
4. When done, EAS gives you a URL to download the `.ipa` file (the iOS app bundle)

**If the build fails**, EAS will show the error. Common issues:
- Bundle identifier mismatch → check `app.json` matches App Store Connect
- Missing Apple team ID → EAS will prompt for it
- Package version mismatches (we saw these warnings earlier) → usually non-blocking but can update if needed

---

## Phase 4: Submit with EAS

Once the build succeeds:

```bash
eas submit --platform ios --latest
```

EAS uploads the `.ipa` to App Store Connect automatically. After 5–10 minutes it'll appear under the **TestFlight** tab of your app in App Store Connect.

### Test it via TestFlight first (strongly recommended)
- TestFlight lets you install the production build on your phones before submitting to Apple's review
- Add yourself, Zack, and Zack's wife as internal testers
- Actually use the app for a few days to catch bugs
- Fix anything that turns up, rebuild, re-upload
- **Don't skip this step** — it's way cheaper to find bugs here than during Apple's review

### Submit for review
- In App Store Connect → your app → **1.0 Prepare for Submission**
- Choose the build you want to submit (from TestFlight)
- Fill in **Export Compliance** (almost always: "No, my app doesn't use encryption beyond standard HTTPS")
- Fill in **App Review Information:**
  - Contact info
  - Demo account if needed (HouseLens doesn't need one)
  - Notes: brief explanation of the app's features for the reviewer
- Hit **Submit for Review**

---

## Phase 5: Apple Review

- Apple's review takes **1–3 business days** typically
- They will test the app on real devices
- You may get a rejection with reasons — common ones for an app like HouseLens:
  - *"We couldn't find the features described"* → fix the description or add missing features
  - *"Location usage description is vague"* → make your `NSLocationWhenInUseUsageDescription` more specific
  - *"Demo data visible to users without clear disclosure"* → this is why I suggest hiding Drive mode in v1
  - *"Minimal functionality"* → add more user-facing polish
- If rejected, you read their notes, fix the issue, re-submit. No penalty.

Once approved: the app goes live on the App Store automatically (or at a scheduled release date you set).

---

## Post-Launch: Future Updates

Two types of updates are possible:

### EAS Updates (JavaScript-only changes) — instant, no Apple review
- You're already using EAS Update for your Expo Go workflow
- After launch, pushing a new `eas update --branch main` delivers fresh JavaScript to users' phones on next app open
- Good for bug fixes, copy changes, small tweaks
- **Cannot** change native code, permissions, or app icon

### Full binary updates — for bigger changes
- Bump version in `app.json` (e.g., 1.0.0 → 1.1.0)
- `eas build --platform ios --profile production`
- `eas submit --platform ios --latest`
- Goes through Apple review again (usually faster for updates, 1–2 days)
- Needed when: adding new permissions, changing app icon, native module updates, big new features

---

## Rough Timeline

| Step | Time |
|---|---|
| Pre-flight code changes | 1 session with me |
| Privacy policy + hosting | 1–2 hours |
| Apple Developer team access | depends on Zack's wife's availability |
| App Store Connect metadata + screenshots | 2–4 hours |
| First EAS build | 30 min (with troubleshooting) |
| TestFlight testing | 3–7 days of real use |
| Submit for review | 15 min |
| Apple review | 1–3 business days |
| **Total** | **~2–4 weeks** |

---

## Open Questions for You and Zack

Before we start, decide these:

1. **App name on the store** — stick with "HouseLens" or try something else?
2. **Drive tab in v1** — ship with demo banner, or hide until v1.1?
3. **AR overlay in v1** — ship as-is, finish the pitch fix first, or hide?
4. **Pricing** — free, paid, or free-with-IAP?
5. **Target audience** — US only, or worldwide?
6. **Privacy policy** — who's writing it? (I can help draft)
7. **Support email/URL** — what to list in App Store Connect?

When you're ready to start, tell me which items you've decided on and I'll run through the pre-flight code changes with you.
