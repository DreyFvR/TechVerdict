# Deploy

Target: Vercel (standard Next.js build, `app/api/chat` as a Node serverless function with `maxDuration` 30 s). This checkout has no Vercel link (`.vercel/`), and the Vercel CLI isn't installed on the Mac, so the live project, URL and deploy method (Git integration or CLI) aren't recorded here yet. Ask the user before deploying.

## Environment

| Variable | Where | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `.env.local` locally (template `.env.example`); Vercel project env for Production/Preview | Required. Server-only. Key from <https://ai.google.dev/>. |

Affiliate IDs are not env vars; they're hardcoded placeholders in `app/components/PhoneComparison.js` and `LaptopComparison.js` (`getAmazonUrl`/`getFlipkartUrl`). Amazon Associates IN tags look like `name-21`.

## Before and after a deploy

Run the `## Verify` steps in `AGENTS.md` first. After deploy, run one smartphone and one laptop comparison on the live URL. A missing key shows as a 500 "GEMINI_API_KEY is not configured".
