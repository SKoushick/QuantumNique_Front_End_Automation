import React from 'react';

const PaintingCard = ({
  painting,
  viewMode = 'grid',
  onSelect,
  onQuickView,
  wishlist,
  onToggleWishlist,
  compareList,
  onToggleCompare,
  onAddToCart
}) => {
  const isWishlisted = wishlist.includes(painting.id);
  const isCompared = compareList.includes(painting.id);

  const formatPrice = (p) => {
    if (p >= 1000000) return `₹${(p / 1000000).toFixed(1)}M`;
    return `₹${p.toLocaleString()}`;
  };

  const getStockBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return <span className="badge badge-in-stock">🟢 In Stock</span>;
      case 'Low Stock':
        return <span className="badge badge-low-stock">🟠 Low Stock</span>;
      case 'Sold':
      default:
        return <span className="badge badge-sold">🔴 Sold Out</span>;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="glass-card painting-card-list">
        {/* Museum Frame Image Container */}
        <div className="frame-container list-frame" onClick={() => onSelect(painting.id)}>
          <img src={painting.images[0]} alt={painting.name} className="zoom-img" />
          <div className="collection-tag">{painting.collection}</div>
        </div>

        {/* Painting Meta Center */}
        <div className="card-list-details">
          <div className="card-header-meta">
            <span className="sku-label">{painting.sku}</span>
            {getStockBadge(painting.availability)}
          </div>
          <h3 className="painting-title-link" onClick={() => onSelect(painting.id)}>{painting.name}</h3>
          <p className="artist-label-card">by {painting.artist}</p>
          <p className="card-description-summary">{painting.description}</p>
          <div className="spec-quick-list">
            <span><strong>Medium:</strong> {painting.medium}</span>
            <span><strong>Year:</strong> {painting.specifications.year}</span>
            <span><strong>Dimensions:</strong> {painting.specifications.dimensions}</span>
          </div>
        </div>

        {/* Action Panel Right */}
        <div className="card-list-actions">
          <div className="price-tag-container">
            {painting.discountPrice ? (
              <>
                <span className="original-price strike-price">{formatPrice(painting.price)}</span>
                <span className="current-price text-gold">{formatPrice(painting.discountPrice)}</span>
              </>
            ) : (
              <span className="current-price">{formatPrice(painting.price)}</span>
            )}
          </div>

          <div className="card-actions-vertical">
            <button
              className="gold-btn btn-sm"
              onClick={() => onAddToCart(painting)}
              disabled={painting.availability === 'Sold'}
            >
              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Acquire Painting
            </button>
            <div className="card-action-subrow">
              <button
                className={`secondary-btn btn-icon ${isWishlisted ? 'liked' : ''}`}
                onClick={() => onToggleWishlist(painting.id)}
                title="Add to Wishlist"
              >
                <svg className="action-icon" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
              <button
                className={`secondary-btn btn-icon ${isCompared ? 'compared' : ''}`}
                onClick={() => onToggleCompare(painting.id)}
                title="Add to Comparison"
              >
                <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </button>
              <button
                className="secondary-btn btn-icon"
                onClick={() => onQuickView(painting)}
                title="Quick View"
              >
                👁
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div className="glass-card painting-card-grid">
      {/* Framed Image */}
      <div className="frame-container grid-frame">
        <img
          src={painting.images[0]}
          alt={painting.name}
          className="zoom-img"
          onClick={() => onSelect(painting.id)}
        />
        <div className="collection-tag">{painting.collection}</div>
        
        {/* Floating actions overlay */}
        <div className="grid-overlay-actions">
          <button
            className={`overlay-icon-btn ${isWishlisted ? 'active' : ''}`}
            onClick={() => onToggleWishlist(painting.id)}
            title="Wishlist"
          >
            <svg fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </button>
          <button
            className={`overlay-icon-btn ${isCompared ? 'active' : ''}`}
            onClick={() => onToggleCompare(painting.id)}
            title="Compare Artworks"
          >
            📊
          </button>
          <button
            className="overlay-icon-btn"
            onClick={() => onQuickView(painting)}
            title="Quick View"
          >
            👁
          </button>
        </div>
      </div>

      {/* Frame Details */}
      <div className="card-grid-meta" onClick={() => onSelect(painting.id)}>
        <div className="card-header-meta">
          <span className="sku-label">{painting.sku}</span>
          {getStockBadge(painting.availability)}
        </div>
        <h3 className="painting-title-link">{painting.name}</h3>
        <p className="artist-label-card">by {painting.artist}</p>
        <div className="card-footer-meta">
          <span className="card-medium">{painting.medium}</span>
          <div className="price-tag-container">
            {painting.discountPrice ? (
              <>
                <span className="original-price strike-price">{formatPrice(painting.price)}</span>
                <span className="current-price text-gold">{formatPrice(painting.discountPrice)}</span>
              </>
            ) : (
              <span className="current-price">{formatPrice(painting.price)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Acquisition button */}
      <div className="card-grid-footer">
        <button
          className="gold-btn btn-full"
          onClick={() => onAddToCart(painting)}
          disabled={painting.availability === 'Sold'}
        >
          <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          Acquire Original
        </button>
      </div>
    </div>
  );
};

export default PaintingCard;
