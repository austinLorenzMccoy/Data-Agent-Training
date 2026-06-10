# Datanerds Annotation

**Data Agent Training & Certification Platform**

> Prove you can tell signal from noise in AI responses. Earn your clearance. Climb the ranks. Become a Data Agent.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## Repository Structure

```
datanerds-annotation/
├── frontend/          # Next.js 16 App Router application
└── backend/           # Supabase database layer (SQL migrations + types)
```

---

## Frontend

### Quick Start

```bash
cd frontend
pnpm install
cp .env.local .env.local   # fill in credentials (see below)
pnpm dev                   # http://localhost:3000
```

### Environment Variables

Create `frontend/.env.local`:

```env
# Supabase — get from dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # server-side only, never expose

# Groq AI grading — https://console.groq.com
GROQ_API_KEY=gsk_...

# App config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PASS_SCORE=70
NEXT_PUBLIC_QUESTION_COUNT=25
NEXT_PUBLIC_TIME_LIMIT=40
```

The app works without Supabase credentials — auth and persistence are disabled until credentials are filled in.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| AI Grading | Groq SDK (llama-3.3-70b) |
| Auth | Supabase Google OAuth |
| Database | Supabase (PostgreSQL + RLS) |
| Icons | Lucide React |
| Deployment | Vercel |

### Pages

| Route | Description |
|---|---|
| `/` | Landing — agency HQ |
| `/prep` | Briefing — annotation study guide |
| `/training` | Practice mode (no timer) |
| `/operation` | Live operation (25 questions, 40 min) |
| `/dossier` | Agent profile — XP, rank, badges, history |
| `/rankings` | Global leaderboard |
| `/login` | Google OAuth sign-in |

### Assignment Types

- **Alpha** — Rate a single AI response: CLEAR / AMBIGUOUS / COMPROMISED
- **Beta** — Compare two responses and select the better one
- **Gamma** — Flag transcript contamination (8 rejection reasons)
- **Delta** — Choose the optimal response from 4 candidates

---

## Backend (Supabase)

### Database Setup

Run the SQL files in `backend/supabase/migrations/` in order in the Supabase SQL Editor:

```
001_extensions.sql     — uuid-ossp
002_rank_tiers.sql     — rank reference table + seed data
003_agents.sql         — user profiles
004_operations.sql     — operation history
005_badges.sql         — badge definitions + earned badges
006_leaderboard_view.sql
007_rls_policies.sql   — row-level security
008_triggers.sql       — XP totals, rank calc, badge awards
```

### Auth Setup

1. Supabase dashboard → Authentication → Providers → Google → Enable
2. Add redirect URIs in Google Cloud Console:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
3. Paste Client ID + Secret back into Supabase Google provider settings

### Data Architecture

```
Browser
  └─ AgentContext (React)
       ├─ localStorage (instant read cache)
       └─ Supabase JS Client
            ├─ Auth (Google OAuth)
            ├─ agents table (XP, rank, profile)
            ├─ operations table (history)
            └─ agent_badges table
```

DB triggers handle XP totals, rank recalculation, and badge awards automatically on operation insert — application code only inserts the row.

---

## Rank System

| Rank | XP | Colour |
|---|---|---|
| Recruit | 0 | Warm stone |
| Operative | 500 | Steel blue |
| Field Agent | 1,500 | Sage green |
| Specialist | 3,500 | Muted mauve |
| Analyst | 7,000 | Gold |
| Senior Analyst | 12,000 | Amber |
| Intelligence Director | 20,000 | Champagne gold |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project at vercel.com
3. Add all env vars under Settings → Environment Variables
4. Set `NEXT_PUBLIC_SITE_URL` to your live Vercel URL
5. Add the Vercel URL to Supabase → Auth → Redirect URLs

**Root directory:** set to `frontend` in Vercel project settings.

---

## License

MIT
