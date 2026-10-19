# Arabic With Friends: versão mobile (Android e iOS)

O mesmo código React alimenta o site, o app Android e o app iOS, via Capacitor.

## Configuração antes do primeiro build

1. Copie `.env.example` para `.env` e defina `VITE_API_BASE_URL` com a URL pública do servidor
   (é o servidor que hospeda `/api/dictionary/check` e a chave do Gemini).
2. Confirme o `appId` em `capacitor.config.ts` (ex.: `com.ibrahim.arabicwithfriends`).
   Ele é único nas lojas e não pode ser alterado depois de publicado.
3. Coloque o ícone (1024x1024) e a splash nas pastas nativas, ou use `@capacitor/assets`.

## Fluxo de desenvolvimento

```bash
npm install
npm run cap:sync        # gera o build web e copia para os projetos nativos
npm run cap:android     # abre o projeto no Android Studio
npm run cap:ios         # abre o projeto no Xcode (somente macOS)
```

Sempre que mudar o código do jogo, rode `npm run cap:sync` de novo antes de gerar o app.

## Android (Google Play)

- Requisitos: Android Studio, JDK 17+ e Android SDK.
- Gerar o pacote para a Play Store: Android Studio > Build > Generate Signed App Bundle (AAB).
- Guarde o keystore de assinatura em local seguro: sem ele não é possível atualizar o app.
- Conta de desenvolvedor Google Play: taxa única.

## iOS (App Store / TestFlight)

- Requisitos: Mac com Xcode, CocoaPods (`sudo gem install cocoapods`) e conta Apple Developer (anual).
- Na primeira vez, rode `cd ios/App && pod install`.
- Sem Mac: dá para compilar na nuvem com Codemagic ou EAS Build.

## Observações

- O login e o histórico de jogadores ainda são simulados no `localStorage` do aparelho.
  Se for publicar com contas reais, o próximo passo é um backend de autenticação.
- O Gemini só funciona se o servidor estiver no ar com `GEMINI_API_KEY` configurada.
