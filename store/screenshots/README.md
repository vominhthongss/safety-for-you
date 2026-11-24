# Store screenshots

Screenshots must come from a real build of the app (iOS Simulator, Android emulator or device). They are not generated in the build container.

## Folders

| Folder | Device | Accepted sizes (portrait) | Count |
|---|---|---|---|
| `iphone-6.9/` | iPhone 17 Pro Max or 16 Pro Max simulator | 1320 × 2868, 1290 × 2796 | 1–10 (this or `iphone-6.5/` is required) |
| `iphone-6.5/` | iPhone 11 Pro Max simulator (optional) | 1284 × 2778, 1242 × 2688 | 0–10 |
| `ipad-13/` | iPad Pro 13-inch (M4) simulator | 2064 × 2752, 2048 × 2732 | 1–10 (required while `ios.supportsTablet` is `true`) |
| `android-phone/` | Android emulator or phone | each side 320–3840 px, long side ≤ 2.3 × short side, no alpha | 2–8 |

## Procedure

1. Build and run a release-like build: `npx expo run:ios --configuration Release` on the simulator, or install the EAS `preview` APK on Android.
2. Wait until live data has loaded, then open the screen to capture.
3. Run, for example:

   ```bash
   bash scripts/capture-store-screenshot.sh iphone-6.9 01-home
   ```

   The script sets a clean status bar (9:41, full battery), saves `store/screenshots/<folder>/<name>.png` and checks its size.
4. When all folders are filled, run `npm run check:screenshots`.

## Suggested shot list

Use the same order on every device. File names sort the upload order.

1. `01-home`: Home with location, alarm switch and the hazard list.
2. `02-earthquake-map`: Earthquake screen with a selected report: epicenter Shindo badge, user position and both framed on the map.
3. `03-tsunami`: Tsunami screen with a bulletin and coastline colors, if a bulletin exists; otherwise the protective steps.
4. `04-shelter`: Evacuation places with the map and the list.
5. `05-what-to-do`: Protective steps and the Shindo guide.
6. `06-japanese`: Any screen in Japanese with Romaji readings.

## Rules for content

- Show real data only. Do not edit a screenshot to add warnings, intensities or tsunami areas that were not issued.
- Do not imply official affiliation or real-time guaranteed alerts (see the safety gate in `docs/stores/STORE_RELEASE.en.md`).
- Text overlays and device frames are optional. Google Play advises against device frames and ranking or price text.
