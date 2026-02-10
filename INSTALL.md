# How to Install HouseLens on Your Phone

## For the Developer (one-time setup)

1. Install the EAS CLI if you haven't already:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account (create one free at https://expo.dev/signup):
   ```bash
   eas login
   ```

3. Configure EAS Update for the project:
   ```bash
   cd HouseLens
   eas update:configure
   ```

4. Publish an update:
   ```bash
   eas update --branch main --message "Latest version"
   ```

5. This will output a **shareable URL** — send that link to anyone who wants to try the app.

## For Testers (your friends)

1. **Install Expo Go** on your phone:
   - **iPhone**: [Expo Go on App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: [Expo Go on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Open the link** the developer sent you — it will open directly in Expo Go.

3. **Grant permissions** when prompted:
   - **Camera** — needed to point at houses
   - **Location** — needed to determine your position
   - **Motion** — needed for compass heading

4. **Use the app**:
   - Point your phone camera at a house
   - Adjust the distance slider to estimate how far away the house is (5–50 meters)
   - Tap the **Identify** button
   - The app will show the estimated address and a link to view it on Zillow

## Troubleshooting

- **"Calibrating..." won't go away**: Move your phone in a figure-8 pattern to calibrate the compass.
- **Address seems wrong**: Try adjusting the distance slider — closer or farther than you think.
- **Permissions denied**: Go to your phone's Settings > Expo Go and enable Camera and Location.
- **App won't load**: Make sure you have the latest version of Expo Go installed.
