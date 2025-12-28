/**
 * Static Phone Image Database
 *
 * This is the most reliable approach - manually curated image URLs
 * Images are hosted on reliable CDNs (ImgBB, Imgur, or your own hosting)
 *
 * To add new phones:
 * 1. Find the official product image (from manufacturer site, Amazon, Flipkart)
 * 2. Upload to ImgBB (https://imgbb.com) - free, permanent hosting
 * 3. Add entry below with the direct image URL
 */

export const PHONE_IMAGE_DATABASE = {
  // iPhone Models
  "iphone 15": "https://m.media-amazon.com/images/I/31KxpX7Xk7L._SY300_SX300_QL70_FMwebp_.jpg",

  // Samsung Galaxy S Series

};

/**
 * Get phone image from database with fuzzy matching
 */
export function getPhoneImageFromDatabase(phoneName) {
  const normalized = phoneName.toLowerCase().trim();

  // Try exact match first
  if (PHONE_IMAGE_DATABASE[normalized]) {
    return {
      url: PHONE_IMAGE_DATABASE[normalized],
      thumbnail: PHONE_IMAGE_DATABASE[normalized],
      title: phoneName,
      source: 'database',
    };
  }

  // Try partial match (e.g., "iPhone 15 Pro" matches "iphone 15 pro")
  for (const [key, imageUrl] of Object.entries(PHONE_IMAGE_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        url: imageUrl,
        thumbnail: imageUrl,
        title: phoneName,
        source: 'database',
      };
    }
  }

  // No match found
  return null;
}

/**
 * Add a new phone image to the database
 * (This is for future expansion - you can add phones as needed)
 */
export function addPhoneImage(phoneName, imageUrl) {
  PHONE_IMAGE_DATABASE[phoneName.toLowerCase().trim()] = imageUrl;
}
