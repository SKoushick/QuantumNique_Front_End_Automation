import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({
  theme,
  setTheme,
  activePage,
  setActivePage,
  wishlist,
  compareList,
  cart,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  paintings
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Suggestions for search
  const suggestions = searchQuery.trim()
    ? paintings.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.medium.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.collection.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handlePageClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const selectSuggestion = (name) => {
    setSearchQuery(name);
    setActivePage('gallery');
    setSearchFocused(false);
  };

  return (
    <motion.nav 
      className="glass-panel sticky-nav"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="nav-container">
        {/* Logo */}
        <motion.div 
          className="nav-logo" 
          onClick={() => handlePageClick('home')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="logo-swirl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ✦
          </motion.div>
          <span className="logo-text">STARLIGHT</span>
          <span className="logo-subtext">GALLERY</span>
        </motion.div>

        {/* Desktop Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {['home', 'gallery', 'artist', 'commissions', 'reviews', 'contact'].map((page) => (
            <motion.li
              key={page}
              className={activePage === page ? 'active' : ''}
              onClick={() => handlePageClick(page)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {page.charAt(0).toUpperCase() + page.slice(1).replace('artist', 'The Artist')}
            </motion.li>
          ))}
        </ul>

        {/* Right Action Icons & Search */}
        <div className="nav-actions">
          {/* Search bar */}
          <div className="search-wrapper">
            <div className="search-box">
              <svg className="action-icon search-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Search catalog, SKU, medium..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
            </div>
            
            <AnimatePresence>
              {searchFocused && suggestions.length > 0 && (
                <motion.div 
                  className="search-suggestions glass-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {suggestions.map((p, i) => (
                    <motion.div
                      key={p.id}
                      className="suggestion-item"
                      onMouseDown={() => selectSuggestion(p.name)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img src={p.images?.[0]} alt={p.name} className="sugg-thumb" />
                      <div>
                        <div className="sugg-name">{p.name}</div>
                        <div className="sugg-meta">{p.medium} | {p.collection}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compare */}
          <motion.button 
            className="action-btn-link" 
            onClick={() => handlePageClick('compare')} 
            title="Compare Paintings"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            {compareList.length > 0 && <motion.span 
              className="counter-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={compareList.length}
            >{compareList.length}</motion.span>}
          </motion.button>

          {/* Wishlist */}
          <motion.button 
            className="action-btn-link" 
            onClick={() => handlePageClick('profile')} 
            title="Wishlist"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            {wishlist.length > 0 && <motion.span 
              className="counter-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={wishlist.length}
            >{wishlist.length}</motion.span>}
          </motion.button>

          {/* Cart Bag */}
          <motion.button 
            className="action-btn-link" 
            onClick={onOpenCart} 
            title="Shopping Cart"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            {cart.length > 0 && <motion.span 
              className="counter-badge gold-count"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={cart.reduce((sum, item) => sum + item.quantity, 0)}
            >{cart.reduce((sum, item) => sum + item.quantity, 0)}</motion.span>}
          </motion.button>

          {/* Theme Toggle */}
          <motion.button 
            className="action-btn-link theme-toggler" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            title="Toggle Light/Dark Theme"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {theme === 'dark' ? (
              <svg className="action-icon text-gold" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05L5.75 4.343a1 1 0 10-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
            ) : (
              <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            )}
          </motion.button>

          {/* User Profile / Login */}
          <div className="profile-container">
            {currentUser ? (
              <div className="profile-logged-in">
                <motion.img 
                  src={currentUser.profilePic} 
                  alt={currentUser.name} 
                  className="nav-avatar"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      className="profile-dropdown glass-panel"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="dropdown-header">
                        <div className="drop-name">{currentUser.name}</div>
                        <div className="drop-email">{currentUser.email}</div>
                      </div>
                      <ul>
                        <motion.li 
                          onClick={() => handlePageClick('profile')}
                          whileHover={{ x: 5 }}
                        >
                          My Profile
                        </motion.li>
                        {currentUser.isAdmin && (
                          <motion.li 
                            onClick={() => handlePageClick('admin')} 
                            className="admin-link"
                            whileHover={{ x: 5 }}
                          >
                            Curator Dashboard
                          </motion.li>
                        )}
                        <motion.li 
                          onClick={onLogout} 
                          className="logout-link"
                          whileHover={{ x: 5 }}
                        >
                          Sign Out
                        </motion.li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button 
                className="gold-btn btn-sm" 
                onClick={onOpenAuth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className={`bar ${mobileMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${mobileMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${mobileMenuOpen ? 'open' : ''}`}></div>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
