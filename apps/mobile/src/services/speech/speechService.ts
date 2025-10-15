import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

import { LogService } from '@services/logging/logService';
import { useSettingsStore } from '@state/settingsStore';

export type SpeechStatus = 'idle' | 'recording' | 'processing';

type StartListeningParams = {
  onResult?: (transcript: string) => void;
  onError?: (error: Error) => void;
};

class SpeechServiceClass {
  private status: SpeechStatus = 'idle';

  constructor() {
    Voice.onSpeechResults = this.handleSpeechResults;
    Voice.onSpeechError = this.handleSpeechError;
  }

  private onResult?: (transcript: string) => void;
  private onError?: (error: Error) => void;

  private handleSpeechResults = (event: SpeechResultsEvent) => {
    if (!event.value?.[0]) {
      return;
    }
    void LogService.info('speech', 'Received speech recognition result', {
      transcript: event.value[0]
    });
    this.onResult?.(event.value[0]);
    this.status = 'idle';
  };

  private handleSpeechError = (event: SpeechErrorEvent) => {
    const error = new Error(event.error?.message ?? 'Speech recognition error');
    void LogService.error('speech', 'Speech recognition error', {
      message: error.message
    });
    this.onError?.(error);
    this.status = 'idle';
  };

  async startListening({ onResult, onError }: StartListeningParams = {}) {
    if (this.status === 'recording') {
      return;
    }
    this.status = 'recording';
    this.onResult = onResult;
    this.onError = onError;
    const { targetLanguage, speech } = useSettingsStore.getState();
    void LogService.info('speech', 'Starting speech capture', {
      provider: speech.stt,
      targetLanguage
    });
    if (speech.stt === 'whisper') {
      // Whisper integration will replace this placeholder once the networking layer is ready.
      const whisperError = new Error('Whisper capture not implemented yet. Switch to system STT.');
      void LogService.warn('speech', 'Whisper capture requested before implementation');
      this.onError?.(whisperError);
      this.status = 'idle';
      return;
    }
    await Voice.start(targetLanguage);
  }

  async stopListening() {
    if (this.status !== 'recording') {
      return;
    }
    await Voice.stop();
    this.status = 'processing';
    void LogService.info('speech', 'Stopped listening');
  }

  async cancel() {
    await Voice.cancel();
    this.status = 'idle';
    void LogService.info('speech', 'Cancelled speech capture');
  }

  speak(text: string) {
    const {
      audio: { ttsRate },
      targetLanguage
    } = useSettingsStore.getState();
    void LogService.info('speech', 'Playing synthesized speech', {
      language: targetLanguage,
      ttsRate
    });
    Speech.speak(text, {
      rate: ttsRate,
      language: targetLanguage
    });
  }
}

export const SpeechService = new SpeechServiceClass();
