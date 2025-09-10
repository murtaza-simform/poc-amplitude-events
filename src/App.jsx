import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import { track } from './amplitude';
import { EVENTS } from './analyticsEvents';

function RouteChangeTracker() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
  if (path.startsWith('/analytics')) return;
    switch (true) {
      case path.startsWith('/login'): track(EVENTS.LOGIN_PAGE_VIEWED); break;
      case path.startsWith('/register'): track(EVENTS.REGISTER_PAGE_VIEWED); break;
      case path.startsWith('/home'): track(EVENTS.HOME_PAGE_VIEWED); break;
      default: break;
    }
  }, [location]);
  return null;
}

function App() {
  return (
    <Router>
      <RouteChangeTracker />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/home" element={<Home />} />
  <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
