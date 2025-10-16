# Plan rozwoju aplikacji – Language Tutor

> Dokument opisuje strukturę prac dla wersji MVP aplikacji mobilnej oraz kolejne rozszerzenia. Ma służyć jako plan operacyjny do monitorowania postępów i priorytetów zespołu.

## 1. Założenia ogólne
- Priorytet: możliwie najszybsze dostarczenie działającej wersji MVP na Android i iOS z jedną ścieżką rozmowy.
- Brak dedykowanego backendu – aplikacja komunikuje się bezpośrednio z usługami STT/TTS/LLM.
- Dane użytkownika (ustawienia, skróty rozmów) przechowywane lokalnie (AsyncStorage/SQLite/plik JSON).
- Wersja MVP ma pozwolić na ewaluację doświadczenia konwersacyjnego z prawdziwymi użytkownikami.

## Status wdrożenia (aktualizacja)
- ✅ **Etap 0 – Przygotowanie** zakończony: repozytorium Expo z konfiguracją TypeScript/ESLint/Prettier/Jest jest gotowe,
  a podstawowa dokumentacja deweloperska została uzupełniona.
- ✅ **Nawigacja i layout** (Etap 1) zaimplementowane zgodnie z makietami — aplikacja posiada działające ekrany Home,
  Conversation oraz Settings spięte przez React Navigation.
- ✅ **Konfiguracja lokalnego storage** (Etap 1) dostarczona: ustawienia, historia sesji i klucze Whisper są zapisywane z
  użyciem AsyncStorage oraz SecureStore.
- ✅ **Moduł logowania zdarzeń** (Etap 1) dodany w bieżącej iteracji — zdarzenia są utrwalane w AsyncStorage i dostępne
  z poziomu ustawień (podgląd + eksport do logów deweloperskich).
- 🚧 **Etap 2 – Integracje mowy**: działająca warstwa natywnego STT/TTS oraz obsługa Whisper (upload + test w ustawieniach);
  kolejne iteracje obejmą pomiary latencji i ewentualne optymalizacje.

## 2. Etapy rozwoju
### Etap 0 – Przygotowanie (1 tydzień)
| Zadanie | Opis | Artefakty/Definition of Done |
| --- | --- | --- |
| Utworzenie repozytorium aplikacji | Inicjalizacja projektu Expo (managed workflow, TypeScript). | Repo z podstawową konfiguracją, CI uruchamia lint. |
| Integracja podstawowych bibliotek | `expo-speech`, `@react-native-voice/voice`, `expo-secure-store`, `react-query`, `zustand`. | Biblioteki zainstalowane, dokumentacja konfiguracji w README dev. |
| Ramowy design UX | Makiety ekranów Home, Settings, Conversation. | Zatwierdzone makiety w narzędziu (np. Figma) + link w README. |

### Etap 1 – Fundamenty aplikacji (2 tygodnie)
| Zadanie | Opis | Definition of Done |
| --- | --- | --- |
| Nawigacja i layout | Implementacja nawigacji pomiędzy Home, Settings, Conversation (React Navigation). | Działająca nawigacja, styl bazowy zgodny z makietą. |
| Konfiguracja lokalnego storage | Abstrakcja `SettingsStore` (AsyncStorage/SQLite) z walidacją danych. | Persistencja ustawień działa między restartami, testy jednostkowe logiki. |
| Moduł logowania zdarzeń | Zapisywanie do lokalnego pliku JSON lub AsyncStorage (timestamp, zdarzenie). | Możliwość eksportu logu (np. przez share sheet). |

### Etap 2 – Integracje mowy (3 tygodnie)
| Zadanie | Opis | Definition of Done |
| --- | --- | --- |
| Natywne STT/TTS | Warstwa `SpeechService` obsługująca Android SpeechRecognizer & TextToSpeech oraz iOS SFSpeechRecognizer & AVSpeechSynthesizer. | Można przeprowadzić rozmowę lokalnie (bez LLM), transkrypt i odczyt działają. |
| Integracja zewnętrznych API | Obsługa Whisper (STT) w `SpeechService`, w tym upload audio i obsługa błędów. | Możliwość przełączania dostawcy STT w ustawieniach, klucz zapisywany w SecureStore. |
| Zarządzanie uprawnieniami | Obsługa żądań mikrofonu/głosu, komunikaty błędów. | Ścieżki odmowy uprawnień przetestowane manualnie. |

### Etap 3 – Silnik konwersacyjny (3 tygodnie)
| Zadanie | Opis | Definition of Done |
| --- | --- | --- |
| Orkiestrator rozmowy | Klasa `ConversationEngine` utrzymująca kontekst, poziom trudności, wątki. | Jednostkowe testy adaptacji trudności, możliwość restartu sesji. |
| Integracja LLM | Połączenie z API OpenAI GPT-4o mini, streaming odpowiedzi, obsługa błędów. | Rozmowa end-to-end z wykorzystaniem prawdziwego modelu. |
| Feedback językowy | Implementacja podstawowych heurystyk (np. słowa-klucze, długość wypowiedzi). | Po każdej wypowiedzi dostępna krótka informacja zwrotna. |

### Etap 4 – Udoskonalenie MVP (2 tygodnie)
| Zadanie | Opis | Definition of Done |
| --- | --- | --- |
| Polerowanie UX | Animacje przycisku rozmowy, wskaźnik nagrywania, dark mode (opcjonalnie). | Pozytywna ocena w wewnętrznych testach UX. |
| Stabilność i monitoring | Obsługa edge cases (brak internetu, błędy API), dodatkowe logi. | Testy ręczne scenariuszy awaryjnych, raport stabilności. |
| Przygotowanie do testów beta | Instrukcje instalacji, formularz feedbacku, polityka prywatności MVP. | Pakiet EAS build, dokumentacja testerska, landing page beta (opcjonalnie). |

## 3. Kamienie milowe i KPI
| Milestone | Kryteria | KPI kontrolne |
| --- | --- | --- |
| M1: „Hello World Voice” | Po Etapie 2 – pełna ścieżka mowy bez LLM. | <3 s latencji lokalnej, 0 crashy/5 min testu. |
| M2: „Adaptive Tutor” | Po Etapie 3 – działający LLM + adaptacja. | 80% wypowiedzi bez błędów krytycznych, satysfakcja testerów ≥4/5. |
| M3: „Beta Ready” | Po Etapie 4 – gotowość do zewnętrznych testów. | ≥20 testerów na liście, dokumentacja pełna. |

## 4. Role i odpowiedzialności
- **Tech Lead / Mobile Dev**: architektura RN, przegląd kodu, integracje natywne.
- **ML/AI Engineer**: strojenie promptów, heurystyki adaptacji.
- **Product Designer**: makiety, testy UX.
- **QA / Tester**: scenariusze regresji, raportowanie błędów.
- Role mogą być łączone w małym zespole; ważne jest przypisanie właściciela do każdego zadania w trakcie planowania sprintu.

## 5. Zarządzanie projektem
- Metoda pracy: sprinty 1–2 tygodniowe, tablica Kanban (Jira/Trello/Linear).
- Każde zadanie opisane wg szablonu: cel, kroki, ryzyka, kryteria akceptacji.
- Cotygodniowy przegląd postępów + demo build.
- Lista kontrolna wejścia do sprintu: makiety gotowe, decyzje techniczne podjęte, zależności dostępne.

## 6. Testowanie i weryfikacja
- Testy jednostkowe: logika ConversationEngine, SettingsStore, adaptacja poziomu.
- Testy integracyjne: pętle STT → LLM → TTS na emulatorach i realnych urządzeniach.
- Testy użyteczności: sesje z 5 użytkownikami docelowymi w Etapie 4.
- Monitoring: logi lokalne + możliwość eksportu do analizy, obserwacja latencji.

## 7. Plan rozwoju po MVP
- **Faza A (po walidacji)**: moduł quizów diagnostycznych, personalizacja tematów.
- **Faza B**: gamifikacja (punkty, streaki), współdzielone scenariusze.
- **Faza C**: synchronizacja w chmurze, tryb multi-device, analityka.
- Priorytety kolejnych faz ustalić na podstawie feedbacku i metryk z beta testów.

---
**Status testów:** ⚠️ brak – dokument planistyczny.
