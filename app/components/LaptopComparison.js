"use client";
import { useState } from "react";

export default function LaptopComparison({ data, onRequestGeekMode }) {
  const [showingGeekMode, setShowingGeekMode] = useState(false);

  if (!data || !data.comparison) {
    return null;
  }

  const { laptop1, laptop2, comparison, prosConsIndianMarket, finalVerdict, bestFor, comparisonMode, showGeekDetailsOption, geekDetails } = data;

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
      onRequestGeekMode(laptop1, laptop2);
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

      {/* Geek Mode Button */}
      {comparisonMode === 'brief' && showGeekDetailsOption && !showingGeekMode && (
        <div className="geek-mode-section">
          <button className="geek-mode-btn" onClick={handleGeekModeRequest}>
            🤓 Show Geek Details (Technical Deep Dive)
          </button>
          <p className="geek-mode-hint">
            Get detailed specs, gaming FPS, rendering times, real-world battery tests, and more!
          </p>
        </div>
      )}

      {/* Geek Details Section */}
      {geekDetails && (
        <div className="geek-details-section">
          <h3 className="section-title">🤓 Geek Mode: Real-World Performance</h3>

          <div className="geek-details-grid">
            {/* Laptop 1 Geek Details */}
            <div className="geek-details-card">
              <div className="geek-details-header">{laptop1.name}</div>

              {/* CPU & GPU Details */}
              <div className="geek-section">
                <div className="geek-section-title">⚡ Processor & Graphics</div>
                <div className="geek-item">
                  <span className="geek-label">CPU:</span>
                  <span className="geek-value">{geekDetails.laptop1.cpuDetails}</span>
                </div>
                <div className="geek-item">
                  <span className="geek-label">GPU:</span>
                  <span className="geek-value">{geekDetails.laptop1.gpuDetails}</span>
                </div>
              </div>

              {/* Gaming Performance */}
              {geekDetails.laptop1.gamingPerformance?.applicable && (
                <div className="geek-section">
                  <div className="geek-section-title">🎮 Gaming Performance (FPS)</div>
                  <div className="gaming-fps-grid">
                    {geekDetails.laptop1.gamingPerformance.games.map((game, idx) => (
                      <div key={idx} className="fps-item">
                        <div className="game-title">{game.title}</div>
                        <div className="game-settings">{game.settings}</div>
                        <div className="game-fps">{game.fps}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creative Performance */}
              {geekDetails.laptop1.creativePerformance && (
                <div className="geek-section">
                  <div className="geek-section-title">🎨 Creative Workloads</div>
                  {geekDetails.laptop1.creativePerformance.premierePro && (
                    <div className="geek-item">
                      <span className="geek-label">Premiere Pro:</span>
                      <span className="geek-value">{geekDetails.laptop1.creativePerformance.premierePro}</span>
                    </div>
                  )}
                  {geekDetails.laptop1.creativePerformance.blenderBMW && (
                    <div className="geek-item">
                      <span className="geek-label">Blender:</span>
                      <span className="geek-value">{geekDetails.laptop1.creativePerformance.blenderBMW}</span>
                    </div>
                  )}
                  {geekDetails.laptop1.creativePerformance.photoshop && (
                    <div className="geek-item">
                      <span className="geek-label">Photoshop:</span>
                      <span className="geek-value">{geekDetails.laptop1.creativePerformance.photoshop}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Productivity Metrics */}
              {geekDetails.laptop1.productivityMetrics && (
                <div className="geek-section">
                  <div className="geek-section-title">💼 Productivity</div>
                  <div className="geek-item">
                    <span className="geek-label">Boot Time:</span>
                    <span className="geek-value">{geekDetails.laptop1.productivityMetrics.bootTime}</span>
                  </div>
                  <div className="geek-item">
                    <span className="geek-label">Multitasking:</span>
                    <span className="geek-value">{geekDetails.laptop1.productivityMetrics.multitasking}</span>
                  </div>
                </div>
              )}

              {/* Thermals */}
              {geekDetails.laptop1.thermalPerformance && (
                <div className="geek-section">
                  <div className="geek-section-title">🌡️ Thermals & Noise</div>
                  <div className="geek-item">
                    <span className="geek-value thermal-info">{geekDetails.laptop1.thermalPerformance}</span>
                  </div>
                </div>
              )}

              {/* Battery Life */}
              {geekDetails.laptop1.realWorldBattery && (
                <div className="geek-section">
                  <div className="geek-section-title">🔋 Real-World Battery</div>
                  <div className="geek-item">
                    <span className="geek-value battery-info">{geekDetails.laptop1.realWorldBattery}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Laptop 2 Geek Details */}
            <div className="geek-details-card">
              <div className="geek-details-header">{laptop2.name}</div>

              {/* CPU & GPU Details */}
              <div className="geek-section">
                <div className="geek-section-title">⚡ Processor & Graphics</div>
                <div className="geek-item">
                  <span className="geek-label">CPU:</span>
                  <span className="geek-value">{geekDetails.laptop2.cpuDetails}</span>
                </div>
                <div className="geek-item">
                  <span className="geek-label">GPU:</span>
                  <span className="geek-value">{geekDetails.laptop2.gpuDetails}</span>
                </div>
              </div>

              {/* Gaming Performance */}
              {geekDetails.laptop2.gamingPerformance?.applicable && (
                <div className="geek-section">
                  <div className="geek-section-title">🎮 Gaming Performance (FPS)</div>
                  <div className="gaming-fps-grid">
                    {geekDetails.laptop2.gamingPerformance.games.map((game, idx) => (
                      <div key={idx} className="fps-item">
                        <div className="game-title">{game.title}</div>
                        <div className="game-settings">{game.settings}</div>
                        <div className="game-fps">{game.fps}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creative Performance */}
              {geekDetails.laptop2.creativePerformance && (
                <div className="geek-section">
                  <div className="geek-section-title">🎨 Creative Workloads</div>
                  {geekDetails.laptop2.creativePerformance.premierePro && (
                    <div className="geek-item">
                      <span className="geek-label">Premiere Pro:</span>
                      <span className="geek-value">{geekDetails.laptop2.creativePerformance.premierePro}</span>
                    </div>
                  )}
                  {geekDetails.laptop2.creativePerformance.blenderBMW && (
                    <div className="geek-item">
                      <span className="geek-label">Blender:</span>
                      <span className="geek-value">{geekDetails.laptop2.creativePerformance.blenderBMW}</span>
                    </div>
                  )}
                  {geekDetails.laptop2.creativePerformance.photoshop && (
                    <div className="geek-item">
                      <span className="geek-label">Photoshop:</span>
                      <span className="geek-value">{geekDetails.laptop2.creativePerformance.photoshop}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Productivity Metrics */}
              {geekDetails.laptop2.productivityMetrics && (
                <div className="geek-section">
                  <div className="geek-section-title">💼 Productivity</div>
                  <div className="geek-item">
                    <span className="geek-label">Boot Time:</span>
                    <span className="geek-value">{geekDetails.laptop2.productivityMetrics.bootTime}</span>
                  </div>
                  <div className="geek-item">
                    <span className="geek-label">Multitasking:</span>
                    <span className="geek-value">{geekDetails.laptop2.productivityMetrics.multitasking}</span>
                  </div>
                </div>
              )}

              {/* Thermals */}
              {geekDetails.laptop2.thermalPerformance && (
                <div className="geek-section">
                  <div className="geek-section-title">🌡️ Thermals & Noise</div>
                  <div className="geek-item">
                    <span className="geek-value thermal-info">{geekDetails.laptop2.thermalPerformance}</span>
                  </div>
                </div>
              )}

              {/* Battery Life */}
              {geekDetails.laptop2.realWorldBattery && (
                <div className="geek-section">
                  <div className="geek-section-title">🔋 Real-World Battery</div>
                  <div className="geek-item">
                    <span className="geek-value battery-info">{geekDetails.laptop2.realWorldBattery}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
