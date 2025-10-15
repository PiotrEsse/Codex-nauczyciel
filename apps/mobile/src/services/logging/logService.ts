import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASYNC_STORAGE_KEYS } from '@utils/constants/storage';

type LogLevel = 'info' | 'warn' | 'error';

export type LogEventRecord = {
  id: string;
  timestamp: number;
  level: LogLevel;
  scope: string;
  message: string;
  metadata?: Record<string, unknown>;
};

const MAX_LOG_ENTRIES = 200;

const readLogEntries = async (): Promise<LogEventRecord[]> => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LOG_EVENTS);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as LogEventRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn('[LanguageTutor][LogService] Failed to parse log storage', error);
    return [];
  }
};

const persistLogEntries = async (entries: LogEventRecord[]): Promise<void> => {
  const sorted = entries
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_LOG_ENTRIES);
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LOG_EVENTS, JSON.stringify(sorted));
};

const appendLogEntry = async (entry: LogEventRecord): Promise<LogEventRecord> => {
  const current = await readLogEntries();
  await persistLogEntries([entry, ...current]);
  return entry;
};

const consoleForLevel = (level: LogLevel): ((...args: unknown[]) => void) => {
  if (level === 'error') {
    return console.error;
  }
  if (level === 'warn') {
    return console.warn;
  }
  return console.log;
};

const buildEntry = (
  level: LogLevel,
  scope: string,
  message: string,
  metadata?: Record<string, unknown>
): LogEventRecord => ({
  id: `log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  timestamp: Date.now(),
  level,
  scope,
  message,
  metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined
});

export const LogService = {
  async log(
    level: LogLevel,
    scope: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<LogEventRecord> {
    const entry = buildEntry(level, scope, message, metadata);
    await appendLogEntry(entry);
    const logger = consoleForLevel(level);
    if (entry.metadata) {
      logger(`[LanguageTutor][${scope}] ${message}`, entry.metadata);
    } else {
      logger(`[LanguageTutor][${scope}] ${message}`);
    }
    return entry;
  },
  info(scope: string, message: string, metadata?: Record<string, unknown>) {
    return LogService.log('info', scope, message, metadata);
  },
  warn(scope: string, message: string, metadata?: Record<string, unknown>) {
    return LogService.log('warn', scope, message, metadata);
  },
  error(scope: string, message: string, metadata?: Record<string, unknown>) {
    return LogService.log('error', scope, message, metadata);
  },
  async getRecent(limit = 50): Promise<LogEventRecord[]> {
    const entries = await readLogEntries();
    return entries
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.LOG_EVENTS);
  },
  async buildExportPayload(): Promise<{ exportedAt: string; events: LogEventRecord[] }> {
    const events = await readLogEntries();
    return {
      exportedAt: new Date().toISOString(),
      events: events
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
    };
  }
};
