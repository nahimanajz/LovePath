# Agent Implementation Guide

This document is the practical reference for an AI agent implementing any LovePath screen. Read this alongside `workflow.md` (the steps) and `coding-style.md` (the rules).

---

## Before You Start Any Screen

Answer these three questions:

1. **Have I read the full GitHub issue?**
   → `/knowledge/source-of-truth.md` § GitHub Issues
2. **Have I opened the Stitch frame for this screen?**
   → `/knowledge/source-of-truth.md` § Stitch Designs
3. **Is JSON Server running?**
   → `npx json-server --watch db.json --port 3001`

If any answer is No — stop and do that first.

---

## How to Read a GitHub Issue

Open the issue and extract this information before touching code:

```
Route:          What is the screen's URL path?
Components:     What UI components does this screen need?
Data needed:    What data does this screen read and write?
API endpoints:  Which JSON Server routes does it call?
States:         What are the loading / empty / error states?
Navigation:     Where does this screen navigate to and from?
Acceptance:     What must be true before this is "done"?
```

Write these down before you start. This prevents mid-implementation surprises.

---

## Screen Implementation Checklist

Use this as a running checklist as you build each screen:

### Setup
- [ ] Branch created: `feature/s[NN]-[slug]`
- [ ] Issue moved to **In Progress** on GitHub project board
- [ ] Screen file created at correct Expo Router path
- [ ] Screen added to navigation (tab bar or stack)

### Layout
- [ ] All components from the issue are present
- [ ] Layout matches the Stitch design (top to bottom)
- [ ] Colors, fonts, spacing, and radii extracted from the Stitch frame — not invented
- [ ] All values defined as NativeWind tokens in `tailwind.config.js` before use
- [ ] No raw hex strings or hardcoded pixel values inline in components
- [ ] All text content matches the issue specification exactly

### States
- [ ] Loading state implemented (`<LoadingScreen />`)
- [ ] Error state implemented (`<ErrorScreen />`)
- [ ] Empty state implemented (if applicable)
- [ ] All interactive states: pressed, disabled, selected, checked

### Data
- [ ] All reads call the correct JSON Server endpoint via service function
- [ ] All writes call the correct JSON Server endpoint via service function
- [ ] No `fetch` calls inside the component
- [ ] Data persists correctly (survives app reload)

### Navigation
- [ ] Back navigation works
- [ ] Forward navigation (CTAs) works
- [ ] Bottom tab bar shows correct active state (if screen is a tab)

### Book Content
- [ ] If screen includes book-derived text (insights, obstacle text, checklist items, quiz questions), verify the content against the GitHub issue — every item must be present
- [ ] No placeholder text ("Lorem ipsum", "Coming soon") in final implementation

### Quality
- [ ] Tested on iOS simulator (iPhone 14, 390px)
- [ ] Tested on Android emulator
- [ ] Tested on small screen (iPhone SE, 375px)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint errors

### PR Ready
- [ ] All acceptance criteria checked
- [ ] Screenshots attached to PR
- [ ] PR body includes `Closes #[issue-number]`
- [ ] Commit messages follow Conventional Commits

---

## Screen-Specific Notes

### S07 — Love Language Quiz
The quiz has **30 forced-choice questions**. Every question and its scoring key (which love language each option maps to) is defined in `/src/constants/quizQuestions.ts`. Do not hardcode questions in the component. The scoring algorithm:
1. Tally how many times each language letter (W/Q/G/S/T) was selected
2. The highest count = primary language
3. Second highest = secondary language
4. Store all 5 counts + primary + secondary to the user profile

### S10 — LovePath Stage Tracker
There are **4 stages**, each with **5 checklist items** (defined in `/src/constants/lovepathStages.ts`). Stage advances when all 5 items are checked — show a confirmation dialog before advancing. Do not auto-advance silently.

### S13 — Trust Circle
The trust status badge is computed automatically:
- Gap 0–1: `Mutual` (green)
- Gap 2: `Watch` (amber)
- Gap ≥ 3: `One-sided` (red)

Gap = `yourInvestment - theirInvestment`. Alert box appears for every `One-sided` person.

### S14 — Obstacle Guide
All 8 obstacles are defined in `/src/constants/obstacleGuide.ts` with:
- Phase (perception / action / will)
- Title
- Full insight text (from the GitHub issue)
- 4 practice items

Practices reset daily at midnight. A practice checked today should still show as checked if the user revisits the screen before midnight.

### S12 — Effort Balance
Sliders reset every Monday. The balance percentage is computed as:
```
userTotal = sum of all 5 user slider values
partnerTotal = sum of all 5 partner slider values
grandTotal = userTotal + partnerTotal
userPercent = round(userTotal / grandTotal * 100)
```

Status:
- Within 10% of 50/50 → Balanced (green)
- 10–20% gap → Slight imbalance (amber)
- > 20% gap → Significant imbalance (red)

---

## JSON Server Quick Reference

```bash
# Start the server
npx json-server --watch db.json --port 3001

# Read all users
GET http://localhost:3001/users

# Read single user
GET http://localhost:3001/users/1

# Create a quiz result
POST http://localhost:3001/quizResults
Body: { "userId": 1, "primary": "Q", "scores": {...} }

# Update effort balance
PATCH http://localhost:3001/effortBalance/1
Body: { "init_user": 7, "init_partner": 4 }

# Add trust circle person
POST http://localhost:3001/trustCircle
Body: { "userId": 1, "name": "Kofi", "role": "Friend", "theirInvestment": 2, "yourInvestment": 4 }
```

All JSON Server routes support: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

Filter by field: `GET /trustCircle?userId=1`
Sort: `GET /insights?_sort=createdAt&_order=desc`
Paginate: `GET /insights?_page=1&_limit=10`

---

## Design Token Quick Reference

```typescript
// /src/constants/designTokens.ts

export const colors = {
  primary: '#C0556A',
  secondary: '#7F77DD',
  teal: '#1D9E75',
  amber: '#EF9F27',
  background: '#FAF9F6',
  card: '#FFFFFF',
  foreground: '#1A1A1A',
  muted: '#888780',
  border: '#E8E6E0',
  danger: '#E24B4A',
  // Tints
  roseTint: '#FDE8EC',
  purpleTint: '#EEEDFE',
  tealTint: '#E1F5EE',
  amberTint: '#FAEEDA',
  redTint: '#FCEBEB',
} as const;

export const radius = {
  card: 16,
  button: 50,
  input: 12,
  pill: 20,
  badge: 4,
} as const;

export const spacing = {
  screenPadding: 20,
  cardPadding: 16,
  gap: 12,
} as const;
```

---

## Common Components to Reuse

Before building a UI element from scratch, check if it already exists in `/src/components/ui/`:

| Component | File | Use for |
|-----------|------|---------|
| `PrimaryButton` | `Button.tsx` | Rose filled CTA button |
| `OutlinedButton` | `Button.tsx` | Rose outlined secondary action |
| `Card` | `Card.tsx` | White surface with shadow |
| `ProgressBar` | `ProgressBar.tsx` | Horizontal fill bar |
| `PhaseBadge` | `PhaseBadge.tsx` | Perception / Action / Will colored pill |
| `StarRating` | `StarRating.tsx` | 5-star tap rating |
| `SliderRow` | `SliderRow.tsx` | Labeled slider with numeric readout |
| `AvatarCircle` | `AvatarCircle.tsx` | Initials circle with color |
| `TrustBadge` | `TrustBadge.tsx` | Mutual / Watch / One-sided pill |
| `AlertBox` | `AlertBox.tsx` | Colored alert with icon and text |
| `LoadingScreen` | `LoadingScreen.tsx` | Full-screen loading state |
| `ErrorScreen` | `ErrorScreen.tsx` | Full-screen error with retry |

If a component does not exist yet, build it as a reusable component in `/src/components/ui/` before using it in the screen.
