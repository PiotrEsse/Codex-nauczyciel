import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { LearnerLevel } from '@utils/constants/languages';
import { ASYNC_STORAGE_KEYS, SECURE_STORE_KEYS } from '@utils/constants/storage';

type SpeechProvider = 'native' | 'whisper';

type SettingsState = {
  targetLanguage: string;
  nativeLanguage: string;
  learnerLevel: LearnerLevel;
  speech: {
    stt: SpeechProvider;
    tts: 'native';
  };
  audio: {
    ttsRate: number;
    normalize: boolean;
  };
  whisperApiKey?: string;
  whisperEndpoint?: string;
  onboardingCompleted: boolean;
  setTargetLanguage: (code: string) => void;
  setNativeLanguage: (code: string) => void;
  setLearnerLevel: (level: LearnerLevel) => void;
  setSpeechProvider: (provider: SpeechProvider) => void;
  setTtsRate: (rate: number) => void;
  setNormalizeAudio: (normalize: boolean) => void;
  markOnboardingComplete: () => void;
  loadSecureConfig: () => Promise<void>;
  updateWhisperCredentials: (params: { apiKey?: string; endpoint?: string }) => Promise<void>;
};

const DEFAULT_SETTINGS: Omit<SettingsState,
  | 'setTargetLanguage'
  | 'setNativeLanguage'
  | 'setLearnerLevel'
  | 'setSpeechProvider'
  | 'setTtsRate'
  | 'setNormalizeAudio'
  | 'markOnboardingComplete'
  | 'loadSecureConfig'
  | 'updateWhisperCredentials'
> = {
  targetLanguage: 'es-ES',
  nativeLanguage: 'pl-PL',
  learnerLevel: 'beginner',
  speech: {
    stt: 'native',
    tts: 'native'
  },
  audio: {
    ttsRate: 1,
    normalize: true
  },
  whisperApiKey: undefined,
  whisperEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
  onboardingCompleted: false
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      setTargetLanguage: (code) => set({ targetLanguage: code }),
      setNativeLanguage: (code) => set({ nativeLanguage: code }),
      setLearnerLevel: (level) => set({ learnerLevel: level }),
      setSpeechProvider: (provider) => set({ speech: { ...get().speech, stt: provider } }),
      setTtsRate: (rate) => set({ audio: { ...get().audio, ttsRate: rate } }),
      setNormalizeAudio: (normalize) => set({ audio: { ...get().audio, normalize } }),
      markOnboardingComplete: () => set({ onboardingCompleted: true }),
      loadSecureConfig: async () => {
        const [apiKey, endpoint] = await Promise.all([
          SecureStore.getItemAsync(SECURE_STORE_KEYS.WHISPER_API_KEY),
          SecureStore.getItemAsync(SECURE_STORE_KEYS.WHISPER_ENDPOINT)
        ]);
        set({
          whisperApiKey: apiKey ?? undefined,
          whisperEndpoint: endpoint ?? DEFAULT_SETTINGS.whisperEndpoint
        });
      },
      updateWhisperCredentials: async ({ apiKey, endpoint }) => {
        if (apiKey !== undefined) {
          if (!apiKey) {
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.WHISPER_API_KEY);
          } else {
            await SecureStore.setItemAsync(SECURE_STORE_KEYS.WHISPER_API_KEY, apiKey);
          }
          set({ whisperApiKey: apiKey || undefined });
        }
        if (endpoint !== undefined) {
          if (!endpoint) {
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.WHISPER_ENDPOINT);
            set({ whisperEndpoint: DEFAULT_SETTINGS.whisperEndpoint });
          } else {
            await SecureStore.setItemAsync(SECURE_STORE_KEYS.WHISPER_ENDPOINT, endpoint);
            set({ whisperEndpoint: endpoint });
          }
        }
      }
    }),
    {
      name: ASYNC_STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        targetLanguage: state.targetLanguage,
        nativeLanguage: state.nativeLanguage,
        learnerLevel: state.learnerLevel,
        speech: state.speech,
        audio: state.audio,
        onboardingCompleted: state.onboardingCompleted
      })
    }
  )
);
