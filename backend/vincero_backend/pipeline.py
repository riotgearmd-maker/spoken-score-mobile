from __future__ import annotations

from pathlib import Path

from .adapters import KaldiGopScorer, MfaAligner
from .models import Challenge, PhoneInterval, PhoneScore


class PronunciationPipeline:
    def __init__(self, aligner: MfaAligner | None = None, scorer: KaldiGopScorer | None = None):
        self.aligner = aligner or MfaAligner()
        self.scorer = scorer or KaldiGopScorer()

    def evaluate(self, audio: Path, challenge: Challenge, workspace: Path) -> dict:
        intervals = self.aligner.align(audio, challenge, workspace)
        model_version, scores = self.scorer.score(audio, challenge, workspace)
        return {
            "engineId": "mfa-kaldi-gop",
            "engineVersion": model_version,
            "phonemes": _merge(intervals, scores),
        }


def _merge(intervals: list[PhoneInterval], scores: list[PhoneScore]) -> list[dict]:
    if len(intervals) != len(scores):
        raise ValueError("alignment and GOP outputs have different phone counts")
    result: list[dict] = []
    for interval, score in zip(intervals, scores, strict=True):
        # Phone-set conversion belongs in the calibrated GOP runner. Catch drift here.
        if interval.symbol != score.symbol:
            raise ValueError(f"phone mismatch: MFA {interval.symbol!r}, Kaldi {score.symbol!r}")
        result.append({
            "symbol": interval.symbol,
            "confidence": round(score.confidence, 4),
            "startMs": interval.start_ms,
            "endMs": interval.end_ms,
            "durationMs": interval.end_ms - interval.start_ms,
        })
    return result

