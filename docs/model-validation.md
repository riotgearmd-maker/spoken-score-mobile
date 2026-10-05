# Speech model validation gate

The mobile game must remain on the development engine until alignment and GOP
calibration pass a held-out set of human recordings. Installing binaries and
models does not establish pronunciation accuracy.

## Local provisioning

Docker Desktop stores its VM disk on `/Volumes/Drive/Users/Jody/DockerDesktop`.
The `vincero-mfa-models` volume is mounted at `/models` with
`MFA_ROOT_DIR=/models`, owned by the image's `mfauser` account.

Pinned runtimes:

- MFA: `sha256:1986960fcb5169979630a7efb2576480c587500ab556c9daa66a930f471215b8`
- Kaldi: `sha256:335fa60ff1b70d5145dfea83bb6e4cd7b9b8e40bfbf11b8688cd04b358f952f2`

Both run as `linux/amd64` under Apple Silicon emulation.

## Italian reference mismatch

The downloaded Italian CV dictionary contains `bello b e lː o` and
`notte n o tː e`; the game's reviewed targets require `ɛ` and `ɔ` respectively.
Consequently, stock dictionary output must not be treated as authoritative
Italian lyric diction. Add word-level, coach-reviewed pronunciations to content
and construct a challenge-specific dictionary using the model's supported phone
inventory. Retain lexical stress independently from phone duration.

## Remaining gates

The synthetic Italian sample produced parseable JSON only at beam 1000, but its
timings were implausible (several 30 ms phones and a 720 ms consonant). This is a
failed quality gate, not a validated alignment. Do not use that diagnostic beam
as a production fallback. The runner uses beam 100 and reports failure.

1. Successful waveform-to-phone alignment smoke test, with bounded timestamps.
2. Coach-reviewed word/phone targets and a versioned phone-set conversion.
3. Compatible Kaldi posterior model and its phone table for each profile.
4. GOP calibration fitted on training recordings and assessed on held-out
   speakers, including learners with Asian first-language backgrounds.
5. Reject silence, incorrect transcripts, excessive noise, and unsupported
   profiles; verify these cases cannot earn high game scores.

MFA forced alignment locates the expected phones; it does not prove the speaker
actually pronounced them correctly. GOP evidence and human validation are
required before releasing phoneme-quality feedback.
