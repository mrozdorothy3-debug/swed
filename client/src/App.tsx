import React, { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AccountProviderWrapper from './components/AccountProviderWrapper';
import Transfer from './components/Transfer';
import Cards from './components/Cards';
import ResolveDebt from './components/ResolveDebt';
import InactivityWarning from './components/InactivityWarning';
import { Box } from '@mui/material';
import { theme } from './theme';

import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/Admin/AdminLayout';

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
 

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AdminRedirectOrDashboard() {
  const { role } = useAuth();
  
  if (role === 'admin') {
    console.log('Redirecting admin to /admin');
    return <Navigate to="/admin" replace />;
  }
  
  return <Dashboard />;
}

function App() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AccountProviderWrapper>
            <Router>
              <ScrollToTop />
              <AppRoutes />
            </Router>
          </AccountProviderWrapper>
        </AuthProvider>
      </ThemeProvider>
    </Box>
  );
}

export default App;

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, role, username } = useAuth();
  const location = useLocation();
  
  // Debug logging
  console.log('RequireAdmin check - Auth:', isAuthenticated, 'Role:', role, 'Username:', username);
  
  // Allow System Administrator to access admin panel
  const isSystemAdmin = username === 'System Administrator';
  
  if (!isAuthenticated || (role !== 'admin' && !isSystemAdmin)) {
    console.log('Access denied - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('Admin access granted');
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const { showInactivityWarning, dismissInactivityWarning, role, username } = useAuth();
  const hideNav = location.pathname === '/login' || role === 'admin';
  
  // Debug logging
  console.log('Current user:', username, 'Role:', role);
  
  // Force admin redirect for System Administrator
  const isSystemAdmin = username === 'System Administrator';
  if (isSystemAdmin && location.pathname === '/' && role !== 'admin') {
    console.log('Forcing redirect to admin for System Administrator');
  }
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Admin experience */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>} />
        {/* User experience */}
        <Route path="/" element={<RequireAuth><AdminRedirectOrDashboard /></RequireAuth>} />
        <Route path="/transfer" element={<RequireAuth><Transfer /></RequireAuth>} />
        <Route path="/cards" element={<RequireAuth><Cards /></RequireAuth>} />
        <Route path="/resolve-debt" element={<RequireAuth><ResolveDebt /></RequireAuth>} />
        <Route path="*" element={<Navigate to={role === 'admin' ? '/admin' : '/'} replace />} />
      </Routes>
      {!hideNav && <Navigation />}
      {showInactivityWarning && (
        <InactivityWarning onDismiss={dismissInactivityWarning} />
      )}
    </>
  );
}
