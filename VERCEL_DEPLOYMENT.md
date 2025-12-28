# Vercel Deployment Guide - Phone Comparison Chatbot

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Create `.env.local` in your project root:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - Affiliate IDs (can be hardcoded instead)
NEXT_PUBLIC_AMAZON_AFFILIATE_ID=youraffid-21
NEXT_PUBLIC_FLIPKART_AFFILIATE_ID=youraffiliate
```

**Get Gemini API Key**:
1. Go to https://ai.google.dev/
2. Sign in with Google account
3. Create a new API key
4. Copy the key

### 2. Update Affiliate Links (If Not Using Env Vars)

Edit `app/components/PhoneComparison.js` (lines 13 & 18):
```javascript
// Replace these with your actual affiliate IDs
return `https://www.amazon.in/s?k=${searchQuery}&tag=YOUR_AMAZON_ID`;
return `https://www.flipkart.com/search?q=${searchQuery}&affid=YOUR_FLIPKART_ID`;
```

### 3. Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test the app at http://localhost:3000
```

**Test these features**:
- ✅ Phone comparison works
- ✅ New chat button creates new chat
- ✅ Chats save to sidebar
- ✅ Amazon/Flipkart links work
- ✅ Comparison displays correctly

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit - Phone comparison chatbot"
git branch -M main
git remote add origin https://github.com/yourusername/phone-comparison-chatbot.git
git push -u origin main
```

2. **Import to Vercel**:
   - Go to https://vercel.com/
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your key
   - Add optional affiliate IDs if using env vars

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Get your live URL: `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? phone-comparison-chatbot
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add GEMINI_API_KEY
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Compare phones (try: "iPhone 15 vs Samsung S24")
- [ ] Purchase links work
- [ ] Chat saves to localStorage
- [ ] New chat button works

### 2. Custom Domain (Optional)

In Vercel dashboard:
1. Go to Settings → Domains
2. Add your domain (e.g., `phonecompare.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### 3. Performance Optimization

Vercel automatically optimizes:
- ✅ Edge caching
- ✅ Image optimization
- ✅ Compression
- ✅ CDN distribution

### 4. Monitor Usage

**Gemini API**:
- Free tier: Check usage at https://ai.google.dev/
- Monitor daily quota
- Set up billing alerts if needed

**Vercel**:
- Free tier includes:
  - 100 GB bandwidth/month
  - Unlimited requests
  - 100 GB hours/month

## Troubleshooting

### Issue: "GEMINI_API_KEY is not defined"

**Solution**:
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add `GEMINI_API_KEY`
4. Redeploy: Deployments → ⋯ → Redeploy

### Issue: Chat history not saving

**Solution**: This is normal! localStorage is client-side only.
- Each user's chats save in their browser
- Chats persist across sessions
- Clearing browser data clears chats

### Issue: Build fails

**Check**:
```bash
# Test build locally first
npm run build

# If successful, redeploy to Vercel
vercel --prod
```

**Common fixes**:
- Remove unused imports
- Fix TypeScript errors
- Check Node version (18.x recommended)

### Issue: Comparison not displaying

**Debug**:
1. Open browser console (F12)
2. Check for errors
3. Verify API response in Network tab
4. Check Vercel logs in dashboard

## Performance Tips

### 1. Enable Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Add Speed Insights
```bash
npm install @vercel/speed-insights

# Add to layout
import { SpeedInsights } from '@vercel/speed-insights/next';
```

### 3. Optimize Images
Already handled by Next.js Image component!

### 4. Caching Strategy
API responses are automatically cached by Vercel Edge.

## Scaling

### Free Tier Limits
- **Bandwidth**: 100 GB/month
- **Executions**: Unlimited
- **Build time**: 6000 minutes/month

### If You Exceed Free Tier
- **Pro Plan**: $20/month
  - 1 TB bandwidth
  - Priority support
  - Advanced analytics

### For High Traffic
1. **Enable ISR** (Incremental Static Regeneration)
2. **Add caching headers**
3. **Use Vercel Edge Functions**

## Security Best Practices

### 1. Never Commit .env Files
```bash
# Already in .gitignore, but verify:
echo ".env.local" >> .gitignore
```

### 2. Rotate API Keys Regularly
- Gemini API: Generate new key every 90 days
- Update in Vercel dashboard

### 3. Rate Limiting
Add to `app/api/chat/route.js`:
```javascript
// Simple rate limiting (for production, use Redis)
const requestCounts = new Map();

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const count = requestCounts.get(ip) || 0;

  if (count > 50) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  requestCounts.set(ip, count + 1);
  setTimeout(() => requestCounts.delete(ip), 60000); // Reset after 1 min

  // ... rest of your code
}
```

## Maintenance

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Redeploy
vercel --prod
```

### Monitor Errors
- Check Vercel dashboard → Logs
- Set up error tracking (e.g., Sentry)

### Backup Data
- Export chat history feature (future enhancement)
- Database backup if you add one later

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Gemini API Docs**: https://ai.google.dev/docs

## Costs Breakdown

### Free Forever
- Vercel Hobby plan
- Gemini API (within limits)
- localStorage (browser-based)

### Optional Paid
- Custom domain: ~$10-15/year
- Vercel Pro: $20/month (if needed)
- Gemini API: Pay-as-you-go (only if exceeding free tier)

---

**You're ready to deploy!** 🚀

Run `vercel --prod` or push to GitHub and import to Vercel!
