# Phoneme engine evaluation

## Required capabilities

- Scripted pronunciation assessment against a known lyric.
- Phoneme-level accuracy and time offsets.
- Italian (`it-IT`), Received Pronunciation (`en-GB`), and General American (`en-US`).
- Short-phrase latency suitable for a game.
- A stable server API; provider credentials never ship in the mobile app.
- Raw audio deletion after evaluation by default.

## First candidate: Azure Speech Pronunciation Assessment

Azure currently supports pronunciation assessment for all three target locales. Its scripted assessment can return phoneme-level scores, offsets, durations, fluency, and completeness. However, named IPA phonemes and spoken-phoneme candidates are documented only for `en-US`; other locales return phoneme scores without phoneme names. Vinceró can map ordered scores to its curated target transcription, but Italian gemination must be validated with duration data rather than assumed from the vendor score.

Official references:

- https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment
- https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment

## Decision gate

Do not select a production provider until it is tested against coach-labeled recordings for:

1. Italian single versus doubled consonants.
2. Italian open and closed vowels.
3. RP versus General American target vowels and rhoticity.
4. Multiple voice types, registers, devices, and first-language backgrounds.

The mobile `PronunciationEngine` port and `/v1/pronunciation/evaluate` backend contract allow candidates to be compared without changing game code.
