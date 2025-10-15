# UX & Conversation Flows – Language Tutor MVP

## 1. Navigation Structure
- **Home (Conversation) Screen**
  - Header with current target language and learner level chip.
  - Central microphone button (press-and-hold) controlling capture state.
  - Waveform animation during recording, playback bar for AI response.
  - Transcript area with collapsible bilingual hints (target + native language).
  - Footer with quick actions: "Pause", "Ask for hint", "Switch topic".
- **Settings Screen** (single scroll view)
  - Section: *Languages & Level* – dropdowns for target language, native language, and learner level.
  - Section: *Speech Services* – toggles for `Use native speech` vs `Use Whisper STT`; configuration drawer for Whisper API key and model.
  - Section: *Audio Behaviour* – sliders for TTS speech rate and volume normalization toggle.
  - Section: *Data & Debug* – buttons for export session, clear history, view logs.
- **Session Review Modal**
  - Pops up after user stops conversation (>5 minutes inactivity or manual exit).
  - Shows total duration, number of AI hints, list of new vocabulary (max 10), button to share/export transcript.

## 2. Happy Path Flow
1. User launches app → Home screen shows onboarding overlay (first run only) highlighting microphone button.
2. User taps microphone → permission request for microphone shown (OS native dialog).
3. Recording state begins (waveform active, hint text "Speak now in {targetLanguage}").
4. On release, Whisper STT or native STT processes audio → spinner "Understanding you..." displayed.
5. Conversation engine response arrives → audio auto-plays, transcript displayed (target language). Short hint bubble in native language appears below.
6. User can swipe up transcript for full history or tap "Ask for hint" to force bilingual explanation.
7. User continues conversation; after 5 exchanges app prompts "Ready to review?" with options Continue/Review.
8. Choosing Review opens Session Review modal; user taps "Done" to return to Home.

## 3. Edge Cases & Alternate Paths
- **Low connectivity / STT failure**
  - Toast: "We could not understand. Try again or switch to system speech recognition." with action button linking to Settings → Speech Services.
- **Whisper API key missing**
  - When Whisper mode is enabled without key, Settings shows inline error "Add your Whisper API key to continue" and Home mic button is disabled with tooltip.
- **User requests pause**
  - Pause button stops microphone and TTS playback; banner shows "Session paused" with Resume/End options.
- **Beginner scaffolding**
  - After two very short replies (<3 words) AI automatically sends supportive prompt in native language encouraging longer answers.
- **Advanced mode**
  - Transcript defaults to target language only; hints are collapsed and labelled "Show explanation".

## 4. Copy Guidelines
- Tone: friendly, encouraging, non-judgmental.
- Always mention target language in prompts ("Let's try saying this in Spanish").
- Use short CTA labels: "Start", "Pause", "Review", "Export".

## 5. Outstanding UX Assets
- High-fidelity visual mockups (color palette, typography).
- Audio waveform animation reference.
- Icon set for mic states (idle/recording/muted).
