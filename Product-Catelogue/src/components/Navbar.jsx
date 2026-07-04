import React, { useState } from 'react';

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
    <nav className="glass-panel sticky-nav">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => handlePageClick('home')}>
          <div className="logo-swirl">✦</div>
          <span className="logo-text">STARLIGHT</span>
          <span className="logo-subtext">GALLERY</span>
        </div>

        {/* Desktop Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li className={activePage === 'home' ? 'active' : ''} onClick={() => handlePageClick('home')}>Home</li>
          <li className={activePage === 'gallery' ? 'active' : ''} onClick={() => handlePageClick('gallery')}>Gallery</li>
          <li className={activePage === 'artist' ? 'active' : ''} onClick={() => handlePageClick('artist')}>The Artist</li>
          <li className={activePage === 'commissions' ? 'active' : ''} onClick={() => handlePageClick('commissions')}>Commissions</li>
          <li className={activePage === 'reviews' ? 'active' : ''} onClick={() => handlePageClick('reviews')}>Reviews</li>
          <li className={activePage === 'contact' ? 'active' : ''} onClick={() => handlePageClick('contact')}>Contact</li>
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
            
            {searchFocused && suggestions.length > 0 && (
              <div className="search-suggestions glass-panel">
                {suggestions.map(p => (
                  <div
                    key={p.id}
                    className="suggestion-item"
                    onMouseDown={() => selectSuggestion(p.name)}
                  >
                    <img src={p.images[0]} alt={p.name} className="sugg-thumb" />
                    <div>
                      <div className="sugg-name">{p.name}</div>
                      <div className="sugg-meta">{p.medium} | {p.collection}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compare */}
          <button className="action-btn-link" onClick={() => handlePageClick('compare')} title="Compare Paintings">
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            {compareList.length > 0 && <span className="counter-badge">{compareList.length}</span>}
          </button>

          {/* Wishlist */}
          <button className="action-btn-link" onClick={() => handlePageClick('profile')} title="Wishlist">
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            {wishlist.length > 0 && <span className="counter-badge">{wishlist.length}</span>}
          </button>

          {/* Cart Bag */}
          <button className="action-btn-link" onClick={onOpenCart} title="Shopping Cart">
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            {cart.length > 0 && <span className="counter-badge gold-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </button>

          {/* Theme Toggle */}
          <button className="action-btn-link theme-toggler" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle Light/Dark Theme">
            {theme === 'dark' ? (
              <svg className="action-icon text-gold" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05L5.75 4.343a1 1 0 10-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
            ) : (
              <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            )}
          </button>

          {/* User Profile / Login */}
          <div className="profile-container">
            {currentUser ? (
              <div className="profile-logged-in" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <img src={currentUser.profilePic} alt={currentUser.name} className="nav-avatar" />
                {showProfileMenu && (
                  <div className="profile-dropdown glass-panel">
                    <div className="dropdown-header">
                      <div className="drop-name">{currentUser.name}</div>
                      <div className="drop-email">{currentUser.email}</div>
                    </div>
                    <ul>
                      <li onClick={() => handlePageClick('profile')}>My Profile</li>
                      {currentUser.isAdmin && (
                        <li onClick={() => handlePageClick('admin')} className="admin-link">Curator Dashboard</li>
                      )}
                      <li onClick={onLogout} className="logout-link">Sign Out</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <button className="gold-btn btn-sm" onClick={onOpenAuth}>
                Sign In
              </button>
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
    </nav>
  );
};

export default Navbar;
