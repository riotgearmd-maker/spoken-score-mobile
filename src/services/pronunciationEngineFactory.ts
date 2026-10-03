import { HttpPronunciationEngine } from './httpPronunciationEngine';
import { mockPronunciationEngine } from './mockPronunciationEngine';
import { PronunciationEngine } from './pronunciationEngine';

export function createPronunciationEngine(): PronunciationEngine {
  const serviceUrl = process.env.EXPO_PUBLIC_PRONUNCIATION_API_URL;
  const useRemote = process.env.EXPO_PUBLIC_PRONUNCIATION_ENGINE === 'remote';

  if (useRemote && serviceUrl) return new HttpPronunciationEngine(serviceUrl);
  return mockPronunciationEngine;
}
