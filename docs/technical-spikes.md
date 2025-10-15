# Technical Spike Plan – Speech Loop

## Objective
Validate end-to-end speech flow in React Native/Expo using native TTS and selectable STT providers (system, Whisper).

## Deliverables
1. Expo playground project in separate branch `spike/speech-loop`.
2. Metrics note summarizing latency (record end → transcript available → audio playback).
3. Decision log confirming readiness of libraries for production implementation.

## Tasks
1. **Project Setup**
   - `npx create-expo-app@latest speech-loop --template expo-template-blank-typescript`.
   - Install dependencies: `expo-av`, `expo-speech`, `react-native-voice`, `expo-file-system`, `axios`.
2. **Native STT Prototype**
   - Implement button to start/stop recognition via `react-native-voice`.
   - Log transcripts and error codes.
   - Measure average latency across 5 utterances per language (English, Spanish).
3. **Whisper Integration**
   - Record audio to WAV (16 kHz) using `expo-av`.
   - Upload via `axios` to Whisper endpoint with API key from `.env`.
   - Compare transcript accuracy vs native STT for same utterances.
4. **Playback Test**
   - Use `expo-speech` for TTS output.
   - Adjust rate slider and confirm persistence across app reload (using `AsyncStorage`).
5. **Reporting**
   - Document results in `docs/spike-results.md` (latency table, qualitative notes).
   - Flag blockers (permissions, background noise) and propose mitigations.

## Success Criteria
- Average round-trip (record end → audio playback) ≤ 2.5s native, ≤ 4s Whisper.
- Whisper transcripts match reference text ≥ 85% word accuracy.
- No critical crashes observed in Expo Go on Android & iOS during tests.
