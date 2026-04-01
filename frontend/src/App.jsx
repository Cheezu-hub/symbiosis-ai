import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// PrivateRoute Component - Protects authenticated routes
const PrivateRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PublicRoute Component - Redirects if already logged in
const PublicRoute = ({ children, isLoggedIn }) => {
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Loading Spinner Component
const LoadingSpinner = () => {
  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('symbiotech_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('symbiotech_user');
    localStorage.removeItem('symbiotech_token');
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - No Layout Wrapper (Full Screen) */}
        <Route element={<PublicRoute isLoggedIn={isLoggedIn}><Outlet /></PublicRoute>}>
          <Route path="/" element={<HomePage onLogin={handleLogin} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
        </Route>

        {/* Protected Routes - With Layout Wrapper */}
        <Route
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Layout isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}>
                <Outlet />
              </Layout>
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/waste-listings" element={<WasteListingsPage user={user} />} />
          <Route path="/resource-requests" element={<ResourceRequestsPage user={user} />} />
          <Route path="/matches" element={<MatchesPage user={user} />} />
          <Route path="/network" element={<NetworkPage user={user} />} />
          <Route path="/impact" element={<ImpactPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
        </Route>

        {/* Catch-All Route */}
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