import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { LogService } from '@services/logging/logService';
import { useSettingsStore } from '@state/settingsStore';

export type SpeechStatus = 'idle' | 'recording' | 'processing';

type StartListeningParams = {
  onResult?: (transcript: string) => void;
  onError?: (error: Error) => void;
};

type PreparedRecording = {
  fileUri: string;
  fileName: string;
  mimeType: string;
  size: number;
};

class SpeechServiceClass {
  private status: SpeechStatus = 'idle';
  private recording: Audio.Recording | null = null;

  constructor() {
    Voice.onSpeechResults = this.handleSpeechResults;
    Voice.onSpeechError = this.handleSpeechError;
  }

  private onResult?: (transcript: string) => void;
  private onError?: (error: Error) => void;

  private resetHandlers() {
    this.onResult = undefined;
    this.onError = undefined;
  }

  private handleSpeechResults = (event: SpeechResultsEvent) => {
    if (!event.value?.[0]) {
      void LogService.warn('speech', 'Speech recognition returned empty transcript');
      this.status = 'idle';
      const handler = this.onResult;
      this.resetHandlers();
      handler?.('');
      return;
    }
    void LogService.info('speech', 'Received speech recognition result', {
      transcriptLength: event.value[0].length
    });
    const handler = this.onResult;
    this.status = 'idle';
    this.resetHandlers();
    handler?.(event.value[0]);
  };

  private handleSpeechError = (event: SpeechErrorEvent) => {
    const error = new Error(event.error?.message ?? 'Speech recognition error');
    void LogService.error('speech', 'Speech recognition error', {
      message: error.message
    });
    const handler = this.onError;
    this.status = 'idle';
    this.resetHandlers();
    handler?.(error);
  };

  private async requestMicrophonePermission(): Promise<void> {
    try {
      const response = await Audio.requestPermissionsAsync();
      if (response.status !== 'granted') {
        throw new Error('Microphone permission is required to capture audio.');
      }
    } catch (error) {
      throw new Error('Unable to request microphone permissions.');
    }
  }

  private async ensureNativePermissions(): Promise<void> {
    await this.requestMicrophonePermission();
    if (Platform.OS === 'ios') {
      const voiceModule = Voice as unknown as { requestPermissions?: () => Promise<boolean> };
      if (typeof voiceModule.requestPermissions === 'function') {
        const granted = await voiceModule.requestPermissions();
        if (!granted) {
          throw new Error('Speech recognition permission was denied.');
        }
      }
    }
  }

  private async ensureWhisperPermissions(): Promise<void> {
    await this.requestMicrophonePermission();
  }

  private async ensurePermissions(provider: 'native' | 'whisper'): Promise<void> {
    if (provider === 'whisper') {
      await this.ensureWhisperPermissions();
      return;
    }
    await this.ensureNativePermissions();
  }

  private async configureAudioModeForRecording() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true
    });
  }

  private async resetAudioMode() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false
    });
  }

  private async startNativeCapture(language: string) {
    await Voice.start(language);
  }

  private async startWhisperCapture() {
    await this.configureAudioModeForRecording();
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    this.recording = recording;
    void LogService.info('speech', 'Whisper recording started');
  }

  private getExtension(uri: string): string {
    const match = /\.([a-zA-Z0-9]+)$/.exec(uri);
    return match ? match[1].toLowerCase() : 'm4a';
  }

  private mimeTypeForExtension(extension: string): string {
    switch (extension) {
      case 'wav':
        return 'audio/wav';
      case 'mp3':
        return 'audio/mpeg';
      case 'caf':
        return 'audio/x-caf';
      case 'ogg':
        return 'audio/ogg';
      case 'webm':
        return 'audio/webm';
      case 'm4a':
      default:
        return 'audio/m4a';
    }
  }

  private async prepareRecordingForUpload(uri: string): Promise<PreparedRecording> {
    const fileHandle = new FileSystem.File(uri);
    const extension = fileHandle.extension?.replace(/^\./, '') ?? this.getExtension(uri);
    const fileName = fileHandle.name || `speech-${Date.now()}.${extension}`;
    let size = 0;
    try {
      const info = fileHandle.info();
      if (typeof info.size === 'number') {
        size = info.size;
      }
    } catch (error) {
      void error;
    }
    return {
      fileUri: uri,
      fileName,
      mimeType: this.mimeTypeForExtension(extension),
      size
    };
  }

  private async sendToWhisper(recording: PreparedRecording): Promise<string> {
    const { whisperApiKey, whisperEndpoint, targetLanguage } = useSettingsStore.getState();
    if (!whisperApiKey) {
      throw new Error('Add your Whisper API key in Settings to enable speech recognition.');
    }
    const endpoint = whisperEndpoint ?? 'https://api.openai.com/v1/audio/transcriptions';
    const formData = new FormData();
    formData.append('file', {
      uri: recording.fileUri,
      name: recording.fileName,
      type: recording.mimeType
    } as unknown as Blob);
    formData.append('model', 'whisper-1');
    const languageCode = targetLanguage.split('-')[0] ?? targetLanguage;
    formData.append('language', languageCode);
    formData.append('response_format', 'json');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${whisperApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      let message = `Whisper request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        const candidate =
          typeof errorBody?.error?.message === 'string'
            ? errorBody.error.message
            : typeof errorBody?.message === 'string'
            ? errorBody.message
            : null;
        if (candidate) {
          message = candidate;
        }
      } catch (parseError) {
        try {
          const fallback = await response.text();
          if (fallback) {
            message = fallback;
          }
        } catch (textError) {
          void textError;
        }
      }
      throw new Error(message);
    }

    const payload = (await response.json()) as { text?: string };
    const transcript = payload.text?.trim() ?? '';
    if (!transcript) {
      void LogService.warn('speech', 'Whisper returned empty transcript payload');
    }
    return transcript;
  }

  private async processWhisperRecording() {
    const activeRecording = this.recording;
    this.recording = null;
    if (!activeRecording) {
      this.status = 'idle';
      return;
    }
    try {
      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      if (!uri) {
        throw new Error('Unable to access recorded audio.');
      }
      const prepared = await this.prepareRecordingForUpload(uri);
      void LogService.info('speech', 'Uploading audio to Whisper', {
        size: prepared.size
      });
      try {
        const transcript = await this.sendToWhisper(prepared);
        void LogService.info('speech', 'Whisper transcription completed', {
          transcriptLength: transcript.length
        });
        this.onResult?.(transcript);
      } finally {
        try {
          new FileSystem.File(prepared.fileUri).delete();
        } catch (cleanupError) {
          void cleanupError;
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to process Whisper recording.');
      void LogService.error('speech', 'Whisper transcription failed', {
        message: err.message
      });
      this.onError?.(err);
    } finally {
      this.status = 'idle';
      this.resetHandlers();
      await this.resetAudioMode();
    }
  }

  async startListening({ onResult, onError }: StartListeningParams = {}) {
    if (this.status === 'recording') {
      return;
    }
    const { targetLanguage, speech } = useSettingsStore.getState();
    await this.ensurePermissions(speech.stt);
    this.status = 'recording';
    this.onResult = onResult;
    this.onError = onError;
    void LogService.info('speech', 'Starting speech capture', {
      provider: speech.stt,
      targetLanguage
    });
    try {
      if (speech.stt === 'whisper') {
        await this.startWhisperCapture();
      } else {
        await this.startNativeCapture(targetLanguage);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start speech capture.');
      this.status = 'idle';
      this.resetHandlers();
      void LogService.error('speech', 'Failed to start speech capture', {
        provider: speech.stt,
        message: err.message
      });
      throw err;
    }
  }

  async stopListening() {
    if (this.status !== 'recording') {
      return;
    }
    const { speech } = useSettingsStore.getState();
    this.status = 'processing';
    if (speech.stt === 'whisper') {
      await this.processWhisperRecording();
      return;
    }
    try {
      await Voice.stop();
      void LogService.info('speech', 'Stopped listening');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to stop speech recognition.');
      this.status = 'idle';
      this.resetHandlers();
      this.onError?.(err);
      void LogService.error('speech', 'Failed to stop native speech recognition', {
        message: err.message
      });
    }
  }

  async cancel() {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        void error;
      }
      this.recording = null;
      await this.resetAudioMode();
    }
    await Voice.cancel();
    this.status = 'idle';
    this.resetHandlers();
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

  async runWhisperConfigurationTest(durationMs = 3500): Promise<string> {
    if (this.status !== 'idle') {
      throw new Error('Speech capture is already running. Finish the active session before testing Whisper.');
    }
    const { whisperApiKey } = useSettingsStore.getState();
    if (!whisperApiKey) {
      throw new Error('Add your Whisper API key in Settings before running the test.');
    }
    await this.ensurePermissions('whisper');
    await this.configureAudioModeForRecording();
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    void LogService.info('speech', 'Whisper configuration test recording started');
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (!uri) {
      await this.resetAudioMode();
      throw new Error('Test recording failed. Try again.');
    }
    const prepared = await this.prepareRecordingForUpload(uri);
    try {
      const transcript = await this.sendToWhisper(prepared);
      void LogService.info('speech', 'Whisper configuration test completed', {
        transcriptLength: transcript.length
      });
      return transcript;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Whisper test failed.');
    } finally {
      try {
        new FileSystem.File(prepared.fileUri).delete();
      } catch (cleanupError) {
        void cleanupError;
      }
      await this.resetAudioMode();
    }
  }
}

export const SpeechService = new SpeechServiceClass();
