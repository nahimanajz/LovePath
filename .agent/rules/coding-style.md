# Coding Style Rules

All code in the LovePath project must follow these rules. These apply to every file an agent creates or modifies.

---

## 1. File & Folder Naming

| Type | Convention | Example |
|------|-----------|---------|
| Screen files | `kebab-case.tsx` | `love-language-quiz.tsx` |
| Component files | `PascalCase.tsx` | `ProgressBar.tsx` |
| Hook files | `camelCase.ts` prefix `use` | `useQuizResults.ts` |
| Utility files | `camelCase.ts` | `computeLanguageScore.ts` |
| Store files | `camelCase.ts` suffix `Store` | `quizStore.ts` |
| Constant files | `camelCase.ts` | `designTokens.ts` |
| Type files | `camelCase.ts` | `userTypes.ts` |

---

## 2. Project Structure

```
/app                        ← Expo Router screens (file-based routing)
  /(auth)
    login.tsx
    signup.tsx
  /(onboarding)
    index.tsx               ← /onboarding/1
    how-it-works.tsx        ← /onboarding/2
    your-situation.tsx      ← /onboarding/3
  /(tabs)
    index.tsx               ← /home (dashboard)
    compatibility.tsx
    obstacles.tsx
    rebuild.tsx
    profile.tsx
  /love-languages
    intro.tsx
    quiz.tsx
    results.tsx
    comparison.tsx
  /lovepath
    stage.tsx
  /effort-balance
    index.tsx
  /trust-circle
    index.tsx
  /practices
    today.tsx
  /rebuild
    contributions.tsx
    ego-check.tsx
  /insights
    index.tsx
  /partner
    invite.tsx

/src
  /components               ← Reusable UI components
    /ui                     ← Primitives (Button, Card, Badge, etc.)
  /hooks                    ← Custom hooks
  /stores                   ← Zustand stores
  /services                 ← API call functions (JSON Server / REST only — no Firebase)
  /types                    ← TypeScript type definitions
  /constants                ← Quiz questions, obstacle data, stage checklists (no design tokens)
  /utils                    ← Pure utility functions
  /config                   ← API base URL, environment config

/knowledge                  ← Project documentation
/.agent/rules               ← Agent workflow and coding rules
/db.json                    ← JSON Server mock database
```

> **Rule:** There is no `src/screens/` directory and no `src/styles/` directory.
> All screens are Expo Router files under `/app`. All styling is NativeWind classes.
> Design tokens (colors, fonts, spacing, radii) come **directly from the Stitch design** — never invented or hardcoded independently.

---

## 3. TypeScript

- **Always use TypeScript.** No `.js` or `.jsx` files.
- Every function must have explicit return types
- Every component must have a typed `Props` interface
- Never use `any` — use `unknown` and narrow the type instead
- Prefer `interface` for object shapes, `type` for unions and aliases

```typescript
// ✅ Correct
interface QuizResultProps {
  primaryLanguage: LoveLanguage;
  scores: LanguageScores;
  onInvitePartner: () => void;
}

export function QuizResult({ primaryLanguage, scores, onInvitePartner }: QuizResultProps): JSX.Element {
  // ...
}

// ❌ Wrong
export function QuizResult(props: any) {
  // ...
}
```

---

## 4. Component Rules

### One component per file
Never define two exported components in the same file.

### Props destructuring
Always destructure props in the function signature.

### No inline styles on components
Use NativeWind classes. Exception: dynamic values (like computed widths) may use the `style` prop.

```typescript
// ✅ Correct
<View className="flex-1 bg-background px-5 pt-6">

// ❌ Wrong
<View style={{ flex: 1, backgroundColor: '#FAF9F6', paddingHorizontal: 20 }}>
```

### Screen components
Every screen component must be the default export of its file.

```typescript
export default function LoveLanguageQuiz(): JSX.Element {
  return (...)
}
```

---

## 5. NativeWind / Tailwind Classes

**All color, font, spacing, and radius values must be extracted from the Stitch design for the screen being implemented.** The table below shows the NativeWind token names to use — but the actual hex values are always confirmed by inspecting the Stitch frame, not invented from memory.

| Token | NativeWind class | Source |
|-------|-----------------|--------|
| Primary rose | `bg-primary` / `text-primary` / `border-primary` | Stitch primary color |
| Secondary purple | `bg-secondary` / `text-secondary` | Stitch secondary color |
| Teal | `bg-teal` / `text-teal` | Stitch tertiary color |
| Amber | `bg-amber` / `text-amber` | Stitch warning/will color |
| App background | `bg-background` | Stitch canvas background |
| Card surface | `bg-card` | Stitch card fill |
| Text primary | `text-foreground` | Stitch body text color |
| Text muted | `text-muted` | Stitch caption/subtitle color |
| Border | `border-border` | Stitch card/input border color |
| Card radius | `rounded-2xl` | Stitch card corner radius |
| Button radius | `rounded-full` | Stitch button shape |

> If a color or style in the Stitch design does not have a named token, add it to `tailwind.config.js` before using it. Never pass raw hex strings inline in components.

---

## 6. API Calls

All API calls go through the service layer in `/src/services/`.

```typescript
// /src/services/quizService.ts

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function submitQuizResults(results: QuizSubmission): Promise<QuizResult> {
  const response = await fetch(`${BASE_URL}/quizResults`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results),
  });

  if (!response.ok) {
    throw new Error(`Quiz submission failed: ${response.status}`);
  }

  return response.json() as Promise<QuizResult>;
}
```

**Rules:**
- Never call `fetch` directly inside a component
- Always handle loading, error, and success states
- Never hardcode the API base URL — use `process.env.EXPO_PUBLIC_API_URL`

---

## 7. State Management (Zustand)

```typescript
// /src/stores/quizStore.ts

import { create } from 'zustand';

interface QuizStore {
  answers: Record<number, LanguageKey>;
  currentQuestion: number;
  setAnswer: (questionId: number, language: LanguageKey) => void;
  nextQuestion: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  answers: {},
  currentQuestion: 1,
  setAnswer: (questionId, language) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: language } })),
  nextQuestion: () =>
    set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
  reset: () => set({ answers: {}, currentQuestion: 1 }),
}));
```

---

## 8. Constants — Quiz Questions & Content

All quiz questions, obstacle texts, checklist items, and insight pool content are defined as constants — **not hardcoded in components**.

```
/src/constants/
  quizQuestions.ts        ← All 30 love language questions
  obstacleGuide.ts        ← All 8 obstacles with insight text + practices
  lovepathStages.ts       ← All 4 stage checklists
  insightPool.ts          ← All 15+ insights for the feed
```

> **No `designTokens.ts`.** Design tokens live in `tailwind.config.js` and are sourced from the Stitch design — not from a separate constants file.

---

## 9. Error Handling

Every screen must handle three states:

```typescript
if (isLoading) return <LoadingScreen />;
if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;
return <ActualScreen data={data} />;
```

Never show a blank screen. Never swallow errors silently.

---

## 10. Navigation

Use Expo Router's typed navigation. Never use `navigation.navigate('ScreenName')` with string literals.

```typescript
import { router } from 'expo-router';

// ✅ Correct
router.push('/love-languages/quiz');
router.replace('/home');
router.back();

// ❌ Wrong
navigation.navigate('LoveLanguageQuiz');
```

---

## 11. Commits

Follow Conventional Commits:

```
feat(s07): add all 30 quiz questions with scoring
fix(s09): correct bar width calculation for comparison table
style(s05): align dashboard card grid to design spec
refactor(s12): extract slider row into reusable component
chore: update db.json with insight pool content
```

Format: `type(scope): description`

Types: `feat` | `fix` | `style` | `refactor` | `chore` | `docs` | `test`

Scope: use the screen code (s01–s20) or a module name.

---

## 12. What NOT to Do

| ❌ Never do this | ✅ Do this instead |
|-----------------|-------------------|
| Use `any` type | Type everything explicitly |
| Invent colors or spacing | Extract from the Stitch design |
| Hardcode raw hex in components | Define token in `tailwind.config.js` first |
| Use Firebase | Use JSON Server (dev) / REST API (prod) |
| Put screens in `src/screens/` | Screens live in `/app` only |
| Create `src/styles/` files | Style with NativeWind classes |
| Call fetch in a component | Use a service function |
| Commit directly to `main` | Always use a feature branch |
| Mix two screens in one branch | One branch per screen / issue |
| Mark issue Done before PR merge | Wait for merge confirmation |
| Use string literals in navigation | Use `router.push('/path')` |
| Write logic inside JSX | Extract to a utils/ function or hook |
| Write file exceeds 200 lines| Create new components|
