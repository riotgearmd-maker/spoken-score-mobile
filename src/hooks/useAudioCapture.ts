import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback } from 'react';
import { CapturedAudio } from '../domain/pronunciation';
import { AudioCaptureError } from '../services/audioCapture';

export function useAudioCapture() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);

  const start = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new AudioCaptureError('Microphone access is needed to evaluate pronunciation.', 'permission-denied');
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [recorder]);

  const stop = useCallback(async (): Promise<CapturedAudio> => {
    const durationMs = recorder.getStatus().durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });

    if (!recorder.uri || durationMs < 250) {
      throw new AudioCaptureError('The recording was too short. Please try the phrase again.', 'empty-recording');
    }

    return {
      uri: recorder.uri,
      durationMs,
      mimeType: 'audio/mp4',
    };
  }, [recorder]);

  return {
    durationMs: recorderState.durationMillis,
    isRecording: recorderState.isRecording,
    start,
    stop,
  };
}
