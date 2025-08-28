import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CreditCardIcon from '@mui/icons-material/CreditCard';
 

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/transfer', label: 'Transfers', icon: <SwapHorizIcon /> },
    { path: '/cards', label: 'Cards', icon: <CreditCardIcon /> },
  ];

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        bgcolor: 'white',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            flex: 1,
            color: '#6b7280',
            '&.Mui-selected': {
              color: '#1e3a8a',
              fontWeight: 600,
            },
            '&:hover': {
              bgcolor: 'rgba(30, 58, 138, 0.04)',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
            marginTop: '4px',
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
          },
        }}
      >
        {routes.map((route) => (
          <BottomNavigationAction
            key={route.path}
            label={route.label}
            value={route.path}
            icon={route.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation;
