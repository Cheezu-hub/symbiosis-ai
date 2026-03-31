import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children, isLoggedIn, user, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary, #121416)',
      display: 'flex'
    }}>
      {isLoggedIn && (
        <Sidebar
          isLoggedIn={isLoggedIn}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />
      )}

      <div style={{
        flex: 1,
        marginLeft: isLoggedIn ? (sidebarCollapsed ? '72px' : '260px') : 0,
        transition: 'margin-left 0.3s ease'
      }}>
        {isLoggedIn && (
          <Topbar
            user={user}
            onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        )}

        <main style={{
          paddingTop: isLoggedIn ? '64px' : 0,
          padding: '2rem',
          minHeight: isLoggedIn ? 'calc(100vh - 64px)' : '100vh'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;