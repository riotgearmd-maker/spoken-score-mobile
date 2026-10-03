import { ObservedPhoneme, PronunciationChallenge } from '../domain/pronunciation';

export type PronunciationEngine = {
  startAttempt(challenge: PronunciationChallenge): Promise<void>;
  stopAttempt(): Promise<ObservedPhoneme[]>;
};

// A production implementation will stream audio to a phoneme-alignment backend.
// Keeping that boundary here lets the game remain independent of the provider.
