-- Faza 4 — limity AI liczone w bazie.
--
-- Migracja 006 utworzyła `ai_request_logs` z RLS i polityką tylko na odczyt własnych
-- wierszy. Bez polityki INSERT aplikacja nie mogła zapisać zużycia, więc limit
-- (dzienny i minutowy) nigdy się nie włączał — użytkownik mógł wysłać dowolną liczbę
-- żądań do tutora i generatora.
--
-- Ta migracja dodaje:
--   1) politykę INSERT „własny wiersz" (użytkownik zapisuje wyłącznie swoje zużycie),
--   2) indeks (user_id, mode, created_at) — zapytania o licznik są tanie.

drop policy if exists ai_logs_insert_own on public.ai_request_logs;
create policy ai_logs_insert_own on public.ai_request_logs
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create index if not exists ai_request_logs_user_mode_created_idx
  on public.ai_request_logs(user_id, mode, created_at desc);

-- Uwaga: usunięcie użytkownika ustawia `user_id = null` (FK on delete set null),
-- więc dziennik nie kasuje się razem z kontem. Wiersze bez użytkownika to historia
-- kosztów — nie wpływają na limity, bo te liczymy per `user_id`.
