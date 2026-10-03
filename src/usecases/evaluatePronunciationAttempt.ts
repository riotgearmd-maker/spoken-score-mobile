import { CapturedAudio, EvaluatedAttempt, PronunciationChallenge } from '../domain/pronunciation';
import { PronunciationEngine } from '../services/pronunciationEngine';
import { gradePronunciation } from '../services/pronunciationGrader';

export const SCORING_VERSION = 'italian-geminate-v1';

export async function evaluatePronunciationAttempt(
  audio: CapturedAudio,
  challenge: PronunciationChallenge,
  engine: PronunciationEngine,
): Promise<EvaluatedAttempt> {
  if (audio.durationMs < 250) throw new Error('Recording is too short to evaluate.');

  const alignment = await engine.analyze(audio, challenge);
  const grade = gradePronunciation(challenge, alignment.phonemes);

  return {
    challengeId: challenge.id,
    audio,
    grade,
    engineId: alignment.engineId,
    engineVersion: alignment.engineVersion,
    scoringVersion: SCORING_VERSION,
    evaluatedAt: new Date().toISOString(),
  };
}
