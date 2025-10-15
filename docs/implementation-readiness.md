# Implementation Readiness Assessment – Language Tutor MVP

> Cel dokumentu: ocenić, czy obecne założenia i plan są wystarczające, aby bezpiecznie rozpocząć implementację aplikacji mobilnej, oraz wskazać obszary wymagające dodatkowych decyzji lub badań.

## 1. Krok po kroku – ocena kluczowych obszarów

| Obszar | Co już mamy | Luki / ryzyka | Status gotowości |
| --- | --- | --- | --- |
| **Zakres produktu & funkcje** | Spójna specyfikacja MVP (ekrany Home/Settings/Conversation, adaptacyjna rozmowa). | Brak. Zakres potwierdzony przez zespół. | ✅ Gotowe do startu. |
| **UX/UI** | Tekstowe makiety przepływów i edge-case'ów w `docs/ux-conversation-flows.md`. | Wysokiej wierności mockupy graficzne do dopracowania równolegle z developmentem. | ✅ Wystarczające na start. |
| **Warstwa mowy (STT/TTS)** | Strategia natywny TTS + przełączalne STT (system / Whisper) w `docs/voice-and-storage-options.md`; plan spike'u w `docs/technical-spikes.md`. | Potrzebne wykonanie spike'u i zebranie metryk latencji. | ⚠️ Częściowo gotowe – spike w toku. |
| **Integracja LLM** | Prompt skeleton, zasady adaptacji i korekcji w `docs/prompt-design.md`. | Testowe konwersacje do walidacji tonu i długości odpowiedzi. | ⚠️ Wymagana walidacja na próbkach. |
| **Adaptacja poziomu i feedback** | Reguły adaptacji opisane w `docs/prompt-design.md`, scenariusze w `docs/ux-conversation-flows.md`. | Brak katalogu komunikatów w wielu językach – można tworzyć iteracyjnie. | ✅ Minimalny zakres gotowy. |
| **Lokalne przechowywanie danych** | Schematy AsyncStorage/SecureStore/SQLite w `docs/data-schemas.md`. | Konieczne przygotowanie migracji startowej w kodzie (plan opisany). | ✅ Gotowe na start. |
| **Konfiguracja usług zewnętrznych** | Szczegółowa checklista w `docs/whisper-configuration.md`. | Ustalić proces przydzielania kluczy testerom (formularz). | ✅ Gotowe – proces testerski do komunikacji. |
| **Środowisko developerskie & CI** | `docs/getting-started.md` z narzędziami, standardem kodu, skrótami npm. | Skonfigurować realny pipeline CI w repo, gdy kod będzie dostępny. | ✅ Gotowe na start. |
| **Testy & QA** | Plan testowy i kryteria akceptacji w `docs/testing-plan.md`. | Automatyzacja (Detox) odkładana po MVP. | ✅ Gotowe na start. |
| **Wydanie MVP / Beta** | Checklisty release i QA w `docs/release-checklist.md`. | Trzeba przygotować szablon notatek z testów w repo (przed pierwszym release). | ✅ Wystarczające na sprint 1. |

## 2. Najważniejsze działania przed startem implementacji

1. **Przeprowadzić spike techniczny STT/TTS** zgodnie z `docs/technical-spikes.md` i zanotować wyniki w `docs/spike-results.md` (do utworzenia po spike'u).
2. **Zweryfikować prompt** – przeprowadzić 3 przykładowe rozmowy (Beginner/Intermediate/Advanced) i zebrać wnioski w krótkim raporcie (dodatek do `docs/prompt-design.md`).
3. **Przygotować proces dystrybucji kluczy Whisper** – lista testerów + instrukcje wysyłki (odwołanie do `docs/whisper-configuration.md`).
4. **Wykorzystać szablon notatek testowych** `docs/testing-notes-template.md` w trakcie pierwszego cyklu QA.
5. **Rozpocząć implementację** Expo projektu bazowego wraz z konfiguracją lint/tsc opisanych w `docs/getting-started.md`.

## 3. Rekomendacja

- **Status ogólny:** dokumentacja umożliwia start prac implementacyjnych. Pozostałe działania mają charakter operacyjny i mogą być realizowane równolegle z kodowaniem.
- **Proponowane podejście:** rozpocząć sprint implementacyjny, równolegle realizując spike STT/TTS i walidację promptu. Wyniki dopisać do odpowiednich dokumentów, aby utrzymać aktualność wiedzy.

---
**Status testów:** ⚠️ brak – dokument analityczny.
