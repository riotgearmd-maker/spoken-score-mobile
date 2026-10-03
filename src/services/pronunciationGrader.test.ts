import { describe, expect, it } from 'vitest';
import { challenges, italianGeminateDemo } from '../data/challenges';
import { gradePronunciation } from './pronunciationGrader';

describe('gradePronunciation', () => {
  const challenge = challenges[0];

  it('scores a complete aligned attempt', () => {
    const result = gradePronunciation(challenge, italianGeminateDemo);

    expect(result.completeness).toBe(100);
    expect(result.total).toBeGreaterThan(75);
    expect(result.phonemes).toHaveLength(challenge.phonemes.length);
  });

  it('penalizes a short or substituted geminate', () => {
    const result = gradePronunciation(challenge, italianGeminateDemo);
    const finalGeminate = result.phonemes[10];

    expect(finalGeminate.score).toBeLessThan(50);
    expect(finalGeminate.feedback).toContain('Hold tt longer');
  });

  it('marks absent phonemes as incomplete', () => {
    const result = gradePronunciation(challenge, italianGeminateDemo.slice(0, 4));

    expect(result.completeness).toBe(33);
    expect(result.phonemes[4].feedback).toBe('Not detected');
  });
});
