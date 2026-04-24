import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Import Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import WasteListingsPage from './pages/WasteListingsPage';
import ResourceRequestsPage from './pages/ResourceRequestsPage';
import MatchesPage from './pages/MatchesPage';
import NetworkPage from './pages/NetworkPage';
import ImpactPage from './pages/ImpactPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AIInsightsPage from './pages/AIInsightsPage';
import TradeRequestsPage from './pages/TradeRequestsPage';
import TransactionsPage from './pages/TransactionsPage';
import NotificationsPage from './pages/NotificationsPage';
import SupportPage from './pages/SupportPage';
import FinancePage from './pages/FinancePage';


// ============================================
// PrivateRoute Component - Protects authenticated routes
// ============================================
const PrivateRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ============================================
// PublicRoute Component - Redirects if already logged in
// ============================================
const PublicRoute = ({ children, isLoggedIn }) => {
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ============================================
// Loading Spinner Component
// ============================================
const LoadingSpinner = () => {
  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  );
};

// ============================================
// Main App Component
// ============================================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Check Authentication on Mount
  // ============================================
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const savedUser = localStorage.getItem('symbiotech_user');
      const token = localStorage.getItem('symbiotech_token');
      
      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('symbiotech_user');
      localStorage.removeItem('symbiotech_token');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Handle Login
  // ============================================
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('symbiotech_user', JSON.stringify(userData));
  };

  // ============================================
  // Handle Logout - Clear ALL auth data and redirect
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem('symbiotech_user');
    localStorage.removeItem('symbiotech_token');
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  // ============================================
  // Show Loading State While Checking Auth
  // ============================================
  if (loading) {
    return <LoadingSpinner />;
  }

  // ============================================
  // Render Routes
  // ============================================
  return (
    <Router>
      <Routes>
        {/* ============================================
            PUBLIC ROUTES - No Layout Wrapper (Full Screen)
            ============================================ */}
        <Route
          path="/"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <HomePage onLogin={handleLogin} />
            </PublicRoute>
          }
        />
        
        <Route
          path="/login"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <LoginPage onLogin={handleLogin} />
            </PublicRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <PublicRoute isLoggedIn={isLoggedIn}>
              <RegisterPage onLogin={handleLogin} />
            </PublicRoute>
          }
        />

        {/* ============================================
            PROTECTED ROUTES - With Layout Wrapper
            ============================================ */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <DashboardPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/waste-listings"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <WasteListingsPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/resource-requests"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <ResourceRequestsPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/matches"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <MatchesPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/ai-insights"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <AIInsightsPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/network"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <NetworkPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/trade-requests"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <TradeRequestsPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/transactions"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <TransactionsPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <NotificationsPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/impact"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <ImpactPage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <ProfilePage user={user} onLogout={handleLogout} />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/support"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <SupportPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <FinancePage user={user} />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* ============================================
            CATCH-ALL ROUTE - Redirect unknown paths
            ============================================ */}
        <Route
          path="*"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;