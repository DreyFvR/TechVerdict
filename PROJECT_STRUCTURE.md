# Phone Comparison Chatbot - Project Structure

Clean and organized file structure for the phone comparison chatbot.

## Core Files

```
chatbot/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.js              # Main AI chat endpoint (Gemini API)
│   │   └── utils/
│   │       ├── imageAPI.js           # Phone image fetching logic
│   │       └── phoneImageDatabase.js # Static image URL database
│   ├── components/
│   │   └── PhoneComparison.js        # Comparison display component
│   ├── globals.css                   # All styles (dark ChatGPT theme)
│   ├── layout.tsx                    # Root layout
│   └── page.js                       # Main chat interface
│
├── public/                            # Static assets (empty for now)
│
├── AFFILIATE_LINKS_SETUP.md          # Guide for Amazon/Flipkart affiliate setup
├── IMAGE_SETUP_GUIDE.md              # Guide for adding phone images
├── VERCEL_DEPLOYMENT.md              # Deployment instructions
├── README.md                         # Original Next.js README
│
├── .env.local                        # Environment variables (not in git)
├── .env.local.example                # Example env file
│
└── [Config files]
    ├── next.config.ts                # Next.js configuration
    ├── tsconfig.json                 # TypeScript config
    ├── package.json                  # Dependencies
    └── eslint.config.mjs             # ESLint config
```

## Key Features

### 1. Chat Interface (`app/page.js`)
- Dark ChatGPT-style UI
- Sidebar with chat history
- Search functionality
- localStorage-based persistence

### 2. AI Backend (`app/api/chat/route.js`)
- Google Gemini AI integration
- Specialized for phone comparisons
- JSON response format
- Indian market focus

### 3. Phone Images (`app/api/utils/`)
- **imageAPI.js**: Fetches images from database
- **phoneImageDatabase.js**: Static image mappings
- Shows images only if BOTH phones have entries

### 4. Comparison Display (`app/components/PhoneComparison.js`)
- Side-by-side comparison UI
- 7 comparison categories
- Amazon/Flipkart purchase links
- Warning banner for unreleased phones
- Pros/cons and verdict sections

## What Was Removed

Cleaned up unnecessary files from development:
- ❌ `app/api/chat.js` - Old unused API file
- ❌ `app/api/utils/priceAPI.js` - Placeholder, not implemented
- ❌ Fallback image code - Simplified to database-only approach

## Environment Variables

Required in `.env.local`:
- `GEMINI_API_KEY` - Google Gemini API key (required)

Optional:
- `NEXT_PUBLIC_AMAZON_AFFILIATE_ID` - Amazon affiliate ID
- `NEXT_PUBLIC_FLIPKART_AFFILIATE_ID` - Flipkart affiliate ID

## Next Steps

1. **Add Phone Images**: Follow [IMAGE_SETUP_GUIDE.md](IMAGE_SETUP_GUIDE.md)
2. **Setup Affiliates**: Follow [AFFILIATE_LINKS_SETUP.md](AFFILIATE_LINKS_SETUP.md)
3. **Deploy**: Follow [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

## File Sizes

- Total core files: ~15 files (excluding node_modules, .next)
- Main CSS: 17KB
- Main chat interface: 12KB
- AI route handler: 7KB
- Clean and minimal!
