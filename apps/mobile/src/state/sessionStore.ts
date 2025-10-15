import { create } from 'zustand';

import { LogService } from '@services/logging/logService';
import {
  StorageService,
  type SessionHintRecord,
  type SessionHistoryEntry,
  type SessionMetadata,
  type SessionTurnRecord
} from '@services/storage/storageService';
import { useSettingsStore } from './settingsStore';

type SessionStatus = 'idle' | 'active' | 'paused' | 'completed';

type SessionState = {
  currentSession?: SessionHistoryEntry;
  status: SessionStatus;
  startSession: () => Promise<SessionHistoryEntry>;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  recordTurn: (turn: SessionTurnRecord) => Promise<void>;
  recordHint: (hint: SessionHintRecord) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
  reset: () => void;
};

const buildSessionMetadata = (): SessionHistoryEntry => {
  const { targetLanguage, nativeLanguage, learnerLevel, speech } = useSettingsStore.getState();
  const id = `session-${Date.now()}`;
  const startedAt = Date.now();
  const metadata: SessionMetadata = {
    id,
    startedAt,
    targetLanguage,
    nativeLanguage,
    learnerLevel,
    mode: speech.stt === 'whisper' ? 'whisper-stt' : 'native-stt',
    turnsCount: 0,
    hintsCount: 0,
    newVocab: []
  };
  return {
    session: metadata,
    turns: [],
    hints: []
  };
};

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  async startSession() {
    const { currentSession, status } = get();
    if (currentSession && status !== 'completed') {
      if (status === 'paused') {
        set({ status: 'active' });
        void LogService.info('session', 'Resumed paused session', {
          sessionId: currentSession.session.id
        });
      }
      return currentSession;
    }
    const entry = buildSessionMetadata();
    await StorageService.saveSession(entry);
    await StorageService.setLastSessionId(entry.session.id);
    set({ currentSession: entry, status: 'active' });
    void LogService.info('session', 'Started new session', {
      sessionId: entry.session.id,
      targetLanguage: entry.session.targetLanguage,
      learnerLevel: entry.session.learnerLevel,
      mode: entry.session.mode
    });
    return entry;
  },
  async endSession() {
    const { currentSession } = get();
    if (!currentSession) {
      return;
    }
    const endedEntry: SessionHistoryEntry = {
      ...currentSession,
      session: {
        ...currentSession.session,
        endedAt: Date.now()
      }
    };
    await StorageService.saveSession(endedEntry);
    await StorageService.setLastSessionId(endedEntry.session.id);
    set({ currentSession: endedEntry, status: 'completed' });
    void LogService.info('session', 'Session completed', {
      sessionId: endedEntry.session.id,
      turns: endedEntry.session.turnsCount,
      hints: endedEntry.session.hintsCount
    });
  },
  pauseSession() {
    if (get().status === 'active') {
      set({ status: 'paused' });
      const sessionId = get().currentSession?.session.id;
      void LogService.info('session', 'Session paused', sessionId ? { sessionId } : undefined);
    }
  },
  resumeSession() {
    if (get().status === 'paused') {
      set({ status: 'active' });
      const sessionId = get().currentSession?.session.id;
      void LogService.info('session', 'Session resumed', sessionId ? { sessionId } : undefined);
    }
  },
  async recordTurn(turn) {
    const session = await get().startSession();
    const updated = await StorageService.appendTurn(session.session.id, turn);
    if (!updated) {
      return;
    }
    set({ currentSession: updated });
    void LogService.info('session', 'Recorded conversation turn', {
      sessionId: session.session.id,
      speaker: turn.speaker
    });
  },
  async recordHint(hint) {
    const session = await get().startSession();
    const updated = await StorageService.appendHint(session.session.id, hint);
    if (!updated) {
      return;
    }
    set({ currentSession: updated });
    void LogService.info('session', 'Recorded session hint', {
      sessionId: session.session.id
    });
  },
  async updateNotes(notes) {
    const { currentSession } = get();
    if (!currentSession) {
      return;
    }
    const updated = await StorageService.updateSessionMetadata(currentSession.session.id, { notes });
    if (updated) {
      set({ currentSession: updated });
      void LogService.info('session', 'Updated session notes', {
        sessionId: updated.session.id
      });
    }
  },
  reset() {
    set({ currentSession: undefined, status: 'idle' });
    void LogService.info('session', 'Session state reset');
  }
}));
