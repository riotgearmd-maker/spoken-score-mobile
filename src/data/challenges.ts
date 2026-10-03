import { PronunciationChallenge, PronunciationProfileId } from '../domain/pronunciation';

export const profiles: Array<{ id: PronunciationProfileId; shortName: string; name: string }> = [
  { id: 'italian', shortName: 'IT', name: 'Italian' },
  { id: 'english-rp', shortName: 'RP', name: 'English · RP' },
  { id: 'english-general-american', shortName: 'GA', name: 'English · General American' },
];

export const challenges: PronunciationChallenge[] = [
  {
    id: 'italian-notte',
    profileId: 'italian',
    title: 'Hold the double consonant',
    source: 'Italian diction fundamentals',
    text: 'Fatto. Bello. Notte.',
    translation: 'Done. Beautiful. Night.',
    phonemes: [
      { symbol: 'f', label: 'f' },
      { symbol: 'a', label: 'a', focus: 'vowel' },
      { symbol: 'tː', label: 'tt', focus: 'geminate', expectedDurationMs: 180 },
      { symbol: 'o', label: 'o', focus: 'vowel' },
      { symbol: 'b', label: 'b' },
      { symbol: 'ɛ', label: 'e', focus: 'vowel' },
      { symbol: 'lː', label: 'll', focus: 'geminate', expectedDurationMs: 180 },
      { symbol: 'o', label: 'o', focus: 'vowel' },
      { symbol: 'n', label: 'n' },
      { symbol: 'ɔ', label: 'o', focus: 'vowel' },
      { symbol: 'tː', label: 'tt', focus: 'geminate', expectedDurationMs: 180 },
      { symbol: 'e', label: 'e', focus: 'vowel' },
    ],
  },
];

export const italianGeminateDemo = [
  { symbol: 'f', confidence: 0.99 },
  { symbol: 'a', confidence: 0.96 },
  { symbol: 'tː', confidence: 0.91, durationMs: 168 },
  { symbol: 'o', confidence: 0.97 },
  { symbol: 'b', confidence: 0.96 },
  { symbol: 'ɛ', confidence: 0.86 },
  { symbol: 'lː', confidence: 0.78, durationMs: 122 },
  { symbol: 'o', confidence: 0.95 },
  { symbol: 'n', confidence: 0.98 },
  { symbol: 'ɔ', confidence: 0.89 },
  { symbol: 't', confidence: 0.71, durationMs: 82 },
  { symbol: 'e', confidence: 0.96 },
];
