import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from vincero_backend.adapters import _interval, _find_phones
from vincero_backend.models import Challenge, PhoneInterval, PhoneScore, ValidationError
from vincero_backend.pipeline import PronunciationPipeline


class FakeAligner:
    def align(self, audio, challenge, workspace):
        return [PhoneInterval("v", 0, 120), PhoneInterval("i", 120, 260)]


class FakeScorer:
    def score(self, audio, challenge, workspace):
        return "kaldi-test-1", [PhoneScore("v", 0.91), PhoneScore("i", 0.76)]


class PipelineTests(unittest.TestCase):
    def test_normalizes_alignment_and_gop_output(self):
        challenge = Challenge("victory", "italian", "Vincerò", ("v", "i"))
        with TemporaryDirectory() as directory:
            result = PronunciationPipeline(FakeAligner(), FakeScorer()).evaluate(
                Path(directory) / "audio.m4a", challenge, Path(directory)
            )
        self.assertEqual(result["engineId"], "mfa-kaldi-gop")
        self.assertEqual(result["engineVersion"], "kaldi-test-1")
        self.assertEqual(result["phonemes"][1]["durationMs"], 140)
        self.assertEqual(result["phonemes"][0]["confidence"], 0.91)

    def test_rejects_phone_set_drift(self):
        class DriftedScorer(FakeScorer):
            def score(self, audio, challenge, workspace):
                return "bad", [PhoneScore("f", 0.9), PhoneScore("i", 0.8)]

        with TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "phone mismatch"):
                PronunciationPipeline(FakeAligner(), DriftedScorer()).evaluate(
                    Path(directory) / "audio.m4a",
                    Challenge("x", "italian", "vi", ("v", "i")),
                    Path(directory),
                )

    def test_rejects_unknown_profile(self):
        with self.assertRaisesRegex(ValidationError, "unsupported"):
            Challenge.from_json({"id": "x", "profileId": "unknown", "text": "hi", "phonemes": [{"symbol": "h"}]})

    def test_accepts_explicit_millisecond_alignment(self):
        self.assertEqual(_interval({"symbol": "a", "startMs": 25, "endMs": 140}), PhoneInterval("a", 25, 140))

    def test_parses_real_mfa_json_tier(self):
        payload = {"tiers": {"phones": {"type": "interval", "entries": [[0.12, 0.30, "tː"]]}}}
        self.assertEqual(_interval(_find_phones(payload)[0]), PhoneInterval("tː", 120, 300))

    def test_rejects_reversed_intervals(self):
        with self.assertRaises(ValueError):
            _interval({"symbol": "a", "startMs": 140, "endMs": 25})

    def test_removes_word_position_suffix_without_losing_gemination(self):
        self.assertEqual(_interval({"label": "tː_I", "begin": 0.12, "end": 0.30}), PhoneInterval("tː", 120, 300))


if __name__ == "__main__":
    unittest.main()
