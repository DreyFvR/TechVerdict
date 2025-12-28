import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchPhoneImages } from "../utils/imageAPI.js";

// System prompt for phone comparison specialist
const SYSTEM_PROMPT = `You are a smartphone comparison expert for the Indian market. Compare phones side-by-side with focus on DIFFERENCES.

IMPORTANT RULES:
1. If asked about unreleased/future phones (like S25 Ultra, iPhone 17), use your knowledge of the brand's typical patterns, previous flagship releases, and industry trends to provide an educated comparison based on expected specifications.
2. Clearly indicate when specs are "Expected" or "Rumored" vs confirmed.
3. For unreleased phones, use approximate pricing based on previous flagship pricing patterns.
4. Always provide a comparison even if the phones aren't officially released yet - users want to know what to expect.

RESPONSE FORMAT - Return ONLY this JSON structure (no extra text):
{
  "phone1": { "name": "Phone 1 Name", "brand": "Brand" },
  "phone2": { "name": "Phone 2 Name", "brand": "Brand" },
  "comparison": {
    "price": {
      "phone1": "₹XX,XXX (for base model) - only add 'Expected' or 'Approximate' if phone is unreleased",
      "phone2": "₹XX,XXX (for base model) - only add 'Expected' or 'Approximate' if phone is unreleased",
      "verdict": "Which offers better value and why"
    },
    "display": {
      "phone1": "Screen details (add 'Expected: ' prefix if rumored)",
      "phone2": "Screen details (add 'Expected: ' prefix if rumored)",
      "verdict": "Which is better and why"
    },
    "performance": {
      "phone1": "Processor, RAM, storage details (add 'Expected: ' prefix if rumored)",
      "phone2": "Processor, RAM, storage details (add 'Expected: ' prefix if rumored)",
      "verdict": "Which performs better and why"
    },
    "camera": {
      "phone1": "Camera specs and quality (add 'Expected: ' prefix if rumored)",
      "phone2": "Camera specs and quality (add 'Expected: ' prefix if rumored)",
      "verdict": "Which has better cameras and why"
    },
    "battery": {
      "phone1": "Battery capacity and charging (add 'Expected: ' prefix if rumored)",
      "phone2": "Battery capacity and charging (add 'Expected: ' prefix if rumored)",
      "verdict": "Which has better battery life"
    },
    "software": {
      "phone1": "OS and update policy (add 'Expected: ' prefix if rumored)",
      "phone2": "OS and update policy (add 'Expected: ' prefix if rumored)",
      "verdict": "Which has better software support"
    },
    "build": {
      "phone1": "Build quality and design (add 'Expected: ' prefix if rumored)",
      "phone2": "Build quality and design (add 'Expected: ' prefix if rumored)",
      "verdict": "Which feels more premium"
    }
  },
  "prosConsIndianMarket": {
    "phone1": {
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"]
    },
    "phone2": {
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"]
    }
  },
  "finalVerdict": "Overall recommendation with reasoning (2-3 sentences)",
  "bestFor": {
    "phone1": "Type of user this phone is best suited for",
    "phone2": "Type of user this phone is best suited for"
  }
}

If the user asks a general question or doesn't specify two phones, respond with:
{
  "type": "query",
  "message": "Your helpful response here. Ask them to specify two phones to compare."
}

Use your latest knowledge about phones available in the Indian market. If you don't have exact current prices, provide approximate ranges based on typical pricing.`;

// Function to fetch real-time pricing from multiple sources
async function fetchIndianPricing(phone1, phone2) {
  // Note: In production, you'd integrate with actual APIs
  // For now, we'll use web search or mock data
  // You can integrate with:
  // - Flipkart API
  // - Amazon Product Advertising API
  // - PriceAPI.in
  // - Web scraping services

  try {
    // Placeholder for real API integration
    // This is where you'd make actual API calls
    return {
      phone1: {
        flipkart: null,
        amazon: null,
        available: false
      },
      phone2: {
        flipkart: null,
        amazon: null,
        available: false
      }
    };
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return null;
  }
}

// Function to extract phone names from user query
function extractPhoneNames(message) {
  // Simple extraction - in production, use NER or better parsing
  const lowerMessage = message.toLowerCase();

  // Common patterns: "compare X and Y", "X vs Y", "difference between X and Y"
  const patterns = [
    /compare\s+(.+?)\s+(?:and|vs|with)\s+(.+?)(?:\?|$|\.)/i,
    /(.+?)\s+vs\s+(.+?)(?:\?|$|\.)/i,
    /difference between\s+(.+?)\s+and\s+(.+?)(?:\?|$|\.)/i,
    /(.+?)\s+or\s+(.+?)(?:\?|$|\.)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        phone1: match[1].trim(),
        phone2: match[2].trim()
      };
    }
  }

  return null;
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Extract phone names if it's a comparison request
    const phones = extractPhoneNames(message);

    // Fetch real-time pricing if phones are detected
    let pricingData = null;
    let phoneImages = null;
    if (phones) {
      pricingData = await fetchIndianPricing(phones.phone1, phones.phone2);
      phoneImages = await fetchPhoneImages(phones.phone1, phones.phone2);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        responseMimeType: "application/json", // Force JSON output
      }
    });

    // Construct the full prompt with system instructions
    const fullPrompt = `${SYSTEM_PROMPT}

${pricingData ? `REAL-TIME PRICING DATA (if available):
${JSON.stringify(pricingData, null, 2)}
` : ''}

USER QUERY: ${message}

Remember to respond ONLY with valid JSON. No markdown, no code blocks, just pure JSON.`;

    const result = await model.generateContent(fullPrompt);
    let reply = result.response.text();

    // Enhanced JSON extraction and cleaning
    let parsedReply;
    try {
      // Remove markdown code blocks
      reply = reply.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      // Try to extract JSON if it's wrapped in text
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reply = jsonMatch[0];
      }

      // Remove any trailing commas before closing braces/brackets (invalid JSON)
      reply = reply.replace(/,(\s*[}\]])/g, '$1');

      // Remove any text before the first { or after the last }
      const firstBrace = reply.indexOf('{');
      const lastBrace = reply.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        reply = reply.substring(firstBrace, lastBrace + 1);
      }

      parsedReply = JSON.parse(reply);
      console.log("Successfully parsed JSON response");
    } catch (parseError) {
      // If JSON parsing still fails, return as plain text
      console.error("JSON parse error:", parseError);
      console.error("Problematic reply:", reply.substring(0, 500));
      parsedReply = {
        type: "text",
        message: reply
      };
    }

    // Add phone images to the response if available
    if (phoneImages && parsedReply.comparison) {
      parsedReply.images = phoneImages;
    }

    return new Response(JSON.stringify({
      reply: parsedReply,
      rawText: reply
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500 }
    );
  }
}
