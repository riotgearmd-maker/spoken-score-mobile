import { describe, expect, it } from 'vitest';
import { challenges } from '../data/challenges';
import { mockPronunciationEngine } from '../services/mockPronunciationEngine';
import { evaluatePronunciationAttempt, SCORING_VERSION } from './evaluatePronunciationAttempt';

describe('evaluatePronunciationAttempt', () => {
  it('records versions needed to reproduce a score', async () => {
    const attempt = await evaluatePronunciationAttempt(
      { uri: 'file:///attempt.m4a', durationMs: 1800, mimeType: 'audio/mp4' },
      challenges[0],
      mockPronunciationEngine,
    );

    expect(attempt.challengeId).toBe(challenges[0].id);
    expect(attempt.engineId).toBe('deterministic-fixture');
    expect(attempt.scoringVersion).toBe(SCORING_VERSION);
  });

  it('rejects recordings too short to contain a phrase', async () => {
    await expect(evaluatePronunciationAttempt(
      { uri: 'file:///attempt.m4a', durationMs: 100, mimeType: 'audio/mp4' },
      challenges[0],
      mockPronunciationEngine,
    )).rejects.toThrow('too short');
  });
});
