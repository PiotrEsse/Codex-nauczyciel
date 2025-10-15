# Testing & QA Plan – Language Tutor MVP

## 1. Device Matrix
| Platform | Minimum OS | Devices |
| --- | --- | --- |
| Android | 11 | Pixel 5 (emulator), Samsung Galaxy A52 (physical) |
| iOS | 16 | iPhone 14 (simulator), iPhone SE (physical) |

## 2. Test Types
- **Manual exploratory** during development sprints.
- **Smoke checklist** before each release candidate.
- **Unit tests** for storage services, prompt assembly, speech service wrappers.
- **Instrumentation** (future) using Detox for button flows (start/stop conversation).

## 3. Acceptance Criteria per Milestone
### Milestone M1 – Voice Loop Prototype
- Microphone permission request appears and records audio.
- Native STT returns transcript for sample phrase in target language.
- AI response plays through device speaker with native TTS.
- Whisper toggle disabled until API key provided.

### Milestone M2 – Adaptive Tutor Beta
- Whisper STT returns accurate transcript for 90% of scripted phrases (10-sentence test set).
- AI prompt adapts: beginner receives translation hints, advanced does not (verified in 3 scripted conversations).
- Session data saved locally and listed in review modal.
- Export JSON matches schema in `docs/data-schemas.md`.

## 4. Regression Checklist
- Start conversation → record → AI responds within 3 seconds.
- Pause/resume preserves transcripts and audio playback position.
- Switching STT mode mid-session prompts confirmation and restarts capture.
- Clearing data removes sessions, transcripts, Whisper key.
- App handles loss of network by falling back to native STT without crash.

## 5. Bug Reporting Process
- Capture logs using Expo dev tools (`expo start --tunnel` + remote JS debugger).
- Record audio/video of failure when possible.
- File issue template fields: environment, reproduction steps, expected vs actual, logs, attachments.

## 6. Open QA Tasks
- Define automated test harness for speech services (mocking Whisper responses).
- Collect baseline latency metrics across devices.
- Schedule weekly QA sync during MVP build.
