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
2. Przesłanie próbki bezpośrednio do wybranej usługi STT (lub cienkiego proxy) i konwersja na tekst.
3. Orkiestrator rozmowy + LLM.
4. Generacja odpowiedzi w TTS i odtworzenie w aplikacji.

## 5. Silnik Konwersacyjny AI
- Utrzymanie stanu sesji i profilu ucznia.
- Strategia promptów: rola nauczyciela, instrukcje adaptacji poziomu, streszczenie kontekstu.
- Adaptacja trudności: analiza jakości wypowiedzi, długości, błędów.
- Obsługa błędów STT, stagnacji rozmowy.

## 6. Dane i Prywatność
- Wszystkie ustawienia i notatki trzymamy **lokalnie** na urządzeniu (np. pliki JSON, AsyncStorage lub lekka baza SQLite).
- Nie zakładamy synchronizacji między urządzeniami ani kopii w chmurze – ewentualna utrata danych jest akceptowalna na etapie walidacji.
- Jeżeli zapisywane są transkrypty, użytkownik musi wyrazić zgodę i mieć możliwość ich usunięcia.

## 7. Wymagania Niefunkcjonalne
- Responsywność, obserwowalność (metryki opóźnień, błędów), skalowalność warstwy mowy/LLM, bezpieczeństwo API.

## 8. Rekomendowany Stos Technologiczny
### Aplikacja mobilna
- React Native (TypeScript), React Query, Zustand/Recoil, natywne moduły audio, Expo/NativeBase.

### Backend
- **Na potrzeby MVP brak dedykowanego backendu i bazy danych.** Aplikacja komunikuje się bezpośrednio z usługą LLM/STT/TTS lub przez bardzo cienką funkcję pośredniczącą (serverless), jeśli wymaga tego polityka kluczy API.
- Jeśli potrzebne będzie logowanie ruchu, można rozważyć prosty serwer proxy zapisujący lekkie logi w plikach – bez relacyjnej bazy danych.

### AI i Mowa
- LLM: GPT-4o / GPT-4o mini (z możliwością wymiany).
- STT: w pierwszej kolejności natywne moduły (`SpeechRecognizer`, `SFSpeechRecognizer`). Chmurowe rozwiązanie (np. Whisper API) włączamy tylko, gdy dokładność okaże się niewystarczająca.
- TTS: natywne silniki (`TextToSpeech`, `AVSpeechSynthesizer`) z możliwością rozszerzenia o chmurowe głosy premium w późniejszym etapie.

### Infrastruktura
- Brak wymogów serwerowych poza ewentualną funkcją proxy dla kluczy API.
- Automatyczne testy i analityka mogą być prowadzone ręcznie na podstawie eksportowanych plików.

## 9. Architektura Systemu
- Aplikacja mobilna (Onboarding, Conversation, History + audio) z lokalnym magazynem danych.
- Bezstanowe wywołania do usług STT/TTS/LLM (np. OpenAI) – bez utrzymywania własnego serwera aplikacyjnego.
- Pliki i konfiguracja przechowywane na urządzeniu użytkownika.

## 10. Harmonogram
- **MVP (0–8 tyg.)**: funkcje opisane wyżej, identyfikacja użytkownika na podstawie danych lokalnych (np. UUID zapisany w pliku), ręczna obserwowalność (np. eksport transkryptów).
- **Rozszerzenia (po walidacji)**: testy poziomujące, tryb lekcji, gamifikacja, funkcje społecznościowe, synchronizacja w chmurze, rozbudowane polityki bezpieczeństwa.

## 11. Dlaczego wystartować z aplikacją natywną
- **Dostęp do pełnych API mowy**: Android i iOS oferują natywne moduły STT/TTS o niskiej latencji. W PWA Web Speech API działa tylko w wybranych przeglądarkach (np. Safari nie wspiera rozpoznawania mowy), co komplikuje wdrożenie.
- **Spójność UX**: na urządzeniach mobilnych łatwiej zarządzać uprawnieniami mikrofonu, odtwarzaniem w tle i powiadomieniami w aplikacji natywnej.
- **Integracja offline**: lokalne przechowywanie plików JSON/SQLite jest prostsze w natywnej aplikacji niż w przeglądarce, gdzie dostęp do systemu plików jest ograniczony.
- **Szybkość budowy MVP**: React Native/Swift/Kotlin pozwala skorzystać z gotowych bibliotek `TextToSpeech`/`AVSpeechSynthesizer` oraz `SpeechRecognizer`/`SFSpeechRecognizer`. W PWA trzeba liczyć się z obejściami i brakiem wsparcia w części urządzeń.
- W razie potrzeby aplikację PWA można rozważyć później jako wersję uzupełniającą, gdy logika zostanie zweryfikowana i pojawi się potrzeba lekkiego klienta webowego.

## 12. Metryki Sukcesu
- DAU/retencja, długość sesji, wskaźniki poprawek, trafność STT, satysfakcja.

## 13. Ryzyka i Mitigacje
- Opóźnienia → streaming, cache, regiony edge.
- Dokładność STT → fallback tekstowy, spowolnienie TTS.
- Prywatność → zgody, lokalne przechowywanie.
- Koszty → monitorowanie, limity sesji, modele lżejsze dla casual users.

---

**Status testów:** ⚠️ brak testów automatycznych (dokumentacja).
