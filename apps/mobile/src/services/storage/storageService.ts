import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASYNC_STORAGE_KEYS } from '@utils/constants/storage';

const MAX_SESSION_HISTORY = 10;

type SpeechMode = 'native-stt' | 'whisper-stt';

type SettingsPayload = {
  targetLanguage: string;
  nativeLanguage: string;
  learnerLevel: string;
  speech: { stt: 'native' | 'whisper'; tts: 'native' };
  audio: { ttsRate: number; normalize: boolean };
};

type SettingsPartial = Partial<SettingsPayload>;

export type SessionMetadata = {
  id: string;
  startedAt: number;
  endedAt?: number;
  targetLanguage: string;
  nativeLanguage: string;
  learnerLevel: string;
  mode: SpeechMode;
  turnsCount: number;
  hintsCount: number;
  newVocab: string[];
  notes?: string;
};

export type SessionTurnRecord = {
  id: string;
  sessionId: string;
  speaker: 'user' | 'lumi';
  transcript: string;
  createdAt: number;
};

export type SessionHintRecord = {
  id: string;
  sessionId: string;
  targetText: string;
  nativeText: string;
  createdAt: number;
};

export type SessionHistoryEntry = {
  session: SessionMetadata;
  turns: SessionTurnRecord[];
  hints: SessionHintRecord[];
};

type SessionHistoryPayload = SessionHistoryEntry[];

const readSessionHistory = async (): Promise<SessionHistoryPayload> => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_HISTORY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as SessionHistoryPayload;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored session history', error);
    return [];
  }
};

const writeSessionHistory = async (entries: SessionHistoryPayload): Promise<void> => {
  const sorted = entries
    .slice()
    .sort((a, b) => b.session.startedAt - a.session.startedAt)
    .slice(0, MAX_SESSION_HISTORY);
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(sorted));
};

const upsertSessionEntry = async (entry: SessionHistoryEntry): Promise<SessionHistoryEntry> => {
  const history = await readSessionHistory();
  const index = history.findIndex((item) => item.session.id === entry.session.id);
  const updatedHistory =
    index >= 0 ? history.map((item, position) => (position === index ? entry : item)) : [entry, ...history];
  await writeSessionHistory(updatedHistory);
  return entry;
};

const updateSessionEntry = async (
  sessionId: string,
  updater: (entry: SessionHistoryEntry) => SessionHistoryEntry
): Promise<SessionHistoryEntry | undefined> => {
  const history = await readSessionHistory();
  const index = history.findIndex((item) => item.session.id === sessionId);
  if (index === -1) {
    return undefined;
  }
  const updatedEntry = updater(history[index]);
  const updatedHistory = history.map((item, position) => (position === index ? updatedEntry : item));
  await writeSessionHistory(updatedHistory);
  return updatedEntry;
};

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
  },
  async saveSession(entry: SessionHistoryEntry): Promise<SessionHistoryEntry> {
    return upsertSessionEntry(entry);
  },
  async appendTurn(sessionId: string, turn: SessionTurnRecord): Promise<SessionHistoryEntry | undefined> {
    return updateSessionEntry(sessionId, (entry) => {
      const turns = [...entry.turns, turn];
      return {
        ...entry,
        turns,
        session: {
          ...entry.session,
          turnsCount: turns.length
        }
      };
    });
  },
  async appendHint(sessionId: string, hint: SessionHintRecord): Promise<SessionHistoryEntry | undefined> {
    return updateSessionEntry(sessionId, (entry) => {
      const hints = [...entry.hints, hint];
      return {
        ...entry,
        hints,
        session: {
          ...entry.session,
          hintsCount: hints.length
        }
      };
    });
  },
  async updateSessionMetadata(
    sessionId: string,
    partial: Partial<SessionMetadata>
  ): Promise<SessionHistoryEntry | undefined> {
    return updateSessionEntry(sessionId, (entry) => ({
      ...entry,
      session: {
        ...entry.session,
        ...partial
      }
    }));
  },
  async getRecentSessions(limit = 5): Promise<SessionHistoryEntry[]> {
    const history = await readSessionHistory();
    return history
      .slice()
      .sort((a, b) => b.session.startedAt - a.session.startedAt)
      .slice(0, limit);
  },
  async setLastSessionId(sessionId: string): Promise<void> {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LAST_SESSION_ID, sessionId);
  },
  async getLastSessionId(): Promise<string | null> {
    return AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LAST_SESSION_ID);
  },
  async clearSessionHistory(): Promise<void> {
    await AsyncStorage.multiRemove([
      ASYNC_STORAGE_KEYS.SESSION_HISTORY,
      ASYNC_STORAGE_KEYS.LAST_SESSION_ID
    ]);
  },
  buildSessionExportPayload(entry: SessionHistoryEntry) {
    return {
      meta: {
        exportedAt: new Date().toISOString(),
        source: 'language-tutor-mobile'
      },
      session: entry.session,
      turns: entry.turns,
      hints: entry.hints
    };
  }
};
