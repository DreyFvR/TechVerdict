"use client";

export default function PhoneComparison({ data }) {
  if (!data || !data.comparison) {
    return null;
  }

  const { phone1, phone2, comparison, prosConsIndianMarket, finalVerdict, bestFor, images } = data;

  // Helper to check if spec contains "Expected" or "Rumored" (but NOT "Confirmed")
  const isExpectedSpec = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();

    // Don't trigger warning if it says "Confirmed"
    if (lower.includes('confirmed')) return false;

    // Only trigger for unreleased phone indicators
    return lower.includes('expected') || lower.includes('rumored') || lower.includes('approximate');
  };

  // Generate Amazon India search URLs
  const getAmazonUrl = (phoneName) => {
    const searchQuery = encodeURIComponent(phoneName);
    return `https://www.amazon.in/s?k=${searchQuery}&tag=youraffid-21`; // Replace youraffid-21 with actual affiliate ID
  };

  const getFlipkartUrl = (phoneName) => {
    const searchQuery = encodeURIComponent(phoneName);
    return `https://www.flipkart.com/search?q=${searchQuery}&affid=youraffiliate`; // Replace with actual affiliate ID
  };

  const categories = [
    { key: 'price', icon: '💰', label: 'Price & Value' },
    { key: 'display', icon: '📱', label: 'Display' },
    { key: 'performance', icon: '⚡', label: 'Performance' },
    { key: 'camera', icon: '📸', label: 'Camera' },
    { key: 'battery', icon: '🔋', label: 'Battery' },
    { key: 'software', icon: '💻', label: 'Software' },
    { key: 'build', icon: '🏗️', label: 'Build & Design' },
  ];

  // Check if any specs are expected/rumored
  const hasExpectedSpecs = Object.values(comparison).some(category =>
    isExpectedSpec(category?.phone1) || isExpectedSpec(category?.phone2)
  );

  return (
    <div className="phone-comparison">
      {/* Disclaimer for unreleased phones */}
      {hasExpectedSpecs && (
        <div className="unreleased-disclaimer">
          ⚠️ <strong>Note:</strong> One or both phones may not be officially released yet.
          Specifications marked as "Expected" or "Approximate" are based on rumors, leaks,
          and industry trends. Actual specs may vary upon official release.
        </div>
      )}

      {/* Header with phone names */}
      <div className="comparison-header">
        <div className="phone-header">
          {images?.phone1 && (
            <div className="phone-image-container">
              <img
                src={images.phone1.url}
                alt={`${phone1.brand} ${phone1.name}`}
                className="phone-image"
                loading="lazy"
              />
              {images.phone1.source === 'fallback' && (
                <div className="image-fallback-badge">Placeholder</div>
              )}
            </div>
          )}
          <div className="phone-brand">{phone1.brand}</div>
          <div className="phone-name">{phone1.name}</div>
          <div className="purchase-links">
            <a
              href={getAmazonUrl(`${phone1.brand} ${phone1.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="purchase-btn amazon"
            >
              🛒 Buy on Amazon
            </a>
            <a
              href={getFlipkartUrl(`${phone1.brand} ${phone1.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="purchase-btn flipkart"
            >
              🛍️ Buy on Flipkart
            </a>
          </div>
        </div>
        <div className="vs-divider">VS</div>
        <div className="phone-header">
          {images?.phone2 && (
            <div className="phone-image-container">
              <img
                src={images.phone2.url}
                alt={`${phone2.brand} ${phone2.name}`}
                className="phone-image"
                loading="lazy"
              />
              {images.phone2.source === 'fallback' && (
                <div className="image-fallback-badge">Placeholder</div>
              )}
            </div>
          )}
          <div className="phone-brand">{phone2.brand}</div>
          <div className="phone-name">{phone2.name}</div>
          <div className="purchase-links">
            <a
              href={getAmazonUrl(`${phone2.brand} ${phone2.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="purchase-btn amazon"
            >
              🛒 Buy on Amazon
            </a>
            <a
              href={getFlipkartUrl(`${phone2.brand} ${phone2.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="purchase-btn flipkart"
            >
              🛍️ Buy on Flipkart
            </a>
          </div>
        </div>
      </div>

      {/* Comparison categories */}
      <div className="comparison-categories">
        {categories.map(({ key, icon, label }) => (
          <div key={key} className="comparison-category">
            <div className="category-label">
              <span className="category-icon">{icon}</span>
              <span className="category-name">{label}</span>
            </div>

            <div className="category-comparison">
              <div className="phone-spec phone-spec-1">
                <div className="spec-content">{comparison[key]?.phone1}</div>
              </div>

              <div className="spec-divider"></div>

              <div className="phone-spec phone-spec-2">
                <div className="spec-content">{comparison[key]?.phone2}</div>
              </div>
            </div>

            {comparison[key]?.verdict && (
              <div className="verdict">
                <span className="verdict-icon">🏆</span>
                <span className="verdict-text">{comparison[key].verdict}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pros & Cons for Indian Market */}
      <div className="pros-cons-section">
        <h3 className="section-title">Pros & Cons (Indian Market Perspective)</h3>
        <div className="pros-cons-grid">
          <div className="phone-pros-cons">
            <div className="phone-pros-cons-header">{phone1.name}</div>
            <div className="pros">
              <div className="pros-title">✅ Pros</div>
              <ul>
                {prosConsIndianMarket.phone1.pros.map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <div className="cons-title">❌ Cons</div>
              <ul>
                {prosConsIndianMarket.phone1.cons.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="phone-pros-cons">
            <div className="phone-pros-cons-header">{phone2.name}</div>
            <div className="pros">
              <div className="pros-title">✅ Pros</div>
              <ul>
                {prosConsIndianMarket.phone2.pros.map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <div className="cons-title">❌ Cons</div>
              <ul>
                {prosConsIndianMarket.phone2.cons.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Best For section */}
      <div className="best-for-section">
        <h3 className="section-title">Best Suited For</h3>
        <div className="best-for-grid">
          <div className="best-for-card">
            <div className="best-for-phone">{phone1.name}</div>
            <div className="best-for-text">{bestFor.phone1}</div>
          </div>
          <div className="best-for-card">
            <div className="best-for-phone">{phone2.name}</div>
            <div className="best-for-text">{bestFor.phone2}</div>
          </div>
        </div>
      </div>

      {/* Final Verdict */}
      <div className="final-verdict">
        <div className="verdict-icon-large">🎯</div>
        <div className="verdict-title">Final Verdict</div>
        <div className="verdict-content">{finalVerdict}</div>
      </div>
    </div>
  );
}
