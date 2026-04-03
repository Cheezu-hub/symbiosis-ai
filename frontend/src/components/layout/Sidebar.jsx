import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Globe2,
  Truck,
  PlusCircle,
  HelpCircle,
  LogOut,
  Recycle,
  X,
  Zap
} from 'lucide-react';

const Sidebar = ({ 
  isLoggedIn, 
  onLogout, 
  collapsed, 
  setCollapsed, 
  mobileOpen, 
  setMobileOpen 
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/waste-listings', label: 'Waste Listings', icon: Recycle },
    { path: '/resource-requests', label: 'Resource Requests', icon: Store },
    { path: '/matches', label: 'AI Matches', icon: PlusCircle },
    { path: '/ai-insights', label: 'AI Insights', icon: Zap },
    { path: '/network', label: 'Network', icon: Globe2 },
    { path: '/impact', label: 'Impact', icon: LayoutDashboard },
  ];

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Recycle size={28} color="var(--primary, #58e077)" />
        {!collapsed && (
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary, #58e077), var(--secondary, #00daf3))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SymbioTech
          </span>
        )}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #a0a0a5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: isActive ? 'var(--primary, #58e077)' : 'var(--text-secondary, #a0a0a5)',
                background: isActive ? 'var(--bg-tertiary, #282a2c)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary, #58e077)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-tertiary, #282a2c)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              {!collapsed && <span style={{ fontWeight: 500 }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border, rgba(55, 57, 59, 0.5))' }}>
        <Link
          to="/support"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            color: 'var(--text-secondary, #a0a0a5)',
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <HelpCircle size={20} />
          {!collapsed && <span style={{ fontWeight: 500 }}>Support</span>}
        </Link>

        {isLoggedIn && (
          <button
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--error, #ef4444)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            {!collapsed && <span style={{ fontWeight: 500 }}>Logout</span>}
          </button>
        )}
      </div>

      {/* Collapse Toggle Button (Desktop Only) */}
      {!mobileOpen && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '100px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--primary, #58e077)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bg-primary, #121416)',
            boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.4))',
            zIndex: 1001
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      )}
    </>
  );

  // Mobile: Fixed overlay sidebar
  if (mobileOpen) {
    return (
      <>
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
        />
        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            background: 'var(--bg-secondary, #1a1c1e)',
            borderRight: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        background: 'var(--bg-secondary, #1a1c1e)',
        borderRight: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;