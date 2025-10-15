# Voice & Storage Options for MVP

## 1. Text-to-Speech (TTS) Strategy

| Option | Platform Support | Pros | Cons | Recommended Usage in MVP |
| --- | --- | --- | --- | --- |
| **Native TTS engines** (Android TextToSpeech, iOS AVSpeechSynthesizer) | Built into Android & iOS | • Zero external dependencies<br>• No per-request cost<br>• Works offline once voices installed | • Voice quality depends on OS voices<br>• Language coverage varies by OS version<br>• Requires bridging if using cross-platform frameworks | Domyślny tryb TTS w MVP. Zapewnia prostą konfigurację i brak zależności od usług zewnętrznych. |

### Implementation Notes
- **React Native / Expo**: Use packages such as `react-native-tts` or Expo's `Speech` module to access the native APIs. Test pronunciation for the chosen languages; allow user to download additional voices in OS settings if needed.
- **Quality feedback**: Zbieraj opinie testerów o barwie głosu i płynności. Jeśli w przyszłości pojawi się potrzeba bogatszych głosów, można rozważyć chmurowe TTS jako rozszerzenie.

## 2. Speech-to-Text (STT) Strategy

| Option | Platform Support | Pros | Cons | Recommended Usage in MVP |
| --- | --- | --- | --- | --- |
| **Native STT** (Android SpeechRecognizer, iOS Speech framework) | Built into OS; accessible via permissions | • No external billing<br>• Integrates with system dictation (familiar UX)<br>• Acceptable accuracy for many major languages | • Some languages/accent combinations have poorer accuracy<br>• Requires network connection in most cases<br>• Rate limits on session length (e.g., iOS ~1 minute) | Tryb podstawowy. Aplikacja automatycznie restartuje sesję, gdy system zakończy rozpoznawanie. |
| **OpenAI Whisper API** | REST API | • Strong multilingual accuracy, incl. non-standard accents<br>• Consistent experience across devices | • Requires API key<br>• Adds latency & usage cost<br>• Needs secure handling of audio uploads | Opcja alternatywna w ustawieniach. Użytkownik podaje klucz API; aplikacja wysyła nagrania do Whisper w razie problemów z natywnym STT. |

### Implementation Notes
- **React Native bridging**: Libraries like `react-native-voice` surface Android/iOS recognition. Verify microphone permission flows early.
- **Whisper integration**: Rekorduj audio jako 16 kHz mono WAV i wysyłaj do `https://api.openai.com/v1/audio/transcriptions` z nagłówkiem `Authorization: Bearer <API_KEY>`.
- **Session management**: Because native APIs may enforce time limits, implement auto-restart or instruct users to keep utterances concise. Whisper nie ma limitów długości, ale dla responsywności utrzymuj wypowiedzi ≤ 30 s.
- **Offline scenario**: Native STT often requires connectivity; clearly communicate this requirement to testers.

## 3. Storage Approach for Early MVP

| Storage Option | Description | Pros | Cons | Recommendation |
| --- | --- | --- | --- | --- |
| **On-device JSON/SQLite file** | Persist session settings, transcripts, and metrics locally without remote server | • Fast to implement<br>• No backend infrastructure<br>• Keeps user data private during MVP experiments | • Harder to sync across devices<br>• No centralized analytics<br>• Risk of data loss if app uninstalled | For idea validation, store small JSON/SQLite files using libraries like `react-native-fs`, `expo-sqlite`, or `AsyncStorage`. |
| **Lightweight local DB (Realm, WatermelonDB)** | Embedded database with query APIs | • Better structure for growing datasets<br>• Reactive updates to UI | • Slightly more setup effort | Możliwa przyszła migracja, gdy dane urosną. Na start wystarczy SQLite. |

### Practical MVP Plan
1. **Persist locally**: Store language selections, proficiency level, STT provider choice, TTS rate and recent conversation summaries using `AsyncStorage` plus SQLite tables (patrz `docs/data-schemas.md`).
2. **Zabezpiecz klucze**: użyj `expo-secure-store` do przechowywania klucza Whisper.
3. **Export for feedback**: Provide a simple "Export session" action that writes transcripts to a shareable file. Manual export supports qualitative research without infrastructure.
4. **Upgrade path**: When you need collaborative features or remote analytics, migrate to a hosted database. Keep local storage schema modular to ease migration (wrap persistence in `StorageService`).

## 4. Konfiguracja w aplikacji
- **Sekcja „Mowa”** w ustawieniach pozwala wskazać dostawcę STT (System / Whisper) oraz podać klucz API.
- Dla trybu Whisper aplikacja umożliwia testowe rozpoznanie, aby użytkownik mógł zweryfikować konfigurację.
- Wszystkie pola konfiguracji posiadają krótkie opisy i link do `docs/whisper-configuration.md`.
- W pamięci operacyjnej przechowuj aktualnie wybrane ustawienia, aby `SpeechService` mógł płynnie przełączać się między dostawcami bez restartu aplikacji.

## 5. Native App vs PWA for Voice Features (podsumowanie)
| Kryterium | Aplikacja natywna (React Native / Swift / Kotlin) | PWA (Web Speech API) |
| --- | --- | --- |
| **Dostępność TTS** | Pełny dostęp do `TextToSpeech` (Android) i `AVSpeechSynthesizer` (iOS); działa offline po pobraniu głosów. | Web Speech Synthesis ograniczony; brak wsparcia offline. |
| **Dostępność STT** | `SpeechRecognizer` (Android) i `SFSpeechRecognizer` (iOS) lub Whisper przez API. | Web Speech Recognition niedostępny na iOS Safari; niestabilny w innych przeglądarkach. |
| **Uprawnienia / UX** | Jednorazowe nadanie dostępu do mikrofonu, możliwość działania w tle, kontrola nad audio. | Przeglądarki wymagają częstych zgód; brak stabilnego działania w tle. |
| **Magazyn danych** | Pełny dostęp do plików/SQLite. | Ograniczony rozmiar Storage API, brak wygodnego eksportu. |
| **Czas wdrożenia MVP** | Gotowe biblioteki RN przyspieszają prace. | Należy budować obejścia dla braku wsparcia STT. |

**Wniosek**: Dla MVP stawiamy na aplikację natywną z domyślnym natywnym TTS oraz przełączalnym STT (systemowym lub Whisper). PWA pozostaje opcją na później.

## 6. Priorytetowe zalecenia
1. **Udostępnij wybór dostawcy STT** już w pierwszej wersji, aby szybko testować natywne vs Whisper.
2. **Instrument feedback**: pytaj testerów o rozpoznawanie mowy i brzmienie natywnego TTS.
3. **Keep storage simple**: Use on-device storage for MVP, coupled with optional manual export for research.
4. **Iterate quickly**: Focus development time on conversational logic and UX; speech and storage can evolve once the learning value is proven.
