import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconDashboard, IconUsers, IconBuilding, IconFolders, IconTasks,
  IconChat, IconWorkload, IconReports, IconAI, IconRisk, IconAudit,
  IconSettings, IconLogout, IconEmployee, IconML, IconWhatIf, IconProfile,
  IconMenu, IconX
} from '../ui/Icons';

// Navigation configuration per role
const NAV_CONFIG = {
  admin: [
    {
      section: 'Overview',
      items: [
        { label: 'Dashboard',       to: '/admin',              icon: <IconDashboard /> },
        { label: 'Organization',    to: '/admin/organization', icon: <IconBuilding /> },
        { label: 'Projects',        to: '/admin/projects',     icon: <IconFolders /> },
      ],
    },
    {
      section: 'Work',
      items: [
        { label: 'Tasks',      to: '/admin/tasks',     icon: <IconTasks /> },
        { label: 'Team Chat',  to: '/admin/chat',      icon: <IconChat /> },
        { label: 'Workload',   to: '/admin/workload',  icon: <IconWorkload /> },
        { label: 'Reports',    to: '/admin/reports',   icon: <IconReports /> },
      ],
    },
    {
      section: 'AI & ML',
      items: [
        { label: 'ML Management',  to: '/admin/ml',          icon: <IconML /> },
        { label: 'AI Control',     to: '/admin/ai-control',  icon: <IconAI /> },
        { label: 'AI Analysis',    to: '/admin/ai-analysis', icon: <IconRisk /> },
        { label: 'What-If',        to: '/admin/whatif',      icon: <IconWhatIf /> },
      ],
    },
    {
      section: 'System',
      items: [
        { label: 'Audit Logs', to: '/admin/audit',    icon: <IconAudit /> },
        { label: 'Settings',   to: '/admin/settings', icon: <IconSettings /> },
      ],
    },
  ],
  manager: [
    {
      section: 'Main',
      items: [
        { label: 'Dashboard',     to: '/manager',           icon: <IconDashboard /> },
        { label: 'Projects',      to: '/manager/projects',  icon: <IconFolders /> },
        { label: 'Tasks',         to: '/manager/tasks',     icon: <IconTasks /> },
        { label: 'Team Chat',     to: '/manager/chat',      icon: <IconChat /> },
        { label: 'Workload',      to: '/manager/workload',  icon: <IconWorkload /> },
        { label: 'Reports',       to: '/manager/reports',   icon: <IconReports /> },
        { label: 'Risk Analysis', to: '/manager/risk',      icon: <IconRisk /> },
        { label: 'AI Assistant',  to: '/manager/assistant', icon: <IconAI /> },
      ],
    },
  ],
  employee: [
    {
      section: 'My Work',
      items: [
        { label: 'Dashboard',    to: '/employee',              icon: <IconDashboard /> },
        { label: 'My Tasks',     to: '/employee/tasks',        icon: <IconTasks /> },
        { label: 'My Projects',  to: '/employee/projects',     icon: <IconFolders /> },
        { label: 'My Workload',  to: '/employee/workload',     icon: <IconWorkload /> },
        { label: 'AI Assistant', to: '/employee/assistant',    icon: <IconAI /> },
        { label: 'Profile',      to: '/employee/profile',      icon: <IconProfile /> },
      ],
    },
  ],
};

function SidebarLogo({ onMobileClose }) {
  return (
    <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="nav-logo-mark" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10" cy="10" r="7"/>
            <path d="M10 6v4l2.5 2.5"/>
            <circle cx="10" cy="10" r="1.5" fill="white" stroke="none"/>
          </svg>
        </div>
        <div>
          <div className="nav-logo-name">ENTERPRISE.AI</div>
          <div className="nav-logo-sub">Workflow OS</div>
        </div>
      </div>
      {onMobileClose && (
        <button
          className="sidebar-close-btn"
          onClick={onMobileClose}
          aria-label="Close navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <IconX style={{ width: 18, height: 18 }} />
        </button>
      )}
    </div>
  );
}

function NavSection({ section, items, onNavigate }) {
  const location = useLocation();

  return (
    <div className="nav-section">
      <div className="nav-section-label">{section}</div>
      {items.map(item => {
        const isActive = location.pathname === item.to ||
          (item.to !== '/admin' && item.to !== '/manager' && item.to !== '/employee' &&
           location.pathname.startsWith(item.to));
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`nav-item ${isActive ? 'active' : ''}`}
            end={item.to === '/admin' || item.to === '/manager' || item.to === '/employee'}
            onClick={() => onNavigate?.()}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'employee';
  const navSections = NAV_CONFIG[role] || NAV_CONFIG.employee;

  const roleLabel = { admin: 'Administrator', manager: 'Manager', employee: 'Employee' }[role] || role;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 49, display: 'none',
          }}
          className="mobile-overlay"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <nav
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        aria-label="Primary navigation"
      >
        <SidebarLogo onMobileClose={onMobileClose} />

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {navSections.map(s => (
            <NavSection key={s.section} section={s.section} items={s.items} onNavigate={onMobileClose} />
          ))}
        </div>

        {/* Bottom: user info + logout */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 10px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', marginBottom: 4,
          }}>
            <div className="user-avatar" style={{ width: 28, height: 28, borderRadius: 6, fontSize: 11 }}>
              {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.email || 'User'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {roleLabel}
              </div>
            </div>
          </div>
          <button
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={logout}
          >
            <span className="nav-icon"><IconLogout /></span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
