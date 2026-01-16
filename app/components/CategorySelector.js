"use client";

export default function CategorySelector({ selectedCategory, onCategoryChange }) {
  return (
    <div className="category-selector">
      <button
        className={`category-btn ${selectedCategory === 'smartphone' ? 'active' : ''}`}
        onClick={() => onCategoryChange('smartphone')}
      >
        <span className="category-icon">📱</span>
        <span>Smartphones</span>
      </button>
      <button
        className={`category-btn ${selectedCategory === 'laptop' ? 'active' : ''}`}
        onClick={() => onCategoryChange('laptop')}
      >
        <span className="category-icon">💻</span>
        <span>Laptops</span>
      </button>
    </div>
  );
}
