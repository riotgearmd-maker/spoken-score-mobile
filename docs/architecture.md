# Vinceró architecture

Vinceró uses ports and adapters around its highest-risk capabilities. Screens depend on use cases and domain types, not speech vendors, storage SDKs, or authentication providers.

## Dependency direction

`screens → use cases → domain`

Adapters implement ports owned by the application layer:

- `AudioCapture` owns permission and recording behavior.
- `PronunciationEngine` converts captured audio into time-aligned phonemes.
- `PronunciationGrader` deterministically converts observations into scores.
- Future `ContentRepository`, `ProgressRepository`, and `AccountRepository` ports will isolate storage and network choices.

## Reproducibility

Every evaluated attempt records the challenge, engine identifier and version, scoring version, and timestamp. Content will also carry a version before coach calibration begins. This allows a result to be reproduced after models or scoring rules change.

## Privacy boundary

Raw audio is transient by default. Capture writes to application cache, the alignment adapter uploads only with explicit consent, and the adapter deletes local and remote temporary audio after evaluation unless the user deliberately saves an attempt.

## Current critical-path gate

The deterministic adapter proves UI and scoring behavior. The next gate replaces it with live recording and an evaluated phoneme-alignment adapter without changing the game or grading layers.
