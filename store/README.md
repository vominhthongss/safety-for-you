# Store graphics

## Overview

This directory and `assets/` contain the graphics for the Google Play and App Store listings. All artwork is original: a shield with a wave, rendered from SVG by `scripts/render-assets.cjs`. Apple's SF Symbols license does not permit symbols in app icons or logos, so none are used here.

Requirements were checked on 2026-11-24 against the [App Store Connect screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) and [Play Console preview assets](https://support.google.com/googleplay/android-developer/answer/9866151). Confirm them again in each console before uploading.

## Included

| File | Size and format | Used for |
|---|---|---|
| `assets/icon.png` | 1024 × 1024 PNG, RGB, no alpha | `expo.icon`: iOS App Store icon (generated into `AppIcon.appiconset`) and Android legacy launcher icon |
| `assets/adaptive-icon.png` | 1024 × 1024 PNG, transparent | `android.adaptiveIcon.foregroundImage` (glyph inside the 66% safe zone; background `#0057D9`) |
| `assets/adaptive-monochrome.png` | 1024 × 1024 PNG, alpha mask | `android.adaptiveIcon.monochromeImage` (Android 13+ themed icons) |
| `assets/splash-icon.png` | 1024 × 1024 PNG, transparent | `expo-splash-screen` image on the `#E8F5F4` background |
| `assets/icon-dark.png` | 1024 × 1024 PNG, transparent | `ios.icon.dark`: iOS 18 dark appearance |
| `assets/icon-tinted.png` | 1024 × 1024 PNG, grayscale glyph | `ios.icon.tinted`: iOS 18 tinted appearance |
| `assets/notification-icon.png` | 96 × 96 PNG, white on transparent | `expo-notifications` `icon` (Android status bar), accent color `#0057D9` |
| `store/google-play/icon-512.png` | 512 × 512 PNG, 32-bit | Google Play listing icon |
| `store/google-play/feature-graphic.png` | 1024 × 500 PNG, RGB, no alpha | Google Play feature graphic |

`npx expo prebuild` was run on a scratch copy and generated the Android launcher, round, foreground and monochrome mipmaps, `drawable-*/notification_icon.png` for five densities with `notification_icon_color`, the iOS light (RGB), dark and tinted 1024 icons and the splash logo from these files.

## Not included: publisher tasks

The following items cannot be produced in the build container and must be completed by the publisher.

1. **Screenshots from the real app.** No iOS Simulator or Android emulator is available in the container. Capture them from a release build with real data using `scripts/capture-store-screenshot.sh` and validate them with `npm run check:screenshots`; folders, shot list and rules are in [screenshots/README.md](screenshots/README.md):
   - iPhone: at least one 6.9" (or 6.5") screenshot; up to 10.
   - iPad: at least one 13" screenshot (2064 × 2752 or 2048 × 2732), because `ios.supportsTablet` is `true`. Set it to `false` if iPad support is not intended.
   - Google Play: 2 to 8 phone screenshots, JPEG or 24-bit PNG without alpha, each side 320–3840 px, long side at most 2.3 × the short side.
   - Do not show active-warning claims that the app does not make; see the safety gate in `docs/stores/STORE_RELEASE.en.md`.
2. **Publish the privacy policy.** The policy is written in `docs/privacy/` (English, Japanese, Vietnamese) and the app links to `https://vominhthongss.github.io/safety-for-you/privacy/`. Enable GitHub Pages (Settings → Pages → branch `main`, folder `/docs`) and check that the URL loads, or host it elsewhere and set `EXPO_PUBLIC_PRIVACY_POLICY_URL`. GitHub Pages on a private repository requires a paid GitHub plan. Questionnaire answers: [REVIEW-ANSWERS.md](REVIEW-ANSWERS.md).
3. **Visual review.** Check the icon at small sizes on a device (home screen, Settings, Spotlight) and the themed icon on Android 13+.
4. **Optional:** Android tablet screenshots, App Store preview video.

## Regenerating

```bash
node scripts/render-assets.cjs            # or: node scripts/render-assets.cjs assets/notification-icon.png
python3 -c "from PIL import Image as I;[I.open(f).convert('RGB').save(f) for f in ['assets/icon.png','store/google-play/feature-graphic.png']]"
```

The script uses the Playwright Chromium that is available in the build container; Playwright is not a project dependency.
