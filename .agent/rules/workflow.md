# Agent Workflow Rules

This file defines the exact sequence an AI agent (Claude) must follow when implementing any feature in the LovePath project. Follow every step in order — do not skip steps.

---

## The 7-Step Implementation Workflow

### Step 1 — Read the GitHub Issue

Before writing a single line of code:

1. Open the GitHub issue for the screen you are implementing
   - URL pattern: `https://github.com/nahimanajz/lovepath/issues`
   - Find the issue titled `[S0N] Screen Name`
2. Read the **entire** issue body including:
   - Purpose
   - Book context
   - Layout specification (every component)
   - All questions / checklist items / obstacle texts if present
   - Data / API section
   - Acceptance criteria
3. Do not begin implementation until the issue is fully read and understood

**Move the issue from `Todo` → `In Progress` on the GitHub project board.**

---

### Step 2 — Read the Stitch Design

Stitch is the **authoritative visual source**. All colors, fonts, spacing, padding, border radii, and component styles must be extracted from the Stitch frame — never assumed or invented.

1. Open Stitch (`https://stitch.withgoogle.com/projects/2770586918123854384`) via the Playwright MCP
2. Locate and screenshot the frame named `[S0N] Screen Name`
3. Extract and record from the screenshot:
   - Background color or gradient (start/end values)
   - All colors used: fills, text, borders, icons
   - Typography: font family, size, weight, line height per text element
   - Spacing: screen padding, card padding, gap between components
   - Border radii: cards, buttons, inputs, pills, badges
   - Shadows/elevation on surfaces
   - All interactive states visible in the design (pressed, disabled, error, empty)
4. Before writing any component, register extracted values as named tokens in `tailwind.config.js`
5. If a state exists in the issue but not in Stitch — implement it using the closest design system default
6. If a state exists in Stitch but not in the issue — implement it as designed

---

### Step 3 — Create a Git Branch

Branch naming convention:

```
feature/s[NN]-[short-slug]
```

Examples:
```
feature/s07-love-language-quiz
feature/s12-effort-balance
feature/s14-obstacle-guide
```

Commands:
```bash
git checkout main
git pull origin main
git checkout -b feature/s[NN]-[short-slug]
```

---

### Step 4 — Implement the Screen

Follow the coding style rules in `/.agent/rules/coding-style.md`.

Implementation order per screen:
1. Create the screen file at the correct Expo Router path under `/app` (see issue for route)
2. Register any new colors, fonts, spacing, or radii from the Stitch screenshot into `tailwind.config.js`
3. Build the static layout first (no data, no logic) using NativeWind token classes
4. Wire up navigation (in/out)
5. Connect to JSON Server endpoints via service functions (see issue — Data/API section)
6. Add loading, error, and empty states
7. Implement all interactive states (taps, toggles, sliders, checkboxes)

> **Never use Firebase.** All data goes through `/src/services/` → JSON Server REST API.
> **Never put screens in `src/screens/`** — screens live exclusively in `/app`.

---

### Step 5 — Verify Against Acceptance Criteria

Open the GitHub issue. Go through every checkbox in the **Acceptance Criteria** section.

For each item:
- Test on both iOS simulator and Android emulator
- Check on small screen (iPhone SE, 375px) and standard screen (390px)
- If an item cannot be checked off — fix it before proceeding

Do not submit a PR with unchecked acceptance criteria unless a GitHub comment explains why.

---

### Step 6 — Open a Pull Request

```bash
git add .
git commit -m "feat(s[NN]): implement [Screen Name]

- [brief bullet of what was built]
- [any notable decision made]

Closes #[issue-number]"

git push origin feature/s[NN]-[short-slug]
```

PR title format:
```
[S0N] Screen Name — brief description
```

PR body must include:
- Link to the GitHub issue: `Closes #N`
- Screenshots of the implemented screen (iOS + Android)
- Any deviations from the design (with reason)
- Acceptance criteria checklist copy-pasted and checked

---

### Step 7 — After Merge

Once the PR is merged into `main`:

1. **Delete the feature branch** (GitHub does this automatically if configured, or do it manually)
2. **Move the GitHub issue from `In Progress` → `Done`**
3. Pull the latest `main` locally:
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/s[NN]-[short-slug]
   ```

---

## Branch Lifecycle Summary

```
main (stable)
  │
  ├─ feature/s01-splash          ← created when issue moves to In Progress
  │       │
  │       └─ PR merged → branch deleted → issue moves to Done
  │
  ├─ feature/s07-love-language-quiz
  │       │
  │       └─ PR merged → branch deleted → issue moves to Done
  ...
```

**Rule:** Only one branch per issue. Never work on two screens in the same branch.

---

## Issue Board State Rules

| State | When to set it |
|-------|---------------|
| `Todo` | Default state for all new issues |
| `In Progress` | Set when you create the feature branch (Step 3) |
| `Done` | Set only after the PR is merged to `main` (Step 7) |

Never set `Done` manually before the merge. Never leave an issue in `In Progress` with no open PR or active branch.

---

## What to Do When Requirements Are Unclear

1. Re-read the GitHub issue carefully — the answer is usually there
2. Check the Stitch design — visual decisions often resolve ambiguity
3. Check `/knowledge/source-of-truth.md` for guidance
4. If still unclear: leave a comment on the GitHub issue describing the ambiguity before proceeding
