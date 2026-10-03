# Pronunciation service contract

Provider credentials stay on the server. The mobile client sends a short recording and the versioned challenge target to Vinceró's API.

## `POST /v1/pronunciation/evaluate`

Content type: `multipart/form-data`

- `audio`: the recorded phrase.
- `challenge`: JSON containing `id`, `profileId`, `text`, and ordered target `phonemes`.

Successful response:

```json
{
  "engineId": "provider-adapter-name",
  "engineVersion": "provider-model-or-api-version",
  "phonemes": [
    {
      "symbol": "tː",
      "confidence": 0.91,
      "startMs": 420,
      "endMs": 588,
      "durationMs": 168
    }
  ]
}
```

The API must reject unsupported profiles, enforce phrase-duration and upload-size limits, avoid logging raw audio, and delete temporary recordings after evaluation. Provider output is normalized here; mobile scoring remains deterministic and versioned independently.
