# AGENTS.md — Safety For You

This file is the canonical instruction set for AI coding assistants and contributors. `CHATGPT.md` delegates to this file. Follow these rules for all code and documentation changes.

## Project context

- Safety For You is a free, nonprofit, MIT-licensed, independent disaster-information app for Japan, built with Expo SDK 58, React Native and JavaScript.
- Supported app/documentation locales: `en`, `ja`, `vi`, `zh-CN`, `zh-TW`, `ko`, `tl`, `ne`, `id`, `pt`, `my`, `th`, `hi`.
- Check `App.js`, `src/`, `server/`, `app.config.js`, `package.json`, `.env.example`, and `docs/` before proposing behavior or deployment commands. Never assume a missing configuration file is already available.

## Development expectations

1. Prefer the smallest cohesive change; preserve existing user-facing behavior, localization keys, and safety safeguards unless the task explicitly changes them.
2. iOS map: native Apple Maps/MapKit through `react-native-maps` (`src/AppleSafetyMap.js`). Android map: `react-native-webview` with bundled Leaflet and OSM Japan tiles. Do not introduce native map plugins or API-key requirements without an explicit design decision.
3. Use only source-verified JMA/P2PQuake data for magnitude, Shindo, tsunami warning regions and forecast details; never invent coordinates, warnings, wave propagation, active shelter status or a translation of critical measurements.
4. The optional Cloudflare JMA Worker categorizes recent headlines, **not** confirmed active warning state. The optional Romaji service can misread Kanji; do not fabricate readings. Preserve official sources and emergency disclaimers.
5. Request location only for an explained, consent-based foreground feature; handle denial. Preserve accessible text, clear hazard labels, dark mode, 44pt iOS touch targets, and source attribution.
6. Keep credentials, signing keys, Google Play service-account files, Apple certificate files and API tokens out of Git. `EXPO_PUBLIC_*` variables are included in shipped bundles and cannot hold secrets.

## Documentation rules

- Follow [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md): professional, neutral, unambiguous technical writing in every language. **Do not use regional dialect or colloquial wording in any documentation**, including Vietnamese docs.
- Keep ADR, deployment and Google Play/App Store release instructions synchronized for **all 13 locales**. Update [docs/README.md](docs/README.md) for additions or renames.
- Use Markdown headings, numbered procedures, labeled code fences, references, and explicit prerequisites and limitations. Avoid claiming builds, physical-device tests, service availability or store acceptance without evidence.
- Ensure changes to Apple Maps, Android Leaflet, Expo SDK, permissions, signing, privacy practices or warning semantics are reflected in documentation and release checklists.

## Verification and pull requests

Run where supported:

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Inspect output; do not report success for checks that were not run. A successful JS export does not validate native MapKit, WebView, signing, store review or emergency-data reliability. For changes intended to be merged, use a dedicated branch and pull request with scope, verification results and known limitations. Never publish to either app store as part of a documentation-only task.
