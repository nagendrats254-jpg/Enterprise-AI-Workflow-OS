import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ children, pageTitle }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="main-area">
        <TopBar
          onMenuToggle={() => setMobileOpen(o => !o)}
          pageTitle={pageTitle}
        />
        <main className="page-content" role="main" id="main-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .topbar-title { display: block !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
