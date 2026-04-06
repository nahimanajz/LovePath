# LovePath

A mobile application that helps couples and individuals build healthier, more self-aware relationships — grounded in the frameworks of Joe Beam, Ryan Holiday, and Gary Chapman.

---

## Quick Links

| Resource | Location |
|----------|----------|
| GitHub Issues (what to build) | https://github.com/nahimanajz/lovepath/issues |
| Project Board (workflow state) | https://github.com/nahimanajz/lovepath/projects |
| Project overview | [`/knowledge/project-overview.md`](./knowledge/project-overview.md) |
| Source of truth | [`/knowledge/source-of-truth.md`](./knowledge/source-of-truth.md) |
| Design system | [`/knowledge/design-system.md`](./knowledge/design-system.md) |
| Agent workflow | [`.agent/rules/workflow.md`](./.agent/rules/workflow.md) |
| Coding style | [`.agent/rules/coding-style.md`](./.agent/rules/coding-style.md) |
| Implementation guide | [`.agent/rules/implementation-guide.md`](./.agent/rules/implementation-guide.md) |
| Git & GitHub rules | [`.agent/rules/git-github.md`](./.agent/rules/git-github.md) |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start JSON Server (mock backend)
```bash
npx json-server --watch db.json --port 3001
```

### 3. Start the app
```bash
npx expo start
```

---

## For AI Agents

If you are an AI agent implementing a feature, start here:

1. **Read** `/.agent/rules/workflow.md` — the 7-step process you must follow
2. **Find** the GitHub issue for the screen you are implementing (S01–S20)
3. **Open** the matching Stitch design frame
4. **Create** a feature branch: `feature/s[NN]-[slug]`
5. **Move** the issue to `In Progress` on the project board
6. **Build** following `/.agent/rules/coding-style.md`
7. **Verify** against acceptance criteria, then open a PR
8. **After merge**: delete branch, move issue to `Done`

Never start coding without reading the GitHub issue and the Stitch design first.

---

## Project Structure

```
/app                  ← Expo Router screens
/src
  /components         ← Reusable UI components
  /hooks              ← Custom hooks
  /stores             ← Zustand state stores
  /services           ← API service functions
  /types              ← TypeScript types
  /constants          ← Quiz questions, obstacle data, design tokens
  /utils              ← Utility functions
/knowledge            ← Project documentation
/.agent/rules         ← AI agent workflow and coding rules
/db.json              ← JSON Server mock database
```

---

## The Three Books

| Book | Author | What it drives in the app |
|------|--------|--------------------------|
| *The Art of Falling in Love* | Joe Beam | LovePath stages, compatibility ratings, effort balance, trust circle |
| *The Obstacle Is the Way* | Ryan Holiday | Obstacle guide (Perception/Action/Will), daily practices, ego check |
| *The Five Love Languages* | Gary Chapman | 30-question quiz, language results, partner comparison |
