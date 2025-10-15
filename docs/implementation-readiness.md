# Implementation Readiness Assessment – Language Tutor MVP

> Cel dokumentu: ocenić, czy obecne założenia i plan są wystarczające, aby bezpiecznie rozpocząć implementację aplikacji mobilnej, oraz wskazać obszary wymagające dodatkowych decyzji lub badań.

## 1. Krok po kroku – ocena kluczowych obszarów

| Obszar | Co już mamy | Luki / ryzyka | Status gotowości |
| --- | --- | --- | --- |
| **Zakres produktu & funkcje** | Spójna specyfikacja MVP (ekrany Home/Settings/Conversation, adaptacyjna rozmowa). | Wymagane doprecyzowanie pojedynczych scenariuszy rozmów (np. przykładowe dialogi, zakres Small Talk). | ✅ Gotowe do startu, detalizować podczas implementacji. |
| **UX/UI** | Opis ekranów i funkcji w specyfikacji. | Brak finalnych makiet UI, brak wytycznych dot. ikonografii/kolorystyki, brak nagranego user flow. | ⚠️ Częściowo gotowe – potrzebne makiety low/high-fidelity i nazewnictwo elementów. |
| **Warstwa mowy (STT/TTS)** | Zidentyfikowane opcje natywne i chmurowe, lista bibliotek RN/Expo. | Brak decyzji które języki głosy testujemy na start, brak PoC sprawdzającego latencję natywnych bibliotek na docelowych urządzeniach. | ⚠️ Częściowo gotowe – zalecany szybki spike techniczny. |
| **Integracja LLM** | Wybrany model (GPT-4o mini), opis roli ConversationEngine. | Brak szkicu promptów systemowych, brak decyzji o strategii skracania historii i limitach tokenów. | ⚠️ Częściowo gotowe – wymagane warsztaty nad promptem i polityką kontekstu. |
| **Adaptacja poziomu i feedback** | Założenia heurystyk w specyfikacji i planie (analiza długości, błędów). | Nieokreślone algorytmy/metryki, brak przykładowych reguł i komunikatów w obydwu językach. | ⚠️ Częściowo gotowe – przygotować katalog reguł i komunikatów. |
| **Lokalne przechowywanie danych** | Wskazane technologie (AsyncStorage/SQLite), opis konfiguracji i bezpieczeństwa kluczy. | Brak docelowego schematu danych (np. struktura pliku ustawień, format transkryptów), brak polityki czyszczenia danych. | ⚠️ Częściowo gotowe – zaprojektować kontrakty danych. |
| **Konfiguracja usług zewnętrznych** | Lista dostawców, zalecenie użycia SecureStore, ustawienia w menu. | Brak decyzji czy wymagamy logowania/kluczy w MVP, brak instrukcji dla testerów jak zdobyć klucze. | ⚠️ Częściowo gotowe – opracować checklistę konfiguracji testerów. |
| **Środowisko developerskie & CI** | Plan zakłada Expo managed, lint w CI. | Brak konkretnej konfiguracji CI, brak ustalonego standardu kodu (ESLint/Prettier), brak instrukcji onboardingu devów. | ⚠️ Częściowo gotowe – przygotować dokument „Getting Started”. |
| **Testy & QA** | Ogólny plan testów (jednostkowe, integracyjne, użyteczność) w development-plan.md. | Brak kryteriów akceptacji dla scenariuszy STT/TTS, brak listy urządzeń testowych, brak automatycznych testów e2e. | ⚠️ Częściowo gotowe – doprecyzować scenariusze QA. |
| **Wydanie MVP / Beta** | Kamienie milowe i KPI zdefiniowane. | Brak planu wsparcia testerów (kanał feedbacku, SLA), brak checklisty publikacji (EAS build, testflight). | ⚠️ Częściowo gotowe – opracować checklistę release. |

## 2. Najważniejsze działania przed startem implementacji

1. **Makiety UX + flow rozmowy** – przygotować interaktywne prototypy Home/Settings/Conversation oraz przykładową ścieżkę rozmowy z podpisanymi komunikatami i stanami mikrofonu.
2. **Spike techniczny STT/TTS** – zbudować minimalny projekt RN/Expo nagrywający i odtwarzający audio przy użyciu wybranych bibliotek; zmierzyć latencję i jakość dla 2 docelowych języków.
3. **Warsztaty nad promptem** – opracować system prompt, przykładowe polecenia użytkownika i odpowiedzi AI dla różnych poziomów, ustalić reguły adaptacji i limity historii.
4. **Projekt schematu danych** – spisać strukturę `settings.json`, formatu transkryptów oraz zasady retencji (np. limit ostatnich 10 sesji).
5. **Checklisty konfiguracyjne** – przygotować instrukcje pozyskania kluczy API (Whisper, ElevenLabs) oraz kroki konfiguracji w aplikacji dla testerów.
6. **Onboarding zespołu** – utworzyć dokument „Getting Started” (narzędzia, komendy, standard kodu) i zaprojektować minimalną konfigurację CI (lint + build).
7. **Plan testów praktycznych** – zdefiniować listę urządzeń (min. jeden Android, jeden iOS), scenariusze testowe STT/TTS i kryteria sukcesu dla M1/M2.

## 3. Rekomendacja

- **Status ogólny:** jesteśmy blisko fazy implementacji, ale kilka kluczowych decyzji (UX, prompt, schemat danych, PoC mowy) wymaga dopracowania, aby uniknąć kosztownych zmian w trakcie developmentu.
- **Proponowane podejście:** zakończyć powyższe działania przygotowawcze w krótkim sprincie „Etap 0.5”, a następnie rozpocząć implementację zgodnie z planem rozwoju. Dzięki temu zminimalizujemy ryzyko opóźnień i przeróbek.

---
**Status testów:** ⚠️ brak – dokument analityczny.
