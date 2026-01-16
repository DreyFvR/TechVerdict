"use client";
import { useState } from "react";

export default function LaptopComparison({ data, onRequestGeekMode }) {
  const [showingGeekMode, setShowingGeekMode] = useState(false);

  if (!data || !data.comparison) {
    return null;
  }

  const { laptop1, laptop2, comparison, prosConsIndianMarket, finalVerdict, bestFor, comparisonMode, showGeekDetailsOption } = data;

  // Generate Amazon India search URLs for laptops
  const getAmazonUrl = (laptopName) => {
    const searchQuery = encodeURIComponent(laptopName);
    return `https://www.amazon.in/s?k=${searchQuery}&tag=youraffid-21`; // Replace youraffid-21 with actual affiliate ID
  };

  const getFlipkartUrl = (laptopName) => {
    const searchQuery = encodeURIComponent(laptopName);
    return `https://www.flipkart.com/search?q=${searchQuery}&affid=youraffiliate`; // Replace with actual affiliate ID
  };

  const categories = [
    { key: 'price', icon: '💰', label: 'Price & Value' },
    { key: 'cpu', icon: '🔥', label: 'Processor (CPU)' },
    { key: 'gpu', icon: '🎮', label: 'Graphics (GPU)' },
    { key: 'ram', icon: '⚡', label: 'RAM & Memory' },
    { key: 'storage', icon: '💾', label: 'Storage' },
    { key: 'display', icon: '🖥️', label: 'Display' },
    { key: 'battery', icon: '🔋', label: 'Battery Life' },
    { key: 'build', icon: '🏗️', label: 'Build & Design' },
  ];

  const handleGeekModeRequest = () => {
    setShowingGeekMode(true);
    if (onRequestGeekMode) {
      onRequestGeekMode();
    }
  };

  return (
    <div className="phone-comparison">
      {/* Info banner about comparison mode */}
      {comparisonMode === 'brief' && showGeekDetailsOption && (
        <div className="info-banner">
          ℹ️ Showing brief comparison. Want more technical details? Scroll down for geek mode!
        </div>
      )}

      {/* Header with laptop names */}
      <div className="comparison-header">
        <div className="phone-header">
          <div className="phone-brand">{laptop1.brand}</div>
          <div className="phone-name">{laptop1.name}</div>
          <div className="purchase-links">
            <a
              href={getAmazonUrl(`${laptop1.brand} ${laptop1.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="purchase-btn amazon"
            >
              🛒 Buy on Amazon
            </a>
            <a
              href={getFlipkartUrl(`${laptop1.brand} ${laptop1.name}`)}
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
          <div className="phone-brand">{laptop2.brand}</div>
          <div className="phone-name">{laptop2.name}</div>
          <div className="purchase-links">
            <a
              href={getAmazonUrl(`${laptop2.brand} ${laptop2.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="purchase-btn amazon"
            >
              🛒 Buy on Amazon
            </a>
            <a
              href={getFlipkartUrl(`${laptop2.brand} ${laptop2.name}`)}
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
                <div className="spec-content">{comparison[key]?.laptop1}</div>
              </div>

              <div className="spec-divider"></div>

              <div className="phone-spec phone-spec-2">
                <div className="spec-content">{comparison[key]?.laptop2}</div>
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

      {/* Geek Mode Button */}
      {comparisonMode === 'brief' && showGeekDetailsOption && !showingGeekMode && (
        <div className="geek-mode-section">
          <button className="geek-mode-btn" onClick={handleGeekModeRequest}>
            🤓 Show Geek Details (Technical Deep Dive)
          </button>
          <p className="geek-mode-hint">
            Get detailed specs: benchmark scores, TGP, RAM speeds, color accuracy, and more!
          </p>
        </div>
      )}

      {/* Pros & Cons for Indian Market */}
      <div className="pros-cons-section">
        <h3 className="section-title">Pros & Cons (Indian Market Perspective)</h3>
        <div className="pros-cons-grid">
          <div className="phone-pros-cons">
            <div className="phone-pros-cons-header">{laptop1.name}</div>
            <div className="pros">
              <div className="pros-title">✅ Pros</div>
              <ul>
                {prosConsIndianMarket.laptop1.pros.map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <div className="cons-title">❌ Cons</div>
              <ul>
                {prosConsIndianMarket.laptop1.cons.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="phone-pros-cons">
            <div className="phone-pros-cons-header">{laptop2.name}</div>
            <div className="pros">
              <div className="pros-title">✅ Pros</div>
              <ul>
                {prosConsIndianMarket.laptop2.pros.map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <div className="cons-title">❌ Cons</div>
              <ul>
                {prosConsIndianMarket.laptop2.cons.map((con, idx) => (
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
            <div className="best-for-phone">{laptop1.name}</div>
            <div className="best-for-text">{bestFor.laptop1}</div>
          </div>
          <div className="best-for-card">
            <div className="best-for-phone">{laptop2.name}</div>
            <div className="best-for-text">{bestFor.laptop2}</div>
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
