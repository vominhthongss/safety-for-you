# Guia de implantação — Safety For You (Português)

Safety For You é um aplicativo gratuito, sem fins lucrativos e de código aberto, voltado a informações sobre desastres no Japão, sob licença MIT. Não substitui JMA, J-Alert nem orientações locais.

## Pré-requisitos

É necessário Node.js 22+ e Expo Go compatível com SDK 58. Este repositório não tem lockfile; execute npm install.

## Execução local

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

## Serviços opcionais

O Worker opcional da Cloudflare publica títulos recentes da JMA em /hazards, não alertas ativos. O serviço de Romaji também é opcional; publique apenas com HTTPS e limites de acesso.

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## Builds para lojas

Para publicar nas lojas, entre no Expo/EAS, configure o projeto e crie builds de produção para Android e iOS. Os identificadores devem pertencer ao publicador.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## Verificação de lançamento

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Antes da publicação, forneça informações de privacidade, ícone, capturas de tela, contato, testes em aparelhos/acessibilidade e aviso de que o app não é um serviço oficial. Exportar JS não certifica segurança nem aprovação na App Store.

## Termos de código aberto

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.pt.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
