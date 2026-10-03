import { italianGeminateDemo } from '../data/challenges';
import { PronunciationEngine } from './pronunciationEngine';

export const mockPronunciationEngine: PronunciationEngine = {
  async analyze() {
    return {
      phonemes: italianGeminateDemo,
      engineId: 'deterministic-fixture',
      engineVersion: '1.0.0',
    };
  },
};
