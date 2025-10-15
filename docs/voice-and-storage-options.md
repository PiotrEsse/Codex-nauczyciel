# Voice & Storage Options for MVP

## 1. Text-to-Speech (TTS) Strategies

| Option | Platform Support | Pros | Cons | Recommended Usage in MVP |
| --- | --- | --- | --- | --- |
| **Native TTS engines** (Android TextToSpeech, iOS AVSpeechSynthesizer) | Built into Android & iOS | • Zero external dependencies<br>• No per-request cost<br>• Works offline once voices installed | • Limited voice quality compared to premium cloud voices<br>• Language coverage varies by OS version<br>• Requires bridging if using cross-platform frameworks | Use by default to keep MVP simple and low-cost. Offer settings to choose installed voices; fall back to cloud voices if native voice missing. |
| **Cloud TTS (Azure, Google, Amazon, ElevenLabs)** | REST APIs, streaming support | • Higher fidelity & expressive voices<br>• Broad language & accent coverage<br>• Can return SSML features (emotion, prosody) | • Requires internet and API key management<br>• Adds latency & per-call cost<br>• Additional failure modes | Consider as optional upgrade for premium experience or when native voice unavailable. |

### Implementation Notes
- **React Native / Expo**: Use packages such as `react-native-tts` or Expo's `Speech` module to access the native APIs. Test pronunciation for the chosen languages; allow user to download additional voices in OS settings if needed.
- **Quality fallback**: Start with native TTS for MVP validation, log feedback about voice quality. Introduce cloud voices only if users demand richer audio.

## 2. Speech-to-Text (STT) Strategies

| Option | Platform Support | Pros | Cons | Recommended Usage in MVP |
| --- | --- | --- | --- | --- |
| **Native STT** (Android SpeechRecognizer, iOS Speech framework) | Built into OS; accessible via permissions | • No external billing<br>• Integrates with system dictation (familiar UX)<br>• Acceptable accuracy for many major languages | • Some languages/accent combinations have poorer accuracy<br>• Requires network connection in most cases<br>• Rate limits on session length (e.g., iOS ~1 minute) | Start here for MVP to minimize setup. Ensure UX handles short recognition windows (auto-restart listening). |
| **Cloud STT** (Whisper API, Google Speech-to-Text, AssemblyAI, Deepgram) | HTTP/streaming APIs | • Strong multilingual accuracy, including non-standard accents<br>• Supports streaming for longer utterances<br>• Consistent experience across devices | • Additional latency<br>• Usage cost & key management<br>• Must handle audio upload securely | Introduce when native accuracy proves insufficient or when you need longer, streaming sessions. |

### Implementation Notes
- **React Native bridging**: Libraries like `react-native-voice` surface Android/iOS recognition. Verify microphone permission flows early.
- **Session management**: Because native APIs may enforce time limits, implement auto-restart or instruct users to keep utterances concise.
- **Offline scenario**: Native STT often requires connectivity; clearly communicate this requirement to testers.

## 3. Storage Approach for Early MVP

| Storage Option | Description | Pros | Cons | Recommendation |
| --- | --- | --- | --- | --- |
| **On-device JSON/SQLite file** | Persist session settings, transcripts, and metrics locally without remote server | • Fast to implement<br>• No backend infrastructure<br>• Keeps user data private during MVP experiments | • Harder to sync across devices<br>• No centralized analytics<br>• Risk of data loss if app uninstalled | For idea validation, store small JSON/SQLite files using libraries like `react-native-fs` or `AsyncStorage`. Good enough to track sessions and notes. |
| **Lightweight local DB (Realm, WatermelonDB)** | Embedded database with query APIs | • Better structure for growing datasets<br>• Reactive updates to UI | • Slightly more setup effort | Use if transcripts or analytics grow quickly; optional for MVP. |
| **Cloud backend (Postgres/Firestore)** | Centralized storage for users and sessions | • Enables multi-device sync, analytics, user accounts | • Requires auth, backend deployment, security considerations | Delay until after MVP validation unless remote analytics are critical. |

### Practical MVP Plan
1. **Persist locally**: Store language selections, proficiency level, and recent conversation summaries using `AsyncStorage` or a small file. This avoids backend work while letting testers resume sessions.
2. **Export for feedback**: Provide a simple "Export session" action that writes transcripts to a shareable file. Manual export supports qualitative research without infrastructure.
3. **Upgrade path**: When you need collaborative features or remote analytics, migrate to a hosted database. Keep local storage schema modular to ease migration (e.g., wrap all persistence in a repository layer).

## 4. Prioritized Recommendations
1. **Adopt native TTS/STT first** to minimize cost and accelerate prototyping. Validate conversational flow and pedagogy before investing in premium audio quality.
2. **Instrument feedback**: Ask testers about speech clarity and recognition accuracy. Their responses guide whether to invest in cloud speech services.
3. **Keep storage simple**: Use on-device storage for MVP, coupled with optional manual export for research. Plan an abstraction layer so moving to a backend later requires minimal refactoring.
4. **Iterate quickly**: Focus development time on conversational logic and UX; speech and storage can evolve once the learning value is proven.
