/**
 * Top navigation bar with search, notifications, and user menu
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, Menu, ChevronDown, LogOut,
  User, Settings, Command, X, Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import { getInitials, getAvatarColor, formatRelative } from '../../../utils/formatters';
import './Topbar.css';

const THEME_KEY = 'ems_theme';

export default function Topbar({ onMenuToggle, collapsed, onOpenCommandPalette }) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen]           = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [notifOpen, setNotifOpen]             = useState(false);
  const [userMenuOpen, setUserMenuOpen]       = useState(false);
  const [theme, setTheme]                     = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  const searchRef = useRef(null);
  const notifRef  = useRef(null);
  const userRef   = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Ctrl+K opens command palette
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fullName = `${user?.firstName} ${user?.lastName}`;

  return (
    <header className="topbar" role="banner">
      {/* ── Left: hamburger + breadcrumb ─────────── */}
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <div className="topbar__brand">
          <span className="topbar__brand-title">NexusHR</span>
          <span className="topbar__brand-env">Production</span>
        </div>
      </div>

      {/* ── Center: Search ────────────────────────── */}
      <div className={`topbar__search-container ${searchOpen ? 'topbar__search-container--open' : ''}`}>
        <div className="topbar__search" role="search">
          <Search size={16} className="topbar__search-icon" aria-hidden="true" />
          <input
            ref={searchRef}
            type="text"
            className="topbar__search-input"
            placeholder="Search pages and actions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { setSearchOpen(true); onOpenCommandPalette?.(); }}
            onClick={() => onOpenCommandPalette?.()}
            readOnly
            aria-label="Open command palette"
          />
          <kbd className="topbar__search-shortcut" aria-label="Press Ctrl+K to open command palette" onClick={() => onOpenCommandPalette?.()} style={{ cursor: 'pointer' }}>
            <Command size={11} /> K
          </kbd>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="topbar__search-clear" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Right: actions ────────────────────────── */}
      <div className="topbar__actions">
        {/* Theme toggle */}
        <button
          className="topbar__icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="topbar__dropdown-wrapper" ref={notifRef}>
          <button
            className="topbar__icon-btn topbar__notif-btn"
            onClick={() => { setNotifOpen((p) => !p); setUserMenuOpen(false); }}
            aria-label={`Notifications (${unreadCount} unread)`}
            aria-expanded={notifOpen}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="topbar__badge" aria-hidden="true">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="topbar__dropdown topbar__notif-panel animate-scaleIn" role="dialog" aria-label="Notifications">
              <div className="topbar__dropdown-header">
                <span className="topbar__dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="topbar__dropdown-action"
                    onClick={markAllNotificationsRead}
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="topbar__notif-list">
                {notifications.length === 0 ? (
                  <div className="topbar__notif-empty">
                    <Bell size={32} opacity={0.3} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      className={`topbar__notif-item ${!n.read ? 'topbar__notif-item--unread' : ''}`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className="topbar__notif-dot" aria-hidden="true" />
                      <div className="topbar__notif-content">
                        <p className="topbar__notif-msg">{n.message}</p>
                        <span className="topbar__notif-time">{formatRelative(n.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="topbar__dropdown-wrapper" ref={userRef}>
          <button
            className="topbar__user-btn"
            onClick={() => { setUserMenuOpen((p) => !p); setNotifOpen(false); }}
            aria-expanded={userMenuOpen}
            aria-label="User menu"
          >
            <div
              className="topbar__user-avatar"
              style={{ background: getAvatarColor(fullName) }}
              aria-hidden="true"
            >
              {getInitials(fullName)}
            </div>
            <div className="topbar__user-info">
              <span className="topbar__user-name">{fullName}</span>
              <span className="topbar__user-role">{user?.role?.toUpperCase()}</span>
            </div>
            <ChevronDown size={14} className={`topbar__chevron ${userMenuOpen ? 'topbar__chevron--open' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="topbar__dropdown topbar__user-menu animate-scaleIn" role="menu">
              <div className="topbar__user-menu-header">
                <div className="topbar__user-avatar topbar__user-avatar--lg" style={{ background: getAvatarColor(fullName) }}>
                  {getInitials(fullName)}
                </div>
                <div>
                  <p className="topbar__user-menu-name">{fullName}</p>
                  <p className="topbar__user-menu-email">{user?.email}</p>
                </div>
              </div>
              <div className="topbar__dropdown-divider" />
              <button className="topbar__menu-item" onClick={() => { navigate('/settings'); setUserMenuOpen(false); }} role="menuitem">
                <User size={15} /> My Profile
              </button>
              <button className="topbar__menu-item" onClick={() => { navigate('/settings'); setUserMenuOpen(false); }} role="menuitem">
                <Settings size={15} /> Settings
              </button>
              <div className="topbar__dropdown-divider" />
              <button className="topbar__menu-item topbar__menu-item--danger" onClick={logout} role="menuitem">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
