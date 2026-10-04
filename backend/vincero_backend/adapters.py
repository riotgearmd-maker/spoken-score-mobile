from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Iterable

from .models import Challenge, PhoneInterval, PhoneScore


class EngineConfigurationError(RuntimeError):
    pass


class EngineExecutionError(RuntimeError):
    pass


def _command(name: str) -> list[str]:
    raw = os.environ.get(name)
    if not raw:
        raise EngineConfigurationError(f"{name} is not configured")
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as error:
        raise EngineConfigurationError(f"{name} must be a JSON array") from error
    if not isinstance(value, list) or not value or not all(isinstance(token, str) for token in value):
        raise EngineConfigurationError(f"{name} must be a non-empty JSON string array")
    return value


def _run(template: Iterable[str], replacements: dict[str, str], timeout: int = 120) -> None:
    command = [token.format_map(replacements) for token in template]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
    except (OSError, subprocess.TimeoutExpired) as error:
        raise EngineExecutionError(f"engine process failed: {error}") from error
    if result.returncode != 0:
        detail = result.stderr.strip()[-500:] or "no diagnostic output"
        raise EngineExecutionError(f"engine exited {result.returncode}: {detail}")


def _profile_env(prefix: str, profile_id: str) -> str:
    suffix = profile_id.upper().replace("-", "_")
    value = os.environ.get(f"{prefix}_{suffix}")
    if not value:
        raise EngineConfigurationError(f"{prefix}_{suffix} is not configured")
    return value


class MfaAligner:
    def align(self, audio: Path, challenge: Challenge, workspace: Path) -> list[PhoneInterval]:
        transcript = workspace / "transcript.txt"
        output = workspace / "alignment.json"
        transcript.write_text(challenge.text, encoding="utf-8")
        replacements = {
            "audio": str(audio),
            "transcript": str(transcript),
            "dictionary": _profile_env("VINCERO_MFA_DICTIONARY", challenge.profile_id),
            "acoustic_model": _profile_env("VINCERO_MFA_ACOUSTIC_MODEL", challenge.profile_id),
            "output": str(output),
            "profile": challenge.profile_id,
        }
        _run(_command("VINCERO_MFA_COMMAND"), replacements)
        try:
            payload = json.loads(output.read_text(encoding="utf-8"))
            raw_phones = _find_phones(payload)
            phones = [_interval(item) for item in raw_phones if _label(item)]
        except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
            raise EngineExecutionError("MFA produced invalid phone alignment JSON") from error
        if not phones:
            raise EngineExecutionError("MFA produced no phone intervals")
        return phones


class KaldiGopScorer:
    def score(self, audio: Path, challenge: Challenge, workspace: Path) -> tuple[str, list[PhoneScore]]:
        phones_path = workspace / "target-phones.json"
        output = workspace / "gop.json"
        phones_path.write_text(json.dumps(list(challenge.phonemes)), encoding="utf-8")
        replacements = {
            "audio": str(audio),
            "phones": str(phones_path),
            "output": str(output),
            "profile": challenge.profile_id,
        }
        _run(_command("VINCERO_KALDI_GOP_COMMAND"), replacements)
        try:
            payload = json.loads(output.read_text(encoding="utf-8"))
            version = payload["modelVersion"]
            scores = [PhoneScore(str(item["symbol"]), float(item["score"])) for item in payload["phones"]]
        except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
            raise EngineExecutionError("Kaldi produced invalid GOP JSON") from error
        if not isinstance(version, str) or not version or not scores:
            raise EngineExecutionError("Kaldi produced incomplete GOP output")
        if any(not 0 <= phone.confidence <= 1 for phone in scores):
            raise EngineExecutionError("Kaldi scores must be calibrated to the 0-1 range")
        return version, scores


def _find_phones(payload: object) -> list[dict]:
    if isinstance(payload, dict):
        if isinstance(payload.get("phones"), list):
            return payload["phones"]
        tiers = payload.get("tiers")
        if isinstance(tiers, dict) and isinstance(tiers.get("phones"), list):
            return tiers["phones"]
        for value in payload.values():
            if isinstance(value, dict) and str(value.get("name", "")).lower() == "phones":
                entries = value.get("entries") or value.get("intervals")
                if isinstance(entries, list):
                    return entries
    raise ValueError("phone tier not found")


def _label(item: dict) -> str:
    return str(item.get("label") or item.get("text") or item.get("symbol") or "").strip()


def _interval(item: dict) -> PhoneInterval:
    if "startMs" in item or "endMs" in item:
        start, end = item.get("startMs"), item.get("endMs")
        multiplier = 1
    else:
        start = item.get("begin", item.get("start", item.get("startTime")))
        end = item.get("end", item.get("stop", item.get("endTime")))
        multiplier = 1000
    if start is None or end is None:
        raise ValueError("interval is missing boundaries")
    return PhoneInterval(_label(item), round(float(start) * multiplier), round(float(end) * multiplier))
