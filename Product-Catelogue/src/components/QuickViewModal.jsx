import React from 'react';

const QuickViewModal = ({ painting, onClose, onSelect, onAddToCart }) => {
  if (!painting) return null;

  const formatPrice = (p) => {
    if (p >= 1000000) return `$${(p / 1000000).toFixed(1)}M`;
    return `$${p.toLocaleString()}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-glass glass-panel quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        
        <div className="quickview-layout">
          {/* Framed Image */}
          <div className="quickview-image-panel">
            <div className="frame-container">
              <img src={painting.images[0]} alt={painting.name} className="quickview-img" />
            </div>
          </div>

          {/* Metadata */}
          <div className="quickview-details-panel">
            <span className="sku-label">{painting.sku}</span>
            <h2>{painting.name}</h2>
            <p className="artist-label-card">by {painting.artist}</p>
            
            <div className="quickview-spec-strip">
              <span><strong>Medium:</strong> {painting.medium}</span>
              <span><strong>Year:</strong> {painting.specifications.year}</span>
              <span><strong>Size:</strong> {painting.specifications.dimensions}</span>
            </div>

            <p className="quickview-desc">{painting.description}</p>

            <div className="price-tag-container quickview-price">
              {painting.discountPrice ? (
                <>
                  <span className="original-price strike-price">{formatPrice(painting.price)}</span>
                  <span className="current-price text-gold">{formatPrice(painting.discountPrice)}</span>
                </>
              ) : (
                <span className="current-price">{formatPrice(painting.price)}</span>
              )}
            </div>

            <div className="quickview-actions">
              <button
                className="gold-btn btn-full"
                onClick={() => {
                  onAddToCart(painting);
                  onClose();
                }}
                disabled={painting.availability === 'Sold'}
              >
                Acquire Artwork
              </button>
              <button
                className="secondary-btn btn-full"
                onClick={() => {
                  onSelect(painting.id);
                  onClose();
                }}
              >
                View Full Museum Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
