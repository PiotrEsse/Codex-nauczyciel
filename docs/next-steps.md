# Immediate Next Steps – Language Tutor MVP

This checklist distills the work that should happen right away so that the
team can transition from planning to implementation with clear ownership and
expected deliverables. Each item references the deeper documentation where
applicable.

## 1. Close Outstanding Research Items

1. **Run the STT/TTS latency spike** (see `docs/technical-spikes.md`).
   - Measure end-to-end latency for: native STT, Whisper STT, native TTS.
   - Document findings in a new `docs/spike-results.md` file.
   - Decide default configuration for Sprint 1 based on measurements.
2. **Validate the conversation prompt** (see `docs/prompt-design.md`).
   - Conduct three scripted sessions (beginner/intermediate/advanced personas).
   - Capture transcripts, highlight where responses need tuning.
   - Update the prompt guidelines with adjustments or TODOs.
3. **Finalize Whisper key distribution** (see `docs/whisper-configuration.md`).
   - Produce tester list and secure storage method for API keys.
   - Confirm fallback instructions for testers without Whisper access.

## 2. Prepare the Development Environment

- [x] **Bootstrap the Expo React Native project** following `docs/getting-started.md`.
  - Initialize repository structure (`apps/mobile`, shared config, etc.).
  - Add TypeScript, ESLint, Prettier, Jest, and basic CI configuration (even if
    CI will be wired later).
- [x] **Implement local storage scaffolding** based on `docs/data-schemas.md`.
  - Create AsyncStorage helpers for settings and session notes.
  - Stub SQLite module (optional) to be filled once session history feature is
    prioritized.
- [x] **Set up configuration surfaces** in the app skeleton.
  - Settings screen with options for: target language, native language, user
    level, STT provider (native vs Whisper), and API key entry.
  - Persist changes immediately and confirm they survive app reload.
  - Surface debug tooling for session history and event logs so testers can
    share context quickly.

## 3. Coordinate Team Operations

1. **Adopt the QA/testing workflow** from `docs/testing-plan.md`.
   - Clone `docs/testing-notes-template.md` into a dated file for the first
     testing cycle.
   - Define exit criteria for the first milestone (basic conversation loop).
2. **Align on release expectations** using `docs/release-checklist.md`.
   - Determine which items are MVP-critical versus “later”.
   - Schedule a dry run once the conversation loop is functional.
3. **Maintain documentation hygiene.**
   - Update relevant docs immediately after each spike or major decision.
   - Track open questions in the development plan (`docs/development-plan.md`).

## 4. Kick Off Sprint 1 (Implementation)

Once the spike and prompt validation outcomes are captured:

1. **Create Sprint 1 backlog** focusing on the conversational happy path:
   - Microphone capture & Whisper/native STT integration.
   - LLM request/response pipeline using the defined prompt blueprint.
   - Native TTS playback and transcript display.
   - Conversation screen interactions (push-to-talk, tips pane).
2. **Schedule regular demos** (e.g., twice per week) to validate UX flow early.
3. **Capture learnings** in the new spike results doc and testing notes to feed
   future iterations.

---
*Status of this checklist: initial version. Update as soon as tasks are
completed or reprioritized.*
