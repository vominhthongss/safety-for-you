# Google Play 및 Apple App Store 출시 가이드

이 문서는 Safety For You(Expo SDK 58)의 출시 절차를 설명합니다. 이 앱은 무료·비영리·독립 재난 정보 서비스이며 JMA, J-Alert, 지자체 지침 또는 긴급 방송을 대체하지 않습니다. 스토어 심사 승인은 보장되지 않습니다.

## 1. 준비 사항과 검증

Node.js 22 이상, 호환 Expo 환경, Expo 계정 및 Google Play·Apple 개발자 계정이 필요합니다. 현재 저장소에는 npm 잠금 파일과 `eas.json`이 없습니다. 아래 명령은 JavaScript만 검증하므로 네이티브 빌드 테스트를 대신하지 않습니다.

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. EAS, 식별자 및 서명 설정

최초 출시 전에 `.env`의 `ANDROID_PACKAGE`, `IOS_BUNDLE_ID`를 소유한 고유 식별자로 설정하고 `app.config.js` 및 스토어 등록 정보와 일치시킵니다. 출시 후 변경 시 다른 앱으로 처리될 수 있습니다. `build:configure`로 `eas.json`을 만들고 Expo 프로젝트 연결을 확인합니다.

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — 설정 예시(생성 후 검토):

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

예시는 EAS가 빌드 번호를 관리하며 자동 증가시킵니다. `app.config.js`의 `expo.version`도 출시 버전에 맞춥니다. Android versionCode와 iOS buildNumber를 재사용하지 마세요. 업로드 키와 Apple 서명 정보를 비공개로 보관합니다.

EAS production 환경에 필요한 환경 변수를 설정하세요. `EXPO_PUBLIC_*`는 배포 앱에 노출되므로 비밀키를 저장하면 안 됩니다. JMA Worker와 로마자 서비스는 선택 사항이며 미설정 상태를 명확히 표시해야 합니다.

## 3. Google Play: Android App Bundle(AAB)

Play Console 계정을 만들고 앱과 올바른 패키지 ID를 등록한 뒤 스토어 정보와 Play App Signing을 설정합니다. Google의 앱 서명 키와 EAS의 업로드 키는 별개입니다. 업로드 키를 Git에 올리지 마세요.

production AAB를 생성합니다. 첫 빌드는 Play Console에서 직접 업로드할 수 있으며, 이후 Google Play API와 서비스 계정 권한을 안전하게 설정한 경우 Expo Submit을 사용할 수 있습니다. 업로드만으로 공개되지 않습니다.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

Internal testing 또는 Closed testing에서 충돌, 위치 권한, 지도, 네트워크 오류를 확인하세요. 2023년 11월 13일 이후 개설한 개인 개발자 계정은 12명 이상이 14일 연속 참여하는 비공개 테스트와 정식 출시 승인 절차가 필요할 수 있습니다. Play Console의 현재 요건을 확인하세요.

Data safety, 스토어와 앱 내부의 개인정보처리방침 URL, 콘텐츠 등급, 대상 사용자, 앱 접근 정보, 스크린샷, 연락처 및 권한을 신고합니다. 최종 AAB의 target API가 현재 기준(2026년 11월 신규 휴대전화 앱 API 36)을 충족하는지 확인하세요.

## 4. App Store: 서명된 iOS IPA

Apple Developer Program에 가입하고 동일 Bundle ID로 App ID와 App Store Connect 앱을 생성합니다. EAS에서 배포 인증서와 프로비저닝 프로파일을 설정하고 Apple 팀 소유권을 확인합니다.

서명된 IPA를 빌드해 App Store Connect에 업로드한 후 TestFlight로 실기기 테스트를 수행합니다. Expo Submit은 업로드만 처리하며 자동으로 공개하지 않습니다.

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

App Store Connect에서 App Privacy, 유효한 개인정보처리방침 및 지원 URL, 정확한 설명, 연령 등급, 규격에 맞는 iPhone 및 필요한 iPad 스크린샷(`supportsTablet: true`), 심사 메모와 필요 시 테스트 계정을 입력합니다. 빌드를 선택해 App Review에 제출하고 승인 후 공개합니다.

## 5. 안전성 및 출시 검증

실제 iOS·Android 기기에서 각각 Apple Maps와 Leaflet, 13개 언어, 접근성, 위치 권한 허용·거부, 오래되거나 누락된 알림, 오프라인 상태 및 지도 출처 표시를 검증합니다. 공식 실시간 경보, JMA 제목만으로 판단한 유효 경보, 쓰나미 전파 시뮬레이션 또는 대피소 개방 상태를 보장하지 마세요.

**재해 경보와 알림:** 앱은 사용자가 경보음 스위치를 켠 후에만 알림 권한을 요청합니다. 개인정보 답변에 경보를 위한 기기 내 위치 사용을 공개하고, 실제 기기에서 경보 화면, 진동, 알림음을 확인하며, 경보는 앱이 열려 있을 때만 작동하고 일본의 공식 긴급 경보를 대체하지 않는다는 점을 스토어 정보에 명시하십시오.

**현재 미완료 항목: `eas.json`, 스토어용 이미지·스크린샷과 개인정보처리방침 URL, 서명된 실기기 빌드 검증, 스토어 심사 결과. 문서만으로 배포 준비가 완료되지 않습니다.**

## 6. 업데이트와 유지 관리

업데이트마다 버전과 빌드 번호를 올리고 실기기 테스트를 반복하며 단계적 배포, 충돌 모니터링, 데이터 공급자 약관 및 개인정보 공지를 점검합니다. 데이터 제공 실패 시 장애 상태를 명확히 표시하고 공식 재난 안내로 연결합니다.

## 공식 참고 자료

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[배포 개요](../deploy/DEPLOY.ko.md) · [문서 목차](../README.md)
