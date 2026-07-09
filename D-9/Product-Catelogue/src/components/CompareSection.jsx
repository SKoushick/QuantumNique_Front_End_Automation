import React from 'react';
import { getPaintings } from '../utils/storage';

const CompareSection = ({ compareIds, onRemoveCompare, onSelect, onAddToCart }) => {
  const allPaintings = getPaintings() || [];
  const paintings = allPaintings.filter(p => compareIds.includes(p.id));

  const formatPrice = (p) => {
    if (p >= 1000000) return `₹${(p / 1000000).toFixed(1)}M`;
    return `₹${p.toLocaleString()}`;
  };

  if (paintings.length === 0) {
    return (
      <div className="container compare-empty-view glass-card">
        <h2>Comparison Board</h2>
        <p>No artworks selected for comparison. Visit the exhibition catalogue and bookmark paintings to compare side-by-side.</p>
      </div>
    );
  }

  return (
    <div className="container compare-page">
      <div className="compare-header">
        <h2>Artwork Comparison Board</h2>
        <p>Compare medium details, canvas dimensions, and acquisition prices</p>
      </div>

      <div className="compare-table-wrapper glass-panel">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="row-attribute-title">Art Details</th>
              {paintings.map(p => (
                <th key={p.id} className="row-painting-header">
                  <div className="compare-header-card">
                    <button className="remove-compare-btn" onClick={() => onRemoveCompare(p.id)} title="Remove">&times;</button>
                    <div className="frame-container compare-frame">
                      <img src={p.images?.[0]} alt={p.name} />
                    </div>
                    <h4>{p.name}</h4>
                    <span className="sku-sub">{p.sku}</span>
                  </div>
                </th>
              ))}
              {/* Fill remaining slots for 3-col spacing uniformity */}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => (
                <th key={`empty-${idx}`} className="compare-empty-col">
                  <div className="empty-compare-slot">
                    <span>+ Add painting to compare</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr>
              <td className="row-attribute-title">Collector Price</td>
              {paintings.map(p => (
                <td key={p.id} className="text-gold font-bold">
                  {p.discountPrice ? (
                    <div>
                      <span className="strike-price margin-right">{formatPrice(p.price)}</span>
                      <span>{formatPrice(p.discountPrice)}</span>
                    </div>
                  ) : (
                    <span>{formatPrice(p.price)}</span>
                  )}
                </td>
              ))}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-p-${idx}`}></td>)}
            </tr>

            {/* Medium */}
            <tr>
              <td className="row-attribute-title">Medium Used</td>
              {paintings.map(p => <td key={p.id}>{p.medium}</td>)}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-m-${idx}`}></td>)}
            </tr>

            {/* Style */}
            <tr>
              <td className="row-attribute-title">Art Movement Style</td>
              {paintings.map(p => <td key={p.id}>{p.style}</td>)}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-s-${idx}`}></td>)}
            </tr>

            {/* Dimensions */}
            <tr>
              <td className="row-attribute-title">Original Dimensions</td>
              {paintings.map(p => <td key={p.id}>{p.specifications.dimensions}</td>)}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-d-${idx}`}></td>)}
            </tr>

            {/* Frame details */}
            <tr>
              <td className="row-attribute-title">Frame Included</td>
              {paintings.map(p => <td key={p.id}>{p.specifications.frame}</td>)}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-f-${idx}`}></td>)}
            </tr>

            {/* Year */}
            <tr>
              <td className="row-attribute-title">Year of Creation</td>
              {paintings.map(p => <td key={p.id}>{p.specifications.year}</td>)}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-y-${idx}`}></td>)}
            </tr>

            {/* Rating */}
            <tr>
              <td className="row-attribute-title">Viewer Rating</td>
              {paintings.map(p => (
                <td key={p.id}>
                  ★ {p.rating} / 5.0
                </td>
              ))}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-r-${idx}`}></td>)}
            </tr>

            {/* Availability */}
            <tr>
              <td className="row-attribute-title">Gallery Availability</td>
              {paintings.map(p => (
                <td key={p.id}>
                  <span className={`badge ${p.availability === 'In Stock' ? 'badge-in-stock' : p.availability === 'Low Stock' ? 'badge-low-stock' : 'badge-sold'}`}>
                    {p.availability}
                  </span>
                </td>
              ))}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-a-${idx}`}></td>)}
            </tr>

            {/* Actions */}
            <tr>
              <td className="row-attribute-title">Acquisition</td>
              {paintings.map(p => (
                <td key={p.id}>
                  <div className="compare-action-row">
                    <button
                      className="gold-btn btn-sm"
                      onClick={() => onAddToCart(p)}
                      disabled={p.availability === 'Sold'}
                    >
                      Acquire
                    </button>
                    <button className="secondary-btn btn-sm" onClick={() => onSelect(p.id)}>
                      Details
                    </button>
                  </div>
                </td>
              ))}
              {paintings.length < 3 && Array.from({ length: 3 - paintings.length }).map((_, idx) => <td key={`empty-ac-${idx}`}></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareSection;
