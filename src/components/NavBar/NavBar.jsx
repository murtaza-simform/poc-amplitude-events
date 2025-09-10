import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

export default function NavBar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const inAnalytics = location.pathname.startsWith('/analytics');
  return (
    <AppBar position="static" className="navbar-appbar">
      <Toolbar className="navbar-toolbar">
        <Typography variant="h6" className="navbar-title">
          User Management
        </Typography>
        <Box className="navbar-userinfo">
          <Typography variant="body2" className="navbar-usertext">
            {currentUser.email} ({currentUser.group})
          </Typography>
        </Box>
        <Button color="inherit" onClick={() => navigate(inAnalytics ? '/home' : '/analytics')}>
          {inAnalytics ? 'Home' : 'Analytics'}
        </Button>
        <Button color="inherit" onClick={onLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}
