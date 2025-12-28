/**
 * Phone Image Fetching System
 *
 * Simple and reliable approach:
 * - Only uses static database (phoneImageDatabase.js)
 * - Images shown only if BOTH phones have images in database
 * - No external APIs, no fallbacks - keeps it clean and uniform
 */

import { getPhoneImageFromDatabase } from './phoneImageDatabase.js';

export async function fetchPhoneImage(phoneName) {
  // Only use static database - no external APIs
  const databaseImage = getPhoneImageFromDatabase(phoneName);
  return databaseImage || null;
}

/**
 * Fetch images for multiple phones in parallel
 * Only returns images if BOTH phones have images in database (for uniformity)
 */
export async function fetchPhoneImages(phone1Name, phone2Name) {
  try {
    const [image1, image2] = await Promise.all([
      fetchPhoneImage(phone1Name),
      fetchPhoneImage(phone2Name),
    ]);

    // Only return images if BOTH phones have images
    // This maintains uniformity - either both have images or neither do
    if (image1 && image2) {
      return {
        phone1: image1,
        phone2: image2,
      };
    }

    // If one or both missing, return null for both
    return {
      phone1: null,
      phone2: null,
    };
  } catch (error) {
    console.error('Error fetching phone images:', error);
    return {
      phone1: null,
      phone2: null,
    };
  }
}