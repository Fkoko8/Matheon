# MATHEON

<p align="center">
  <strong>Adaptive mathematics learning for the Polish matura</strong><br />
  <sub>Learn. Practice. Review. Measure. Improve.</sub>
</p>

<p align="center">
  <a href="https://github.com/Fkoko8/Matheon">Repository</a>
  ·
  <a href="https://github.com/Fkoko8/Matheon/issues">Issues</a>
  ·
  <a href="https://github.com/Fkoko8/Matheon/pulls">Pull Requests</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-AI%20Gateway-black?logo=vercel" alt="Vercel AI Gateway" />
</p>

---

## Overview

**Matheon** is a Polish mathematics learning platform designed around one idea:

> **Do not just give the student more exercises — build a system that knows what they should learn, why they struggle, and what to practice next.**

The platform combines structured curriculum, real problem solving, spaced repetition, exam simulation, mistake tracking, adaptive study planning and an AI tutor into one learning loop.

Matheon is being built primarily for **mathematics preparation for the Polish matura**, covering both **basic** and **extended** levels.

### The learning loop

```text
Curriculum
    ↓
Learn
    ↓
Practice
    ↓
Measure mastery
    ↓
Identify weaknesses
    ↓
Review with spaced repetition
    ↓
Generate / recommend targeted practice
    ↓
Take full exams
    ↓
Feed results back into the skill model
    ↺
```

This architecture is intentional: the same underlying learning state is used by lessons, practice, reviews, statistics, exams and AI features.

---

## Core capabilities

| Area                  | What Matheon does                                                                     |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Learning**          | Structured lessons, objectives, theory, formulas, examples, pitfalls and checkpoints  |
| **Practice**          | Topic, skill, mixed, review, weak-skill and mistake-based sessions                    |
| **Mastery**           | Skill-level mastery derived from answer evidence instead of page visits               |
| **Spaced repetition** | SM-2 scheduling with ease, intervals, lapses and due dates                            |
| **Mistakes**          | Persistent mistake loop with answer history and re-attempts                           |
| **Adaptive planning** | Study plans driven by weaknesses, priorities and available time                       |
| **Exams**             | Timed exam attempts, autosave, navigation, grading and detailed reports               |
| **AI Tutor**          | Streaming tutor with task context, multiple teaching modes and knowledge retrieval    |
| **AI Generator**      | Generates mathematics tasks and validates them before exposing them to the learner    |
| **RAG**               | Knowledge retrieval over lessons and questions using embeddings with keyword fallback |
| **Math rendering**    | LaTeX rendering through KaTeX                                                         |
| **Progress**          | Dashboard, skill map, statistics, streaks, XP and learning activity                   |
| **Security**          | Supabase Auth + PostgreSQL + Row Level Security                                       |
| **Quality**           | Dedicated QA scripts covering auth, content, calculator, exams, practice and AI       |

---

## Why Matheon

Most study applications treat a student as a sequence of pages:

```text
open lesson → read → open another lesson
```

Matheon is designed around a different abstraction:

```text
student → skills → evidence → state → next action
```

Every meaningful interaction should produce evidence about what a learner can or cannot do.

Examples:

* a correct answer increases confidence in the associated skill;
* a wrong answer creates negative evidence and can reopen a mistake;
* hints and solution reveals reduce the strength of the evidence;
* overdue skills lose freshness through mastery decay;
* exam answers feed back into the same skill model used by practice;
* AI can use the learner's weak skills and typical mistakes to personalize generated tasks.

The goal is a **closed learning system**, not a collection of disconnected features.

---

# Architecture

## High-level system

```text
┌─────────────────────────────────────────────────────────────┐
│                         Next.js App                        │
│                   App Router + React 19                    │
├─────────────────────────────────────────────────────────────┤
│  UI / Pages        Learning Engine        AI Experiences    │
│  ├─ Dashboard      ├─ Practice            ├─ Tutor         │
│  ├─ Learn          ├─ Mastery             ├─ RAG           │
│  ├─ Tasks          ├─ Review              ├─ Generator     │
│  ├─ Exams          ├─ Mistakes            └─ AI limits     │
│  ├─ Stats          ├─ Planner                               │
│  └─ Map            └─ Sessions                              │
├─────────────────────────────────────────────────────────────┤
│                         Supabase                             │
│             Auth + PostgreSQL + RLS + pgvector              │
├─────────────────────────────────────────────────────────────┤
│                    External AI layer                         │
│                    Vercel AI Gateway                         │
└─────────────────────────────────────────────────────────────┘
```

## Repository structure

```text
.
├── app/
│   ├── (app)/                 # Main authenticated application
│   │   ├── ai/
│   │   ├── exams/
│   │   ├── generator/
│   │   ├── learn/
│   │   ├── map/
│   │   ├── mistakes/
│   │   ├── plan/
│   │   ├── profile/
│   │   ├── review/
│   │   ├── stats/
│   │   ├── tasks/
│   │   └── settings/
│   ├── (exam)/                # Exam-taking experience
│   ├── api/
│   │   ├── ai/
│   │   └── generator/
│   ├── auth/
│   ├── login/
│   └── globals.css
│
├── components/                # UI and product-level experiences
│
├── content/                   # Authored curriculum and task bank
│
├── lib/
│   ├── ai/                    # Tutor, retrieval, embeddings, usage, prompts
│   ├── learning/              # Mastery, practice, planner, sessions
│   ├── generator/             # Question generation + validation
│   ├── supabase/              # Browser/server clients
│   ├── calculator.ts
│   ├── exams.ts
│   └── auth.ts
│
├── scripts/
│   ├── import-content.ts      # Idempotent content publisher
│   ├── embed-knowledge.ts     # RAG embedding backfill
│   └── qa-*.{ts,mjs}          # End-to-end QA checks
│
├── supabase/
│   ├── migrations/             # Database schema evolution
│   └── seed.sql
│
├── PLAN_ROZBUDOWY.md           # Detailed product / engineering roadmap
├── package.json
└── pnpm-lock.yaml
```

---

# Learning engine

The learning engine lives primarily in `lib/learning/`.

## Skill-based mastery

Mastery is tracked at the **skill** level rather than only at topic level.

A student's state contains information such as:

* mastery;
* attempts;
* correct attempts;
* ease factor;
* repetition count;
* lapses;
* next review date;
* last practice timestamp.

The model is updated from actual answer evidence.

### Evidence matters

Not all correct answers are equal.

For example:

| Evidence                             | Effect                     |
| ------------------------------------ | -------------------------- |
| Correct without help                 | Strong positive evidence   |
| Correct after hints                  | Smaller positive evidence  |
| Correct after viewing the solution   | Reduced evidence           |
| Incorrect                            | Negative evidence          |
| Incorrect after viewing the solution | Stronger negative evidence |

This prevents the system from confusing **exposure** with **mastery**.

## Spaced repetition

The review scheduler is based on an SM-2 style model.

It tracks:

* quality score from 0–5;
* ease factor;
* repetition streak;
* interval in days;
* lapses;
* next due date.

Initial successful intervals follow the familiar:

```text
1 day → 6 days → interval × ease
```

The implementation is deliberately kept as a pure TypeScript model so it can be tested independently from the UI and database.

## Mistake loop

Mistakes are first-class learning objects.

A failed attempt can be surfaced later as:

* a dedicated mistake;
* a weak-skill recommendation;
* part of a review queue;
* targeted generated practice.

A resolved mistake is closed by demonstrated improvement rather than by simply dismissing it.

---

# Exams

Matheon contains a dedicated exam experience rather than turning an exam into a normal practice session.

Exam flows include:

* timed attempts;
* autosaving;
* question navigation;
* exam toolbars;
* answer persistence;
* partial-credit capable grading;
* post-exam reporting;
* skill-level feedback;
* re-attempts.

The exam result is not isolated: answer evidence is propagated back into the learning model.

This means an exam can change what the system recommends next.

---

# AI layer

AI is treated as a learning subsystem, not as a generic chatbot.

## AI Tutor

The tutor supports different pedagogical modes, including explanation, hints and guided reasoning.

The tutor receives context such as:

* the current task;
* learner answer;
* expected answer;
* rubric / scoring information;
* related skills;
* learner profile and preferred level.

The tutor also follows an explicit rule for guided modes:

> When the learner asks for a hint or guided help, the tutor should help them reason rather than immediately reveal the final answer.

## Retrieval-Augmented Generation

The knowledge layer stores chunks from authored lessons and questions.

Two retrieval paths exist:

1. **Embedding retrieval** using `openai/text-embedding-3-small` through Vercel AI Gateway.
2. **Keyword fallback** when embeddings are unavailable.

This allows the application to degrade gracefully instead of pretending that vector search is available when it is not.

### Knowledge flow

```text
lesson / question
      ↓
knowledge chunk
      ↓
embedding
      ↓
pgvector index
      ↓
retrieval
      ↓
AI tutor context
```

## AI usage controls

AI requests are tracked in PostgreSQL.

Current configured limits are:

| Feature   | Per minute | Per 24h |
| --------- | ---------: | ------: |
| Tutor     |          6 |      80 |
| Generator |          3 |      40 |

The system records request metadata such as mode, tools, retrieval count, latency, provider and success state.

When database-backed usage checks fail, a local in-process fallback can still protect the short-term request rate.

---

# AI question generation

The generator is built as a validation pipeline rather than:

```text
prompt → generated text → show user
```

Instead:

```text
learner context
      ↓
generation
      ↓
schema validation
      ↓
mathematical validation
      ↓
retry when necessary
      ↓
published task
      ↓
same practice engine as authored tasks
```

Generated tasks are therefore designed to enter the same learning system as regular content instead of creating a separate "AI-only" experience.

---

# Content system

Matheon keeps authored educational content in the repository under `content/`.

The database is a published representation of that source content.

The importer is designed to be **idempotent**:

* lessons are matched by slug;
* skills are matched by slug;
* tasks are matched by validation metadata codes;
* existing learner history is not intentionally deleted when content is re-imported.

## Publishing content

```bash
pnpm content:import
```

If an AI gateway key is available, the importer can also populate missing knowledge embeddings.

To backfill embeddings separately:

```bash
pnpm content:embed
```

This separation makes content deployment repeatable and safer than manually editing production rows.

---

# Tech stack

### Application

* **Next.js 16** — application framework and App Router
* **React 19** — UI runtime
* **TypeScript 5.7** — typed application and domain logic
* **Tailwind CSS 4** — styling
* **shadcn/base UI ecosystem** — reusable interface primitives
* **KaTeX** — mathematical notation rendering
* **Lucide** — interface icons

### Backend

* **Supabase Auth** — identity and sessions
* **PostgreSQL** — persistence
* **Row Level Security** — per-user data isolation
* **pgvector** — vector search for RAG

### AI

* **Vercel AI SDK**
* **Vercel AI Gateway**
* **OpenAI embedding model**
* AI tutor + task generation + retrieval

### Tooling

* **pnpm**
* **TypeScript / tsx**
* Dedicated repository QA scripts
* GitHub + CodeRabbit workflow

---

# Getting started

## Prerequisites

Recommended local environment:

* Node.js 20+
* pnpm 12+
* Supabase project
* AI Gateway credentials for AI features

## 1. Clone

```bash
git clone https://github.com/Fkoko8/Matheon.git
cd Matheon
```

## 2. Install dependencies

```bash
pnpm install
```

## 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

If the repository does not contain an `.env.example` yet, create `.env.local` manually with the variables required by the application.

### Core variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Required for server-side content import / publishing
SUPABASE_SERVICE_ROLE_KEY=

# Required for AI tutor / generator / embeddings
AI_GATEWAY_API_KEY=

# Optional direct provider key
OPENAI_API_KEY=
```

> **Never commit secrets.** Use `.env.local` for local development and platform-managed environment variables in deployment.

## 4. Prepare Supabase

Run the migrations from:

```text
supabase/migrations/
```

Then load the seed data when appropriate:

```bash
# Use your preferred Supabase workflow.
# For example, with the Supabase CLI:
supabase db push
```

The repository currently contains migration history covering:

* core schema;
* exam system;
* adaptive planner;
* AI tutor;
* question generation;
* knowledge / vector retrieval;
* curriculum content;
* exam attempt safeguards;
* partial-credit grading;
* AI usage RLS.

## 5. Run the development server

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

---

# Scripts

## Development

```bash
pnpm dev
pnpm build
pnpm start
pnpm typecheck
```

## Content

```bash
pnpm content:import
pnpm content:embed
```

## Quality assurance

Targeted checks:

```bash
pnpm qa:auth
pnpm qa:content
pnpm qa:calc
pnpm qa:exam
pnpm qa:practice
pnpm qa:examreport
pnpm qa:ai
```

Standard suite:

```bash
pnpm qa
```

Extended suite:

```bash
pnpm qa:full
```

The QA scripts are intentionally close to the actual application modules they validate. The goal is to catch integration regressions across the database, learning engine and AI layer rather than relying only on isolated unit tests.

---

# Database model

At a high level, the schema is organized around four domains.

## Content

```text
subjects
  └── topics
       └── subtopics
            └── lessons
            └── questions
                 ├── hints
                 └── solutions
```

## Learning state

```text
users / profiles
    ├── user_progress
    ├── user_answers
    ├── mistakes
    ├── learning_events
    ├── study_sessions
    └── study_plans
```

## Exams

```text
exams
  └── exam_questions
       └── questions

exam_attempts
  └── exam_answers
```

## AI / knowledge

```text
knowledge_chunks
    └── embeddings

ai_conversations
    └── ai_messages

ai_request_logs
```

User-owned data is protected through Supabase RLS policies.

---

# Security model

Matheon uses the database as a security boundary rather than relying only on application code.

Important principles:

* authenticated users only;
* user-owned tables are scoped to `auth.uid()`;
* educational content can be shared across users;
* private progress, answers, mistakes, sessions and AI conversations are isolated;
* AI usage logs are tied to the authenticated user;
* service-role access is restricted to server-side workflows such as content publishing.

The application should be treated as a public client. Secrets such as service-role credentials must never be shipped to the browser.

---

# Development workflow

A typical feature should move through the following flow:

```text
1. Define the domain behaviour
          ↓
2. Update / add pure domain logic
          ↓
3. Add database migration when required
          ↓
4. Connect server / API layer
          ↓
5. Build UI
          ↓
6. Add or update QA coverage
          ↓
7. Run typecheck + targeted QA
          ↓
8. Review through pull request
```

For educational content:

```text
content source
   ↓
content importer
   ↓
Supabase
   ↓
QA
   ↓
RAG embedding
```

This keeps content, application state and learning logic separated.

---

# Adding a new learning topic

The recommended workflow is:

### 1. Add authored topic content

Create the appropriate module under:

```text
content/topics/
content/tasks/
```

### 2. Register it

Update:

```text
content/index.ts
content/cke-requirements.ts
```

### 3. Publish

```bash
pnpm content:import
```

### 4. Verify

```bash
pnpm qa:content
pnpm qa:practice
```

The importer is designed to be repeatable, so content can evolve without manually reconstructing database state.

---

# Project status

Matheon is an **actively developed product** rather than a finished framework.

The current codebase already contains substantial implementations for:

* authenticated application flows;
* structured mathematics curriculum;
* skill-based mastery;
* spaced repetition;
* mistake management;
* adaptive planning;
* exam execution and reporting;
* AI tutoring;
* RAG retrieval;
* AI generation;
* persistent AI usage accounting;
* automated QA flows.

The remaining work is mostly about breadth, depth and production hardening: expanding curriculum coverage, expanding the task bank, improving test coverage and polishing the product experience.

For the detailed implementation roadmap, see:

**[PLAN_ROZBUDOWY.md](./PLAN_ROZBUDOWY.md)**

---

# Roadmap

The roadmap is intentionally maintained separately from this README so this document can remain a stable introduction to the project.

Areas currently represented in the engineering roadmap include:

* complete curriculum coverage;
* larger authored task bank;
* comprehensive official exam content;
* deeper planner personalization;
* stronger automated tests;
* further AI evaluation;
* production hardening and performance work;
* additional learner-facing polish.

See **[PLAN_ROZBUDOWY.md](./PLAN_ROZBUDOWY.md)** for the current detailed state.

---

# Contributing

Matheon is structured so that contributions can happen at several levels:

### Product

Propose new learning flows, UX improvements or educational features through an issue.

### Content

Add or improve lessons, skills and tasks under `content/`.

### Engineering

Work on the learning engine, AI layer, database, performance or UI.

### QA

Add regression coverage to the relevant `scripts/qa-*` check when introducing behaviour that can break end-to-end flows.

Before opening a pull request, run at least:

```bash
pnpm typecheck
pnpm qa
```

For changes to exams, practice, content or AI, also run the corresponding targeted QA suite.

---

# Design principles

Matheon follows a few principles that should remain stable as the codebase grows.

### 1. Real state over mock state

If a number affects learner behaviour, it should come from real application state.

### 2. Evidence over assumptions

Mastery should be inferred from demonstrated performance, not from simply opening a lesson.

### 3. One learning engine

Authored tasks, generated tasks and exam-derived practice should converge on the same core learning model whenever possible.

### 4. Graceful degradation

If an optional AI dependency is unavailable, the product should fail explicitly or use a documented fallback instead of pretending the feature is fully operational.

### 5. Database-enforced privacy

RLS should remain a security layer, not an afterthought.

### 6. Repeatable content publishing

Content imports must be safe to rerun and should preserve learner history.

### 7. Domain logic should be testable without the UI

Core learning algorithms should remain isolated from React, HTTP handlers and database-specific concerns wherever practical.

---

# License

The project currently does not declare an open-source license in the repository.

Until a license is added, standard copyright rules apply and the repository should not be treated as permissively licensed software.

---

# Author

**FKoko8**

Built as an independent project focused on combining software engineering, mathematics education and applied AI.

---

<p align="center">
  <strong>MATHEON</strong><br />
  <sub>Build the system. Understand the math. Master the exam.</sub>
</p>

