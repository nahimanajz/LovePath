# Git & GitHub Project Board Rules

---

## Branch Strategy

LovePath uses a simple **feature branch workflow**:

```
main
 └── feature/s[NN]-[slug]   ← one per screen / issue
```

### Rules

1. **`main` is always deployable.** Never commit broken code to `main`.
2. **One branch per GitHub issue.** Never work on two screens in the same branch.
3. **Branch from `main`.** Never branch from another feature branch.
4. **Delete branches after merge.** Feature branches have a lifespan — they are created when work starts and deleted after the PR is merged.

---

## Branch Naming

```
feature/s[NN]-[short-description-in-kebab-case]
```

| Issue | Branch name |
|-------|-------------|
| [S01] Splash Screen | `feature/s01-splash` |
| [S07] Love Language Quiz Questions | `feature/s07-love-language-quiz` |
| [S12] Effort Balance Tracker | `feature/s12-effort-balance` |
| [S14] Obstacle Guide | `feature/s14-obstacle-guide` |

---

## Creating a Branch

```bash
# Always start from latest main
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feature/s[NN]-[slug]
```

---

## Committing

Follow Conventional Commits format:

```
type(scope): short description (max 72 chars)

Optional longer explanation if needed.

Closes #[issue-number]
```

### Types

| Type | Use when |
|------|----------|
| `feat` | Adding a new screen, component, or feature |
| `fix` | Fixing a bug |
| `style` | UI changes that don't affect behaviour |
| `refactor` | Restructuring code without changing behaviour |
| `chore` | Config, dependencies, tooling |
| `docs` | Documentation only |
| `test` | Tests only |

### Scope

Use the screen code (`s01`–`s20`) or a module name (`quiz`, `api`, `nav`).

### Examples

```bash
git commit -m "feat(s07): implement all 30 quiz questions with language scoring"
git commit -m "feat(s09): add partner comparison screen with match score"
git commit -m "fix(s12): correct effort balance calculation when both values are zero"
git commit -m "style(s05): align pillar card grid to Stitch design"
git commit -m "chore: add quiz question constants to src/constants"
```

---

## Opening a Pull Request

### PR Title
```
[S0N] Screen Name — brief action
```
Examples:
- `[S07] Love Language Quiz — implement 30-question flow`
- `[S14] Obstacle Guide — all 8 obstacles with Stoic insights`

### PR Body Template

```markdown
## What this PR does
[1–3 sentences describing what was built]

## Linked issue
Closes #[issue-number]

## Screenshots
| iOS | Android |
|-----|---------|
| [screenshot] | [screenshot] |

## Acceptance criteria
- [ ] Copy each criterion from the GitHub issue and check it here

## Notes / deviations from design
[If anything differs from the Stitch design, explain why here]
```

---

## Merging Rules

- PRs require passing CI (TypeScript check + ESLint)
- All acceptance criteria in the PR body must be checked
- Screenshots must be attached
- The PR must have `Closes #N` so the issue auto-closes on merge

---

## After Merge

```bash
# Switch back to main and pull the merged code
git checkout main
git pull origin main

# Delete the local feature branch
git branch -d feature/s[NN]-[slug]

# The remote branch should be deleted automatically (if auto-delete is configured)
# If not, delete it manually:
git push origin --delete feature/s[NN]-[slug]
```

---

## GitHub Project Board

The project board has three columns:

```
┌─────────────┐   ┌──────────────┐   ┌──────────┐
│    Todo     │   │ In Progress  │   │   Done   │
│             │   │              │   │          │
│  [S01] ...  │   │  [S07] ...   │   │  [S04].. │
│  [S02] ...  │   │              │   │          │
│  [S03] ...  │   │              │   │          │
│  ...        │   │              │   │          │
└─────────────┘   └──────────────┘   └──────────┘
```

### State Transitions

| From | To | Trigger |
|------|----|---------|
| `Todo` | `In Progress` | Feature branch created |
| `In Progress` | `Done` | PR merged to `main` |

### Rules

- **Maximum 2 issues In Progress at any time.** Focus on one screen at a time.
- **Never skip states.** An issue must pass through `In Progress` before `Done`.
- **Never manually set `Done`** before the PR is merged. The merge closes the issue automatically via `Closes #N`.
- If an issue is blocked, leave it in `In Progress` and add a comment explaining the blocker.

---

## Protection Rules (configure in GitHub Settings)

Recommended branch protection for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass (TypeScript, ESLint)
- ✅ Require branches to be up to date before merging
- ✅ Delete head branches automatically after merge
- ❌ Do not allow force pushes to `main`
- ❌ Do not allow direct commits to `main`
