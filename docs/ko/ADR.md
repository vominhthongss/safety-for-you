# Safety For You — 아키텍처 결정 기록

채택 · 2026-11-23 · 이 브랜치의 구현 기준

[소개 및 배포 안내](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo와 지도

**배경:** 두 플랫폼의 Expo Go SDK 58 지원이 필요하다.

**결정:** JavaScript, Expo 58/RN 0.88, WebView 안의 Leaflet 1.9.4와 OSM Japan 영어 지도를 채택하고 npm 설치 시 엔진을 묶는다.

**결과:** MapLibre 네이티브 확장 없이 실행하지만 타일 통신·출처·용량 및 실기기 시험이 필요하다.


## ADR-002 — 출처 기반 재해 정보

**배경:** 규모, 진도, 쓰나미 등급은 다르며 과거 발표는 현재 경보가 아니다.

**결정:** P2PQuake 551/552/556, 발표/발생 시각, 공표 진도·등급을 유지하고 확인된 JMA 지역만 매칭한다.

**결과:** Worker는 최근 제목만 제공한다. 수치·위치·효력을 추측하지 않으며 영역은 파도 전파/침수 모의가 아니다. 문자 등급과 공식 링크를 유지한다.


## ADR-003 — 전경 갱신

**배경:** 관리되는 푸시 설비가 없다.

**결정:** REST 최소 60초, 재연결 WebSocket, 배경 정지, AsyncStorage 설정 저장과 사용자 동작 후 위치 요청을 채택한다.

**결과:** 백그라운드 긴급 알림과 지연을 보장하지 않는다. 기존 허가를 재사용할 수 있고 거부해도 정보가 보인다.


## ADR-004 — 언어와 읽기

**배경:** 원래 지명을 식별해야 한다.

**결정:** 13언어 i18n과 영어 대체; 언어명은 日本語, 다른 일본어는 로마자를 유지한다. 사전/가나 및 선택적 Kuroshiro를 사용한다.

**결과:** 문서는 13언어지만 ja/en/vi 외 기존 UI는 일부 번역이다. 모르는 읽기를 추측하지 않으며 로마자는 안전 지침 번역이 아니다.


## ADR-005 — 일본 시간과 접근성

**배경:** 시간대와 큰 글자 때문에 오독·겹침이 생길 수 있다.

**결정:** 무오프셋 시각은 JST, ISO 오프셋은 유지하고 Asia/Tokyo로 오늘을 판단한다. 전체 날짜/JST, 매분·복귀 시 갱신, 시간 색상, 44pt, 글자 확대, 모달 포커스와 동작 줄이기를 적용한다.

**결과:** 발표/발생을 구분하고 범례는 지도 아래에 둔다. Apple HIG 적용이 승인이나 접근성 인증을 의미하지 않는다.


## ADR-006 — 별도 서비스

**배경:** JMA 제목과 드문 한자는 서버 처리가 필요하다.

**결정:** Worker와 Node 로마자 서비스를 분리하고 HTTPS EXPO_PUBLIC URL, 실행 HTML이 아닌 텍스트 표시를 사용한다.

**결과:** 공개 캐시·속도 제한·감시가 필요하다. 설정은 앱에 포함되고 제공자는 통신정보·지도 요청·선택적 변환 텍스트를 받는다.


## ADR-007 — MIT와 배포

**배경:** 재사용 권한과 배포 경로가 명확해야 한다.

**결정:** 원본 코드/문서는 MIT, 외부 조건 유지, EAS preview/simulator/production 분리와 Git 밖 서명 보관을 채택한다.

**결과:** 상업 포크도 고지를 남긴다. 운영자는 자체 호스팅·계정을 마련하며 OTA와 공식 보증은 없다.

## 참고 자료

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
