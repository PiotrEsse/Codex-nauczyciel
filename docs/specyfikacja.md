# Language Tutor Mobile App – Specyfikacja Produktu i Techniczna

> Dokument został opracowany, aby zebrać wizję, funkcjonalności MVP oraz rekomendowany stos technologiczny dla aplikacji mobilnej uczącej języków poprzez rozmowę z AI.

## 1. Wizja i Cele
- Stworzenie rozmówcy-mentora wspieranego przez AI, który dostosowuje poziom trudności do umiejętności ucznia.
- Priorytetem MVP jest walidacja, czy prowadzone głosowo konwersacje są skutecznym narzędziem nauki.

## 2. Użytkownicy Docelowi
- Początkujący, średniozaawansowani i zaawansowani uczniowie.
- Scenariusze: wybór języków, rozmowa głosowa z AI, otrzymywanie podpowiedzi i korekt.

## 3. Funkcjonalności MVP
1. **Ekran startowy**: centralny przycisk „Rozpocznij rozmowę” oraz podgląd aktualnych ustawień językowych.
2. **Menu konfiguracji**: wybór języka docelowego, języka ojczystego, poziomu ucznia oraz preferowanych usług STT/TTS (natywne silniki lub zewnętrzne API takie jak Whisper/ElevenLabs). Klucze do usług chmurowych zapisywane lokalnie.
3. **Sesja konwersacyjna**: push-to-talk, STT → LLM → TTS, adaptacja trudności, opcjonalne podpowiedzi w języku ojczystym. Dla uproszczenia MVP korzystamy z jednego scenariusza rozmowy „Small Talk”, który ewoluuje wraz z postępami ucznia.
4. **Informacja zwrotna**: korekty wymowy, gramatyki, sugestie słownictwa, wskazówki w języku ojczystym na żądanie.
5. **Zarządzanie sesją**: pauza/wznowienie, zapis skrótu rozmowy (ostatnie X wymian) w lokalnym pliku JSON, podstawowe statystyki (czas rozmowy, liczba wypowiedzi).
6. **Dostępność**: tryb tekstowy jako fallback, regulacja prędkości mowy TTS.

## 4. Pipeline Audio (MVP)
1. Naciśnięcie przycisku „Mów” → nagranie audio.
2. W zależności od konfiguracji: przekazanie audio do natywnego `SpeechRecognizer/SFSpeechRecognizer` **lub** wysłanie strumienia do zewnętrznej usługi (np. Whisper API) przez lekki moduł HTTP.
3. Orkiestrator rozmowy + LLM (OpenAI GPT-4o mini) pracujący w pamięci aplikacji; historie konwersacji przechowywane lokalnie.
4. Generacja odpowiedzi w TTS: natywny `TextToSpeech/AVSpeechSynthesizer` albo zewnętrzne API (np. ElevenLabs, Azure). W menu ustawień użytkownik wskazuje dostawcę i ewentualne klucze.
5. Odtworzenie audio i równoległe zapisanie tekstu w lokalnym repozytorium.

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
- **React Native (TypeScript) + Expo (tryb managed)** jako najszybsza droga do zbudowania natywnej aplikacji bez konieczności konfiguracji Xcode/Android Studio na starcie.
- React Query do obsługi zapytań sieciowych, Zustand do lokalnego stanu sesji, `expo-speech` oraz `react-native-voice`/`@react-native-voice/voice` do integracji z natywnymi modułami audio.
- Ekrany: `HomeScreen` (start/stop rozmowy), `SettingsScreen` (języki, poziom, wybór dostawców STT/TTS, pola na klucze API), `ConversationScreen` (historia wymian, wskazówki).

### Backend
- **Brak dedykowanego backendu** – aplikacja łączy się bezpośrednio z usługami LLM/STT/TTS. Dla bezpieczeństwa kluczy można opcjonalnie użyć pojedynczej funkcji serverless (np. Cloudflare Workers) jako proxy.
- Logi i diagnostyka zapisywane do lokalnych plików JSON (z opcją eksportu przez systemowe menu „Udostępnij”).

### AI i Mowa
- LLM: GPT-4o mini (lub zamiennie inny model kompatybilny z API OpenAI). Logika promptów utrzymywana w aplikacji.
- STT: możliwość przełączania pomiędzy natywnym rozpoznawaniem mowy a zewnętrznym API (Whisper, AssemblyAI). Moduł konfiguracyjny przechowuje klucze i adresy endpointów w lokalnym magazynie.
- TTS: natywne silniki jako domyślne, z możliwością aktywacji chmurowych głosów (np. ElevenLabs) poprzez tę samą warstwę konfiguracji.

### Infrastruktura
- Zarządzanie zależnościami i buildami przez Expo EAS (OTA updates). W razie potrzeby zejście do bare workflow umożliwia bezpośrednie użycie natywnych SDK.
- Testy manualne na urządzeniach fizycznych; automatyzację można dodać później.

## 9. Architektura Systemu
- Aplikacja mobilna z trzema modułami UI: Home (kontrola rozmowy), Settings (konfiguracja języków i dostawców), Conversation (podgląd transkryptu i wskazówki).
- Warstwa `SpeechService` wybierająca w czasie rzeczywistym natywne lub chmurowe STT/TTS w zależności od ustawień użytkownika.
- `ConversationEngine` utrzymujący kontekst czatu i adaptację poziomu, zapisujący streszczenia do lokalnego repozytorium.
- Warstwa `Storage` oparta o AsyncStorage/SQLite w celu przechowywania ustawień, skrótów rozmów i cache audio (dla TTS z chmury).

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
