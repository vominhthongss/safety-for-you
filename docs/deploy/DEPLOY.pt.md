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

- `EXPO_PUBLIC_REFRESH_SECONDS`: Intervalo de atualização em segundos (mínimo 60).
- `EXPO_PUBLIC_JMA_PROXY_URL`: URL opcional do Cloudflare Worker para títulos da JMA.
- `EXPO_PUBLIC_ROMAJI_API_URL`: URL opcional de serviço próprio de Kanji para Romaji.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Identificadores permanentes de builds Android/iOS assinados.
- `EXPO_PUBLIC_*`: Variáveis públicas entram no aplicativo; não armazene segredos.
- `Leaflet 1.9.4`: O `postinstall` gera `src/generated/leafletAssets.js`; os blocos do mapa ainda exigem Internet.

## Serviços opcionais

O Worker opcional da Cloudflare publica títulos recentes da JMA em /hazards, não alertas ativos. O serviço de Romaji também é opcional; publique apenas com HTTPS e limites de acesso.

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Consulte`romaji-service/README.md`para conversão Kanji/Romaji (Node.js 22+, HTTPS e limites de requisições). Deixe a URL vazia quando o serviço não estiver implantado; sem Worker, títulos meteorológicos podem não aparecer. Reinicie o Expo após alterar `.env`.

## Builds para lojas

Para publicar nas lojas, entre no Expo/EAS, configure o projeto e crie builds de produção para Android e iOS. Os identificadores devem pertencer ao publicador.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

O repositório ainda não inclui`eas.json`. Execute`build:configure`uma vez e revise o perfil production. Configure credenciais de assinatura, contas das lojas, identificadores e variáveis de produção antes do build. Consulte as instruções detalhadas abaixo.

## Verificação de lançamento

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Antes da publicação, forneça informações de privacidade, ícone, capturas de tela, contato, testes em aparelhos/acessibilidade e aviso de que o app não é um serviço oficial. Exportar JS não certifica segurança nem aprovação na App Store.

## Termos de código aberto

Pela[Licença MIT](../../LICENSE), o código pode ser usado, modificado e redistribuído, inclusive comercialmente, desde que o aviso de direitos autorais e licença seja preservado em cópias substanciais. Bibliotecas, mapas, tiles e fontes externas mantêm termos próprios. Contribuições devem preservar atribuição, verificação de fontes e avisos de segurança.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.pt.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## Publicação nas lojas de aplicativos

Veja o[guia de publicação no Google Play e na Apple App Store](../stores/STORE_RELEASE.pt.md), com assinatura, testes, privacidade, revisão e pendências atuais.
