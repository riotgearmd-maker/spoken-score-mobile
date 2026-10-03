import { CapturedAudio, ObservedPhoneme, PronunciationChallenge } from '../domain/pronunciation';

export type AlignmentResult = {
  phonemes: ObservedPhoneme[];
  engineId: string;
  engineVersion: string;
};

export type PronunciationEngine = {
  analyze(audio: CapturedAudio, challenge: PronunciationChallenge): Promise<AlignmentResult>;
};

// Provider adapters implement this port. The game and scoring rules never import
// a vendor SDK directly, which keeps evaluation reproducible and providers replaceable.
