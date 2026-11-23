# Safety For You — Apresentação e guia de implantação

[Registros de decisões de arquitetura](ADR.md) · [🌐](../README.md)

## 1. Projeto e código aberto

Safety For You é um aplicativo móvel gratuito e sem fins lucrativos para moradores e visitantes do Japão. Reúne relatos de terremotos e tsunamis, boletins meteorológicos recentes, mapas e locais designados de evacuação de emergência. É independente, não um serviço governamental. Atualiza enquanto está aberto; não oferece push emergencial em segundo plano nem garantia de funcionamento offline.

O código e os documentos originais usam a licença [MIT](../../LICENSE): é permitido usar, modificar, redistribuir e vender, mantendo os avisos de direitos autorais e permissão. O propósito sem fins lucrativos não impede forks comerciais. Não há garantia. Dados, mapas e dependências seguem [termos próprios](../../THIRD_PARTY_NOTICES.md). Para contribuir, faça um fork, crie uma branch, execute as verificações e abra um PR. Não envie credenciais ou chaves de assinatura ao Git.

## 2. Requisitos

Use Node.js 22+, npm, Git e Expo Go compatível com SDK 58. Compilação iOS local exige macOS/Xcode; Android exige SDK/JDK compatíveis. Nuvem requer conta Expo; lojas exigem suas contas Apple Developer/Google Play Console. Não precisa de banco de dados nem chave Google Maps.

## 3. Execução local

Execute na raiz do repositório; preserve um `.env` existente. Preencha a tabela e leia o QR com Expo Go. A instalação empacota Leaflet; se faltar o arquivo gerado, execute `npm run bundle:maps`. Há 13 idiomas selecionáveis; parte dos textos antigos fora de ja/en/vi ainda usa inglês como alternativa.

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| Variável | Significado |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | Espera inicial opcional de 0–600 ms. |
| `EXPO_PUBLIC_REFRESH_SECONDS` | Intervalo em primeiro plano: mínimo 60 segundos, padrão 120. |
| `EXPO_PUBLIC_JMA_PROXY_URL` | URL HTTPS base do Worker, sem /hazards; vazio desativa a fonte meteorológica. |
| `EXPO_PUBLIC_ROMAJI_API_URL` | URL HTTPS base do Romaji, sem /romaji; vazio mantém somente leituras locais. |
| `ANDROID_PACKAGE` | ID Android próprio. |
| `IOS_BUNDLE_ID` | Bundle ID iOS próprio. |
| `EAS_PROJECT_ID` | UUID do projeto Expo; opcional no Expo Go, EAS deve apontar para seu projeto. |

## 4. Worker JMA opcional

Defina nome exclusivo em `wrangler.toml`, entre no Cloudflare e publique a partir da raiz. Substitua o domínio de exemplo pela URL retornada. `/hazards` deve devolver JSON com `items` e `kind`; `degraded: true` indica falha parcial das fontes. Configure a URL base em `.env`. O Worker classifica títulos Atom da JMA, sem validar alertas atualmente vigentes ou medições.

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. Serviço Romaji opcional

Inicie em outro terminal do VPS. Em produção, use systemd, contêiner ou supervisor, proxy reverso HTTPS na frente da porta 3088 e limites de acesso direto, tamanho e frequência. Confira `{"ok":true}` em `/health` e o array de leituras em POST `/romaji`; configure a URL base. Solicitações podem conter lugares, boletins e endereços de abrigos; minimize logs do corpo. Dicionário/Kana locais continuam em caso de falha.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Compilar Android e iOS

Crie seu projeto no Expo dashboard e informe o UUID em `EAS_PROJECT_ID`. Escolha os dois identificadores antes da primeira compilação; num fork, altere nome/slug/scheme em `app.config.js`. `eas.json` contém preview (APK Android/ad hoc iOS), simulator (iOS Simulator) e production (AAB Android/loja iOS). Cadastre as variáveis preenchidas nos ambientes preview e production do Expo. O `.env` ignorado pelo Git não é enviado; são configurações públicas, não segredos. Reinicie Metro ou recompile após mudanças.

Entre na conta e escolha o comando. EAS fornece a URL de download. iOS ad hoc exige `npx eas-cli device:create` e assinatura Apple. A versão Simulator não funciona no iPhone. Acrescente `--local` se a máquina tiver as ferramentas nativas necessárias.

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. Enviar às lojas

Compile production e envie a plataforma escolhida. Gerencie assinaturas pelo EAS; não salve chaves no Git. Google Play recebe AAB; iOS vai para App Store Connect/TestFlight e não é publicado automaticamente. Complete descrição, ícones, capturas, política de privacidade, declarações de dados e testes reais antes da revisão. App ID do App Store Connect e chave de conta de serviço Google pertencem à sua configuração de distribuição.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. Verificação

Execute os comandos e teste em aparelhos iOS/Android: 13 idiomas, 日本語, emissão/ocorrência, meia-noite japonesa em outro fuso, claro/escuro/alto contraste, texto 200%, VoiceOver/TalkBack e foco modal, Reduzir Movimento, localização negada, falha de rede, créditos e legenda. Exportar JS não substitui teste nativo nem aprovação Apple. Veja a [auditoria de UI](../UI_DESIGN.md).

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. Atualizações e recuperação

Registre commit e builds verificados. Altere version em `app.config.js`; EAS incrementa o número production. Não há EAS Update configurado: publique nova compilação nativa. Recupere o Worker com commit estável ou rollback Cloudflare e reinicie o Romaji anterior. Lojas não fazem downgrade silencioso: compile o código anterior com número maior. Monitore endpoints, limites de mapas e fontes.

## 10. Referências

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
