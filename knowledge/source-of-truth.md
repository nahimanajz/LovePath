# Source of Truth

This document defines the authoritative sources for every type of decision in the LovePath project. When in doubt about what to build, what it should look like, or how it should behave — this document tells you where to look first.

---

## 1. GitHub Issues — Feature Requirements

**URL:** https://github.com/nahimanajz/lovepath/issues

GitHub Issues are the **single source of truth for what to build**.

Every screen in the app has a corresponding GitHub issue (S01–S20). Each issue contains:

- The purpose of the screen
- Book context (the exact Joe Beam / Ryan Holiday / Gary Chapman concept the screen implements)
- Full layout specification (every component, size, color, state)
- All quiz questions (S07 — all 30 with language scoring keys)
- All checklist items (S10 — all 4 LovePath stage checklists)
- All obstacle texts (S14 — all 8 obstacles with full insight copy)
- API endpoints and data shapes
- Acceptance criteria (checkbox list for QA)

### GitHub Project Board

Issues follow this flow on the project board:

```
Todo → In Progress → Done
```

**Rules:**
- An issue moves to **In Progress** when a branch is created for it
- An issue moves to **Done** only after the PR is merged to `main`
- Never mark an issue Done before the branch is merged

### Issue Labels

| Label | Meaning |
|-------|---------|
| `screen` | A mobile screen to implement |
| `onboarding` | Onboarding flow screens |
| `quiz` | Quiz functionality |
| `love-languages` | Chapman's 5 Love Languages feature |
| `lovepath` | Beam's 4-stage framework |
| `obstacles` | Holiday's Stoic obstacle guide |
| `rebuild` | Rebuild together / aspiration features |
| `trust` | Trust circle feature |
| `balance` | Effort balance tracker |
| `UI` | Any UI implementation task |

---

## 2. Stitch Designs — Visual Source of Truth

**Tool:** Stitch (AI design tool)
**Project URL:** `https://stitch.withgoogle.com/projects/2770586918123854384`
**Access:** Use the Playwright MCP browser to open and screenshot Stitch frames.

Stitch designs are the **source of truth for all visual styles** — colors, fonts, spacing, padding, border radii, shadows, and gradients.

Every screen has a corresponding Stitch design frame named `Splash / Onboarding 1` through `Profile & Settings`.

When implementing a screen:
1. Use the Playwright MCP to navigate to the Stitch project
2. Click the matching screen card, press `Shift+2` to zoom, then take an element screenshot
3. Extract **all** visual values from the screenshot: background, colors, fonts, sizes, spacing, radii
4. Register any new values as named tokens in `tailwind.config.js` before writing any component
5. Do not deviate from the Stitch design without updating the design first
6. If a state is missing from Stitch (empty, error, loading), check the GitHub issue — if not specified there either, apply the closest design system default from `/knowledge/design-system.md`

> **Never invent colors, fonts, or spacing.** If it is not in Stitch, it does not go in the code.

### Design System Variables

All Stitch designs use the design tokens defined in `/knowledge/project-overview.md`. Components in Stitch follow these conventions:

| Stitch Component | Maps To |
|-----------------|---------|
| `Card` | White surface, 16px radius, soft shadow |
| `PrimaryButton` | Rose `#C0556A`, pill shape, 52px height |
| `OutlinedButton` | Rose outline, transparent bg |
| `PhaseTag` | Colored pill: Perception=purple, Action=teal, Will=amber |
| `ProgressBar` | Rose fill, gray track, 7px height |
| `StarRating` | 5 stars, rose fill for rated |
| `SliderRow` | Label + range slider + numeric value |

---

## 3. JSON Server — Backend During Development

**Purpose:** JSON Server acts as a mock REST API during development. It allows the frontend to be built and tested without a real backend.

**Port:** `3001`  
**Data file:** `db.json` in the project root

### Starting JSON Server

```bash
npx json-server --watch db.json --port 3001
```

### Base URL

```
http://localhost:3001
```

### Available Endpoints (auto-generated from db.json)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | All user profiles |
| GET/PATCH | `/users/:id` | Single user |
| GET/POST | `/quizResults` | Love language quiz results |
| GET/POST/PATCH | `/effortBalance` | Weekly effort scores |
| GET/POST/PATCH | `/trustCircle` | Trust circle entries |
| GET/POST/PATCH | `/lovepathStage` | Current stage + checklist |
| GET/POST/PATCH | `/compatibility` | Dimension ratings |
| GET/POST | `/obstacles` | Daily practice completions |
| GET/POST | `/rebuild` | Contribution scores |
| GET/POST | `/egoChecks` | Ego pattern submissions |
| GET | `/insights` | Insight feed content pool |
| GET/POST | `/reflections` | Journal entries |
| GET/POST | `/partnerInvites` | Invite tokens |

### Sample db.json structure

```json
{
  "users": [
    {
      "id": 1,
      "name": "Alex",
      "email": "alex@example.com",
      "situation": "building",
      "primaryLanguage": "Quality Time",
      "languageScores": { "W": 7, "Q": 12, "G": 2, "S": 5, "T": 4 },
      "partnerId": 2,
      "createdAt": "2025-03-01"
    }
  ],
  "quizResults": [],
  "effortBalance": [],
  "trustCircle": [],
  "lovepathStage": [],
  "compatibility": [],
  "obstacles": [],
  "rebuild": [],
  "egoChecks": [],
  "insights": [],
  "reflections": [],
  "partnerInvites": []
}
```

### Switching to Real Backend

When the real backend (Node.js/Express) is ready, update the `API_BASE_URL` in `/src/config/api.ts`. No other changes should be needed if the endpoints match the JSON Server structure.

---

## 4. Summary: Where to Look for What

| Question | Where to look |
|----------|---------------|
| What should I build? | GitHub Issue for the screen (S01–S20) |
| What should it look like? | Stitch design frame matching the issue number |
| What data does it need? | GitHub Issue — "Data / API" section |
| Where does the data come from? | JSON Server (`localhost:3001`) |
| What are the design tokens? | `/knowledge/project-overview.md` → Design System |
| What are the coding rules? | `/.agent/rules/` directory |
| What is the workflow? | `/.agent/rules/workflow.md` |
