# Safety For You — 소개 및 배포 안내

[아키텍처 결정 기록](ADR.md) · [🌐](../README.md)

## 1. 프로젝트와 오픈 소스

Safety For You는 일본 거주자와 여행자를 위한 무료 비영리 앱입니다. 지진·쓰나미 정보, 최근 기상 발표, 지도와 지정 긴급 대피 장소를 제공합니다. 정부 공식 서비스가 아닌 독립 프로젝트입니다. 앱이 열린 동안만 갱신하며 백그라운드 긴급 푸시나 오프라인 안전을 보장하지 않습니다.

원본 코드와 문서는 [MIT](../../LICENSE)로 공개합니다. 저작권 및 허가 문구를 유지하면 사용·수정·재배포·판매할 수 있고, 비영리 목적이 상업적 포크를 금지하지 않습니다. 보증은 없습니다. 외부 자료·지도·라이브러리는 [별도 조건](../../THIRD_PARTY_NOTICES.md)을 따릅니다. 기여는 포크, 브랜치, 검증, PR 순으로 진행하며 인증 정보와 서명 키를 커밋하지 마세요.

## 2. 준비 사항

Node.js 22+, npm, Git, SDK 58 호환 Expo Go가 필요합니다. 로컬 iOS는 macOS/Xcode, Android는 호환 SDK/JDK가 필요합니다. 클라우드 빌드는 Expo 계정, 스토어 배포는 자신의 Apple Developer/Google Play Console 계정을 사용합니다. DB나 Google Maps 키는 필요하지 않습니다.

## 3. 로컬 실행

저장소 루트에서 실행하고 기존 `.env`를 덮어쓰지 마세요. 아래 변수를 설정하고 Expo Go로 QR을 스캔합니다. 설치 시 Leaflet을 묶습니다. 생성 파일이 없으면 `npm run bundle:maps`를 실행합니다. 13개 언어를 선택할 수 있지만 일본어·영어·베트남어 외 기존 문구 일부는 영어로 표시됩니다.

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| 변수 | 의미 |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | 선택적 시작 지연, 0–600ms. |
| `EXPO_PUBLIC_REFRESH_SECONDS` | 전경 갱신 주기: 최소 60초, 기본 120초. |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker HTTPS 기본 URL. /hazards 제외; 빈 값이면 기상 소스 비활성화. |
| `EXPO_PUBLIC_ROMAJI_API_URL` | 로마자 HTTPS 기본 URL. /romaji 제외; 빈 값이면 로컬 읽기만 사용. |
| `ANDROID_PACKAGE` | 자신의 Android 앱 ID. |
| `IOS_BUNDLE_ID` | 자신의 iOS Bundle ID. |
| `EAS_PROJECT_ID` | Expo 프로젝트 UUID. Expo Go는 생략 가능, EAS는 자신의 프로젝트 연결 필요. |

## 4. 선택 사항: JMA Worker

`wrangler.toml`의 이름을 고유하게 정하고 루트에서 Cloudflare 로그인 후 배포합니다. 예시 호스트를 Wrangler가 반환한 URL로 바꾸세요. `/hazards`에 `items`, `kind`가 있어야 하며 `degraded: true`는 일부 소스 실패입니다. 기본 URL을 `.env`에 넣습니다. Worker는 JMA Atom 제목만 분류하며 현재 경보 효력이나 측정값을 검증하지 않습니다.

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. 선택 사항: 로마자 서비스

VPS의 별도 터미널에서 실행합니다. 운영에서는 systemd/컨테이너/프로세스 관리자를 사용하고 3088 포트 앞에 HTTPS 역방향 프록시를 둡니다. 직접 접근, 요청 크기와 빈도를 제한하세요. `/health`의 `{"ok":true}` 및 `/romaji`의 읽기 배열을 확인하고 기본 URL을 설정합니다. 지명·발표문·대피 장소 주소가 전송될 수 있으므로 본문 로그는 최소화합니다. 실패해도 로컬 사전과 가나 변환은 작동합니다.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Android와 iOS 빌드

Expo dashboard에서 자신의 프로젝트를 만들고 UUID를 `EAS_PROJECT_ID`에 입력합니다. 첫 빌드 전에 양쪽 앱 ID를 정하고 포크라면 `app.config.js`의 이름/slug/scheme을 수정합니다. `eas.json`에는 preview(Android APK/iOS ad hoc), simulator(iOS 시뮬레이터), production(Android AAB/iOS 스토어)이 있습니다. Expo의 preview와 production 환경 모두에 표의 설정한 변수를 등록하세요. Git 제외 `.env`는 자동 업로드되지 않으며 이 값은 공개 설정입니다. 변경 후 Metro 재시작 또는 재빌드가 필요합니다.

로그인 후 원하는 명령을 선택하면 EAS가 다운로드 링크를 제공합니다. iOS ad hoc는 `npx eas-cli device:create` 기기 등록과 Apple 서명이 필요합니다. 시뮬레이터 빌드는 iPhone에 설치할 수 없습니다. 로컬 도구가 준비되면 `--local`을 추가할 수 있습니다.

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. 스토어 제출

production 빌드 후 해당 플랫폼을 제출합니다. EAS로 서명을 관리하고 키를 Git에 넣지 않습니다. Google Play에는 AAB, iOS는 App Store Connect/TestFlight에 제출하며 자동 공개되지 않습니다. 설명·아이콘·스크린샷·개인정보 정책·데이터 공개 및 실기기 검증 후 심사를 요청하세요. App Store Connect 앱 ID와 Google 서비스 계정 키는 본인의 배포 계정에서 관리합니다.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. 검증

명령 실행 후 양쪽 실기기에서 13언어, 日本語 이름, 발표/발생 시각, 다른 시간대에서 일본 자정, 밝음/어두움/고대비, 200% 글자, VoiceOver/TalkBack과 모달 포커스, 동작 줄이기, 위치 거부, 오프라인, 출처와 범례를 확인합니다. JS 내보내기 성공은 네이티브 시험이나 Apple 승인이 아닙니다. [UI 점검](../UI_DESIGN.md)을 참고하세요.

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. 업데이트와 복구

검증한 commit/빌드 번호를 기록합니다. `app.config.js` version을 바꾸면 production 빌드 번호는 EAS가 증가시킵니다. EAS Update는 미설정이므로 새 네이티브 빌드로 배포합니다. Worker는 안정 commit 재배포/Cloudflare 복구, Romaji는 이전 버전 재시작으로 복구합니다. 스토어는 자동 다운그레이드가 불가능하므로 이전 소스를 더 높은 번호로 빌드합니다. 엔드포인트와 지도 사용량을 감시합니다.

## 10. 참고 자료

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
