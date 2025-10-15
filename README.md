# Codex-nauczyciel

Materiały planistyczne dla koncepcji konwersacyjnego nauczyciela języków.

## Struktura repozytorium
- `apps/mobile` – projekt Expo (TypeScript) z natywną aplikacją „Language Tutor” zgodną z dokumentacją w katalogu `docs/`.

## Uruchomienie aplikacji mobilnej
1. `cd apps/mobile`
2. `npm install`
3. `npm run start` – uruchamia serwer deweloperski Expo (Metro).
4. `npm run ios` / `npm run android` – buduje aplikację na symulator/emulator zgodnie z opisem w `docs/getting-started.md`.

## Dokumentacja
- [Specyfikacja produktu i techniczna](./docs/specyfikacja.md) – opis ekranów (Home/Settings/Conversation) oraz pipeline audio z możliwością wyboru natywnych lub chmurowych usług.
- [Opcje głosowe i magazynowania danych dla MVP](./docs/voice-and-storage-options.md) – strategia natywnego TTS oraz przełączalnego STT (system vs Whisper) i plan lokalnego przechowywania.
- [Plan rozwoju aplikacji](./docs/development-plan.md) – harmonogram etapów, kamienie milowe, role oraz zasady prowadzenia projektu.
- [Ocena gotowości do implementacji](./docs/implementation-readiness.md) – analiza luk i rekomendacje działań przygotowawczych przed startem developmentu.
- [UX & Conversation Flows](./docs/ux-conversation-flows.md) – opis ekranów, przepływów użytkownika oraz edge-case'ów.
- [Conversation Prompt Design](./docs/prompt-design.md) – struktura promptów, reguły adaptacji i korekt.
- [Local Data Schemas](./docs/data-schemas.md) – opis struktur AsyncStorage/SecureStore/SQLite.
- [Whisper Configuration Checklist](./docs/whisper-configuration.md) – instrukcje pozyskania klucza i testów rozpoznawania.
- [Developer Getting Started Guide](./docs/getting-started.md) – narzędzia, standardy kodu i komendy npm.
- [Testing & QA Plan](./docs/testing-plan.md) – macierz urządzeń, kryteria akceptacji oraz checklisty regresji.
- [Pre-Release Checklist](./docs/release-checklist.md) – lista kontroli przed publikacją buildów MVP.
- [Technical Spike Plan – Speech Loop](./docs/technical-spikes.md) – zadania i kryteria sukcesu dla walidacji STT/TTS.
- [Immediate Next Steps](./docs/next-steps.md) – priorytety operacyjne przed startem Sprintu 1.
