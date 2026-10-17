import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconSearch, IconBell, IconMenu, IconAI, IconLogout, IconSettings } from '../ui/Icons';
import { Dropdown } from '../ui/Components';

export function TopBar({ onMenuToggle, pageTitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const role = user?.role || 'employee';
  const roleLabel = { admin: 'Administrator', manager: 'Manager', employee: 'Employee' }[role] || role;

  const assistantPath = { admin: '/admin/ai-control', manager: '/manager/assistant', employee: '/employee/assistant' }[role] || '/employee/assistant';

  const dropdownItems = [
    ...(role !== 'employee' ? [] : [
      { label: 'My Profile', icon: null, onClick: () => navigate('/employee/profile') },
      { divider: true },
    ]),
    { label: 'Settings', onClick: () => navigate(role === 'admin' ? '/admin/settings' : '#') },
    { divider: true },
    { label: 'Sign Out', danger: true, onClick: logout },
  ];

  return (
    <header className="topbar" role="banner">
      {/* Mobile menu toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
        style={{ display: 'none' }}
        id="mobile-menu-btn"
      >
        <IconMenu style={{ width: 18, height: 18 }} />
      </button>

      {/* Page title (desktop) */}
      {pageTitle && (
        <span style={{
          fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)',
          marginRight: 4, display: 'none',
        }} className="topbar-title">
          {pageTitle}
        </span>
      )}

      {/* Search */}
      <div className="topbar-search" style={{ flex: 1, maxWidth: 320 }}>
        <IconSearch style={{ width: 16, height: 16, color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Search tasks, projects, people..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Global search"
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* AI Assistant quick launch */}
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => navigate(assistantPath)}
        style={{ gap: 6, borderColor: 'var(--color-violet-200)', color: 'var(--color-violet-600)' }}
      >
        <IconAI style={{ width: 14, height: 14 }} />
        AI Assistant
      </button>

      {/* Notifications */}
      <button className="topbar-icon-btn" aria-label="Notifications">
        <IconBell style={{ width: 16, height: 16 }} />
        <span className="notification-dot" aria-label="3 unread notifications" />
      </button>

      {/* User menu */}
      <Dropdown
        trigger={
          <div className="user-menu" role="button" aria-label="User menu" tabIndex={0}>
            <div className="user-avatar">
              {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="user-name">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="user-role">{roleLabel}</span>
            </div>
          </div>
        }
        items={dropdownItems}
      />
    </header>
  );
}
