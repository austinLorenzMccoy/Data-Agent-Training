# Datanerds Annotation

Training and certification for people who rate AI output. Study the real vendor guidelines, practice the same rating grids, then sit a timed test.

**Live:** [data-agent-training.vercel.app](https://data-agent-training.vercel.app)

[![Live](https://img.shields.io/badge/Live-data--agent--training.vercel.app-00E5A0?style=for-the-badge&logo=vercel&logoColor=white)](https://data-agent-training.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-AI%20Grading-F55036?style=for-the-badge)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## What this is

Not a trivia quiz. You learn the rating rules used on live annotation jobs, work examples with no clock, then sit a timed packet of one task type. Written reasons are scored, not only the click.

Ranks, XP, and badges follow the work. The live site is a copy-desk training floor, not an intelligence-agency skin.

---

## Source materials

Guidelines in `docs/` come from real vendor programmes. They are **not** interchangeable.

Markdown is the working copy. Original `.docx` / `.pdf` files are kept next to them. Re-convert with:

```bash
python3 docs/scripts/convert-to-markdown.py
```

### DataAnnotation.tech

These files are the DataAnnotation.tech qualification corpus. In the app they live at **`/guidelines/dataannotation`**, not on the English page.

| File | What it is |
|---|---|
| `docs/DataAnnotation Full Assessment.md` | Starter assessment (research, comparison, writing, rubrics, profile) |
| `docs/Task1 Full Evaluation.md` | Evaluating Responses from AI Assistants v19 — restaurant review |
| `docs/Task2 Noodle Evaluation.md` | Task 2 — poem about noodles |
| `docs/Task3 MonetaryPolicy Evaluation.md` | Task 3 — explain monetary policy |
| `docs/Task4 TextClassification Evaluation.md` | Task 4 — classify a speech excerpt |
| `docs/Task5 SabrinaCarpenter Evaluation.md` | Task 5 — filmography fact check |
| `docs/Task6 CreativeWriting Evaluation.md` | Task 6 — four-line poem with a hard constraint |
| `docs/Task7 WoW Evaluation.md` | Task 7 — Wrath Classic mount fact check |
| `docs/guidelines/tryrating_map_guideline_with_images.md` | Maps Search Evaluation (March 2025). In-app: `/guidelines/epsilon` |

The rating scale is **Good / Okay / Bad**, then which response is better, then a justification that names truthfulness, instruction following, or helpfulness. Any truthfulness or instruction miss is automatically Bad.

The maps guideline is the same vendor, but it is a 278-page illustrated document, so it stays on its own page.

**English is not this pack.** `/proficiency/en-CA` (nav: **English**) is the en-CA language exam. It stays a language gate in front of transcription. Do not fold DataAnnotation.tech into it.

### Other vendor guidelines

| File | In-app |
|---|---|
| `docs/guidelines/content-reviewer.md` | Search quality — Page Quality + Needs Met (`/guidelines/zeta`) |
| `docs/guidelines/Lightspeed_Search_Quality_Rating_Guidelines.md` | Search (simple) (`/guidelines/eta`) |
| `docs/guidelines/Freya_Certification_Study_Guide.md` + `Freya_Exam_QA_Compilation.md` | Transcription (`/guidelines/theta`) |
| `docs/guidelines/en-CA_Language_Proficiency_Exam_QA.md` | English exam guide (`/guidelines/proficiency`) |
| `docs/try_rating_text_response_evaluation.md` | Core “rate a response / compare two” work (practice types Alpha–Delta) |

Product specs: `docs/Datanerds_Annotation_PRD_v2.md`, `docs/Datanerds_Annotation_PRD_v4.md`, `docs/Datanerds_Backend_Implementation.md`.

---

## Features

- **Eight assignment types** — Rate a response, compare two, review a transcript, pick the best reply, plus maps, search quality, search (simple), and transcription
- **Full guidelines in the app** — including the DataAnnotation.tech pack and the illustrated maps document. Nothing downloads
- **AI-graded justifications** — Groq (`llama-3.3-70b-versatile`) scores written reasons
- **Practice and timed tests** — no clock on practice; tests are one task type, timed, with a debrief
- **English proficiency gate** — optional one-shot en-CA exam before transcription
- **Ranks, XP, badges** — seven ranks, streak and speed bonuses, 11 badges
- **Google sign-in** — Supabase Auth
- **Leaderboard** — opt-in rankings from Supabase

---

## Pages

| Route | Nav | What it is |
|---|---|---|
| `/` | — | Landing |
| `/prep` | Study | How practice works + jumps into guidelines |
| `/guidelines` | Guidelines | Full source documents |
| `/guidelines/dataannotation` | — | DataAnnotation.tech pack (starter + Tasks 1–7) |
| `/guidelines/epsilon` | — | Maps (DataAnnotation.tech / TryRating) |
| `/guidelines/zeta` | — | Page Quality + Needs Met |
| `/guidelines/eta` | — | Search (simple) |
| `/guidelines/theta` | — | Transcription |
| `/guidelines/proficiency` | — | English exam study guide |
| `/training` | Practice | Untimed practice, one type at a time |
| `/operation` | Test | Timed packet, then `/operation/debrief` |
| `/dossier` | Progress | Profile, stats, badges, history |
| `/rankings` | Rankings | Leaderboard |
| `/proficiency/en-CA` | English | Language exam (not DataAnnotation.tech) |
| `/login` | — | Google sign-in |

---

## Assignment types

| Type | What you do |
|---|---|
| **Rate a response** | Good / Okay / Bad + a written reason |
| **Compare two responses** | Rate each, then pick the better one |
| **Review a transcript** | Pass it or flag what is wrong |
| **Pick the best reply** | Choose among four |
| **Rate map results** | Relevance, name, address, pin |
| **Rate a search result** | Page Quality (10-point) + Needs Met (5-point) |
| **Rate search (simple)** | Four-point satisfaction |
| **Transcribe audio** | Segment, speakers, verbatim transcript, tags |

Written reasons on the first two types are **AI-graded**. Maps / search / transcription are field-by-field. Audio playback on transcription is real WAV files in `frontend/public/audio/`.

v4 tracks are **on** unless a flag is `false`. To hide one: `NEXT_PUBLIC_TRACK_THETA=false`.

Optional language gate: `NEXT_PUBLIC_REQUIRED_PROFICIENCY_EXAM=en-CA` requires `/proficiency/en-CA` before transcription (default gated type).

---

## Rank system

| Rank | XP |
|---|---|
| Recruit | 0 |
| Operative | 500 |
| Field Agent | 1,500 |
| Specialist | 3,500 |
| Analyst | 7,000 |
| Senior Analyst | 12,000 |
| Intelligence Director | 20,000 |

---

## Repository

```
data-agent-training-platform/
├── frontend/                 # Next.js 16 App Router
│   ├── app/                  # Pages + API routes
│   ├── components/
│   ├── lib/                  # Scoring, questions, guideline JSON
│   └── public/guidelines/    # Figures for illustrated documents
├── backend/supabase/         # Migrations, RLS, triggers
└── docs/                     # Vendor guidelines + PRDs (see Source materials)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS 4 |
| Motion | Framer Motion (`motion`) |
| AI grading | Vercel AI SDK + `@ai-sdk/groq` |
| Auth | Supabase Google OAuth |
| Database | Supabase PostgreSQL + RLS + triggers |
| Charts | Recharts |
| Audio | WaveSurfer.js + HTML5 `<audio>` |
| Deploy | Vercel |

---

## Local development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
cd frontend
pnpm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GROQ_API_KEY=gsk_...

NEXT_PUBLIC_SITE_URL=https://data-agent-training.vercel.app
NEXT_PUBLIC_PASS_SCORE=70
NEXT_PUBLIC_QUESTION_COUNT=25
NEXT_PUBLIC_TIME_LIMIT=40
```

```bash
pnpm dev   # → http://localhost:3000
```

The app runs without Supabase or Groq: auth is off and justification grading falls back to a heuristic.

---

## Database (Supabase)

Run `backend/supabase/migrations/` **in order** in the SQL Editor:

| # | File | Purpose |
|---|---|---|
| 001 | `extensions.sql` | `uuid-ossp` |
| 002 | `rank_tiers.sql` | Seven ranks |
| 003 | `agents.sql` | Profiles linked to `auth.users` |
| 004 | `operations.sql` | Test history |
| 005 | `badges.sql` | Badge definitions |
| 006 | `leaderboard_view.sql` | Opt-in leaderboard |
| 007 | `rls_policies.sql` | Row-level security |
| 008 | `triggers.sql` | XP, rank, badges, new-user profile |
| 016 | `tracks.sql` | Specialisation tracks |
| 017 | `widen_question_types.sql` | Epsilon–Theta question types |
| 019 | `theta_transcription.sql` | `questions.audio_asset_url` |
| 020 | `language_proficiency.sql` | Proficiency exams |
| 021 | `keep_alive_cron.sql` | Daily heartbeat |

Free-tier projects pause after a week of no traffic. After deploy, Vercel hits `GET /api/keep-alive` daily at 12:00 UTC (and a GitHub Action does the same). Run `021` so `pg_cron` is scheduled inside the database.

---

## Auth (Google OAuth)

1. **Google Cloud Console** → OAuth client ID (Web)
   - Origins: `https://your-project.supabase.co`, `https://data-agent-training.vercel.app`
   - Redirects: `https://your-project.supabase.co/auth/v1/callback`, `https://data-agent-training.vercel.app/auth/callback`
2. **Supabase** → Authentication → Providers → Google → Client ID + Secret
3. **Supabase** → URL Configuration: Site URL and redirect = `https://data-agent-training.vercel.app/auth/callback`

---

## Deploy (Vercel)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com) → **Root Directory** `frontend`
3. Add environment variables
4. Deploy — `/api/grade` runs as a serverless function

---

## License

MIT
