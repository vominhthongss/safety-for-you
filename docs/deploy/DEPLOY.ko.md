# 배포 안내 — Safety For You (한국어)

Safety For You는 일본 재난 정보용 무료·비영리 오픈소스 앱이며 MIT 라이선스로 배포됩니다. JMA, J-Alert 또는 지자체 지시를 대체하지 않습니다.

## 사전 준비

Node.js 22 이상 및 SDK 58 호환 Expo Go를 준비하세요. 저장소에 lockfile이 없으므로 npm install을 실행하세요.

## 로컬 실행

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: refresh interval (minimum 60 s).
- `EXPO_PUBLIC_JMA_PROXY_URL`: optional Cloudflare Worker URL.
- `EXPO_PUBLIC_ROMAJI_API_URL`: optional self-hosted Kanji/Romaji endpoint.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: app identifiers for native builds.
- `EXPO_PUBLIC_*` values are embedded in public client bundles; never put secrets in them.
- Leaflet 1.9.4 is generated locally by `postinstall` into `src/generated/leafletAssets.js`. Map raster tiles still require network access.

## 선택 서비스

선택적 Cloudflare Worker는 /hazards에서 최근 JMA 발표 제목을 제공하며 유효한 경보가 아닙니다. Romaji 서비스도 선택 사항이며 공개 시 HTTPS와 요청 제한이 필요합니다.

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## 스토어 빌드

스토어 출시 시 Expo/EAS에 로그인하고 빌드 구성을 생성한 뒤 Android와 iOS 프로덕션 빌드를 만드세요. 앱 식별자는 배포자가 관리해야 합니다.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## 출시 점검

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

게시 전에 개인정보 안내, 아이콘, 스크린샷, 연락처, 실제 기기 및 접근성 테스트, 비공식 재난 정보 고지를 준비하세요. JS 내보내기는 안전 인증이나 App Store 승인과 다릅니다.

## 오픈소스 조건

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.ko.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
