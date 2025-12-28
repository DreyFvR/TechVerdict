# Affiliate Links Setup Guide

## Overview
Your phone comparison chatbot now includes purchase links to Amazon India and Flipkart. These links are automatically generated for each phone in the comparison.

## Current Implementation

### Location
The purchase links are in: `app/components/PhoneComparison.js`

### Default URLs (Lines 11-19)
```javascript
const getAmazonUrl = (phoneName) => {
  const searchQuery = encodeURIComponent(phoneName);
  return `https://www.amazon.in/s?k=${searchQuery}&tag=youraffid-21`;
};

const getFlipkartUrl = (phoneName) => {
  const searchQuery = encodeURIComponent(phoneName);
  return `https://www.flipkart.com/search?q=${searchQuery}&affid=youraffiliate`;
};
```

## How to Add Your Affiliate IDs

### 1. Amazon Associates (India)

**Sign up**: https://affiliate-program.amazon.in/

**Steps**:
1. Create an Amazon Associates account
2. Get your tracking ID (format: `yourname-21`)
3. Replace `youraffid-21` in the code with your tracking ID

**Example**:
```javascript
return `https://www.amazon.in/s?k=${searchQuery}&tag=abhishek-21`;
```

### 2. Flipkart Affiliate Program

**Sign up**: https://affiliate.flipkart.com/

**Steps**:
1. Apply for Flipkart Affiliate Program
2. Get your affiliate ID
3. Replace `youraffiliate` with your ID

**Example**:
```javascript
return `https://www.flipkart.com/search?q=${searchQuery}&affid=yourflipkartid`;
```

## Features

### Purchase Buttons
- **Amazon Button**: Orange background (Amazon branding)
- **Flipkart Button**: Blue background (Flipkart branding)
- Both buttons open in new tab
- Hover effects with lift animation
- Mobile responsive

### What Gets Linked
The links are generated using:
- Phone brand + phone name (e.g., "Apple iPhone 15")
- Automatically URL-encoded for safety
- Includes your affiliate tags for commission tracking

## Customization

### Change Button Text
In `PhoneComparison.js`, line 45 & 69:
```javascript
🛒 Buy on Amazon  // Change this text
🛍️ Buy on Flipkart  // Change this text
```

### Change Button Styles
In `globals.css`, lines 696-728:
```css
.purchase-btn.amazon {
  background: #ff9900;  /* Change color */
  color: #000;
}

.purchase-btn.flipkart {
  background: #2874f0;  /* Change color */
  color: white;
}
```

### Add More Purchase Options

You can add more e-commerce sites (e.g., Croma, Reliance Digital):

1. Add function in `PhoneComparison.js`:
```javascript
const getCromaUrl = (phoneName) => {
  const searchQuery = encodeURIComponent(phoneName);
  return `https://www.croma.com/search?q=${searchQuery}`;
};
```

2. Add button in JSX:
```jsx
<a
  href={getCromaUrl(`${phone1.brand} ${phone1.name}`)}
  target="_blank"
  rel="noopener noreferrer"
  className="purchase-btn croma"
>
  🏪 Buy on Croma
</a>
```

3. Add CSS:
```css
.purchase-btn.croma {
  background: #00a699;
  color: white;
}
```

## Testing

### Before Going Live
1. **Replace placeholder IDs** with real affiliate IDs
2. **Test links** - Click to ensure they work
3. **Verify tracking** - Check if affiliate dashboard shows clicks
4. **Mobile test** - Ensure buttons work on mobile

### Example Test Query
```
Compare iPhone 15 and Samsung Galaxy S24
```

Click the purchase buttons to verify they:
- Open correct search results
- Include your affiliate tag
- Open in new tab

## Important Notes for Vercel Deployment

### Environment Variables (Optional)
For better security, you can move affiliate IDs to environment variables:

1. Create `.env.local`:
```env
NEXT_PUBLIC_AMAZON_AFFILIATE_ID=youraffid-21
NEXT_PUBLIC_FLIPKART_AFFILIATE_ID=youraffiliate
```

2. Update code:
```javascript
const getAmazonUrl = (phoneName) => {
  const searchQuery = encodeURIComponent(phoneName);
  const affiliateId = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'youraffid-21';
  return `https://www.amazon.in/s?k=${searchQuery}&tag=${affiliateId}`;
};
```

3. In Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add the same variables

### Compliance

**Disclosure**:
- Add disclosure text that you earn from qualifying purchases
- Amazon requires this disclosure
- Add to welcome screen or footer

**Example**:
```javascript
<p className="affiliate-disclosure">
  As an Amazon Associate and Flipkart Affiliate, we earn from qualifying purchases.
</p>
```

## Revenue Optimization Tips

1. **Use direct product links** when available (requires API integration)
2. **Add "Best Price" indicator** to highlight deals
3. **Track which links perform better** (Amazon vs Flipkart)
4. **Update affiliate IDs** per category if you have multiple accounts

## Support

- **Amazon Associates Help**: https://affiliate-program.amazon.in/help
- **Flipkart Affiliate Help**: https://affiliate.flipkart.com/support

---

**Ready to earn commissions!** 💰
Just replace the placeholder IDs and deploy to Vercel!
