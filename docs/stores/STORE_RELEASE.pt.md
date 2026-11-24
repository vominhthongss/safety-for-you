# Publicação no Google Play e na Apple App Store

Este guia aplica-se ao Safety For You (Expo SDK 58), aplicativo gratuito, sem fins lucrativos e independente de informações sobre desastres. Não substitui a JMA, o J-Alert, autoridades locais ou transmissões de emergência. A aprovação das lojas não é garantida.

## 1. Pré-requisitos e verificação

Prepare Node.js 22+, ambiente Expo compatível, conta Expo e contas de desenvolvedor do Google Play e da Apple. O repositório ainda não possui lockfile do npm nem `eas.json`. Os comandos abaixo verificam o JavaScript, mas não validam os builds nativos.

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. Configurar EAS, identificadores e assinatura

Antes da primeira publicação, defina no `.env` valores exclusivos de `ANDROID_PACKAGE` e `IOS_BUNDLE_ID` sob seu controle. Eles são lidos por `app.config.js` e devem corresponder aos registros das lojas; alterá-los após a publicação pode criar outro aplicativo. Execute `build:configure` para gerar `eas.json` e verificar o vínculo com o projeto Expo.

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — Exemplo de configuração (verificar após gerar):

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

O exemplo utiliza números de build gerenciados e incrementados automaticamente pelo EAS. Atualize também `expo.version` em `app.config.js`. Não reutilize Android versionCode ou iOS buildNumber. Proteja as credenciais de assinatura e a chave de upload, sem incluí-las no Git.

Configure as variáveis necessárias no ambiente production do EAS. `EXPO_PUBLIC_*` é acessível no aplicativo distribuído e não deve conter segredos. O Worker JMA e o serviço Romaji são opcionais; mantenha avisos claros quando não configurados.

## 3. Google Play: Android App Bundle (AAB)

Crie uma conta no Play Console, registre o aplicativo com o identificador Android correto, complete a ficha da loja e ative o Play App Signing. A chave de assinatura gerenciada pelo Google é diferente da chave de upload do EAS. Nunca envie a chave ao Git.

Gere um AAB de produção. O primeiro arquivo pode ser enviado manualmente no Play Console; o Expo Submit pode ser utilizado após configurar com segurança a conta de serviço e a API Google Play. O envio não significa publicação pública.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

Comece com Internal testing ou Closed testing para verificar travamentos, permissões de localização, mapas e falhas de conexão. Contas pessoais de desenvolvedor criadas após 13 de novembro de 2023 podem precisar de pelo menos 12 participantes durante 14 dias consecutivos e autorização para produção. Consulte as exigências da conta no Play Console.

Preencha Data safety, URL da política de privacidade na loja e no aplicativo, classificação indicativa, público-alvo, acesso ao aplicativo, capturas de tela, contato e declarações de permissões. Confira o target API do AAB final (API 36 para novos aplicativos de telefone em novembro de 2026), não apenas o export de JavaScript.

## 4. Apple App Store: arquivo iOS assinado (IPA)

Inscreva-se no Apple Developer Program, crie um App ID e um aplicativo no App Store Connect com o mesmo Bundle ID. Configure os certificados de distribuição e perfis de provisionamento pelo EAS e confirme a equipe Apple responsável.

Gere o IPA assinado, envie-o ao App Store Connect e teste pelo TestFlight em dispositivos reais. O Expo Submit apenas envia o arquivo; não publica automaticamente.

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

No App Store Connect, informe App Privacy, URLs válidas de política de privacidade e suporte, descrição correta, classificação etária, capturas de iPhone e iPad exigidas (`supportsTablet: true`), notas para revisão e conta de teste quando necessário. Selecione o build, envie para App Review e publique após aprovação.

## 5. Segurança e validação de lançamento

Teste Apple Maps no iOS e Leaflet no Android em aparelhos físicos, 13 idiomas, acessibilidade, permissão de localização concedida ou negada, boletins antigos ou ausentes, falhas de rede e atribuição dos mapas. Não prometa alertas oficiais em tempo real, avisos ativos derivados apenas de títulos JMA, simulação da propagação de tsunami ou abrigos comprovadamente abertos.

**Alarme de desastres e notificações:** O aplicativo solicita permissão de notificação somente depois que o usuário ativa a chave de som do alarme. Declare nas respostas de privacidade o uso da localização no dispositivo para o alarme, verifique em dispositivos físicos a tela de alarme, a vibração e o som da notificação, e informe nos metadados da loja que o alarme funciona apenas com o aplicativo aberto e não substitui os Alertas de Emergência oficiais do Japão.

**Pendências atuais: `eas.json`, imagens e capturas para as lojas, URL da política de privacidade, validação de builds nativos assinados e resultado de revisão das lojas. Esta documentação não conclui essas etapas.**

## 6. Atualizações e manutenção

Incremente a versão e o número do build a cada atualização, refaça testes em aparelhos reais, utilize lançamento gradual quando possível, monitore travamentos e termos de provedores, e revise as declarações de privacidade quando os dados tratados mudarem. Se uma fonte falhar, informe a indisponibilidade e encaminhe para canais oficiais.

## Referências oficiais

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[Visão geral da implantação](../deploy/DEPLOY.pt.md) · [Índice da documentação](../README.md)
