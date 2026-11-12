import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchPhoneImages } from "../utils/imageAPI.js";
import { PHONE_SYSTEM_PROMPT } from "../utils/phonePrompt.js";
import { LAPTOP_SYSTEM_PROMPT } from "../utils/laptopPrompt.js";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL_NAME = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 25000;

let cachedModel;

function getModel() {
  if (cachedModel) return cachedModel;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  cachedModel = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.45,
      topP: 0.8,
      topK: 32,
      responseMimeType: "application/json",
    },
  });

  return cachedModel;
}

async function fetchIndianPricing() {
  try {
    return {
      phone1: { flipkart: null, amazon: null, available: false },
      phone2: { flipkart: null, amazon: null, available: false },
    };
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return null;
  }
}

function extractProductNames(message) {
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

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), ms);
  });
}

function parseModelJson(text) {
  let cleaned = String(text || "")
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  try {
    return { parsed: JSON.parse(cleaned), rawText: cleaned };
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Problematic reply:", cleaned.slice(0, 500));
    return {
      parsed: {
        type: "text",
        message: cleaned || "I could not generate a readable response. Please try again.",
      },
      rawText: cleaned,
    };
  }
}

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req) {
  try {
    const { message, category, geekMode } = await req.json();
    const userMessage = typeof message === "string" ? message.trim() : "";

    if (!userMessage) {
      return jsonResponse({ error: "Message is required" }, 400);
    }

    if (userMessage.length > 1200) {
      return jsonResponse({ error: "Message is too long" }, 413);
    }

    const selectedCategory = category === "laptop" ? "laptop" : "smartphone";

    const geekModeInstruction = (geekMode && selectedCategory === "laptop")
      ? '\n\nIMPORTANT: User has requested GEEK MODE. You MUST include the "geekDetails" object with full real-world performance metrics including gaming FPS, rendering times, thermals, and battery tests as specified in the DETAILED/GEEK MODE section.'
      : "";

    const products = extractProductNames(userMessage);

    let pricingData = null;
    let phoneImages = null;
    if (products && selectedCategory === "smartphone") {
      [pricingData, phoneImages] = await Promise.all([
        fetchIndianPricing(products.product1, products.product2),
        fetchPhoneImages(products.product1, products.product2),
      ]);
    }

    const SYSTEM_PROMPT = selectedCategory === 'laptop' ? LAPTOP_SYSTEM_PROMPT : PHONE_SYSTEM_PROMPT;

    const fullPrompt = `${SYSTEM_PROMPT}

${pricingData ? `REAL-TIME PRICING DATA (if available):
${JSON.stringify(pricingData, null, 2)}
` : ''}

USER QUERY: ${userMessage}
${geekModeInstruction}

Remember to respond ONLY with valid JSON. No markdown, no code blocks, just pure JSON.`;

    const result = await Promise.race([
      getModel().generateContent(fullPrompt),
      timeoutPromise(REQUEST_TIMEOUT_MS),
    ]);
    const reply = result.response.text();
    const { parsed: parsedReply, rawText } = parseModelJson(reply);

    if (phoneImages && parsedReply.comparison && selectedCategory === "smartphone") {
      parsedReply.images = phoneImages;
    }

    return jsonResponse({
      reply: parsedReply,
      rawText,
    });
  } catch (err) {
    console.error(err);

    if (err.message === "Request timed out") {
      return jsonResponse({ error: "Request timed out" }, 408);
    }

    if (err.message === "Missing GEMINI_API_KEY") {
      return jsonResponse({ error: "GEMINI_API_KEY is not configured" }, 500);
    }

    return jsonResponse({ error: "Failed to generate response" }, 500);
  }
}
