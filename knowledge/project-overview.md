# LovePath — Project Overview

## What is LovePath?

LovePath is a mobile application that helps couples and individuals build healthier, more self-aware relationships. It synthesizes the frameworks of three books into a single, actionable daily tool:

| Book | Author | Contribution to the App |
|------|--------|------------------------|
| *The Art of Falling in Love* | Joe Beam | LovePath stage tracker (Attraction → Acceptance → Attachment → Aspiration), compatibility deep dive, effort balance |
| *The Obstacle Is the Way* | Ryan Holiday | Stoic obstacle guide (Perception → Action → Will), daily practice checklist, ego check, amor fati reframing |
| *The Five Love Languages* | Gary Chapman | 30-question love language quiz, primary/secondary language results, partner language comparison |

---

## Core Problem the App Solves

Most relationship problems are not caused by lack of love — they are caused by:

1. **Mismatched love languages** — people expressing love in the way *they* want to receive it, not the way their partner needs it
2. **Undetected one-sidedness** — one person investing far more effort than the other, leading to slow resentment
3. **Ego blocking growth** — neither person able to see past their need to be right, validated, or "winning"
4. **Betrayal from one-sided trust** — over-investing emotionally in relationships (friend, advisor, partner) where reciprocity is absent
5. **No framework for obstacles** — people avoid love's difficulties instead of using them as growth material

LovePath addresses all five with measurable, daily-trackable tools.

---

## Target Users

- **Primary:** Individuals in early-stage relationships (dating phase) who want to understand compatibility before deep attachment
- **Secondary:** Couples in established relationships who want to improve communication and rebalance effort
- **Tertiary:** People recovering from betrayal who want to rebuild self-awareness before their next relationship

---

## Application Screens (20 total)

### Onboarding Flow
| Screen | Route | Purpose |
|--------|-------|---------|
| S01 — Splash | `/onboarding/1` | First impression, brand intro |
| S02 — How It Works | `/onboarding/2` | Explain 3-pillar framework |
| S03 — Your Situation | `/onboarding/3` | Personalize experience |
| S04 — Auth | `/auth` | Sign up / Log in |

### Core
| Screen | Route | Purpose |
|--------|-------|---------|
| S05 — Home Dashboard | `/home` | Central hub, all scores at a glance |

### Love Languages (Gary Chapman)
| Screen | Route | Purpose |
|--------|-------|---------|
| S06 — Quiz Intro | `/love-languages/intro` | Explain the quiz |
| S07 — Quiz Questions | `/love-languages/quiz` | 30 forced-choice questions |
| S08 — Quiz Results | `/love-languages/results` | Primary language + breakdown |
| S09 — Partner Comparison | `/love-languages/comparison` | Side-by-side language match |

### LovePath & Compatibility (Joe Beam)
| Screen | Route | Purpose |
|--------|-------|---------|
| S10 — Stage Tracker | `/lovepath/stage` | Current stage + checklist |
| S11 — Compatibility Deep Dive | `/compatibility` | Rate 6 dimensions, track gaps |
| S12 — Effort Balance | `/effort-balance` | Weekly effort sliders, imbalance alerts |
| S13 — Trust Circle | `/trust-circle` | Flag one-sided relationships |

### Obstacles (Ryan Holiday)
| Screen | Route | Purpose |
|--------|-------|---------|
| S14 — Obstacle Guide | `/obstacles` | 8 obstacles with Stoic reframes |
| S15 — Daily Practices | `/practices/today` | Today's checklist + streak |

### Rebuild Together
| Screen | Route | Purpose |
|--------|-------|---------|
| S16 — Contributions | `/rebuild/contributions` | Rate investment in partner's growth |
| S17 — Ego Check | `/rebuild/ego-check` | Identify ego patterns |

### Other
| Screen | Route | Purpose |
|--------|-------|---------|
| S18 — Insight Feed | `/insights` | Daily book-based wisdom |
| S19 — Partner Invite | `/partner/invite` | Invite partner to connect |
| S20 — Profile & Settings | `/profile` | Account management |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo) |
| Navigation | Expo Router (file-based routing — screens in `/app` only) |
| Styling | NativeWind (Tailwind for RN) — tokens sourced from Stitch |
| State | Zustand |
| Data fetching | TanStack Query (React Query) |
| Backend (dev) | JSON Server on port 3001 |
| Backend (prod) | Node.js / Express |
| Auth | Expo SecureStore + JWT |
| Design source | Stitch (`https://stitch.withgoogle.com/projects/2770586918123854384`) |

> **No Firebase.** No `src/screens/` directory. No `src/styles/` directory.

---

## Repository

**GitHub:** https://github.com/nahimanajz/lovepath

---

## Design System

| Token | Value |
|-------|-------|
| Primary (rose) | `#C0556A` |
| Secondary (purple) | `#7F77DD` |
| Accent teal | `#1D9E75` |
| Accent amber | `#EF9F27` |
| Background | `#FAF9F6` |
| Card surface | `#FFFFFF` |
| Text primary | `#1A1A1A` |
| Text muted | `#888780` |
| Border | `#E8E6E0` |
| Danger | `#E24B4A` |
| Card radius | `16px` |
| Button radius | `50px` (pill) |
| Input radius | `12px` |
