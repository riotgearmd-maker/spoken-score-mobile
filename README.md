# Spoken Score Mobile

Cross-platform iOS and Android pronunciation game for singers, built with Expo, React Native, and TypeScript.

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
- `src/services/pronunciationEngine.ts` is the boundary for the future microphone/alignment provider.

The current game uses a deterministic sample phoneme trace so the interaction and scoring can be developed before choosing the production recognition backend.
