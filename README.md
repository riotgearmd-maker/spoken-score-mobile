# Vinceró

Vinceró is a cross-platform iOS and Android pronunciation game for singers, built with Expo, React Native, and TypeScript.

The primary loop is hear, repeat, and improve: singers listen to an AI-spoken lyric demonstration, speak the phrase, and receive phoneme-level feedback. The first playable challenge focuses on Italian geminate consonants. RP and General American English are the next pronunciation profiles.

## Run locally

```sh
npm install
npm run ios
# or
npm run android
```

## Current architecture

- `src/app/` contains Expo Router screens.
- `src/domain/` defines challenges, phoneme observations, and grading results.
- `src/services/pronunciationGrader.ts` performs deterministic phoneme and duration scoring.
- `src/services/pronunciationEngine.ts` isolates the app from the speech backend.
- `backend/` normalizes MFA alignment and calibrated Kaldi GOP output behind the
  versioned pronunciation API.

The game records real microphone audio. A deterministic engine remains the safe
development default; set `EXPO_PUBLIC_PRONUNCIATION_ENGINE=remote` and
`EXPO_PUBLIC_PRONUNCIATION_API_URL` to exercise the self-hosted backend. See
`backend/README.md` for its native-engine configuration and test command.
