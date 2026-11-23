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

- `EXPO_PUBLIC_REFRESH_SECONDS`: 갱신 간격(초, 최소60초).
- `EXPO_PUBLIC_JMA_PROXY_URL`: JMA 제목을 제공하는 선택적 Cloudflare Worker URL.
- `EXPO_PUBLIC_ROMAJI_API_URL`: 선택적 자체 Kanji-Romaji 변환 서비스 URL.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: 서명된 Android/iOS 빌드의 고정 식별자.
- `EXPO_PUBLIC_*`: 공개 변수는 앱에 포함되므로 비밀 정보를 넣지 마세요.
- `Leaflet 1.9.4`: `postinstall`이`src/generated/leafletAssets.js`를 생성하며 지도 타일에는 인터넷이 필요합니다.

## 선택 서비스

선택적 Cloudflare Worker는 /hazards에서 최근 JMA 발표 제목을 제공하며 유효한 경보가 아닙니다. Romaji 서비스도 선택 사항이며 공개 시 HTTPS와 요청 제한이 필요합니다.

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

한자 로마자 변환은`romaji-service/README.md`를 참고하세요(Node.js 22+, HTTPS 프록시 및 요청 제한). 미배포 시 URL을 비워 두세요. Worker가 없으면 날씨 제목 정보를 제공하지 못할 수 있습니다. `.env`에 URL을 입력한 뒤 Expo를 다시 시작하세요.

## 스토어 빌드

스토어 출시 시 Expo/EAS에 로그인하고 빌드 구성을 생성한 뒤 Android와 iOS 프로덕션 빌드를 만드세요. 앱 식별자는 배포자가 관리해야 합니다.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

저장소에는 아직`eas.json`이 없습니다. `build:configure`를 한 번 실행하고 production 설정을 검토하세요. 서명 정보, 스토어 계정, 앱 식별자 및 production 환경 변수를 설정한 후 빌드하세요. 자세한 출시 절차는 아래 문서를 참고하세요.

## 출시 점검

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

게시 전에 개인정보 안내, 아이콘, 스크린샷, 연락처, 실제 기기 및 접근성 테스트, 비공식 재난 정보 고지를 준비하세요. JS 내보내기는 안전 인증이나 App Store 승인과 다릅니다.

## 오픈소스 조건

[MIT 라이선스](../../LICENSE)에 따라 저작권 및 라이선스 고지를 유지하면 상업적 이용을 포함한 사용, 수정, 재배포가 가능합니다. 외부 라이브러리, 지도, 타일 및 데이터에는 각 제공자의 약관이 적용됩니다. 기여 시 출처, 사실 확인 및 안전 안내를 유지하세요.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.ko.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## 앱 스토어 출시

서명, 테스트, 개인정보 공지, 심사, 남은 작업을 다룬[Google Play 및 Apple App Store 출시 가이드](../stores/STORE_RELEASE.ko.md)를 참고하세요.
