import React from 'react';
import { motion } from 'framer-motion';

const FilterSidebar = ({
  priceRange,
  setPriceRange,
  selectedMediums,
  setSelectedMediums,
  selectedStyles,
  setSelectedStyles,
  selectedOrientations,
  setSelectedOrientations,
  selectedAvailability,
  setSelectedAvailability,
  minRating,
  setMinRating,
  onReset
}) => {
  const mediums = ['Oil', 'Acrylic', 'Watercolor', 'Charcoal', 'Mixed Media'];
  const styles = ['Impressionism', 'Post-Impressionism', 'Floral Study', 'Landscape', 'Still Life'];
  const orientations = ['Landscape', 'Portrait', 'Square'];
  const availabilities = ['In Stock', 'Low Stock', 'Sold'];

  const toggleFilter = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const formatPrice = (p) => {
    if (p >= 1000000) return `₹${(p / 1000000).toFixed(1)}M`;
    return `₹${p.toLocaleString()}`;
  };

  return (
    <motion.aside 
      className="filter-sidebar glass-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="filter-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3>Exhibition Filters</h3>
        <motion.button 
          className="reset-btn-link" 
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear All
        </motion.button>
      </motion.div>

      {/* Price Range Slider */}
      <motion.div 
        className="filter-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h4>Price Cap</h4>
        <div className="price-slider-container">
          <input
            type="range"
            min="0"
            max="150000000"
            step="1000000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="slider-accent"
          />
          <div className="price-labels">
            <span>₹0</span>
            <span className="current-price-label">{formatPrice(priceRange)}</span>
          </div>
        </div>
      </motion.div>

      {/* Mediums */}
      <motion.div 
        className="filter-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4>Artistic Medium</h4>
        <div className="checkbox-group">
          {mediums.map((m, i) => (
            <motion.label 
              key={m} 
              className="custom-checkbox"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ x: 5 }}
            >
              <input
                type="checkbox"
                checked={selectedMediums.includes(m)}
                onChange={() => toggleFilter(selectedMediums, setSelectedMediums, m)}
              />
              <span className="checkmark"></span>
              {m}
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Styles */}
      <motion.div 
        className="filter-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h4>Artwork Style</h4>
        <div className="checkbox-group">
          {styles.map((s, i) => (
            <motion.label 
              key={s} 
              className="custom-checkbox"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              whileHover={{ x: 5 }}
            >
              <input
                type="checkbox"
                checked={selectedStyles.includes(s)}
                onChange={() => toggleFilter(selectedStyles, setSelectedStyles, s)}
              />
              <span className="checkmark"></span>
              {s}
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Orientation */}
      <motion.div 
        className="filter-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4>Frame Orientation</h4>
        <div className="checkbox-group">
          {orientations.map((o, i) => (
            <motion.label 
              key={o} 
              className="custom-checkbox"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ x: 5 }}
            >
              <input
                type="checkbox"
                checked={selectedOrientations.includes(o)}
                onChange={() => toggleFilter(selectedOrientations, setSelectedOrientations, o)}
              />
              <span className="checkmark"></span>
              {o}
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Availability */}
      <motion.div 
        className="filter-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h4>Availability</h4>
        <div className="checkbox-group">
          {availabilities.map((a, i) => (
            <motion.label 
              key={a} 
              className="custom-checkbox"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ x: 5 }}
            >
              <input
                type="checkbox"
                checked={selectedAvailability.includes(a)}
                onChange={() => toggleFilter(selectedAvailability, setSelectedAvailability, a)}
              />
              <span className="checkmark"></span>
              {a}
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Rating */}
      <motion.div 
        className="filter-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4>Minimum Rating</h4>
        <div className="rating-select-group">
          {[4.5, 4.7, 4.8, 4.9].map((r, i) => (
            <motion.button
              key={r}
              className={`rating-pill-btn ${minRating === r ? 'active' : ''}`}
              onClick={() => setMinRating(minRating === r ? null : r)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ★ {r}+
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default FilterSidebar;
