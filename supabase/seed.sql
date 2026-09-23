-- Original MATHEON seed data for local and preview environments
insert into public.subjects (id,name,slug,description,level,order_index) values
  (gen_random_uuid(),'Matematyka podstawowa','matematyka-podstawowa','Zakres podstawowy matury z matematyki.','basic',1),
  (gen_random_uuid(),'Matematyka rozszerzona','matematyka-rozszerzona','Zakres rozszerzony z zadaniami problemowymi.','extended',2)
on conflict (slug) do nothing;

insert into public.topics (subject_id,name,slug,description,order_index)
select s.id, v.name, v.slug, v.description, v.order_index
from public.subjects s cross join (values
  ('Algebra','algebra','Równania, nierówności i wyrażenia algebraiczne.',1),
  ('Funkcje','funkcje','Własności i wykresy funkcji.',2),
  ('Geometria','geometria','Planimetria i stereometria.',3),
  ('Ciągi','ciagi','Ciągi arytmetyczne i geometryczne.',4),
  ('Logarytmy','logarytmy','Logarytmy i równania logarytmiczne.',5),
  ('Rachunek prawdopodobieństwa','prawdopodobienstwo','Zdarzenia losowe i statystyka.',6)
) v(name,slug,description,order_index) where s.slug in ('matematyka-podstawowa','matematyka-rozszerzona')
on conflict (subject_id,slug) do nothing;

insert into public.subtopics (topic_id,name,slug,description,order_index)
select t.id, v.name, v.slug, v.description, 1 from public.topics t cross join (values
 ('Podstawy','podstawy','Najważniejsze definicje i metody.'),
 ('Zadania maturalne','zadania-maturalne','Ćwiczenia w formacie egzaminacyjnym.')
) v(name,slug,description) on conflict (topic_id,slug) do nothing;

-- Slug includes the subject because topic slugs repeat across levels (e.g. 'algebra' in both).
insert into public.lessons (topic_id,subtopic_id,title,slug,content,difficulty,estimated_minutes,order_index,published)
select t.id, st.id, 'Wprowadzenie: '||t.name, s.slug||'-'||t.slug||'-wprowadzenie', 'Autorska lekcja MATHEON z definicjami, przykładami i ćwiczeniami.', 2, 15, 1, true
from public.topics t
join public.subjects s on s.id = t.subject_id
join public.subtopics st on st.topic_id=t.id and st.slug='podstawy'
on conflict (slug) do nothing;

insert into public.questions (topic_id,subtopic_id,lesson_id,question_text,question_type,level,difficulty,points,estimated_minutes,correct_answer,solution_text,source_type,published)
select t.id, st.id, l.id,
  'Zadanie treningowe '||n||': oblicz wartość wyrażenia z działu '||t.name||'.',
  'numeric'::public.question_kind,
  case when t.name in ('Logarytmy','Ciągi') then 'extended'::public.content_level else 'basic'::public.content_level end,
  ((n-1)%5)+1, 2+((n-1)%3), 5,
  (n%17)::text,
  'Przekształć wyrażenie krok po kroku, sprawdź dziedzinę i podstaw otrzymany wynik.',
  'original', true
from public.topics t join public.subtopics st on st.topic_id=t.id and st.slug='zadania-maturalne'
join public.lessons l on l.topic_id=t.id
cross join generate_series(1,9) n
where not exists (select 1 from public.questions q where q.question_text='Zadanie treningowe '||n||': oblicz wartość wyrażenia z działu '||t.name||'.');

insert into public.hints (question_id,hint_level,content,order_index)
select q.id, 1, 'Zapisz dane i wybierz wzór właściwy dla tego działu.', 1 from public.questions q on conflict (question_id,hint_level) do nothing;
insert into public.hints (question_id,hint_level,content,order_index)
select q.id, 2, 'Wykonaj jedno przekształcenie algebraiczne i sprawdź znak wyniku.', 2 from public.questions q on conflict (question_id,hint_level) do nothing;
insert into public.solutions (question_id,content)
select q.id, q.solution_text from public.questions q on conflict (question_id) do nothing;

insert into public.exams (title,year,level,duration_minutes,total_points,description,source,published) values
 ('Próbny arkusz podstawowy',2026,'basic',180,50,'Autorski arkusz treningowy MATHEON.','MATHEON',true),
 ('Próbny arkusz rozszerzony',2026,'extended',180,50,'Autorski arkusz problemowy MATHEON.','MATHEON',true),
 ('Arkusz treningowy',2025,'basic',180,50,'Zestaw powtórkowy z całego zakresu.','MATHEON',true)
on conflict do nothing;
insert into public.exam_questions (exam_id,question_id,question_number,points,order_index)
select e.id,q.id,row_number() over(partition by e.id order by q.created_at),q.points,row_number() over(partition by e.id order by q.created_at)
from public.exams e join lateral (select id,points,created_at from public.questions where published=true and level=e.level order by created_at limit 20) q on true
on conflict (exam_id,question_id) do nothing;

insert into public.achievements (name,description,icon,xp_reward,condition_type,condition_value) values
 ('Pierwszy krok','Rozwiąż pierwsze zadanie.','target',50,'answers',1),
 ('Regularność','Ucz się przez 7 dni z rzędu.','flame',200,'streak',7),
 ('Mistrz działu','Osiągnij 80% opanowania działu.','trophy',300,'mastery',80),
 ('Setka zadań','Rozwiąż 100 zadań.','sparkles',500,'answers',100)
on conflict (name) do nothing;

-- The schema uses generated UUIDs. The dashboard can query this seed after sign-in.
select 1;

-- Note: if using the exact migration supplied to the hosted project, the subjects table
-- does not need a published column. Keep seed portable by omitting it in production.
-- The following compatibility cleanup is intentionally harmless for existing schemas:
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='subjects' and column_name='published') then
    update public.subjects set description=coalesce(description,'');
  end if;
end $$;

delete from public.questions where question_text like 'Zadanie treningowe %' and correct_answer='';

-- Ensure at least 100 original questions when the seed is run against a fresh schema.
insert into public.questions (topic_id,question_text,question_type,level,difficulty,points,estimated_minutes,correct_answer,solution_text,published)
select t.id,'Ćwiczenie autorskie '||g||' z działu '||t.name,'numeric'::public.question_kind,
 case when t.order_index > 3 then 'extended'::public.content_level else 'basic'::public.content_level end,
 ((g-1)%5)+1,2,5,(g%23)::text,'Rozpisz rozwiązanie etapami i zweryfikuj wynik przez podstawienie.',true
from public.topics t cross join generate_series(1,20) g
where not exists (select 1 from public.questions q where q.question_text='Ćwiczenie autorskie '||g||' z działu '||t.name);
insert into public.hints (question_id,hint_level,content,order_index)
select q.id,1,'Zacznij od wypisania znanych danych.',1 from public.questions q left join public.hints h on h.question_id=q.id where h.id is null;
insert into public.solutions (question_id,content)
select q.id,coalesce(q.solution_text,'Rozwiązanie krok po kroku z kontrolą wyniku.') from public.questions q left join public.solutions s on s.question_id=q.id where s.id is null;

-- Seed is intentionally idempotent for content with unique slugs/names.
-- SQL seed end
