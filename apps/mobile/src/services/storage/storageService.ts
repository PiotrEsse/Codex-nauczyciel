import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASYNC_STORAGE_KEYS } from '@utils/constants/storage';

type SettingsPayload = {
  targetLanguage: string;
  nativeLanguage: string;
  learnerLevel: string;
  speech: { stt: 'native' | 'whisper'; tts: 'native' };
  audio: { ttsRate: number; normalize: boolean };
};

type SettingsPartial = Partial<SettingsPayload>;

export const StorageService = {
  async getSettings(): Promise<SettingsPayload | null> {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as SettingsPayload;
    } catch (error) {
      console.warn('Failed to parse stored settings', error);
      return null;
    }
  },
  async updateSettings(partial: SettingsPartial): Promise<void> {
    const current = (await StorageService.getSettings()) ?? {};
    const payload = { ...current, ...partial } as SettingsPayload;
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SETTINGS, JSON.stringify(payload));
  }
};
