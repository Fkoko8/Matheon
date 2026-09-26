# MATHEON — lista zadań do wykonania (handoff dla DeepSeek v4)

> Ten plik powstał 2026-09-25 na podstawie analizy kodu i uruchomienia pełnego zestawu testów QA.
> Szczegółowa wizja produktu i historia prac: `PLAN_ROZBUDOWY.md`. Ten plik zawiera **konkretne, wykonawcze zadania** w kolejności priorytetów.
> Zanim zaczniesz cokolwiek zmieniać: przeczytaj sekcję „Pułapki techniczne” na dole.

---

## 1. Kontekst w pigułce

- **Produkt:** polska platforma do nauki do matury z matematyki (Formuła 2023, podstawa + rozszerzenie).
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript, Tailwind 4, shadcn/ui, Supabase (Auth + Postgres + RLS + pgvector), Vercel AI SDK (`ai` + gateway), pnpm.
- **Baza:** Supabase — migracje `supabase/migrations/001–011` (011 jeszcze **nie wgrana** do środowiska).
- **Treść:** 20 autorskich działów w `content/topics/`, bank zadań `content/tasks/`, importer `pnpm content:import`, testy `scripts/qa-*.ts|mjs`.
- **Git:** praca na branchu `master`; **30 plików zmian niewcommittowanych** (silnik figur SVG `lib/figures/`, `components/figure.tsx`, migracja 011, `scripts/qa-figures-check.ts`).

## 2. Stan zweryfikowany testami (wynik analizy)

| Test | Komenda | Wynik |
|---|---|---|
| Typy | `pnpm typecheck` | ✅ 0 błędów |
| Treść + routing | `pnpm qa:content` | ✅ wszystkie |
| Silnik nauki / SM-2 | `pnpm qa:practice` | ✅ wszystkie |
| AI (limity, RLS) | `pnpm qa:ai` | ✅ wszystkie |
| Kalkulator | `pnpm qa:calc` | ✅ wszystkie |
| Figury SVG | `pnpm qa:figures` | ✅ wszystkie |
| Raport egzaminu | `pnpm qa:examreport` | ⚠️ **2 FAIL** — naprawia je migracja 011 (nie wgrana) |

Fazy 0–4 (routing, auth, silnik nauki, egzaminy, AI) — **zrealizowane**. Poniżej to, co zostało.

---

## 3. Zadania — BLOKERY (zrób najpierw, w tej kolejności)

### 3.1. Wgraj migrację 011 do Supabase ⚠️ najważniejsze

Plik: `supabase/migrations/011_exam_finish_mistakes_and_null_guard.sql`

Naprawia 2 znane FAIL-e `qa:examreport`:
1. Zadania pozostawione **bez odpowiedzi** nie trafiały do pętli błędów `mistakes`,
2. `finish_exam_attempt` zwracał kompozyt NULL serializowany przez PostgREST jako `{"id":null,...}` zamiast literalnego `null` — ochrona „Ta próba została już zakończona.” w `lib/exams.ts` nigdy nie działała. Typ zwracany zmieniony na `json`.

**Jak:** DDL **nie przechodzi przez REST/service role** (PGRST202) — uruchom SQL ręcznie w Supabase SQL Editor (dashboard) albo `psql`. Migracje 001–010 są już wgrane — sprawdź `select * from exam_answers limit 1` (kolumny `points_earned` z 009 działają).

**Weryfikacja:** `pnpm exec tsx --env-file=.env scripts/qa-exam-report-check.ts` → musi być 100% OK (dzisiaj: 20 OK / 2 FAIL, oba FAIL dotyczą właśnie tej migracji).

### 3.2. Utrwal ładowanie `.env` w skryptach QA — ✅ ZROBIONE (2026-09-25)

Skrypty `tsx` **nie ładują same** `.env` — dzisiaj `pnpm qa:examreport` i `pnpm qa:ai` wyrzucają `Brak konfiguracji` bez ręcznego `--env-file=.env`. Napraw w `package.json`:

```json
"qa:examreport": "tsx --env-file=.env scripts/qa-exam-report-check.ts",
"qa:practice":   "tsx --env-file=.env scripts/qa-practice-check.ts",
"qa:ai":         "tsx --env-file=.env scripts/qa-ai-check.ts",
"qa:calc":       "tsx --env-file=.env scripts/qa-calculator-check.ts",
"qa:figures":    "tsx --env-file=.env scripts/qa-figures-check.ts"
```

Skrypty `.mjs` (`qa:auth`, `qa:exam`, `qa:content`) odpalane przez `node` — dodaj `--env-file=.env` analogicznie. **Weryfikacja:** `pnpm qa:full` ma przejść bez żadnych ręcznych kroków.

### 3.3. Commit-nij 30 plików oczekujących zmian

W working tree jest cała praca nad silnikiem figur + migracja 011 + poprawki raportu egzaminu. Commitnij **po** wgraniu migracji 3.1 i zielonym `qa:examreport`.

### 3.4. Klucz `AI_GATEWAY_API_KEY`

Brak go w `.env` (są tylko `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SERVICE_ROLE`). Bez niego tutor/generator/RAG nie działają produkcyjnie (RAG schodzi na tryb słowny, tutor zwraca kontrolowany błąd). Po dodaniu klucza:
1. `pnpm content:embed` — backfill wektorów `knowledge_chunks`,
2. sprawdź, że `pnpm content:import` dolicza embeddingi nowych fragmentów automatycznie.

---

## 4. Zadania — dokończenie Fazy 0

### 4.1. Onboarding po rejestracji — ✅ ZROBIONE (2026-09-25, `/onboarding` + `lib/learning/onboarding.ts` + bramka w shelu)
Kreator po pierwszym logowaniu: zakres (podstawa/rozszerzenie), data matury, cel %, dni nauki, dzienny czas → zapis do `profiles` + start planu. Opcjonalnie: krótki quiz diagnostyczny (10 zadań) wyznaczający poziom startowy. Podepnij pod `lib/learning/planner/*`.

### 4.2. Testy jednostkowe (vitest) + CI — ✅ ZROBIONE (2026-09-25, 127 testów + `.github/workflows/ci.yml`)
- Dodaj `vitest` i testy dla czystych modułów: `lib/learning/skill-model.ts` (gradeAnswer, SM-2, decayedMastery), planner (priorytety), `lib/figures/evaluate.ts` + `spec.ts` (parser — przypadki z `scripts/qa-figures-check.ts` można przenieść/rozbić), kalkulator `lib/calculator.ts`.
- Dodaj GitHub Actions: `pnpm typecheck` + `pnpm test` (+ `pnpm qa:figures` jako minimum bez bazy). Sekrety bazy dawać tylko na workflow_dispatch.

---

## 5. Zadania — Faza 1 (treść)

### 5.1. Ekspansja banku zadań: 259 → ≥600
Proces dopisywania działu (powtarzalny, opisany w `PLAN_ROZBUDOWY.md`):
1. `content/tasks/<slug>.ts` — zadania z kodem, poziomem, podpowiedziami, rozwiązaniami krok po kroku, matrycą punktów (`validation_metadata.rubric`) i opcjonalną figurą (`validation_metadata.figure` — spec w `lib/figures/spec.ts`),
2. `pnpm content:import` → `pnpm qa:content` → `pnpm qa:figures`.

### 5.2. Bank zadań CKE 2015–2026
Zadania z arkuszy CKE (licencja CC BY 3.0 PL, wymaga atrybucji): `source_name='CKE'`, rok, `cke_requirement_code`. Osobny krok po zadaniach autorskich.

### 5.3. Odłożone wymagania CKE
4 wymagania bez `lesson_ready`: `I.9`, `I.10`, `Z.1`, `Z.2` (statusy w `content/cke-requirements.ts`). Pozostałe 74/78 są gotowe.

---

## 6. Zadania — Faza 5 (UX)

1. ~~**Mobile-first + PWA**~~ — ✅ ZROBIONE: `app/manifest.ts`, ikony `pnpm icons:generate`, `public/sw.js` + `/offline`, `viewportFit: cover`.
2. **Edytor wzorów LaTeX w odpowiedziach** — pasek symboli (√, ², π, ułamki) przy textarea/solverze.
3. **Osiągnięcia** — odkleić `user_achievements` z bazy (tabela istnieje): reguły w `lib/learning/achievements.ts`, wyzwalanie przez `learning_events`, toast + animacja.
4. ~~**Wykresy w statystykach**~~ — ✅ ZROBIONE: `components/stats-charts.tsx` + `lib/learning/insights.ts` (własny SVG, bez Recharts).
5. ~~**Globalny search ⌘K**~~ — ✅ ZROBIONE: indeks w `lib/search.ts` (program + bank zadań + arkusze), skrót ⌘K/Ctrl+K w shelu.
6. ~~**Wykresy w kolejnych działach**~~ — ✅ CZĘŚCIOWO (2026-09-25): dodane realne, ciągi, wielomiany, wymierne, pochodne, stereometria (razem 17 figur w 12 działach); `qa:figures` waliduje już wszystkie działy i zadania. Do zrobienia zostały m.in. algebra, równania, kombinatoryka, prawdopodobieństwo i działy rozszerzone (granice, optymalizacja, parametry, dowody).

---

## 7. Zadania — Faza 6 (poler do final)

1. Audyt RLS (każda tabela, wszystkie operacje; `security invoker` vs `definer`).
2. Wydajność: server components dla lekcji, paginacja banku zadań, `next/image`.
3. Telemetria: eventy produktowe w `learning_events` + dashboard metryk (retencja D7).
4. Korekta merytoryczna treści (nauczyciel) → `validation_status='reviewed'` przed publikacją.
5. SEO/landing: strona marketingowa dla niezalogowanych (teraz `/` = dashboard za gate'em), meta/OG, sitemap.
6. Testy E2E Playwright: rejestracja → onboarding → lekcja → trening → egzamin → plan.
7. Do dalszej przyszłości: zmaterializowana tabela `user_skills` (cache stanu), gdy event sourcing w `learning_events` przestanie być szybki; generator AI zapisujący zadania z umiejętnościami przez wspólny silnik.

---

## 8. Pułapki techniczne (przeczytaj przed pracą!)

1. **DDL nie przez REST.** W tym środowisku Supabase DDL przez PostgREST/service role nie działa (PGRST202). Migracje SQL wgrywaj ręcznie (SQL Editor / psql) i tylko wtedy odhaczaj w planie.
2. **`.env` ma spacje wokół `=`** (`NEXT_PUBLIC_SUPABASE_URL = https://...`). Node `--env-file` to parsuje poprawnie, ale inne parsery (np. bash `source`, dotenv w starych wersjach) mogą się wywalić. Nie „poprawiaj” pliku bez konsultacji — klucze działają.
3. **Klucze w `.env`:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon), `SERVICE_ROLE` (admin API — używane przez skrypty QA; nie wystawiaj go nigdy do klienta).
4. **Idempotentny importer.** `pnpm content:import` upsertuje po `slug`/`code`/`validation_metadata.code` i **nie wolno mu usuwać historii odpowiedzi uczniów**. Zmiany w treści publikuj przez importer, nie ręcznie w bazie.
5. **38 pytań z banku egzaminacyjnego** jest powiązanych z `exam_questions` (FK `ON DELETE RESTRICT`) — nie próbuj ich usuwać.
6. **`pnpm qa` vs `qa:full`:** `qa` nie wymaga migracji 009–011; `qa:full` wymaga 009/010 (+011 dla pełnej zieleni). Po wgraniu 011 oba mają być zielone.
7. **Nie wprowadzaj mocków z powrotem.** Stare warstwy mock (`lib/mock-data.ts`, task-engine, DEMO_USER_ID) były celowo usunięte — wszystkie ekrany biorą dane z bazy pod RLS zalogowanego użytkownika.
8. **Odpowiedzi:** sprawdzanie przez `normalizeAnswer` + tolerancja liczbowa (`lib/learning/practice.ts`), nie string-match. Zadania otwarte: samoocena wg matrycy `rubric`.
9. **LaTeX:** renderowanie przez `components/math-text.tsx` (KaTeX). Treść pisz z LaTeX-em w blokach.
10. **Odpowiadaj/wydawaj komuniky po polsku** — produkt i cała treść są polskie (kod i identyfikatory zostają po angielsku).

## 9. Komendy weryfikacyjne (po każdej większej zmianie)

```bash
pnpm typecheck                    # typy
pnpm test                         # testy jednostkowe (vitest)
pnpm qa:curriculum                # kompletność działów/lekcji (bez bazy)
pnpm qa:tasks                     # poprawność banku zadań i zgodność z CKE (bez bazy)
pnpm qa:figures                   # figury (bez bazy)
pnpm qa:full                      # pełny zestaw: treść, praktyka, egzaminy, AI (wymaga .env)
pnpm content:import               # publikacja treści (idempotentna)
```

## 10. Audyt banku zadań i zgodności z CKE (2026-09-25)

Nowy skrypt `pnpm qa:tasks` (`scripts/qa-tasks-audit.ts`) sprawdza cały bank zadań pod kątem:
formatu (identyfikatory, treść, podpowiedzi, kroki, rozwiązanie), **poprawności zapisu odpowiedzi**
(odpowiedzi zamknięte muszą wystąpić na liście opcji, zadania liczbowe muszą mieć liczbę, matryce
punktacji muszą sumować się do punktów zadania), **zgodności z maturą** (zadanie zamknięte = 1 pkt,
trudność 1–5, punkty 1–6, poziom zgodny z wymaganiami działu) oraz pokrycia wymagań CKE zadaniami.

### Naprawione błędy merytoryczne

| Zadanie | Problem | Poprawka |
| --- | --- | --- |
| `sr-04` | pole boczne stożka liczone jako $\pi r h$ zamiast $\pi r l$ (wynik $24\pi$ był przypadkowo poprawny) | rozwiązanie i kroki liczą $\pi r l = 15\pi$ |
| `sr-07` | kąt nachylenia tworzącej do **podstawy** policzony jak kąt z wysokością (odpowiedź $37^{\circ}$) | poprawna odpowiedź $53^{\circ}$ ($\cos\varphi = r/l$), z wyjaśnieniem różnicy |
| `kb-07` | treść „liczby bez cyfry 0” z odpowiedzią $576$ (dotyczyła innego pytania) | odpowiedź $504$, poprawne rozwiązanie (wyłączenia $648-144$) |
| `pr-07` | wśród $12$ figur jest $4$ króle, nie $1$ — klucz wskazywał $1/12$ | odpowiedź $1/3$, poprawione uzasadnienie |
| `op-08` | treść mówiła o sumie boków $10$, rozwiązanie liczyło dla $5$ | treść ujednolicona z rozwiązaniem (suma $5$, maksimum $6{,}25$) |

### Poprawki formatu i zgodności z egzaminem

- **12 zadań z symboliczną odpowiedzią** miało typ `numeric` (np. `3x^2`, `(x-4)(x+4)`, `12/a`, `(-infinity,1)`) — przy braku dokładnego dopasowania uczeń nie mógł dostać punktu. Zmienione na `text`, z wariantami zapisu w `acceptedAnswers` (`po-01/02/03/05/08`, `wm-01/02/06`, `wy-04`, `pa-02/07`, `op-02`, `sr-05`).
- `op-07` i `wm-03` miały listę wartości/opcje w typie `numeric` — poprawione na `single_choice` i `text`.
- **8 zadań zamkniętych** było wartych 2 pkt (na maturze zamknięte = 1 pkt): `rr-20`, `cg-14`, `tg-07`, `tg-09`, `tg-13`, `pl-11`, `sr-04`, `sr-08`, `kb-04`, `kb-09`, `pr-07`.
- `ro-16` (zamknięte) miało matrycę punktacji $0{,}5+0{,}5$ — usunięta, ocenia je sprawdzanie automatyczne.
- `wy-09` — treść nie pasowała do żadnej z opcji (osobliwość usuwalna) — przeredagowana.
- `pr-12` — niejednoznaczne „przynajmniej jeden z dwóch serwisów” — doprecyzowane, który serwis jest własny.
- `kb-02` — treść zawierała odpowiedź w poleceniu — przepisana na czyste zadanie z reguły dodawania.
- `pl-02` — literówka „któka” → „która”.
- `gr-05`, `wm-07`, `kb-10` — zadania przypisane do lekcji, która nie deklaruje ich umiejętności.
- Mapa CKE: wymaganie **D.2** (dowody nierówności) nie było wskazane w żadnej lekcji — dopisane do `dowody-algebraiczne` (treść już je pokrywała).

### Domknięcie braków i pogłębienie lekcji (2026-09-26)

**Nowe lekcje i wymagania CKE (wszystkie 78 wymagań ma teraz status `lesson_ready`):**

1. **III.7 Wzory Viète’a** — nowa lekcja `kwadratowa-viete` (umiejętność `kwadratowa-viete`, zadania `kw-19`…`kw-22`), mapa CKE wskazuje na nową umiejętność.
2. **IV.8 Przekształcenia wykresów** — lekcja `funkcje-przeksztalcenia` (umiejętność `funkcje-przeksztalcenia`, zadania `fn-21`…`fn-23`).
3. **IV.9 Funkcja odwrotna** — lekcja `funkcje-odwrotna` (umiejętności `funkcje-odwrotna`, `funkcje-zlozenie`, zadania `fn-17`…`fn-20`).
4. **I.9 Dowody własności liczb** i **I.10 Nierówności z wartością bezwzględną** — lekcje `realne-dowody` i `realne-modul-nierownosci` (umiejętności `realne-dowody-liczb`, `realne-nierownosci-modul`, zadania `rr-21`…`rr-26`). Statusy zmienione z `planned` na `lesson_ready`.

**Pogłębienie cienkich lekcji** (każda lekcja ma teraz ≥ 6 bloków i pełny zestaw `formula`/`example`/`warning`/`summary`): `wielomiany`, `wymierne`, `parametry`, `granice`, `pochodne`, `optymalizacja`, `dowody`. Dział `zastosowania` (nowy) także uzupełniony.

**Poprawki jakości treści:** naprawiono podwójne escapowanie LaTeX-a (`\\cdot` zamiast `\cdot`) w `content/topics/zastosowania.ts` i `content/tasks/zastosowania.ts` — wcześniej wzory renderowały się jako łamanie linii zamiast poleceń KaTeX.

**Co zostaje:**

- ~~17 zadań ćwiczy umiejętność z innej lekcji~~ — **rozwiązane 2026-09-26**: 4 zadania prze-ankorowane do właściwej lekcji (`kw-18`→`kwadratowa-postacie`, `sr-09`/`sr-10`→`stereometria-objetosci`, `wm-07`→`wielomiany-rozklad`), 13 oczyszczone z umiejętności nienależących do lekcji (rzetelna praktyka = mastery liczony z właściwej lekcji). `pnpm qa:tasks`: 0 błędów, 0 ostrzeżeń.
- Migracja `011` i klucz `AI_GATEWAY_API_KEY` — jak wyżej (blokady środowiskowe, nie treściowe).

### Ulepszenia produktowe i jakość kodu (2026-09-26)

**Druga tura analizy aplikacji — zaimplementowane:**

1. **Reset i zmiana hasła** — `lib/auth.ts` (`requestPasswordReset`, `updatePassword`), strony `app/(auth)/reset-password` i `app/(auth)/update-password`, link „Nie pamiętasz hasła?” na `/login`; usunięty martwy link „Wróć do aplikacji”; `proxy.ts` traktuje obie trasy jak auth (zalogowany → redirect do `/`).
2. **Profil na realnych danych** — `ProfilePage` przepisany: mastery z `loadPracticeOverview`, liczba odpowiedzi i skuteczność z dziennika zdarzeń, czas nauki z sesji, ostatnia aktywność z `learning_events` (podpisy pytań/lekcji z bazy), osiągnięcia z `user_achievements`. Zero mocków (wcześniej: „78% mastery”, „1 240 zadań”, angielskie osiągnięcia).
3. **Osiągnięcia** — nowy silnik `lib/learning/achievements.ts` (reguły z tabeli `achievements`: `answers`/`correct_streak`/`mastery`/`lessons`/`streak`, idempotentny upsert, zwraca nowo zdobyte + XP) + testy; **migracja 012** (`012_user_achievements_insert.sql`) — polityka RLS INSERT, bez niej uczeń nigdy nie zdobył odznaki. Wgrać ręcznie przez SQL Editor.
4. **Ustawienia uczciwe** — zapis nazwy i zakresu do `profiles` (RLS allows), zmiana hasła, wylogowanie; usunięte fałszywe „Saved”, przyciski bez akcji i sekcje-przykrywki.
5. **Niezawodność** — `app/(app)/error.tsx` (granica błędu z „Spróbuj ponownie” i kodem digest) + `app/(app)/loading.tsx` (szkielet).
6. **SEO** — `app/robots.ts` (publiczne: `/`, `/login`, `/reset-password`; uczeńskie trasy disallow), `app/sitemap.ts`, pełne `openGraph`/`twitter` + `metadataBase` (URL przez `NEXT_PUBLIC_SITE_URL`).
7. **Lint + format** — ESLint 9 (flat config: `eslint-config-next/core-web-vitals` + Prettier), Prettier 3; skrypty `pnpm lint` / `pnpm format`. Baseline: wyłączona reguła `react-hooks/set-state-in-effect` (wzorzec „dane w effect” jest w całej aplikacji — naprawa to przepisanie na server components, Faza 6); naprawione realne problemy: `<a>`→`Link`, `Date.now()` w renderze (`useRef(Date.now())`), niepoprawne memoizacje.
8. **Treść** — jak wyżej: 17 rozbieżności zadanie↔lekcja domknięte, `pnpm qa:tasks` bez ostrzeżeń.

**Co dalej (kolejna kolejność wg wartości):**

- Landing marketingowy dla niezalogowanych (Faza 6.5) — `/` to teraz od razu redirect do logowania.
- Telemetria produktowa (eventy: start lekcji, ukończenie egzaminu) i mierzenie retencji.
- Rozbudowa banku zadań do ≥600 (obecnie 293).
- E2E Playwright (rejestracja → onboarding → lekcja → trening → egzamin).
- Przegląd RLS wszystkich tabel + `security invoker` vs `definer` (Faza 6.1).

**Definicja „skończone” dla 3.1–3.4:** `pnpm qa:full` 100% zielony na niezmienionym kodzie + commit historii bezplikowo odzwierciedla stan planu (`PLAN_ROZBUDOWY.md` odhaczone).
