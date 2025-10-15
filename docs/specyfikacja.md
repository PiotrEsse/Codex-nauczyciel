# Language Tutor Mobile App – Specyfikacja Produktu i Techniczna

> Dokument został opracowany, aby zebrać wizję, funkcjonalności MVP oraz rekomendowany stos technologiczny dla aplikacji mobilnej uczącej języków poprzez rozmowę z AI.

## 1. Wizja i Cele
- Stworzenie rozmówcy-mentora wspieranego przez AI, który dostosowuje poziom trudności do umiejętności ucznia.
- Priorytetem MVP jest walidacja, czy prowadzone głosowo konwersacje są skutecznym narzędziem nauki.

## 2. Użytkownicy Docelowi
- Początkujący, średniozaawansowani i zaawansowani uczniowie.
- Scenariusze: wybór języków, rozmowa głosowa z AI, otrzymywanie podpowiedzi i korekt.

## 3. Funkcjonalności MVP
1. **Onboarding**: wybór języka docelowego, języka ojczystego, poziomu oraz celów.
2. **Sesja konwersacyjna**: push-to-talk, STT → LLM → TTS, adaptacja trudności, opcjonalne podpowiedzi w języku ojczystym.
3. **Informacja zwrotna**: korekty wymowy, gramatyki, sugestie słownictwa.
4. **Zarządzanie sesją**: pauza/wznowienie, historia transkryptów, podstawowe statystyki.
5. **Dostępność**: tryb tekstowy jako fallback, regulacja prędkości mowy TTS.

## 4. Pipeline Audio (MVP)
1. Naciśnięcie przycisku „Mów” → nagranie audio.
2. Przesłanie na backend i konwersja STT.
3. Orkiestrator rozmowy + LLM.
4. Generacja odpowiedzi w TTS i odtworzenie w aplikacji.

## 5. Silnik Konwersacyjny AI
- Utrzymanie stanu sesji i profilu ucznia.
- Strategia promptów: rola nauczyciela, instrukcje adaptacji poziomu, streszczenie kontekstu.
- Adaptacja trudności: analiza jakości wypowiedzi, długości, błędów.
- Obsługa błędów STT, stagnacji rozmowy.

## 6. Dane i Prywatność
- Minimalne przechowywanie danych (preferencje, transkrypty za zgodą).
- Szyfrowanie w tranzycie i spoczynku, możliwość usunięcia historii.

## 7. Wymagania Niefunkcjonalne
- Responsywność, obserwowalność (metryki opóźnień, błędów), skalowalność warstwy mowy/LLM, bezpieczeństwo API.

## 8. Rekomendowany Stos Technologiczny
### Aplikacja mobilna
- React Native (TypeScript), React Query, Zustand/Recoil, natywne moduły audio, Expo/NativeBase.

### Backend
- Node.js (TypeScript) z NestJS/Express, Prisma + PostgreSQL, Redis (opcjonalnie), proste uwierzytelnianie.

### AI i Mowa
- LLM: GPT-4o / GPT-4o mini (z możliwością wymiany). 
- STT: Whisper API lub alternatywy (AssemblyAI, Deepgram).
- TTS: Azure, Google, ElevenLabs; cache audio.

### Infrastruktura
- Kontenery (AWS Fargate/Cloud Run), CDN, menedżer tajemnic.

## 9. Architektura Systemu
- Aplikacja mobilna (Onboarding, Conversation, History + audio).
- API Gateway/Backend z REST i WebSocket/SSE.
- Usługi STT/TTS, warstwa LLM, baza danych, analityka.

## 10. Harmonogram
- MVP (0–8 tyg.): funkcje opisane wyżej, anonimowe ID urządzenia, podstawowa obserwowalność.
- Rozszerzenia: testy poziomujące, tryb lekcji, gamifikacja, społeczność, offline, scoring wymowy, authoring treści, multimodalność, polityki bezpieczeństwa.

## 11. Metryki Sukcesu
- DAU/retencja, długość sesji, wskaźniki poprawek, trafność STT, satysfakcja.

## 12. Ryzyka i Mitigacje
- Opóźnienia → streaming, cache, regiony edge.
- Dokładność STT → fallback tekstowy, spowolnienie TTS.
- Prywatność → zgody, lokalne przechowywanie.
- Koszty → monitorowanie, limity sesji, modele lżejsze dla casual users.

---

**Status testów:** ⚠️ brak testów automatycznych (dokumentacja).
