# Prompt: Implement All 20 LovePath Screens

You are a senior React Native / Expo developer with architect-level experience.
Your task is to implement all 20 screens of the LovePath mobile app, one at a time, in order.

**Read these files before starting anything:**
- `/.agent/rules/workflow.md` — the mandatory 7-step process per screen
- `/.agent/rules/coding-style.md` — naming, structure, NativeWind, TypeScript rules
- `/.agent/rules/implementation-guide.md` — per-screen checklist
- `/knowledge/source-of-truth.md` — where every type of decision comes from
- `/knowledge/design-system.md` — component patterns and token reference

---

## Non-Negotiable Rules

1. **No Firebase.** Auth = Expo SecureStore + JWT. Data = JSON Server (dev) via `/src/services/`.
2. **No `src/screens/` directory.** All screens are Expo Router files under `/app`.
3. **No `src/styles/` directory.** All styling = NativeWind classes.
4. **Styles come from Stitch only.** For every screen, use the Playwright MCP to open
   `https://stitch.withgoogle.com/projects/2770586918123854384`, screenshot the matching
   frame, and extract every color, font, spacing, and radius value from the screenshot.
   Register new values in `tailwind.config.js` before using them in any component.
5. **Never invent or assume a visual value.** If it is not in the Stitch screenshot, do not use it.
6. **One branch per screen.** `feature/s[NN]-[slug]` branched from `main`.
7. **All 20 screens must be fully functioning** — real navigation, real data from JSON Server,
   loading/error/empty states, all interactive elements working.

---

## Screen List & GitHub Issues

| # | Issue # | Screen | Expo Route |
|---|---------|--------|------------|
| S01 | #41 | Splash / Onboarding 1 | `/onboarding/1` (index) |
| S02 | #42 | Onboarding 2 — How It Works | `/onboarding/how-it-works` |
| S03 | #43 | Onboarding 3 — Your Situation | `/onboarding/your-situation` |
| S04 | #44 | Sign Up / Login | `/(auth)/login` + `/(auth)/signup` |
| S05 | #45 | Home Dashboard | `/(tabs)/index` |
| S06 | #46 | Love Language Quiz Intro | `/love-languages/intro` |
| S07 | #47 | Love Language Quiz Questions | `/love-languages/quiz` |
| S08 | #48 | Love Language Quiz Results | `/love-languages/results` |
| S09 | #49 | Partner Language Comparison | `/love-languages/comparison` |
| S10 | #50 | LovePath Stage Tracker | `/lovepath/stage` |
| S11 | #51 | Compatibility Deep Dive | `/(tabs)/compatibility` |
| S12 | #52 | Effort Balance Tracker | `/effort-balance/index` |
| S13 | #53 | Trust Circle | `/trust-circle/index` |
| S14 | #54 | Obstacle Guide | `/(tabs)/obstacles` |
| S15 | #55 | Daily Practice Checklist | `/practices/today` |
| S16 | #56 | Rebuild Together | `/rebuild/contributions` |
| S17 | #57 | Ego Check | `/rebuild/ego-check` |
| S18 | #58 | Insight Feed | `/(tabs)/insights` |
| S19 | #59 | Partner Invite | `/partner/invite` |
| S20 | #60 | Profile & Settings | `/(tabs)/profile` |

---

## Per-Screen Workflow (repeat for every screen)

### Step 1 — Read the GitHub issue
```
mcp__github__issue_read(owner="nahimanajz", repo="lovepath", issue_number=<N>)
```
Extract: route, all components, data shape, API endpoints, navigation in/out, acceptance criteria.

### Step 2 — Screenshot the Stitch design
```
mcp__playwright__browser_navigate(url="https://stitch.withgoogle.com/projects/2770586918123854384")
→ click the matching screen card
→ press Shift+2 to zoom
→ mcp__playwright__browser_take_screenshot(element="<Screen Name> screen card")
```
Extract from the screenshot:
- Background color/gradient
- All text colors, fill colors, border colors, icon colors
- Font families, sizes, weights per element
- Padding values (screen, card, button)
- Gap between components
- Border radii (cards, buttons, inputs, pills)
- Shadow values

### Step 3 — Register Stitch values in tailwind.config.js
Add any new tokens before writing a single component.
```js
// tailwind.config.js
theme: {
  extend: {
    colors: { primary: '#C0556A', background: '#FAF9F6', ... },
    fontFamily: { heading: ['Plus Jakarta Sans'], body: ['Be Vietnam Pro'] },
    borderRadius: { card: '16px', button: '50px', ... },
  }
}
```

### Step 4 — Create the git branch
```bash
git checkout main && git pull origin main
git checkout -b feature/s[NN]-[slug]
```

### Step 5 — Implement the screen
File location: `/app/<route>.tsx` (Expo Router, default export).

Implementation order:
1. Static layout with NativeWind classes (no data yet)
2. Service function in `/src/services/<feature>Service.ts`
3. TanStack Query hook for data fetching
4. Zustand store for local/session state (if needed)
5. Wire navigation with `router.push('/path')`
6. Loading state: `<LoadingScreen />`
7. Error state: `<ErrorScreen message={...} onRetry={...} />`
8. Empty state (if applicable)
9. All interactive states: pressed, disabled, checked, selected

### Step 6 — Verify all acceptance criteria
Go through every checkbox in the GitHub issue. Test on:
- iPhone 14 (390px) in iOS simulator
- Android emulator
- iPhone SE (375px)

Run: `npx tsc --noEmit` — zero TypeScript errors.

### Step 7 — Commit and push
```bash
git add .
git commit -m "feat(s[NN]): implement [Screen Name]

- [what was built]
- [any design decision made]

Closes #[issue-number]"

git push origin feature/s[NN]-[slug]
```

---

## JSON Server Setup

Ensure `db.json` exists in the project root and the server is running:
```bash
npx json-server --watch db.json --port 3001
```

`db.json` minimum structure:
```json
{
  "users": [],
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

API base URL is read from environment:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## Shared Components to Build First (before any screen)

Build these in `/src/components/ui/` before implementing screens that need them:

| Component | File | Used by |
|-----------|------|---------|
| `PrimaryButton` | `Button.tsx` | S01, S02, S03, S04, S06… |
| `OutlinedButton` | `Button.tsx` | S08, S09, S19 |
| `Card` | `Card.tsx` | S05, S10, S11, S13, S18… |
| `LoadingScreen` | `LoadingScreen.tsx` | All data screens |
| `ErrorScreen` | `ErrorScreen.tsx` | All data screens |
| `ProgressBar` | `ProgressBar.tsx` | S07, S12, S15 |
| `PhaseBadge` | `PhaseBadge.tsx` | S14 |
| `AlertBox` | `AlertBox.tsx` | S12, S13, S17 |
| `StarRating` | `StarRating.tsx` | S11 |
| `SliderRow` | `SliderRow.tsx` | S12, S16 |
| `TrustBadge` | `TrustBadge.tsx` | S13 |
| `AvatarCircle` | `AvatarCircle.tsx` | S13, S19, S20 |

All styles for these components must be extracted from the Stitch design system panel.

---

## Content Constants to Define First

Before implementing S07, S10, S14:
```
/src/constants/
  quizQuestions.ts     ← 30 forced-choice questions + scoring keys (from issue #47)
  obstacleGuide.ts     ← 8 obstacles + insight text + 4 practices each (from issue #54)
  lovepathStages.ts    ← 4 stages + 5 checklist items each (from issue #50)
  insightPool.ts       ← 30+ daily insights (from issue #58)
```

---

## Execution Order

Implement screens in this order (respects dependencies):

```
Phase 1 — Foundation
  S01 Splash → S02 How It Works → S03 Your Situation → S04 Auth

Phase 2 — Core
  S05 Home Dashboard

Phase 3 — Love Languages
  S06 Quiz Intro → S07 Quiz Questions → S08 Results → S09 Partner Comparison

Phase 4 — LovePath & Compatibility
  S10 Stage Tracker → S11 Compatibility → S12 Effort Balance → S13 Trust Circle

Phase 5 — Obstacles
  S14 Obstacle Guide → S15 Daily Practices

Phase 6 — Rebuild
  S16 Contributions → S17 Ego Check

Phase 7 — Everything Else
  S18 Insight Feed → S19 Partner Invite → S20 Profile & Settings
```

Complete each screen fully (all acceptance criteria checked, no TypeScript errors) before starting the next.
