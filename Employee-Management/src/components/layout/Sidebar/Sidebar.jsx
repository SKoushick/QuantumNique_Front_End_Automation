/**
 * Sidebar navigation component with collapsible support
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarOff, DollarSign,
  CheckSquare, TrendingUp, Megaphone, FileText, Package, BarChart2,
  Shield, Settings, ChevronLeft, ChevronRight, LogOut, Bell,
  Zap, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import './Sidebar.css';

const ICON_MAP = {
  LayoutDashboard, Users, Building2, Clock, CalendarOff, DollarSign,
  CheckSquare, TrendingUp, Megaphone, FileText, Package, BarChart2,
  Shield, Settings,
};

const NAV_SECTIONS = [
  {
    title: 'Core',
    items: [
      { path: '/',            label: 'Dashboard',     icon: 'LayoutDashboard', roles: ['admin','hr','manager','employee'] },
      { path: '/employees',   label: 'Employees',     icon: 'Users',           roles: ['admin','hr','manager'] },
      { path: '/departments', label: 'Departments',   icon: 'Building2',       roles: ['admin','hr'] },
    ],
  },
  {
    title: 'Workforce',
    items: [
      { path: '/attendance',  label: 'Attendance',    icon: 'Clock',           roles: ['admin','hr','manager','employee'] },
      { path: '/leave',       label: 'Leave',         icon: 'CalendarOff',     roles: ['admin','hr','manager','employee'] },
      { path: '/payroll',     label: 'Payroll',       icon: 'DollarSign',      roles: ['admin','hr'] },
    ],
  },
  {
    title: 'Work',
    items: [
      { path: '/tasks',       label: 'Tasks',         icon: 'CheckSquare',     roles: ['admin','hr','manager','employee'] },
      { path: '/performance', label: 'Performance',   icon: 'TrendingUp',      roles: ['admin','hr','manager','employee'] },
    ],
  },
  {
    title: 'Organization',
    items: [
      { path: '/announcements', label: 'Announcements', icon: 'Megaphone',   roles: ['admin','hr','manager','employee'] },
      { path: '/documents',     label: 'Documents',     icon: 'FileText',    roles: ['admin','hr','manager','employee'] },
      { path: '/assets',        label: 'Assets',        icon: 'Package',     roles: ['admin','hr'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { path: '/reports',  label: 'Reports',   icon: 'BarChart2', roles: ['admin','hr','manager'] },
      { path: '/audit',    label: 'Audit Log', icon: 'Shield',    roles: ['admin'] },
      { path: '/settings', label: 'Settings',  icon: 'Settings',  roles: ['admin','hr'] },
    ],
  },
];

export default function Sidebar({ collapsed, onCollapse }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} role="navigation" aria-label="Main navigation">
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Zap size={20} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">NexusHR</span>
            <span className="sidebar__logo-tagline">Enterprise</span>
          </div>
        )}
        <button
          className="sidebar__collapse-btn"
          onClick={onCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="sidebar__nav">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => hasRole(...item.roles));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title} className="sidebar__section">
              {!collapsed && (
                <span className="sidebar__section-title">{section.title}</span>
              )}
              {visibleItems.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sidebar__item-icon">
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
                    {isActive && !collapsed && <span className="sidebar__item-indicator" aria-hidden="true" />}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── User Profile ─────────────────────────────────────── */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div
            className="sidebar__avatar"
            style={{ background: getAvatarColor(`${user?.firstName} ${user?.lastName}`) }}
            aria-hidden="true"
          >
            {getInitials(`${user?.firstName} ${user?.lastName}`)}
          </div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.firstName} {user?.lastName}</span>
              <span className="sidebar__user-role">{user?.role?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <button
          className="sidebar__logout-btn"
          onClick={logout}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
