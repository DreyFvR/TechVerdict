import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchPhoneImages } from "../utils/imageAPI.js";
import { PHONE_SYSTEM_PROMPT } from "../utils/phonePrompt.js";
import { LAPTOP_SYSTEM_PROMPT } from "../utils/laptopPrompt.js";

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

// Function to extract phone/laptop names from user query
function extractProductNames(message) {
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
        product1: match[1].trim(),
        product2: match[2].trim()
      };
    }
  }

  return null;
}

export async function POST(req) {
  try {
    const { message, category } = await req.json();

    // Default to smartphone if no category specified
    const selectedCategory = category || 'smartphone';

    // Extract product names if it's a comparison request
    const products = extractProductNames(message);

    // Fetch real-time pricing if products are detected (only for phones for now)
    let pricingData = null;
    let phoneImages = null;
    if (products && selectedCategory === 'smartphone') {
      pricingData = await fetchIndianPricing(products.product1, products.product2);
      phoneImages = await fetchPhoneImages(products.product1, products.product2);
    }

    // Choose the right system prompt based on category
    const SYSTEM_PROMPT = selectedCategory === 'laptop' ? LAPTOP_SYSTEM_PROMPT : PHONE_SYSTEM_PROMPT;

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

    // Add phone images to the response if available (only for phones)
    if (phoneImages && parsedReply.comparison && selectedCategory === 'smartphone') {
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
