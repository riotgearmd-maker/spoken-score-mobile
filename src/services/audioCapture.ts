import { CapturedAudio } from '../domain/pronunciation';

export type AudioCaptureState = 'idle' | 'requesting-permission' | 'recording' | 'stopping';

export type AudioCapture = {
  requestPermission(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<CapturedAudio>;
  cancel(): Promise<void>;
};

export class AudioCaptureError extends Error {
  constructor(
    message: string,
    readonly code: 'permission-denied' | 'recorder-unavailable' | 'recording-failed' | 'empty-recording',
  ) {
    super(message);
    this.name = 'AudioCaptureError';
  }
}
