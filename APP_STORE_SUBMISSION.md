# HouseLens — TestFlight Setup Guide

How to get HouseLens installed on your phone, Zach's phone, and a few friends' phones — **without** using Expo Go, tunnels, or publishing to the App Store. This uses **TestFlight**, Apple's built-in beta testing system.

**Estimated time:** ~1 day of calendar time (most of it waiting on Apple), but only about 1–2 hours of actual hands-on work.

---

## What TestFlight Gives You

- Real app on your phone — no Expo Go, no dev server, no tunnels
- Up to **100 internal testers** (no review needed, instant installs) or **10,000 external testers** (one ~24hr beta review per version, then instant updates)
- Testers install via Apple's free **TestFlight** app — feels just like the App Store
- When you push a new build, everyone gets notified to update
- **Nobody outside your invite list** can find or install it — not public
- Free (comes with the Apple Developer account)

**Main gotcha:** TestFlight builds expire **90 days after upload**. Push a new build at least once every 3 months to keep testers on a working version.

---

## Two Paths: Internal vs External Testing

Pick one. You can always switch later.

| | **Internal testers** | **External testers** |
|---|---|---|
| Max people | 100 | 10,000 |
| Apple review needed? | ❌ Never | ✅ ~24hr on first build of a version |
| Who can be a tester? | People added to your App Store Connect team | Anyone with an Apple ID + email |
| How they install | TestFlight invite link | TestFlight invite link |
| Time to first install | Minutes after upload | 1 day (after beta review) |
| Best for | You + Zach (trusted, small group) | Friends/acquaintances you don't want on the dev team |

**Recommendation:** start with **internal testing** (just you + Zach). Once the app feels good, switch to external if you want to share with more friends.

---

## Prerequisites (one-time)

1. **Apple Developer team access** — Zach's wife needs to add you (and Zach) to her team in [App Store Connect](https://appstoreconnect.apple.com):
   - Log in → **Users and Access** → **+**
   - Add your Apple ID email, Zach's Apple ID email
   - Role: **Developer** (enough to install TestFlight builds; **App Manager** if you want to upload builds yourself)
   - She'll also need to add you to the Apple Developer portal at [developer.apple.com/account](https://developer.apple.com/account) → *People*

2. **Each tester needs an Apple ID** — they almost certainly already have one (it's what they use on their iPhone). No special account creation needed.

3. **EAS CLI installed** — open Terminal and run:
   ```bash
   npm install -g eas-cli
   eas login
   ```
   (You already have an Expo account — `thejaeti`. Use that.)

4. **Your Apple ID signed in to App Store Connect** at least once at [appstoreconnect.apple.com](https://appstoreconnect.apple.com).

---

## Pre-Flight: One Small Code Change

Before the first build, the app's `app.json` needs an iOS bundle identifier. This is a string that uniquely identifies the app to Apple. I can make this change for you — just say the word. It would be:

```json
"ios": {
  "bundleIdentifier": "com.thejaeti.houselens",
  ...
}
```

That's it. Everything else (camera, location, motion permission descriptions) is already in place.

For TestFlight with internal testers, you can leave the debug `pitch: XX°` readout and the demo listings banner as-is — they're fine for internal testing. If you decide to move to external testers later, we might want to clean those up for the beta review.

---

## Phase 1: Create the App Record in App Store Connect

One-time setup. Takes about 10 minutes.

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**
2. Fill in:
   - **Platforms:** iOS
   - **Name:** `HouseLens` (if taken, try a variant — this is the name that appears in TestFlight)
   - **Primary Language:** English (US)
   - **Bundle ID:** `com.thejaeti.houselens` (must exactly match `app.json`)
   - **SKU:** anything unique, e.g., `HOUSELENS001`
   - **User Access:** Full Access
3. Click **Create**. You're done with this step. You don't need to fill in any of the App Store metadata (description, screenshots, etc.) — those are only for public App Store listing, not TestFlight.

---

## Phase 2: Build and Upload

From your Terminal on your Mac:

```bash
cd "/Users/jonathanroberts/Documents/Claude Code Projects/Real Estate:Zillow App/HouseLens"

# First build. EAS will prompt you for Apple credentials and
# automatically create signing certificates and provisioning profiles.
eas build --platform ios --profile production
```

**What happens:**
- You'll be prompted for your Apple ID and password (the one on Zach's wife's team)
- EAS asks for the Apple Team ID — Zach's wife can find it in her developer portal (looks like `A1B2C3D4E5`)
- EAS creates certificates automatically and stores them in your Expo account
- Your code uploads to Expo's servers and builds (~15–25 minutes)
- When done, EAS gives you a URL to the built `.ipa` file

Then upload that build to App Store Connect:

```bash
eas submit --platform ios --latest
```

This takes 5–10 minutes. Afterward, the build appears under **TestFlight** tab in App Store Connect.

---

## Phase 3: Invite Testers

### Option A — Internal Testers (instant, recommended to start)

1. In App Store Connect → your app → **TestFlight** tab
2. Under **Internal Testing**, click **+** to create an internal group (e.g., "Core Team")
3. Click **Add Testers** → pick from the list of people on the App Store Connect team
4. Assign the latest build to this group
5. Testers get an email with a **View in TestFlight** link
6. They tap it on their iPhone → opens TestFlight app (they'll install it if they don't have it) → tap **Install** → HouseLens appears on their home screen

### Option B — External Testers (after beta review)

1. In App Store Connect → your app → **TestFlight** tab
2. Under **External Testing**, click **+** to create an external group
3. Add testers by email (they don't need to be on your team)
4. Assign the latest build to the group
5. First time per version: Apple reviews the build (~24 hours, sometimes faster)
6. After approval, testers get the email invite and install exactly like internal testers

External testing needs a few extra fields filled in for Apple's reviewer:
- **What to test:** brief notes for the beta reviewer
- **Beta App Description:** one paragraph about what the app does
- **Feedback email:** where beta testers can send feedback
- **Test Information:** login credentials if needed (HouseLens doesn't need any)

---

## Pushing Updates

Two scenarios:

### You changed JavaScript/UI only (most changes)
Your current EAS Update workflow still works — `eas update --branch main --message "..."`. But TestFlight builds don't pick up EAS Updates the same way Expo Go does (runtime version mismatch). So for TestFlight, you'll mostly use:

### Full build updates (any change)
```bash
# Bump the version in app.json first (e.g., 1.0.0 → 1.0.1)
eas build --platform ios --profile production
eas submit --platform ios --latest
```

- Internal testers get the new build within minutes (no review)
- External testers: if it's a patch of the same version (1.0.x), no review needed. If it's a new version (1.1.0+), another ~24hr beta review.

When testers open TestFlight on their phone, they'll see "Update" next to HouseLens.

---

## Rough Timeline From Zero to Apps-On-Phones

| Step | Time |
|---|---|
| Zach's wife adds you both to her team | Depends on her |
| Pre-flight code change (bundle ID) | ~2 minutes with me |
| Create app record in App Store Connect | 10 minutes |
| First EAS build | 20–30 minutes (mostly waiting) |
| First EAS submit | 10 minutes |
| Invite internal testers + install | 5 minutes |
| **Total (if Zach's wife is responsive)** | **~1–2 hours of work spread over a few hours** |

Add ~24 hours on top if you want external testers for anyone outside the Apple Developer team.

---

## Quick Open Questions

Just a handful to decide before we start. Nothing huge:

1. **Are you and Zach okay being added to Zach's wife's Apple Developer team** (she'll see that you're both developers on her account)?
2. **Start with internal testing only** (just you two)? Or add a few friends externally from the start?
3. **App name** — keep "HouseLens"? It only shows up in TestFlight/on the home screen for your testers, but if you ever go public with the same name you'd want it unclaimed.
4. **Want me to make the pre-flight code change** (adding the iOS bundle identifier) right now?

When you're ready, just answer #4 and I'll do the code change. Then you can run through the steps with Zach's wife at your own pace.
