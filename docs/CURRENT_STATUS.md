# Current status

## Works

- Two-product comparisons for smartphones and laptops (Indian market, INR prices from model knowledge), with verdict, per-category specs, pros/cons and Amazon.in/Flipkart search links.
- Laptop geek mode: a follow-up request for real-world performance metrics.
- Chat history with search in a sidebar, stored per browser (`localStorage`).
- Errors come back as JSON: 400 empty message, 413 over 1200 characters, 408 model timeout, 500 missing key or model failure.

## Placeholders and known gaps

- Affiliate IDs are placeholders (`tag=youraffid-21`, `affid=youraffiliate`) in both comparison components. There is no affiliate disclosure text yet, which Amazon Associates requires before going live.
- Live pricing isn't implemented: `fetchIndianPricing` in `route.js` returns `available: false`, so prices come from the model.
- The phone image database has one entry (`iphone 15`). Images show only when both phones have entries, so almost never. Laptops have no images.
- Product names for the image lookup come from `extractProductNames` (regex over the user message).
- No rate limiting on `/api/chat`, so Gemini quota is exposed to anyone who can reach the site.
- Unused dependencies: `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@google/genai` (only `@google/generative-ai` is imported). The package is still named `chatbot`.
- No automated tests.
