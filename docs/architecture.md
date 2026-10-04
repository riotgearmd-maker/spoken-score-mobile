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

## Pronunciation backend

The mobile client calls a self-hosted service in `backend/`. Montreal Forced
Aligner supplies phone boundaries and Kaldi GOP supplies calibrated phone-level
pronunciation evidence. The backend rejects mismatched phone sequences rather
than merging incompatible phone sets. Raw recordings live only in a per-request
temporary directory that is deleted after evaluation.

## Current critical-path gate

The API and native-engine boundaries are implemented. The remaining research
gate is to train or select a Kaldi acoustic model for each pronunciation profile,
map its phone inventory to the MFA dictionary, and calibrate raw GOP scores
against coach-labeled recordings. Until that validation set exists, the mobile
app keeps the deterministic adapter as its safe development default.
