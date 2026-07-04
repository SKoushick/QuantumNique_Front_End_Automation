import React, { useState, useEffect } from 'react';
import ReviewsSection from './ReviewsSection';
import { getPaintings } from '../utils/storage';

const PaintingDetails = ({
  paintingId,
  onBack,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  currentUser
}) => {
  const allPaintings = getPaintings() || [];
  const painting = allPaintings.find(p => p.id === paintingId);

  if (!painting) {
    return (
      <div className="container error-page">
        <h2>Painting not found</h2>
        <button className="gold-btn" onClick={onBack}>Return to Exhibition</button>
      </div>
    );
  }

  // State
  const [activeImage, setActiveImage] = useState(painting.images[0]);
  const [selectedVariant, setSelectedVariant] = useState(painting.variants[0]);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [recentIds, setRecentIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem('starry_recent_viewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track recently viewed
  useEffect(() => {
    let ids = [...recentIds];
    // Remove if already exists, then put it at front
    ids = ids.filter(id => id !== painting.id);
    ids.unshift(painting.id);
    // Keep max 5
    const sliced = ids.slice(0, 5);
    setRecentIds(sliced);
    sessionStorage.setItem('starry_recent_viewed', JSON.stringify(sliced));
    // Reset active image/variant on id change
    setActiveImage(painting.images[0]);
    setSelectedVariant(painting.variants[0]);
  }, [paintingId]);

  // Zoom on hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Recommenders
  const similarPaintings = allPaintings
    .filter(p => p.id !== painting.id && (p.category === painting.category || p.collection === painting.collection))
    .slice(0, 3);

  const recentlyViewed = allPaintings
    .filter(p => p.id !== painting.id && recentIds.includes(p.id))
    .slice(0, 4);

  const formatPrice = (p) => {
    if (p >= 1000000) return `$${(p / 1000000).toFixed(1)}M`;
    return `$${p.toLocaleString()}`;
  };

  const handleVariantChange = (vId) => {
    const v = painting.variants.find(item => item.id === vId);
    if (v) setSelectedVariant(v);
  };

  const getStockLabel = (stock) => {
    if (stock === 0) return <span className="badge badge-sold">🔴 Sold Out</span>;
    if (stock <= 3) return <span className="badge badge-low-stock">🟠 Low Stock ({stock} Available)</span>;
    return <span className="badge badge-in-stock">🟢 In Stock ({stock} Available)</span>;
  };

  return (
    <main className="details-page container">
      {/* Back Button */}
      <div className="back-nav-row">
        <button className="back-btn" onClick={onBack}>
          ← Back to Exhibition Catalogue
        </button>
      </div>

      <div className="details-layout">
        {/* Gallery Column */}
        <div className="details-gallery-col">
          <div
            className="frame-container details-main-frame"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={activeImage} alt={painting.name} className="details-main-img" />
            
            {/* Magnifying glass overlay */}
            <div className="zoom-magnifier-lens" style={zoomStyle}></div>

            <div className="details-img-watermark">Museum Quality Archival Original</div>
          </div>

          {/* Image Carousels */}
          {painting.images.length > 1 && (
            <div className="details-thumb-carousel">
              {painting.images.map((img, i) => (
                <div
                  key={i}
                  className={`details-thumb-frame ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`${painting.name} thumbnail ${i}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Options Column */}
        <div className="details-options-col glass-card">
          <span className="sku-label">{painting.sku}</span>
          <h1>{painting.name}</h1>
          <p className="artist-statement-heading">by {painting.artist}</p>

          <div className="rating-row-detail">
            <span className="detail-stars">{'★'.repeat(Math.round(painting.rating))}{'☆'.repeat(5 - Math.round(painting.rating))}</span>
            <span className="detail-rating-number">({painting.rating} / 5.0)</span>
          </div>

          <div className="stock-price-strip">
            <div className="price-tag-container-detail">
              {painting.discountPrice && selectedVariant.type === 'Original Version' ? (
                <>
                  <span className="original-price-detail strike-price">{formatPrice(painting.price)}</span>
                  <span className="current-price-detail text-gold">{formatPrice(painting.discountPrice)}</span>
                </>
              ) : (
                <span className="current-price-detail">
                  {/* Scale print variant price dynamically */}
                  {formatPrice(selectedVariant.price)}
                </span>
              )}
            </div>
            {getStockLabel(selectedVariant.stock)}
          </div>

          <p className="details-short-desc">{painting.description}</p>

          {/* Variant Selector */}
          <div className="variant-selectors">
            <h4>Select Artwork Variant</h4>
            <div className="variant-options-grid">
              {painting.variants.map(v => (
                <div
                  key={v.id}
                  className={`variant-option-card glass-panel ${selectedVariant.id === v.id ? 'active' : ''}`}
                  onClick={() => handleVariantChange(v.id)}
                >
                  <div className="variant-card-header">
                    <span className="v-type">{v.type}</span>
                    <span className="v-price">{formatPrice(v.price)}</span>
                  </div>
                  <div className="variant-card-body">
                    <span>{v.size}</span>
                    <span>Frame: {v.frame}</span>
                    <span>Canvas: {v.canvas}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="details-action-group">
            <button
              className="gold-btn btn-lg btn-full"
              onClick={() => onAddToCart({ ...painting, selectedVariant })}
              disabled={selectedVariant.stock === 0}
            >
              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Acquire Selected Edition
            </button>
            
            <button
              className={`secondary-btn btn-lg btn-full ${wishlist.includes(painting.id) ? 'liked' : ''}`}
              onClick={() => onToggleWishlist(painting.id)}
            >
              <svg className="action-icon" fill={wishlist.includes(painting.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              {wishlist.includes(painting.id) ? 'Bookmarked in Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Story & Historical Context Cards */}
      <section className="painting-story-section">
        <div className="story-grid">
          {/* Card 1: Story */}
          <div className="glass-card story-card">
            <span className="museum-label">The Story Behind the Masterpiece</span>
            <h3>Historical Context</h3>
            <p>{painting.story}</p>
          </div>

          {/* Card 2: Inspiration */}
          <div className="glass-card story-card">
            <span className="museum-label">Artistic Muse</span>
            <h3>Inspiration</h3>
            <p>{painting.inspiration}</p>
          </div>

          {/* Card 3: Letters */}
          <div className="glass-card story-card yellow-accent-card">
            <span className="museum-label">Artist Notes</span>
            <h3>Vincent's Letters</h3>
            <p className="letter-quote">"{painting.artistNotes}"</p>
          </div>
        </div>
      </section>

      {/* Technical Specifications Grid */}
      <section className="specifications-section glass-card">
        <h3>Museum Curation Specifications</h3>
        <div className="specs-table-grid">
          <div className="spec-row">
            <span className="spec-name">Authenticity</span>
            <span className="spec-val">{painting.specifications.certificate}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Artist Signature</span>
            <span className="spec-val">{painting.specifications.signature}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Year Created</span>
            <span className="spec-val">{painting.specifications.year}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Curation Medium</span>
            <span className="spec-val">{painting.medium} ({painting.style})</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Original Dimensions</span>
            <span className="spec-val">{painting.specifications.dimensions}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Orientation</span>
            <span className="spec-val">{painting.specifications.orientation}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Country of Origin</span>
            <span className="spec-val">{painting.specifications.origin}</span>
          </div>
          <div className="spec-row">
            <span className="spec-name">Shipping & Delivery</span>
            <span className="spec-val">Climate-Controlled White Glove Secure Handling (Worldwide)</span>
          </div>
        </div>
      </section>

      {/* Reviews Integration */}
      <section className="reviews-section">
        <ReviewsSection paintingId={painting.id} currentUser={currentUser} />
      </section>

      {/* Recommenders */}
      {similarPaintings.length > 0 && (
        <section className="recommendations-section">
          <h3>Similar Exhibition Artworks</h3>
          <div className="recommendations-row">
            {similarPaintings.map(p => (
              <div key={p.id} className="rec-card glass-card" onClick={() => onSelect(p.id)}>
                <img src={p.images[0]} alt={p.name} className="rec-thumb" />
                <div className="rec-details">
                  <h4>{p.name}</h4>
                  <p>{p.medium} | {p.specifications.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="recommendations-section">
          <h3>Recently Viewed</h3>
          <div className="recommendations-row">
            {recentlyViewed.map(p => (
              <div key={p.id} className="rec-card glass-card" onClick={() => onSelect(p.id)}>
                <img src={p.images[0]} alt={p.name} className="rec-thumb" />
                <div className="rec-details">
                  <h4>{p.name}</h4>
                  <p>{p.medium} | {p.specifications.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default PaintingDetails;
