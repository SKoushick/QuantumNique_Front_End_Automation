import React from 'react';
import { motion } from 'framer-motion';

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
      <motion.div 
        className="glass-card painting-card-list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      >
        {/* Museum Frame Image Container */}
        <motion.div 
          className="frame-container list-frame" 
          onClick={() => onSelect(painting.id)}
          whileHover={{ scale: 1.02 }}
        >
          <img src={painting.images?.[0]} alt={painting.name} className="zoom-img" />
          <div className="collection-tag">{painting.collection}</div>
        </motion.div>

        {/* Painting Meta Center */}
        <div className="card-list-details">
          <div className="card-header-meta">
            <span className="sku-label">{painting.sku}</span>
            {getStockBadge(painting.availability)}
          </div>
          <motion.h3 
            className="painting-title-link" 
            onClick={() => onSelect(painting.id)}
            whileHover={{ color: "var(--c-gold)" }}
          >
            {painting.name}
          </motion.h3>
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
            <motion.button
              className="gold-btn btn-sm"
              onClick={() => onAddToCart(painting)}
              disabled={painting.availability === 'Sold'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Acquire Painting
            </motion.button>
            <div className="card-action-subrow">
              <motion.button
                className={`secondary-btn btn-icon ${isWishlisted ? 'liked' : ''}`}
                onClick={() => onToggleWishlist(painting.id)}
                title="Add to Wishlist"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="action-icon" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </motion.button>
              <motion.button
                className={`secondary-btn btn-icon ${isCompared ? 'compared' : ''}`}
                onClick={() => onToggleCompare(painting.id)}
                title="Add to Comparison"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </motion.button>
              <motion.button
                className="secondary-btn btn-icon"
                onClick={() => onQuickView(painting)}
                title="Quick View"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                👁
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid Layout
  return (
    <motion.div 
      className="glass-card painting-card-grid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    >
      {/* Framed Image */}
      <motion.div 
        className="frame-container grid-frame"
        whileHover={{ scale: 1.02 }}
      >
        <img
          src={painting.images?.[0]}
          alt={painting.name}
          className="zoom-img"
          onClick={() => onSelect(painting.id)}
        />
        <div className="collection-tag">{painting.collection}</div>
        
        {/* Floating actions overlay */}
        <motion.div 
          className="grid-overlay-actions"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.button
            className={`overlay-icon-btn ${isWishlisted ? 'active' : ''}`}
            onClick={() => onToggleWishlist(painting.id)}
            title="Wishlist"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </motion.button>
          <motion.button
            className={`overlay-icon-btn ${isCompared ? 'active' : ''}`}
            onClick={() => onToggleCompare(painting.id)}
            title="Compare Artworks"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            📊
          </motion.button>
          <motion.button
            className="overlay-icon-btn"
            onClick={() => onQuickView(painting)}
            title="Quick View"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            👁
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Frame Details */}
      <motion.div 
        className="card-grid-meta" 
        onClick={() => onSelect(painting.id)}
        whileHover={{ backgroundColor: "rgba(245, 158, 11, 0.05)" }}
      >
        <div className="card-header-meta">
          <span className="sku-label">{painting.sku}</span>
          {getStockBadge(painting.availability)}
        </div>
        <motion.h3 
          className="painting-title-link"
          whileHover={{ color: "var(--c-gold)" }}
        >
          {painting.name}
        </motion.h3>
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
      </motion.div>

      {/* Acquisition button */}
      <div className="card-grid-footer">
        <motion.button
          className="gold-btn btn-full"
          onClick={() => onAddToCart(painting)}
          disabled={painting.availability === 'Sold'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          Acquire Original
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PaintingCard;
