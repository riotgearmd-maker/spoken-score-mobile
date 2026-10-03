export type PronunciationProfileId = 'italian' | 'english-rp' | 'english-general-american';

export type PhonemeTarget = {
  symbol: string;
  label: string;
  expectedDurationMs?: number;
  focus?: 'vowel' | 'consonant' | 'geminate' | 'stress';
};

export type PronunciationChallenge = {
  id: string;
  profileId: PronunciationProfileId;
  title: string;
  source: string;
  text: string;
  translation: string;
  phonemes: PhonemeTarget[];
};

export type ObservedPhoneme = {
  symbol: string;
  confidence: number;
  durationMs?: number;
};

export type PhonemeGrade = PhonemeTarget & {
  observedSymbol?: string;
  score: number;
  feedback?: string;
};

export type AttemptGrade = {
  total: number;
  accuracy: number;
  timing: number;
  completeness: number;
  phonemes: PhonemeGrade[];
};
