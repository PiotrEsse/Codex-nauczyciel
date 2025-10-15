import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

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
    this.onResult?.(event.value[0]);
    this.status = 'idle';
  };

  private handleSpeechError = (event: SpeechErrorEvent) => {
    const error = new Error(event.error?.message ?? 'Speech recognition error');
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
    if (speech.stt === 'whisper') {
      // Whisper integration will replace this placeholder once the networking layer is ready.
      this.onError?.(new Error('Whisper capture not implemented yet. Switch to system STT.'));
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
  }

  async cancel() {
    await Voice.cancel();
    this.status = 'idle';
  }

  speak(text: string) {
    const {
      audio: { ttsRate },
      targetLanguage
    } = useSettingsStore.getState();
    Speech.speak(text, {
      rate: ttsRate,
      language: targetLanguage
    });
  }
}

export const SpeechService = new SpeechServiceClass();
