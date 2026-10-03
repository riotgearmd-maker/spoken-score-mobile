import { CapturedAudio, PronunciationChallenge } from '../domain/pronunciation';
import { AlignmentResult, PronunciationEngine } from './pronunciationEngine';

type AlignmentResponse = {
  engineId: string;
  engineVersion: string;
  phonemes: AlignmentResult['phonemes'];
};

export class PronunciationServiceError extends Error {
  constructor(
    message: string,
    readonly code: 'not-configured' | 'network' | 'invalid-response' | 'service-rejected',
  ) {
    super(message);
    this.name = 'PronunciationServiceError';
  }
}

export class HttpPronunciationEngine implements PronunciationEngine {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async analyze(audio: CapturedAudio, challenge: PronunciationChallenge): Promise<AlignmentResult> {
    if (!this.baseUrl) {
      throw new PronunciationServiceError('Pronunciation service URL is not configured.', 'not-configured');
    }

    const body = new FormData();
    body.append('challenge', JSON.stringify({
      id: challenge.id,
      profileId: challenge.profileId,
      text: challenge.text,
      phonemes: challenge.phonemes,
    }));
    body.append('audio', {
      uri: audio.uri,
      name: `${challenge.id}.m4a`,
      type: audio.mimeType,
    } as unknown as Blob);

    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl}/v1/pronunciation/evaluate`, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      });
    } catch {
      throw new PronunciationServiceError('Could not reach the pronunciation service.', 'network');
    }

    if (!response.ok) {
      throw new PronunciationServiceError(`Pronunciation service rejected the attempt (${response.status}).`, 'service-rejected');
    }

    const result = await response.json() as Partial<AlignmentResponse>;
    if (!result.engineId || !result.engineVersion || !Array.isArray(result.phonemes)) {
      throw new PronunciationServiceError('Pronunciation service returned an invalid result.', 'invalid-response');
    }

    return result as AlignmentResponse;
  }
}
