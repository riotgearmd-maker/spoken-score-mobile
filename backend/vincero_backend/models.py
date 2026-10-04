from __future__ import annotations

from dataclasses import dataclass
from typing import Any


SUPPORTED_PROFILES = {
    "italian",
    "english-rp",
    "english-general-american",
}


class ValidationError(ValueError):
    pass


@dataclass(frozen=True)
class Challenge:
    id: str
    profile_id: str
    text: str
    phonemes: tuple[str, ...]

    @classmethod
    def from_json(cls, value: Any) -> "Challenge":
        if not isinstance(value, dict):
            raise ValidationError("challenge must be an object")
        challenge_id = value.get("id")
        profile_id = value.get("profileId")
        text = value.get("text")
        raw_phonemes = value.get("phonemes")
        if not isinstance(challenge_id, str) or not challenge_id.strip():
            raise ValidationError("challenge.id is required")
        if profile_id not in SUPPORTED_PROFILES:
            raise ValidationError("unsupported pronunciation profile")
        if not isinstance(text, str) or not text.strip() or len(text) > 500:
            raise ValidationError("challenge.text must contain 1-500 characters")
        if not isinstance(raw_phonemes, list) or not 1 <= len(raw_phonemes) <= 100:
            raise ValidationError("challenge.phonemes must contain 1-100 entries")
        symbols: list[str] = []
        for item in raw_phonemes:
            symbol = item.get("symbol") if isinstance(item, dict) else None
            if not isinstance(symbol, str) or not symbol or len(symbol) > 16:
                raise ValidationError("each target phoneme needs a valid symbol")
            symbols.append(symbol)
        return cls(challenge_id.strip(), profile_id, text.strip(), tuple(symbols))


@dataclass(frozen=True)
class PhoneInterval:
    symbol: str
    start_ms: int
    end_ms: int


@dataclass(frozen=True)
class PhoneScore:
    symbol: str
    confidence: float

