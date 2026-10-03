import { AttemptGrade, ObservedPhoneme, PhonemeGrade, PronunciationChallenge } from '../domain/pronunciation';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function gradePronunciation(
  challenge: PronunciationChallenge,
  observed: ObservedPhoneme[],
): AttemptGrade {
  const phonemes: PhonemeGrade[] = challenge.phonemes.map((target, index) => {
    const result = observed[index];
    if (!result) return { ...target, score: 0, feedback: 'Not detected' };

    const symbolMatch = result.symbol === target.symbol;
    let score = symbolMatch ? result.confidence * 100 : result.confidence * 35;
    let feedback = symbolMatch ? undefined : `Expected /${target.symbol}/, heard /${result.symbol}/`;

    if (target.expectedDurationMs && result.durationMs) {
      const durationRatio = Math.min(result.durationMs, target.expectedDurationMs) / target.expectedDurationMs;
      score = score * 0.65 + durationRatio * 35;
      if (durationRatio < 0.75) feedback = `Hold ${target.label} longer to create a clear consonant stop`;
    }

    return { ...target, observedSymbol: result.symbol, score: clamp(score), feedback };
  });

  const accuracy = clamp(phonemes.reduce((sum, phoneme) => sum + phoneme.score, 0) / phonemes.length);
  const timed = phonemes.filter((phoneme) => phoneme.expectedDurationMs);
  const timing = timed.length
    ? clamp(timed.reduce((sum, phoneme) => sum + phoneme.score, 0) / timed.length)
    : accuracy;
  const completeness = clamp((Math.min(observed.length, challenge.phonemes.length) / challenge.phonemes.length) * 100);

  return {
    total: clamp(accuracy * 0.65 + timing * 0.2 + completeness * 0.15),
    accuracy,
    timing,
    completeness,
    phonemes,
  };
}
