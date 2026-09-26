-- Migracja 012 — osiągnięcia: polityka INSERT dla user_achievements.
--
-- Dotychczas istniała tylko polityka SELECT (user_achievements_own), więc klient
-- nie mógł zapisać zdobytego osiągnięcia (RLS blokował INSERT). Silnik osiągnięć
-- w aplikacji (`lib/learning/achievements.ts`) upsertuje wiersze ucznia —
-- dozwolone wyłącznie dla własnego konta.
--
-- Wgranie ręczne: SQL Editor w Supabase (DDL nie przechodzi przez REST).

create policy user_achievements_insert_own on public.user_achievements
for insert to authenticated
with check ((select auth.uid()) = user_id);
