# Datanerds Annotation · codename DNA

**Data Agent Training & Certification Platform**

> An intelligence-agency themed, gamified annotation training platform where candidates earn ranks, XP, and badges by mastering AI response evaluation.

[![Live](https://img.shields.io/badge/Live-data--agent--training.vercel.app-00E5A0?style=for-the-badge&logo=vercel&logoColor=white)](https://data-agent-training.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-AI%20Grading-F55036?style=for-the-badge&logo=data:image/svg+xml;base64,&logoColor=white)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## What Is This?

Datanerds Annotation is **not a quiz** — it's an intelligence agency training programme. Candidates are *Data Agents* recruited to evaluate AI-generated intelligence for accuracy, instruction compliance, and quality. Every task is a *field operation*. Every correct answer earns *XP*. Every milestone unlocks a new *rank*.

**Live at:** [data-agent-training.vercel.app](https://data-agent-training.vercel.app)

---

## Features

- 🎯 **8 Assignment Types** — Core Alpha–Delta plus vendor-faithful Epsilon (maps), Zeta/Eta (search quality), and Theta (transcription) behind feature flags
- 🤖 **AI-Powered Grading** — Free-text justifications graded by Groq (llama-3.3-70b-versatile)
- 🏆 **7-Tier Rank System** — Recruit → Operative → Field Agent → Specialist → Analyst → Senior Analyst → Intelligence Director
- ⚡ **XP & Streak System** — Earn XP per correct answer, streak bonuses at 3/5/10 consecutive, speed bonuses
- 🔐 **Google OAuth** — Sign in with Google via Supabase Auth
- 📊 **Live Leaderboard** — Opt-in global rankings pulled from Supabase
- 🎖️ **Badge Collection** — 11 earnable badges with rank-up, achievement, and streak categories
- 📋 **Agent Dossier** — Full profile with stats, operation history, and badge wall
- 📚 **Field Training** — Practice mode with interactive study guide and worked examples (no timer)
- ⏱️ **Live Operations** — 25 randomized assignments, 40-minute timer, forward-only navigation

---

## Repository Structure

```
data-agent-training-platform/
├── frontend/              # Next.js 16 App Router application
│   ├── app/               # Pages + API routes
│   ├── components/        # UI components (assignments, operation, training, etc.)
│   ├── contexts/          # AuthContext, AgentContext (Supabase)
│   ├── lib/               # Scoring, questions, ranks, badges, grading, DB client
│   └── .env.local         # Local environment variables (not committed)
├── backend/               # Supabase database layer
│   ├── supabase/migrations/  # SQL migrations (run in order; 016–020 are v4)
│   ├── lib/               # Server-side DB helpers
│   └── types/             # Database TypeScript types
└── docs/                  # PRD, evaluation rubrics, assessment guides
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion (via `motion` package) |
| AI Grading | Vercel AI SDK + `@ai-sdk/groq` (llama-3.3-70b-versatile) |
| Auth | Supabase Google OAuth |
| Database | Supabase PostgreSQL + RLS + DB triggers |
| Charts | Recharts (radar chart for category breakdown) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing — Agency HQ with enlistment flow |
| `/prep` | Briefing — Interactive annotation study guide with worked examples |
| `/training` | Field Training — Practice mode, no timer, earn XP |
| `/operation` | Live Operation — 25 assignments, 40-min timer, streaks & XP |
| `/dossier` | Agent Dossier — Profile, stats, badge wall, operation history |
| `/rankings` | Agency Rankings — Live leaderboard from Supabase |
| `/login` | Google OAuth sign-in |
| `/proficiency/[examId]` | Language proficiency gate (one-shot timed exam) |

---

## Assignment Types

| Type | Codename | What the Agent Does |
|---|---|---|
| **Alpha** | Response Rating | Rate a single AI response: CLEAR / AMBIGUOUS / COMPROMISED + justification |
| **Beta** | Comparative Analysis | Rate two responses independently, select the superior one + justification |
| **Gamma** | Transcript Clearance | Flag transcript contamination across 8 rejection categories |
| **Delta** | Response Selection | Choose the optimal response from 4 candidates |
| **Epsilon** | Map Evaluation | Rate POIs: navigational, relevance, name/address/pin accuracy |
| **Zeta** | Search Quality | Page Quality (10-point) + Needs Met (5-point) on a frozen snapshot |
| **Eta** | Search Quality Lite | Four-point satisfaction scale (shares Zeta's shell) |
| **Theta** | Transcription | Segment a waveform, label speakers, transcribe, tag spans |

Alpha and Beta justifications are **AI-graded** by Groq in real-time (score 0/1/2 + feedback). Epsilon/Zeta/Eta are deterministic. Theta uses IoU + edit-distance + tag F1.

v4 tracks are **on** unless a flag is set to `false`. To hide one, set e.g. `NEXT_PUBLIC_TRACK_THETA=false`.

Optional language gate: set `NEXT_PUBLIC_REQUIRED_PROFICIENCY_EXAM=en-CA` to require `/proficiency/en-CA` before Theta (default gated type).

---

## Rank System

| Rank | XP Required | Colour |
|---|---|---|
| Recruit | 0 | Warm stone |
| Operative | 500 | Steel blue |
| Field Agent | 1,500 | Sage green |
| Specialist | 3,500 | Muted mauve |
| Analyst | 7,000 | Gold |
| Senior Analyst | 12,000 | Amber |
| Intelligence Director | 20,000 | Champagne gold |

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
cd frontend
pnpm install
```

Create `frontend/.env.local` from the example:

```env
# Supabase — get from dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Groq AI grading — https://console.groq.com
GROQ_API_KEY=gsk_...

# App config
NEXT_PUBLIC_SITE_URL=https://data-agent-training.vercel.app
NEXT_PUBLIC_PASS_SCORE=70
NEXT_PUBLIC_QUESTION_COUNT=25
NEXT_PUBLIC_TIME_LIMIT=40
```

```bash
pnpm dev   # → http://localhost:3000
```

> The app works without Supabase/Groq credentials — auth is disabled and grading falls back to a heuristic word-count analyzer.

---

## Database Setup (Supabase)

Run the migration files in `backend/supabase/migrations/` **in order** via the Supabase SQL Editor:

| # | File | Purpose |
|---|---|---|
| 001 | `extensions.sql` | Enable `uuid-ossp` |
| 002 | `rank_tiers.sql` | Rank reference table + seed 7 ranks |
| 003 | `agents.sql` | Agent profiles (linked to `auth.users`) |
| 004 | `operations.sql` | Operation results history |
| 005 | `badges.sql` | Badge definitions (11) + agent_badges junction |
| 006 | `leaderboard_view.sql` | Leaderboard view (opt-in agents only) |
| 007 | `rls_policies.sql` | Row Level Security — agents can only access own data |
| 008 | `triggers.sql` | Auto XP totals, rank recalculation, badge awards, new user profile creation |
| 016 | `tracks.sql` | Specialisation tracks + agent_tracks XP |
| 017 | `widen_question_types.sql` | Questions table (or widen type check) for Epsilon–Theta |
| 019 | `theta_transcription.sql` | Nullable `questions.audio_asset_url` |
| 020 | `language_proficiency.sql` | Proficiency exams, results, optional org requirement |
| 021 | `keep_alive_cron.sql` | Daily `pg_cron` heartbeat (`dna-keep-alive`) |

Free-tier projects pause after a week of no traffic. After deploy, Vercel hits `GET /api/keep-alive` every day at 12:00 UTC (and a GitHub Action does the same). That inbound REST call is what keeps the project awake. Run `021` in the SQL Editor as well so `pg_cron` is scheduled inside the database.

DB triggers handle all XP/rank/badge calculations automatically — the app just inserts an operation row.

---

## Auth Setup (Google OAuth)

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth client ID (Web)
   - Authorized JavaScript origins:
     - `https://your-project.supabase.co`
     - `https://data-agent-training.vercel.app`
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `https://data-agent-training.vercel.app/auth/callback`

2. **Supabase** → Authentication → Providers → Google → Enable → paste Client ID + Secret

3. **Supabase** → Authentication → URL Configuration:
   - Site URL: `https://data-agent-training.vercel.app`
   - Redirect URLs: `https://data-agent-training.vercel.app/auth/callback`

---

## Deployment (Vercel)

The app is deployed at [data-agent-training.vercel.app](https://data-agent-training.vercel.app).

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com) → set **Root Directory** to `frontend`
3. Add all environment variables under Settings → Environment Variables
4. Deploy — the `/api/grade` route runs as a serverless function

---

## Data Architecture

```
Browser
  └─ AgentContext (React)
       ├─ localStorage (instant read/write cache)
       └─ Supabase JS Client
            ├─ Auth (Google OAuth)
            ├─ agents table (XP, rank, profile)
            ├─ operations table (history)
            ├─ agent_badges table
            └─ leaderboard view (opt-in rankings)

API Routes (serverless)
  ├─ POST /api/grade → Groq AI SDK → llama-3.3-70b-versatile
  └─ GET  /api/leaderboard → Supabase leaderboard view
```

---

## License

MIT
