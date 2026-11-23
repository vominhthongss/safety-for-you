# Safety For You — Registros de decisões de arquitetura

Aceito · 2026-11-23 · corresponde ao código desta branch

[Apresentação e guia de implantação](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo e mapa empacotado

**Contexto:** Precisamos de Expo Go SDK 58 em ambos os sistemas.

**Decisão:** JavaScript, Expo 58/RN 0.88, Leaflet 1.9.4 no WebView, empacotado pelo npm; mosaicos OSM Japan com rótulos em inglês.

**Consequências:** Dispensa extensão nativa MapLibre; exige rede, créditos, capacidade do provedor e testes reais.


## ADR-002 — Dados com origem

**Contexto:** Magnitude, Shindo e grau de tsunami diferem; boletim antigo não comprova alerta vigente.

**Decisão:** Normalizar P2PQuake 551/552/556, preservar emissão/ocorrência e grau publicado; associar somente áreas JMA verificadas.

**Consequências:** Worker fornece títulos recentes. Não inferir valores, coordenadas ou vigência; áreas não simulam ondas/inundação. Manter texto e links oficiais.


## ADR-003 — Primeiro plano

**Contexto:** Não existe infraestrutura monitorada de push.

**Decisão:** REST mínimo de 60 segundos, WebSocket com reconexão e pausa em segundo plano; preferências no AsyncStorage; localização após ação do usuário.

**Consequências:** Sem garantia de alerta em segundo plano ou latência. Pode reutilizar permissão existente; negar localização não bloqueia relatos.


## ADR-004 — Idiomas e leituras

**Contexto:** É preciso reconhecer os nomes originais.

**Decisão:** i18n de 13 idiomas com fallback inglês; seletor mostra 日本語 sem Romaji, demais rótulos japoneses mantêm leitura. Dicionário/Kana e Kuroshiro opcional.

**Consequências:** Documentos em 13 idiomas; UI antiga fora de ja/en/vi é parcial. Não adivinhar nomes; romanização não é tradução de segurança.


## ADR-005 — Horário japonês e acesso

**Contexto:** Fuso e texto grande podem causar erros e sobreposição.

**Decisão:** Interpretar tempo sem fuso como JST e preservar offset ISO; Hoje por Asia/Tokyo, data completa/JST, atualização por minuto e retorno. Cor própria, 44pt, texto escalável, foco modal e movimento reduzido.

**Consequências:** Emissão e ocorrência separadas; legenda abaixo do mapa. Aplicar HIG não significa aprovação Apple ou certificação.


## ADR-006 — Serviços opcionais

**Contexto:** Títulos JMA e Kanji raro precisam de servidor.

**Decisão:** Separar Worker Cloudflare e Node Romaji; URL HTTPS EXPO_PUBLIC; rótulos como texto, nunca HTML executável.

**Consequências:** Cache público, limite de requisições e monitoramento necessários. Configuração embutida; provedores recebem metadados, mapas e texto opcional de conversão.


## ADR-007 — MIT e distribuição

**Contexto:** Precisamos de direitos e caminho de lançamento claros.

**Decisão:** MIT para código/docs originais, termos externos preservados; EAS preview/simulator/production separados e chaves fora do Git.

**Consequências:** Fork comercial permitido com avisos. Cada operador cuida de hospedagem e contas; sem OTA nem endosso oficial.

## Referências

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
