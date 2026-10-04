# Vinceró pronunciation backend

This service keeps the native speech toolchain off the mobile device. It uses:

- Montreal Forced Aligner (MFA) for reference-phone boundaries.
- Kaldi GOP for phone-level pronunciation evidence.
- A small normalization layer that returns Vinceró's versioned API contract.

The service uses only the Python standard library. MFA, Kaldi, language models,
and the site-specific GOP runner are external runtime dependencies.

## Run the API

```sh
cd backend
python3 -m vincero_backend.server
```

`GET /health` reports whether both native commands are configured. The service
binds to `127.0.0.1:8787` by default; use `VINCERO_HOST` and `VINCERO_PORT` to
change this.

## Configure the engines

Commands are JSON arrays so filenames never pass through a shell. Tokens may
contain the documented placeholders.

```sh
export VINCERO_MFA_COMMAND='["mfa","align_one","{audio}","{transcript}","{dictionary}","{acoustic_model}","{output}","--output_format","json","--clean"]'
export VINCERO_KALDI_GOP_COMMAND='["/opt/vincero/bin/score-gop","--audio","{audio}","--phones","{phones}","--output","{output}","--profile","{profile}"]'
export VINCERO_MFA_DICTIONARY_ITALIAN='italian_cv'
export VINCERO_MFA_ACOUSTIC_MODEL_ITALIAN='italian_cv'
```

Equivalent `_ENGLISH_RP` and `_ENGLISH_GENERAL_AMERICAN` variables are required
before enabling those profiles. The Kaldi command is deliberately site-owned:
GOP phone IDs and scores are only meaningful with the acoustic model and phone
symbol table used to produce them.

MFA must write JSON containing a phone tier as `phones`, `tiers.phones`, or an
MFA interval group named `phones`. The GOP runner must write:

```json
{"modelVersion":"...", "phones":[{"symbol":"t", "score":0.83}]}
```

Scores must be calibrated to `[0, 1]`; raw GOP log scores are rejected rather
than silently presented as user-facing confidence.

## Test

```sh
cd backend
python3 -m unittest discover -s tests -v
```

