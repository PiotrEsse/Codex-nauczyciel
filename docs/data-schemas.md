# Local Data Schemas – Language Tutor MVP

## 1. Storage Overview
- **AsyncStorage (key-value)** for lightweight preferences and flags.
- **Secure storage** (`expo-secure-store` / Keychain / Keystore) for Whisper API key.
- **SQLite** (via `expo-sqlite` or `react-native-sqlite-storage`) for transcripts and session metrics.

## 2. Keys in AsyncStorage
| Key | Type | Description |
| --- | --- | --- |
| `settings.language` | object | `{ target: "es-ES", native: "pl-PL" }` |
| `settings.level` | string | `beginner | intermediate | advanced` |
| `settings.speech` | object | `{ stt: "native" | "whisper", tts: "native" }` |
| `settings.audio` | object | `{ ttsRate: number (0.5-1.5), normalize: boolean }` |
| `flags.onboardingCompleted` | boolean | Controls first-run overlay |
| `cache.lastSessionId` | string | Primary key of the most recent session |

## 3. Secure Store Items
| Key | Value |
| --- | --- |
| `secret.whisperApiKey` | Base64-encoded string |
| `secret.whisperEndpoint` | URL, default `https://api.openai.com/v1/audio/transcriptions` |

## 4. SQLite Schema
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  learner_level TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('native-stt', 'whisper-stt')),
  turns_count INTEGER DEFAULT 0,
  hints_count INTEGER DEFAULT 0,
  new_vocab JSON,
  notes TEXT
);

CREATE TABLE turns (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('user','lumi')),
  transcript TEXT NOT NULL,
  audio_path TEXT,
  duration_ms INTEGER,
  stt_confidence REAL,
  correction JSON,
  created_at INTEGER NOT NULL
);

CREATE TABLE metrics (
  key TEXT PRIMARY KEY,
  value REAL,
  updated_at INTEGER NOT NULL
);
```

## 5. Data Retention Policy
- Keep only the last 10 sessions (delete oldest when inserting new one).
- Allow user to clear entire history from Settings → Data & Debug.
- Export flow packages a session as JSON:
```json
{
  "meta": { "appVersion": "0.1.0", "exportedAt": "2024-07-21T18:25:43Z" },
  "session": { ... },
  "turns": [ ... ]
}
```

## 6. Sync & Migration Strategy
- Wrap all storage operations in a `StorageService` with interface methods:
  - `getSettings()`, `updateSettings(partial)`
  - `saveSession(session)`, `appendTurn(turn)`
  - `getRecentSessions(limit)`
- Provide migration function that runs on app start to ensure tables exist and apply schema upgrades (track version in AsyncStorage `db.version`).

## 7. Validation Rules
- Validate language codes against supported list before saving.
- Reject Whisper API key if not matching regex `^sk-[A-Za-z0-9]{32,}$` and show inline error.
- Ensure session has at least one user and one AI turn before marking as complete.
