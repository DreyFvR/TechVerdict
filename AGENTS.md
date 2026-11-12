# TechVerdict

"TechVerdict AI": a Next.js 16 (App Router, React 19) chat app that compares two smartphones or two laptops for Indian buyers using Gemini, with Amazon.in/Flipkart purchase links. Repo `DreyFvR/TechVerdict`. It has no database or accounts: chat history lives in the browser.

Follow the workspace `../AGENTS.md` (Checkpoint workflow: no commits or pushes unless told).

## How it works

- `app/page.js` (client) posts `{ message, category: "smartphone" | "laptop", geekMode }` to `POST /api/chat` and renders the reply with `PhoneComparison` or `LaptopComparison`. Chats are saved in `localStorage` under `techVerdictChats` (last 30; falls back to the legacy key `phoneComparisonChats` when the new key is empty).
- `app/api/chat/route.js` (Node runtime, `maxDuration` 30 s, 25 s model timeout) builds the prompt from `app/api/utils/phonePrompt.js` or `laptopPrompt.js` and calls `gemini-2.5-flash` via `@google/generative-ai` with `responseMimeType: application/json`. It parses the JSON and, for phones, attaches images from `phoneImageDatabase.js`, but only when **both** phones have an entry.
- Geek mode (laptops only) asks the model for a `geekDetails` object (FPS, render times, thermals, battery).
- The response JSON shape is a contract between the prompt files and the comparison components. Change them together.

## Rules

- `GEMINI_API_KEY` stays server-side (read only in `route.js`). Never expose it through `NEXT_PUBLIC_*` or client code, and never commit `.env*`.
- Messages over 1200 characters are rejected (413). Keep input limits when changing the route.
- Affiliate links are built in `getAmazonUrl`/`getFlipkartUrl` in both comparison components, and use placeholder IDs. Change both components together.
- Update the matching doc in the same change as the behavior it describes. Docs state current truth only; git holds history.

## Commands

```bash
npm run dev          # http://localhost:3000, needs .env.local with GEMINI_API_KEY
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (next config)
npm run build        # next build
```

## Verify

Every change must pass these; there are no automated tests, and lint's 4 known `no-unused-vars` warnings in `app/page.js` (unfinished UI rework) must not grow.

```bash
npm run typecheck
npm run lint
npm run build
```

## Code map

| Path | Contents |
|---|---|
| `app/page.js` | Chat UI: sidebar history + search, category toggle, templates, geek-mode follow-up |
| `app/layout.tsx`, `app/globals.css` | Metadata ("TechVerdict AI") and all styles (Tailwind 4 + custom CSS) |
| `app/components/` | `PhoneComparison`, `LaptopComparison` (verdict, specs, pros/cons, buy links), `CategorySelector` |
| `app/api/chat/route.js` | The only API route |
| `app/api/utils/` | `phonePrompt`, `laptopPrompt` (system prompts + JSON schema), `imageAPI` + `phoneImageDatabase` (static image URLs) |

## Docs: read only what the task needs

| Read | When |
|---|---|
| `docs/CURRENT_STATUS.md` | Before feature work: what exists, known gaps and placeholders |
| `docs/DEPLOY.md` | Deploying, env vars, affiliate IDs |
