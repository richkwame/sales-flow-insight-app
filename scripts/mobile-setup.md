
# Mobile Development Setup Guide

## Initial Setup (Run these commands in your local project after git pull)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add mobile platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Sync to native platforms:**
   ```bash
   npx cap sync
   ```

## Running on Mobile Devices/Emulators

### For Android:
```bash
npx cap run android
```
*Requires Android Studio to be installed*

### For iOS:
```bash
npx cap run ios
```
*Requires macOS with Xcode installed*

## Development Workflow

After making changes to your code:
1. `npm run build` - Build the web app
2. `npx cap sync` - Sync changes to mobile platforms
3. `npx cap run android` or `npx cap run ios` - Run on device/emulator

## Hot Reload During Development

The app is configured to use hot-reload from the Lovable preview URL, so you can make changes in Lovable and see them instantly on your mobile device without rebuilding.

## Requirements

- **For Android**: Android Studio with Android SDK
- **For iOS**: macOS with Xcode (iOS development only works on Mac)
- **For both**: Node.js and npm installed

## Troubleshooting

If you encounter issues:
1. Make sure all dependencies are installed: `npm install`
2. Clean and rebuild: `npm run build && npx cap sync`
3. Check that Android Studio/Xcode are properly configured
4. Ensure your device/emulator is running and connected

