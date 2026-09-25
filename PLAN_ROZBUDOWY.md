# MATHEON — szczegółowy plan rozbudowy do wersji finalnej

## Status wdrożenia

**Faza 0 — w toku**

- [x] File-based routing: trasy `(app)/*` (dashboard, learn, tasks, exams + szczegóły + tryb egzaminu, review, mistakes, stats, map, plan, ai, generator, profile, settings), usunięty catch-all `[...slug]`
- [x] Shell aplikacji wydzielony (`components/app-shell.tsx`) i podpięty do realnego profilu (nazwa, poziom, XP, seria) oraz działający logout (`components/global-experiences.tsx`)
- [x] Logowanie/rejestracja + Google (`app/login/page.tsx`) z powrotem na żądaną trasę (`?redirect=`)
- [x] Auth gate w `proxy.ts` (ochrona tras, redirect do `/login`, przekierowanie zalogowanych z `/login`)
- [x] KaTeX: `components/math-text.tsx` + renderowanie LaTeX w tutorze, egzaminach, treningu, generatorze i lekcjach
- [x] Poprawka serii dni (streak nie rośnie już przy każdej sesji tego samego dnia)
- [x] Jakość: zdjęte `typescript.ignoreBuildErrors`, dodany skrypt `pnpm typecheck`, strona 404
- [x] Onboarding po rejestracji (`/onboarding`): poziom, data matury, cel punktowy, dni i czas nauki → `profiles` + pierwszy plan (`lib/learning/onboarding.ts`); bramka „brak aktywnego planu → kreator” (`hooks/use-onboarding.ts` + `components/app-shell.tsx`); opcjonalny quiz diagnostyczny (10 zadań z banku, zasila mastery przed zbudowaniem planu)
- [x] Testy jednostkowe (vitest, 127 testów) dla mastery/SM-2, planera, figur (parser + spec), kalkulatora, trendu mastery i indeksu wyszukiwania + CI (`.github/workflows/ci.yml`: typecheck, `pnpm test`, QA bez bazy; QA z bazą tylko na `workflow_dispatch` z sekretami)
- [x] Rate limiting AI przeniesiony z pamięci procesu do Postgresa (`lib/ai/usage.ts`, liczniki na `ai_request_logs` — migracja **010** wgrana, potwierdzona `pnpm qa:ai` 24/24 OK)

### Stan backendu Supabase (zweryfikowany testem REST/Auth)

- [x] `.env` z `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; klucz poprawny (Auth odpowiada `invalid_credentials`, nie `Invalid API key`)
- [x] Auth gate działa: `/`, `/learn`, `/exams`, `/plan`, `/ai`, `/stats` → `307 /login?redirect=…`
- [x] **Pełny test logowania E2E** (`pnpm qa:auth`): tymczasowy użytkownik → logowanie hasłem → sesja w formacie `@supabase/ssr` → wejście na `/`, `/exams`, `/plan`, `/stats` (200) i `/api/ai/tutor` (200 z sesją, 401 bez)
- [x] Klucz `SERVICE_ROLE` działa (admin API)`; DDL przez REST jest niemożliwe (`PGRST202`)
- [x] Zastosowane migracje: **001–008** (potwierdzone sondami na `exam_attempts`, `exam_answers`, `knowledge_chunks`, `ai_request_logs`, `skills`, `lesson_sections`, `lesson_blocks`, `learning_events`, `cke_requirements` oraz kolumnach z 003/004/005/007)
- [x] **Migracje 009 i 010 wgrane ręcznie** (DDL nie przechodzi przez REST/service role): `009_exam_partial_credit.sql` (punktacja cząstkowa egzaminu) i `010_ai_usage_rls.sql` (polityka INSERT na `ai_request_logs`). Potwierdzone: `pnpm qa:ai` 24/24 OK, `pnpm qa:examreport` — migracja OK, pozostały 2 FAIL-e silnika (naprawa: migracja 011).
- [ ] **Do uruchomienia ręcznie**: `supabase/migrations/011_exam_finish_mistakes_and_null_guard.sql` — naprawia 2 błędy wykryte przez `pnpm qa:examreport`: (1) zadania pozostawione bez odpowiedzi nie trafiały do pętli błędów `mistakes`, (2) `finish_exam_attempt` zwracał kompozyt NULL, który PostgREST serializował jako obiekt `{"id":null,...}` zamiast literalnego `null` — ochrona „Ta próba została już zakończona.” w `lib/exams.ts` nigdy nie działała. Typ zwracany zmieniony na `json` (ten sam kształt payloadu).
- [x] „Arkusz treningowy” ma zadanie otwarte z matrycą punktów (dowód nierówności, 3 kryteria) — dopisane do bazy i do `supabase/seed.sql` (świeże środowiska dostaną je automatycznie); `qa:examreport` czyta teraz do 50 pytań arkusza
- [ ] **Klucz AI**: tutor, generator i embeddingi RAG działają na Vercel AI Gateway — wymagany `AI_GATEWAY_API_KEY` (opcjonalnie `OPENAI_API_KEY`). Bez niego aplikacja nie udaje AI: tutor zwraca kontrolowany błąd, a RAG schodzi na tryb słowny.
- [x] Naprawiony błąd RPC → **008_finish_exam_attempt_guard.sql** wgrana; brak dopasowania zwraca `null` zamiast wyjątku
- [x] Naprawione 3 błędy w `supabase/seed.sql`: nieistniejąca kolumna `subjects.published`, join lekcji po `zadania-maturalne` (blokował wszystkie pytania) oraz kolizja slugów lekcji między poziomami
- [x] **Seed wgrany**: 2 przedmioty, 12 działów, 24 podtematy, 6 lekcji, 294 zadania, 348 podpowiedzi, 294 rozwiązania, 5 arkuszy, 96 wpisów `exam_questions`, 4 osiągnięcia
- [x] **Test E2E egzaminu** (`pnpm qa:exam`): start próby → zapis odpowiedzi → RPC `finish_exam_attempt` → naliczenie punktów i procentu → sesja nauki → ochrona przed powtórnym zakończeniem
- [x] Tabele treści z migracji 007 wypełnione: `skills` = 15, `cke_requirements` = 78
- [x] Usunięto 256 pytań śmieciowych bez kodu i 6 placeholderowych lekcji; 38 pytań bez kodu pozostawiono, ponieważ są powiązane z `exam_questions` i blokują bezpieczne usunięcie (FK `ON DELETE RESTRICT`)

**Faza 1 — w toku (20 działów, 74 z 78 wymagań o statusie `lesson_ready`)**

- [x] Warstwa treści `content/`: typy (`content/types.ts`), mapa wymagań CKE (`content/cke-requirements.ts` — 78 wymagań, 19 zmapowanych na umiejętności), 20 autorskich działów i banków zadań
- [x] Idempotentny importer `scripts/import-content.ts` (`pnpm content:import`): upsertuje umiejętności po `slug`, wymagania po `code`, lekcje po `slug`, a zadania po `validation_metadata.code` — ponowne uruchomienie aktualizuje treść i **nie usuwa historii odpowiedzi** uczniów
- [x] Importer sam zakłada brakujące działy CKE w `topics`/`subtopics` (seed ma grubszą taksonomię: algebra, funkcje, geometria, ciągi, logarytmy, prawdopodobieństwo), więc taksonomia aplikacji i mapa CKE są spójne
- [x] Pierwszy dział autorski **„Liczby rzeczywiste”** (poziom podstawowy): 3 lekcje, 31 bloków (teoria, wzory, przykłady, pułapki, checkpoint), 9 umiejętności, 18 zadań z podpowiedziami, rozwiązaniami krok po kroku i matrycą punktów
- [x] RAG tutora zasilony treścią: 46 fragmentów `knowledge_chunks` (31 z lekcji + 15 z zadań) z metadanymi `level`/`lesson`
- [x] Render: LaTeX przez KaTeX w lekcjach/zadaniach/tutorze; biblioteka nauki oznacza działy z pełną treścią („Pełna treść · N zadań”) od szablonowych („Treść w przygotowaniu”)
- [x] Drugi dział autorski **„Wyrażenia algebraiczne”** (poziom podstawowy z elementami rozszerzenia): 3 lekcje (wzory skróconego mnożenia, rozkład na czynniki i wyrażenia wymierne, zadania maturalne), 34 bloki, 6 umiejętności, 20 zadań — w tym dwa dowody z matrycą punktów
- [x] Stan treści po imporcie: **52 lekcje autorskie, 259 zadań autorskich, 89 umiejętności**; dodatkowo zachowano 38 pytań z banku egzaminacyjnego, do których wskazują `exam_questions`
- [x] Test treści `pnpm qa:content` — pełna treść, zadania, powiązania, fragmenty wiedzy i render przechodzą; `pnpm qa` kończy się dwoma znanymi FAIL-ami silnika praktyki po zmianie skali katalogu (nie są błędami importu)
- [ ] Uzupełnić bank autorskich zadań do docelowego progu ≥600 oraz dokończyć pojedynczy dział podstawy; obecnie 259 zadań autorskich
- [ ] Bank zadań z arkuszy CKE 2015–2026 (licencja CC BY 3.0 PL) z `source_name='CKE'`, rokiem i `cke_requirement_code`
- [x] 74 z 78 wymagań CKE ma status `lesson_ready` i wskazuje istniejący skill; pozostały 4 wymagania (`I.9`, `I.10`, `Z.1`, `Z.2`) są jawnie odłożone

**Faza 2 — Silnik nauki: mastery per umiejętność, SM-2, powtórki, błędy — ZREALIZOWANA**

Model (`lib/learning/`):

- [x] `skill-model.ts` — czysty model mastery i harmonogramu: `gradeAnswer` (ocena 0–5 wg poprawności, podpowiedzi, rozwiązania i czasu), pełny **SM-2** (`ease` 1.3–2.8, interwały 1 → 6 → `round(interwał × ease)`, wpadki resetują serię), mastery jako średnia wykładnicza z **dowodów**, `decayedMastery` (świeżość), `sessionScore`
- [x] `skill-state.ts` — stan umiejętności wyprowadzany z dziennika `learning_events` (event sourcing: brak migracji, historia jest źródłem prawdy); katalog umiejętności, mapowanie dział → umiejętności, zapis zdarzeń odpowiedzi
- [x] `practice.ts` — silnik treningu: kolejki (`mixed`/`topic`/`skill`/`review`/`mistakes`/`weak`, także po konkretnych zadaniach), sprawdzanie odpowiedzi (liczby z tolerancją, warianty zapisu, zadania otwarte z samooceną wg matrycy), zapis wyniku: `user_answers` + zdarzenia umiejętności + `user_progress` (mastery działu = średnia ćwiczonych umiejętności, `next_review_at` = najbliższy termin) + pętla błędów (`mistakes`, zamknięcie błędu po poprawnej odpowiedzi)
- [x] Błędna odpowiedź **nigdy nie podnosi** mastery (waga ujemna), odpowiedź z podpowiedzią lub po podglądzie rozwiązania daje mniejszy przyrost

Ekrany (realne dane, zero przykładów w kodzie):

- [x] `/tasks` — bank zadań z filtrami (poziom, dział, trudność, wyszukiwanie) i licznikami postępu; każde zadanie otwiera sesję
- [x] `/review` — harmonogram SM-2: zaległe umiejętności (mastery, interwał, łatwość, liczba wpadek) i najbliższy tydzień; start sesji powtórkowej
- [x] `/mistakes` — lista błędów z treścią zadania, Twoją odpowiedzią, poprawną odpowiedzią i typem błędu; ponowna próba zamyka błąd
- [x] `/stats` — mastery per umiejętność, liczba odpowiedzi, terminy powtórek, bank zadań wg działów
- [x] Dashboard — mastery, poziom podstawy/rozszerzenia, seria dni, aktywność 7 dni, słabe umiejętności, priorytety (wszystko z bazy, wcześniej liczby-mocki)
- [x] `/map` — realny katalog umiejętności z postępem i terminami (zastąpił dekoracyjny graf z wymyślonymi liczbami)
- [x] Test opanowania działu (`/learn/topic/[topic]/mastery`) uruchamia realną sesję na zadaniach działu
- [x] `components/practice-session.tsx` — wspólna sesja: podpowiedzi (obniżają przyrost), wzorzec rozwiązania, kroki, matryca punktów, samoocena zadań otwartych, wpływ na umiejętności, podsumowanie

Porządki i testy:

- [x] Usunięte zdublowane warstwy: `lib/learning/mastery.ts`, `recommendations.ts`, `statistics.ts`, `curriculum-service.ts`, `lib/mock-data.ts`; `lib/data.ts` ograniczony do realnych dostępów (`getHints`, `getSolution`), bez fabrykowanych danych
- [x] Nawigacja w `lib/navigation.ts` (+ nowa pozycja „Moje błędy”, ikona `Target`)
- [x] `pnpm qa:practice` — 27 sprawdzeń E2E na tych samych modułach co aplikacja, z klientem w kontekście zalogowanego użytkownika (prawdziwy RLS): kolejka, ocena odpowiedzi, mastery per umiejętność, harmonogram SM-2, pętla błędów, zadania otwarte z samooceną, dziennik zdarzeń
- [ ] Do Fazy 6: zmaterializowana tabela `user_skills` (cache stanu), gdy dziennik zdarzeń przestanie być wystarczająco szybki
- [ ] Do Fazy 4: generator AI powinien zapisywać zadania z umiejętnościami i przechodzić przez ten sam silnik (`lib/task-engine.ts` to jeszcze stara ścieżka)

**Faza 1 — jak dodać kolejny dział** (powtarzalny proces):

1. Napisz `content/topics/<slug>.ts` (lekcje + bloki) i `content/tasks/<slug>.ts` (bank zadań).
2. Dodaj dział do `content/index.ts` oraz zaktualizuj statusy w `content/cke-requirements.ts`.
3. Uruchom `pnpm content:import` (publikacja) i `pnpm qa:content` (weryfikacja).
4. Dopisz dział do listy w `lib/learning/curriculum.ts` (nowe działy spoza 16+5) — treść autorska automatycznie zastępuje szablon.

**Faza 3 — Egzaminy klasy produkcyjnej — ZREALIZOWANA (migracja 009 wgrana; poprawki pętli błędów i null-guard: migracja 011)**

- [x] Punktacja cząstkowa: `exam_answers.points_earned`, `graded_by`, `is_correct` + RPC `finish_exam_attempt`/`regrade_exam_attempt` z migracji **009** (`exam_answer_points` respektuje punkty zapisane przez aplikację, ograniczone do maksimum)
- [x] Sprawdzanie zamiast porównania tekstu: `normalizeAnswer` + tolerancja liczbowa w `lib/learning/practice.ts` (liczby, ułamki, przecinek dziesiętny, LaTeX) — egzamin używa tego samego modułu
- [x] Samoocena zadań otwartych wg **matrycy punktów** (kryteria + punkty w `validation_metadata.rubric`), z jasnym komunikatem, gdy migracja 009 nie jest wgrana (`examGradingSchemaReady`)
- [x] Raport po egzaminie (`components/exam-report-page.tsx` + `lib/exams.ts`): punkt po punkcie, pełne/cząstkowe/błędne/bez odpowiedzi, działy, umiejętności, **prognoza wyniku** (60% próba + 40% mastery) z przedziałem, historia prób, ponowne podejście
- [x] Realizm egzaminu: `components/exam-toolbar.tsx` (tablice wzorów CKE + kalkulator) i `lib/calculator.ts` (`pnpm qa:calc`)
- [x] Egzamin zasila ten sam model umiejętności co trening (zdarzenia `learning_events` per umiejętność)

**Faza 4 — AI, które naprawdę uczy — ZREALIZOWANA (migracja 010 wgrana; wymaga jeszcze klucza `AI_GATEWAY_API_KEY`)**

- [x] **RAG na embeddingach**: `lib/ai/embeddings.ts` (`openai/text-embedding-3-small`, 1536 wymiarów przez `gateway.embeddingModel`), wyszukiwanie przez RPC `match_knowledge_chunks` (pgvector + HNSW z migracji 006), z jawnym zejściem na tryb słowny, gdy brakuje klucza albo wektorów; wynik niesie `matchType`
- [x] Tryb słowny naprawiony: prawdziwe wyszukiwanie w bazie (ILIKE po słowach zapytania) zamiast próbki pierwszych kilkunastu wierszy
- [x] Backfill wektorów: `pnpm content:embed` (`scripts/embed-knowledge.ts` + `lib/ai/retrieval/embedKnowledge.ts`), a `pnpm content:import` dolicza embeddingi nowych fragmentów automatycznie, gdy jest klucz
- [x] **Tutor w kontekście zadania**: link „Zapytaj tutora o to zadanie” z sesji treningowej i z raportu egzaminu (`lib/ai/task-context.ts`), kontekst (treść, odpowiedź ucznia, matryca, umiejętności) pokazany nad rozmową i automatycznie startujący prompt
- [x] Prompt systemowy: rozszerzony kontekst (`rubric`, `skills`), jawna zasada „w trybie hint/guided nie podawaj gotowego wyniku” (`TUTOR_RULES`)
- [x] **Limity i dziennik AI w bazie**: `lib/ai/usage.ts` (limit dzienny + minutowy per użytkownik i rodzaj, awaryjny licznik w pamięci, gdy baza nie odpowiada), zapis każdej próby (także nieudanej, w tym błędy strumienia) do `ai_request_logs`
- [x] Generator: tryb „Dopasuj do moich słabości” sam buduje kontekst z historii ucznia (`lib/ai/context/buildGeneratorContext.ts` — słabe działy, typowe błędy, umiejętności), a wygenerowane zadanie rozwiązuje się przez realny silnik treningu (`submitPracticeAnswer`)
- [x] Tożsamość i poziom w tutorze pochodzą z profilu (`preferred_level`), zniknęły wpisane na sztywno „FKoko”, poziom i mastery
- [x] Stara ścieżka zadań usunięta: `lib/task-engine.ts`, `lib/learning/{progress,mistakes,review}.ts`, `lib/ai/rateLimit.ts`, `lib/{data,types}.ts` (porównanie tekstu i `DEMO_USER_ID`)
- [x] Test warstwy AI: `pnpm qa:ai` (RAG, kontekst zadania, prompt, limity dzienne i minutowe, brak danych demo); `pnpm qa:full` = `qa` + `qa:examreport` + `qa:ai` (te dwa wymagają migracji 009/010)


> Cel produktu: kompletna, polska platforma do nauki do **matury z matematyki (poziom podstawowy i rozszerzony)** — nauka, trening, powtórki, arkusze, AI tutor i motywacja — dopasowana do **Formuły 2023** (obowiązuje m.in. na maturze 2026 i 2027; brak progu 30% z przedmiotów dodatkowych, matematyka podstawowa obowiązkowa, egzamin pisemny 180 min / 50 pkt w obu zakresach).

---

## 0. Stan obecny (przegląd kodu)

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS 4, shadcn/ui (base-nova), Supabase (Auth + Postgres + RLS), Vercel AI SDK (`ai`, `gateway('openai/gpt-4.1-mini')`), Vercel Analytics. Pnpm. CI nie jest skonfigurowane; `next.config.mjs` ma `typescript.ignoreBuildErrors: true`.

**Co już działa (zaprojektowane i w większości podpięte):**

| Obszar | Pliki | Stan |
|---|---|---|
| Autoryzacja | `hooks/use-auth.ts`, `lib/auth.ts`, `lib/supabase/{client,server,proxy}.ts`, `app/auth/callback` | Sign in/sign up/Google gotowe; **brak dedykowanej strony logowania** i egzekwowania dostępu (proxy tylko odświeża sesję) |
| Baza | 7 migracji SQL: schemat + egzaminy + planner + AI tutor + generator + knowledge + curriculum (skills, lesson_blocks, CKE, learning_events) | Rozbudowany schemat, RLS na wszystkich tabelach; seed skromny (3 tematy w praktyce, 9 pytań/temat) |
| Dashboard | `components/matheon-app.tsx` | Realne dane z `getDashboardData`, ale UI mieszane z mockami („FKoko”, „12 dni”, „69%”) |
| Nauka / curriculum | `lib/learning/curriculum.ts` (16 tematów podstawa + 5 rozszerzenie, szablonowe treści), `learning-curriculum-pages.tsx`, `mastery-challenge-page.tsx` | Wszystkie lekcje to **placeholder z jednego generatora**; mastery challenge nie zapisuje wyników |
| Trening | `lib/task-engine.ts`, `components/feature-pages.tsx` (TasksPage), `learning-pages.tsx` | Silnik sprawdza odpowiedzi **exact-match na string**, progress/mistakes/review zapisywane do bazy |
| Powtórki | `lib/learning/review.ts` (SM-2-like), `RealReviewPage` | Kolejka liczona, ale UI tylko licznik — **nie ma realnego trybu powtórki** |
| Błędy | `lib/learning/mistakes.ts`, `MistakesPage` | Lista błędów; „Spróbuj ponownie” bez akcji |
| Statystyki | `lib/learning/statistics.ts`, `RealStatsPage` | 5 kafelków, brak wykresów/trendów |
| Plan nauki | `lib/learning/planner/*`, `adaptive-plan-page.tsx` | Kreatywny planner z priorytetami — realny, dobry fundament |
| Egzaminy | `lib/exams.ts`, `exam-pages.tsx`, RPC `finish_exam_attempt` | Timer, autosave, nawigator, wynik; scoring tylko exact-match, **brak punktacji cząstkowej za zadania otwarto-obliczeniowe**, brak arkuszy CKE w bazie |
| AI Tutor | `app/api/ai/tutor`, `lib/ai/*`, `ai-tutor-page.tsx` | Streaming, tryby (explain/hint/guided/…), RAG po `knowledge_chunks` **keyword-match** (bez embeddings), limity in-memory (resetują się przy redeployu), brak renderowania LaTeX |
| Generator zadań | `lib/generator/*`, `app/api/generator` | Generowanie + walidacja (3 próby), zapis do bazy; walidator tylko wizualno-numeryczny |
| Motywacja | XP/level/streak w `sessions.ts`, osiągnięcia (tabela istnieje, UI mock) | Streak liczony nielogicznie (+1 za każdą sesję tego samego dnia), osiągnięcia niepodpięte |
| Nawigacja | catch-all `[...slug]` + `pathname.includes(...)` | „Routing” ręczny stringami — do wymiany na file-based routes |

**Główne luki produktowe:** brak logowania z frontu, treść lekcji mockowa, baza zadań/arkuszy skromna, powtórki i osiągnięcia niedokończone, scoring egzaminów nie odpowiada realnej matryce CKE, brak LaTeX/KaTeX, brak mobile-first polish i PWA, brak telemetrii/QA.

---

## 1. Wizja finalnej wersji

1. **Ścieżka do 100%:** uczeń wybiera cel (podstawa/rozszerzenie + data matury), a MATHEON buduje plan i prowadzi go: teoria → trening → powtórki → arkusze.
2. **Pełna treść:** 100% wymagań podstawy programowej (CKE, Formuła 2023) zmapowane na skills; lekcje autorskie (teoria + przykłady + zadania maturalne z matrycą punktacji).
3. **Zadania jak na egzaminie:** bank zadań z lat 2015–2026 (podstawa i rozszerzenie) z pełnymi rozwiązaniami krok-po-kroku i punktacją cząstkową; sprawdzanie symboliczne (CAS), nie string-match.
4. **AI, które uczy:** tutor sokratejski z dostępem do kontekstu ucznia, generowanie podobnych zadań, analiza błędów, renderowanie LaTeX.
5. **Zarządzanie nauką:** planner adaptacyjny + spaced repetition + prognoza wyniku maturalnego.
6. **Motywacja:** streak, XP, poziomy, osiągnięcia, tygodniowe wyzwania.

---

## 2. Roadmapa — fazy

### Faza 0 — Fundamenty techniczne i wydanie „prawdziwego MVP” (1–2 tyg.)

Priorytet: bez tego dalsza rozbudowa pogarsza stan.

1. **Routing na file-based.** Zlikwidować catch-all `app/[...slug]/page.tsx` i ręczny switch w `matheon-app.tsx`. Zrobić `app/(app)/layout.tsx` (sidebar + header) z trasami: `/`, `/learn`, `/learn/[topic]`, `/learn/[topic]/[lesson]`, `/tasks`, `/review`, `/mistakes`, `/stats`, `/plan`, `/exams`, `/exams/[id]`, `/exams/attempt/[attemptId]`, `/ai`, `/generator`, `/profile`, `/settings`. Usunąć duplikaty (`AITutorPage` istnieje w dwóch plikach).
2. **Auth flow domknięty.** Dodać `app/(auth)/login/page.tsx` (email/hasło + Google) na bazie `lib/auth.ts`; middleware (obecny `proxy.ts` ma złe API — Next oczekuje `middleware.ts` z eksportem `middleware`) przekierowuje niezalogowanych z tras chronionych na `/login?redirect=...`; po zalogowaniu wraca na `redirect`. Usunąć twarde mocki „FKoko” z UI — branie danych z `useAuth()` + `profiles`.
3. **Jakość kodu.** Włączyć `tsc` w CI (usunąć `ignoreBuildErrors`), dodać ESLint + prettier, `pnpm test` (vitest) dla: mastery, review (intervale), planner (priorytety), math-validator, scoring egzaminów. Ustawić `freebuff-preview`/deploy scripty (`build` już jest Nextowy).
4. **Konfiguracja AI.** Klucz modelu przez env (`AI_GATEWAY_API_KEY`), przełączenie na `@ai-sdk/openai` z `openai('gpt-4.1-mini')` albo pozostanie przy gateway — ale z jawnym błędem, gdy klucza brak. Rate limit z `lib/ai/rateLimit.ts` przenieść do Postgresa (tabela `rate_limits`) — obecny in-memory żyje krócej niż proces.
5. **Onboarding ucznia.** Po rejestracji kreator: zakres(y), data matury, dni nauki, dzienny czas, samoodkład poziomu startowego (krótki quiz diagnozujący 10 zadań) → zapis do `profiles` + start planu.

**Deliverable:** działający przepływ rejestracja → onboarding → dashboard z prawdziwymi danymi → pierwsza lekcja/trening.

### Faza 1 — Treść programowa i bank zadań (3–6 tyg., najdłuższa) — **w toku: 20 autorskich działów, 52 lekcje i 259 zadań**

1. **Mapa CKE → skills.** Wypełnić `cke_requirements` pełną podstawą programową Formuły 2023:
   - *Podstawa:* liczby rzeczywiste, wyrażenia algebraiczne, równania i nierówności, układy, funkcje (w tym liniowa, kwadratowa, wykładnicza, logarytmiczna), ciągi, trygonometria (w tym funkcje trygonometryczne, tożsamości), planimetria, stereometria (bryły, kąty i odległości w prostopadłościanie), geometria analityczna, kombinatoryka, rachunek prawdopodobieństwa i statystyka, optymalizacja i zadania optymalizacyjne z planimetrii (w tym optymalizacja z funkcją kwadratową).
   - *Rozszerzenie:* liczby rzeczywiste (rozszerzenie: algebra zespolona — dla matury 2023+ *brak liczb zespolonych*, ale są: granice i ciągłość, pochodna funkcji (interpretacje, monotoniczność, ekstrema, optymalizacja, zadania z parametrem), całka oznaczona? **Uwaga:** Formuła 2023 nie zawiera całki na rozszerzeniu — jest za to geometria na płaszczyźnie kartezjańskiej w wersji rozszerzonej, dowodzenie, kombinatoryka i rachunek prawdopodobieństwa w wersji rozszerzonej (w tym prawa prawdopodobieństwa, schemat Bernoulliego), trygonometria rozszerzona (funkcje trygonometryczne dwóch argumentów, równania), wyrażenia zawierające logarytmy, ciągi jako funkcje (monotoniczność, indukcja).
   - Każdy skill z `coverage_status`; lekcja ma status `planned → mapped → lesson_ready → assessed → published` — dzięki temu postęp pisania treści jest mierzalny.
2. **Lekcje autorskie.** Zamiast generatora `lesson()` napisać/pozyskać realne treści: teoria (definicja, twierdzenie, uwagi), przykłady, typowe błędy i checkpointy. Obecnie opublikowano 52 lekcje autorskie; docelowo ~80–120 lekcji.
3. **Bank zadań.** Obecnie 259 autorskich zadań; dokończyć ekspansję do ≥600.
   - Autorskie zadania mają stabilne kody, poziom, typ, wskazówki, rozwiązania krok po kroku, matrycę otwartych i powiązania ze skills.
   - Pełne rozwiązania krok po kroku i matryca punktów są zapisywane w `validation_metadata` (`steps`, `rubric`) oraz w treści `solutions`.
4. **Arkusze.** Zespół arkuszy z lat 2015–2026 + autorskie arkusze próbne. Bank CKE pozostaje osobnym etapem.
5. **KaTeX/MatJax w UI.** Renderowanie LaTeX w lekcjach, zadaniach, tutorze (`katex` + `react-katex` lub `remark-math`+`rehype-katex`). Kluczowe dla maturzysty — bez tego treść jest nieczytelna.

**Deliverable:** 20 autorskich działów, 52 lekcji i 259 zadań; dokończyć ekspansję do ≥600 zadań.

### Faza 2 — Silnik nauki: mastery, powtórki, błędy — **ZREALIZOWANA** (szczegóły w sekcji „Status wdrożenia”)

1. **Mastery oparte na skills.** Przejść z mastery-per-topic na mastery-per-skill (`question_skills` już istnieją). Aktualizacja w transakcji przy każdej odpowiedzi; mastery tematu = ważona średnia umiejętności; osobno mastery dla poziomu podstawy/rozszerzenia.
2. **Spaced repetition (SM-2 pełny).** Rozszerzyć `review.ts`: `ease` (1.3–2.5), `interval`, `reps`, przechowywane per `user_question` (nie per topic jak dziś). Kolejka miesza: zaległe powtórki + nowe zadania + błędy. UI z oceną „wiem / prawie / nie wiem” wpływającą na kolejne interwały.
3. **Powtórki jako sesja.** Zastąpić `RealReviewPage` licznikowym trybem sesji: przepływ zadań z timertem per zadanie, hinty, natychmiastowy feedback, podsumowanie sesji i XP.
4. **Błędy z akcją.** „Spróbuj ponownie” otwiera solver; po poprawnej odpowiedzi błąd przechodzi do `resolved`; „podobne zadanie” z generatora utrwala umiejętność. Grupowanie błędów po typie (`mistake_type`) z porządną klasyfikacją AI (błąd koncepcyjny / rachunkowy / przeoczenie dziedziny / złe przeczytanie).
5. **Zadania maturalne w treningu.** Filtry: dział, skill, poziom, rok, trudność, typ (zamknięte/otwarte), „tylko moje błędy”, „nierozwiązane”. Losowa sesja treningowa 10–15 zadań (jak matura krótka).

**Deliverable:** spójny system mastery + codzienne powtórki z UI + naprawa błędów w kółko.

### Faza 3 — Egzaminy klasy produkcyjnej (2–3 tyg.) — **ZREALIZOWANA** (szczegóły w sekcji „Status wdrożenia”)

1. **Scoring z matrycą punktacji.** Zadania otwarte: uczeń wpisuje odpowiedź + (opcjonalnie) przebieg; auto-scoring sprawdza odpowiedź (symbolicznie), a punkty cząstkowe przyznaje na podstawie kryteriów (checkboxy ucznia: „pokazałem obliczenia”, „podałem warunek…”). Wersja ambitna: AI-ocena przebiegu rozwiązania vs matryca (model vision na zdjęciu karki? — patrz Faza 5).
2. **Sprawdzanie symboliczne.** Do sprawdzania odpowiedzi liczbowych/algebraicznych użyć CAS (np. `math.js` simplify/evaluate z tolerancją, porównanie `latex` po normalizacji). Zero string-match.
3. **Realizm egzaminu.** Arkusz podzielony na zadania jak na prawdziwej maturze, w tym zadania z **grafikami** (SVG/obrazy w storage), tabela wybranych wzorów (matura dopuszcza tabliczke — dodać panel „Tablice matematyczne CKE” dostępny w trybie egzaminu).
4. **Raport po egzaminie.** Punkty per zadanie vs średnia użytkowników, analiza umiejętności (które skills obniżyły wynik), rekomendacje do planu (eksport do `study_plan_items`), prognoza wyniku (%).
5. **Kalkulator i tryb surowy.** Opcja „egzamin z kalkulatorem prostym/wyłączonym” dla treningu nawyków.

**Deliverable:** egzamin 1:1 z realnym doświadczeniem + konkretny feedback.

### Faza 4 — AI, które naprawdę uczy (2–3 tyg.) — **ZREALIZOWANA** (migracja 010 wgrana; wymaga jeszcze klucza `AI_GATEWAY_API_KEY`)

1. **RAG na embeddingach.** Zamiast keyword-match: `pgvector` w Supabase, kolumna `embedding vector(1536)` w `knowledge_chunks`, ingest z `text-embedding-3-small`, `match_knowledge` jako RPC. Ingest lekcji/zadań rozwiązań (obecnie `ingest.ts` nie jest wołany nigdzie w UI — dopiąć po publikacji lekcji).
2. **Tutor z kontekstem zadania.** Z poziomu solvera: „wyjaśnij krok”, „analizuj mój tok myślenia” (mode już są). Tutor widzi treść zadania, odpowiedź ucznia i matrycę punktacji. Zasada: nie podaje gotowego rozwiązania w trybie `hint`/`guided`.
3. **Generowanie zadań pod ucznia.** `generatePersonalizedQuestion` już jest — dopiąć do słabych skills i do typu błędów; walidator z CAS + LLM-čjuder (czy zadanie jest rozwiązywalne, czy zgodne z poziomem).
4. **Renderowanie odpowiedzi tutora.** LaTeX + stream markdown; przycisk „wrzuć do powtórki” — tutor tworzy zadanie z wyjaśnienia.
5. **Limity i koszty.** Limit na użytkownika/dzień w DB; cache odpowiedzi dla podobnych pytań; wybór modelu: tanie gpt-4.1-mini do hintów, mocniejszy do analizy toku.

**Deliverable:** tutor w kontekście lekcji/zadania z RAG i limitem, generowanie zadań z rozwiązaniami.

### Faza 5 — Doświadczenie użytkownika (2–3 tyg.) — **W TOKU: wykresy i rysunki w nauce i zadaniach (gotowe)**

0. **Wykresy i rysunki w treści — ZROBIONE.** Silnik figur SVG bez nowych zależności:
   - `lib/figures/spec.ts` — deklaratywne specyfikacje (`plot` / `geometry` / `numberline`) + bezpieczne parsowanie z JSONB (clamp liczb, limity elementów, odrzucanie śmieci),
   - `lib/figures/evaluate.ts` — kompilator wyrażeń w zmiennej `x` (domyślne mnożenie `2x`/`3(x+1)`/`xsin(x)`, stałe `pi`/`e`, NaN przerywa krzywą na asymptotach),
   - `components/figure.tsx` — renderer SVG: siatka i osie ze strzałkami, krzywe z łamaniem na asymptotach, punkty (kółko/kwadrat/krzyżyk), linie pomocnicze, obszary między krzywymi, trójkąty z kątami α/β/γ i kątami prostymi, okręgi, łuki, osie liczbowe z przedziałami i kropkami,
   - podpięcie: bloki lekcji (`ContentBlock.figure`, typ `diagram` → `lesson_blocks.content.figure`), zadania (`ContentTask.figure` → `validation_metadata.figure`) w sesji treningu, banku, błędach, arkuszu i raporcie egzaminacyjnym,
   - treść: kwadratowa (3 wykresy paraboli), funkcje (odczyt z wykresu, nachylenie linii), planimetria (trójkąt z kątami, podobieństwo), trygonometria (trójkąt prostokątny), geometria (odcinek + środek, odległość od prostej), statystyka (mediana na osi); zadania `kw-01`, `tg-01`, `rr-15`,
   - rozszerzenie treści: liczby rzeczywiste (część wspólna przedziałów na osi), ciągi (wyrazy `a_n = 2n+1` jako punkty), wielomiany (wykres z trzema pierwiastkami), funkcje wymierne (`1/(x−3)` z asymptotami), pochodne (styczna do paraboli), stereometria (prostopadłościan w rzucie) — razem 17 figur w 12 działach,
   - test `pnpm qa:figures` (parser + walidacja + figury w **wszystkich** działach i zadaniach); `qa:content` 100% po imporcie.
1. **Mobile-first + PWA — ZROBIONE.** `app/manifest.ts` (ikony 192/512 + `maskable`, skróty do treningu i powtórek), ikony generowane `pnpm icons:generate` (`scripts/generate-icons.mjs` — rastrowe PNG bez zależności zewnętrznych), offline shell: `public/sw.js` (nawigacje network-first z fallbackiem `/offline`, cache-first wyłącznie dla `_next/static` i obrazów, zero cache dla `/api/` i danych ucznia) + `app/offline/page.tsx` + `components/pwa-register.tsx` (rejestracja tylko w produkcji); `viewportFit: cover` i dolna nawigacja nad paskiem gestów.
2. **LaTeX w edycji odpowiedzi.** Prosty edytor wzorów (pasek symboli √, ², π, ułamki) w textarea/solverze — na mobile krytyczny.
3. **Osiągnięcia i gamifikacja.** Odkleić `user_achievements` z bazy (tabela jest): reguły w `lib/learning/achievements.ts` + event `learning_events` → przyznawanie; toast + animacja; poprawić liczenie streak ( dni aktywności, nie liczba sesji).
4. **Statystyki z wykresami — ZROBIONE.** Własny SVG w palecie figur (`components/stats-charts.tsx`): trend mastery (`buildMasteryTrend` w `lib/learning/insights.ts` odtwarza stan dzień po dniu z `learning_events`), aktywność dzienna (słupki z tooltipami), skuteczność per dział z `user_progress` (`loadTopicAccuracy`). Bez Recharts — zero nowych zależności.
5. **Mapa wiedzy (Knowledge Map) na realnych danych.** Obecny graf z mocków → wygenerować z `skills` + mastery; klik = przejście do skillu.
6. **Search globalny (⌘K) — ZROBIONE.** Indeks z realnych danych (`lib/search.ts`): działy i lekcje z programu, zadania z banku (`questions`), arkusze (`exams`); dopasowanie bez diakrytyki („rownania” → „Równania”), wymagane wszystkie słowa zapytania; `⌘K`/`Ctrl+K` w shelu, wyniki deep-linkują do lekcji, arkusza i banku (`/tasks?level=…&q=…`).

**Deliverable:** aplikacja, której nie trzeba tłumaczyć — mobile PWA + pełna motywacja.

### Faza 6 — Polerowanie do „final” (1–2 tyg.)

1. **Bezpieczeństwo:** audyt RLS (każda tabela, wszystkie operacje; funkcje `security invoker` vs `definer`), rate limit na edge, weryfikacja, że generated questions nie omijają polityk.
2. **Wydajność:** server components dla treści lekcji, paginacja banku zadań, indeksy (są, ale po migracjach do przejrzenia), obrazy w `next/image`.
3. **Telemetria:** Vercel Analytics + eventy produktowe (rozpoczęcie lekcji, ukończenie egzaminu) w `learning_events` + dashboard metryk (retencja D7, mediana sesji).
4. **Q&A i treść:** korekta merytoryczna treści przez nauczyciela, `validation_status='reviewed'` przed publikacją.
5. **SEO/landing:** strona główna marketingowa dla niezalogowanych (obecnie `/` od razu dashboard), strona `/login` bez sidebaru, meta/OG, sitemap.
6. **Testy E2E** (Playwright): rejestracja → onboarding → lekcja → trening → egzamin → plan.

**Deliverable:** wersja do publicznego udostępnienia grupie testowej (beta school), potem GA.

---

## 3. Ryzyka i decyzje

| Ryzyko | Mitygacja |
|---|---|
| Objętość treści (100+ lekcji) przerywa rozwój | Pisać treść iteracyjnie per dział; publikować działami; generator pomaga, ale człowiek zatwierdza |
| Koszty AI przy skalowaniu | Tanie modele do hintów; cache; limity dzienne; RAG zamiast długich promptów |
| Prawa do zadań CKE | Treści CKE na licencji CC BY 3.0 PL z atrybucją; autorskie arkusze oznaczyć `source='MATHEON'` |
| Scoring zadań otwartych | V1: odpowiedź finalna + autopunktuacja kryteriów; V2: AI-asystent oceny przebiegu z vision |
| In-memory rate limits znikają | Migracja na DB (Faza 0.4) — zrobione: liczniki i dziennik w `ai_request_logs`, awaryjny licznik lokalny tylko gdy baza nie odpowiada |
| Brak klucza AI w środowisku | Tutor zwraca kontrolowany błąd, RAG działa słownie, generator zgłasza `GENERATION_UNAVAILABLE`; wektory dolicza `pnpm content:embed` po dodaniu `AI_GATEWAY_API_KEY` |

## 4. Kolejność prac (TL;DR)

1. Faza 0 (routing, auth, QA, konfiguracja AI, onboarding) — najpierw.
2. Faza 1 w równoległych strumieniach: treść (redakcja) + bank zadań (import CKE) + KaTeX.
3. Faza 2 (mastery/powtórki/błędy) → 3 (egzaminy) → 4 (AI) — w tej kolejności, bo każda korzysta z poprzedniej.
4. Faza 5 (UX/PWA) i 6 (poler) na końcu, na stabilnym rdzeniu.
