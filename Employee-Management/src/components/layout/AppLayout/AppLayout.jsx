/**
 * Main app layout — wraps sidebar + topbar + content area
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import ToastContainer from '../../ui/Toast/ToastContainer';
import CommandPalette from '../../ui/CommandPalette/CommandPalette';
import { useCommandPalette } from '../../../hooks/useCommandPalette';
import './AppLayout.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  const toggleCollapse = () => setCollapsed((p) => !p);
  const toggleMobile   = () => setMobileOpen((p) => !p);

  return (
    <div className={`app-layout ${collapsed ? 'app-layout--collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="app-layout__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
      />

      <div className="app-layout__main">
        <Topbar
          onMenuToggle={toggleMobile}
          collapsed={collapsed}
          onOpenCommandPalette={() => setPaletteOpen(true)}
        />

        <main className="app-layout__content" id="main-content" role="main">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
