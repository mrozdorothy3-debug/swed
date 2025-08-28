import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Container
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

interface SharedLayoutProps {
    children: React.ReactNode;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [notificationCount] = React.useState(3);
    const currentDate = new Date();
    const isDashboard = location.pathname === '/';

    const getActiveSection = () => {
        switch (location.pathname) {
            case '/':
                return 'dashboard';
            case '/transfer':
                return 'transfers';
            case '/cards':
                return 'cards';
            case '/transactions':
                return 'transactions';
            default:
                return '';
        }
    };

    const activeSection = getActiveSection();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
<AppBar position="static" sx={{ 
                background: 'linear-gradient(135deg, #1B3A57 0%, #2C5282 100%)', 
                boxShadow: 'none', 
                pb: isDashboard ? 4 : 2
            }}>
                <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={`${process.env.PUBLIC_URL}/logo.png`}
                            alt="SweedBit Bank"
                            sx={{
                                height: 40,
                                width: 'auto',
                                mr: 2,
                                filter: 'brightness(0) invert(1)',
                                opacity: 0.95
                            }}
                        />
                        {location.pathname === '/transfer' && (
                            <Typography 
                                sx={{
                                    color: 'white',
                                    fontFamily: '"Pacifico", cursive',
                                    fontSize: '1.5rem',
                                    opacity: 0.95
                                }}
                            >
                                Make a Transfer
                            </Typography>
                        )}
                        {location.pathname === '/cards' && (
                            <Typography 
                                sx={{
                                    color: 'white',
                                    fontFamily: '"Pacifico", cursive',
                                    fontSize: '1.5rem',
                                    opacity: 0.95
                                }}
                            >
                                Cards
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            sx={{
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <Badge badgeContent={notificationCount} color="error" sx={{
                                '& .MuiBadge-badge': {
                                    bgcolor: '#ff4444',
                                    color: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }
                            }}>
                                <NotificationsNoneIcon sx={{
                                    fontSize: 24,
                                    transform: 'rotate(15deg)',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'rotate(0deg) scale(1.1)'
                                    }
                                }} />
                            </Badge>
                </IconButton>
            </Box>
          </Toolbar>
          {isDashboard && (
            <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: 'white', opacity: 0.95, mb: 1 }}>
                Welcome back, Hannah
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                {currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
          )}
            </AppBar>

            <Container maxWidth="sm" sx={{ mt: -4, mb: 8, px: 2 }}>
                {children}
            </Container>

            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-around',
                    py: 1.5,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                    zIndex: 1000
                }}
            >
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{
                        flexDirection: 'column',
                        borderRadius: 2,
                        p: 1,
                        color: activeSection === 'dashboard' ? 'primary.main' : 'text.secondary',
                        bgcolor: activeSection === 'dashboard' ? 'primary.lighter' : 'transparent',
                        '&:hover': {
                            bgcolor: activeSection === 'dashboard' ? 'primary.lighter' : 'action.hover'
                        }
                    }}
                >
                    <HomeIcon sx={{ mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: activeSection === 'dashboard' ? 600 : 400 }}>
                        Home
                    </Typography>
                </IconButton>

                <IconButton
                    onClick={() => navigate('/transfer')}
                    sx={{
                        flexDirection: 'column',
                        borderRadius: 2,
                        p: 1,
                        color: activeSection === 'transfers' ? 'primary.main' : 'text.secondary',
                        bgcolor: activeSection === 'transfers' ? 'primary.lighter' : 'transparent',
                        '&:hover': {
                            bgcolor: activeSection === 'transfers' ? 'primary.lighter' : 'action.hover'
                        }
                    }}
                >
                    <SwapHorizIcon sx={{ mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: activeSection === 'transfers' ? 600 : 400 }}>
                        Transfers
                    </Typography>
                </IconButton>

                <IconButton
                    onClick={() => navigate('/cards')}
                    sx={{
                        flexDirection: 'column',
                        borderRadius: 2,
                        p: 1,
                        color: activeSection === 'cards' ? 'primary.main' : 'text.secondary',
                        bgcolor: activeSection === 'cards' ? 'primary.lighter' : 'transparent',
                        '&:hover': {
                            bgcolor: activeSection === 'cards' ? 'primary.lighter' : 'action.hover'
                        }
                    }}
                >
                    <CreditCardIcon sx={{ mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: activeSection === 'cards' ? 600 : 400 }}>
                        Cards
                    </Typography>
                </IconButton>

                <IconButton
                    onClick={() => navigate('/transactions')}
                    sx={{
                        flexDirection: 'column',
                        borderRadius: 2,
                        p: 1,
                        color: activeSection === 'transactions' ? 'primary.main' : 'text.secondary',
                        bgcolor: activeSection === 'transactions' ? 'primary.lighter' : 'transparent',
                        '&:hover': {
                            bgcolor: activeSection === 'transactions' ? 'primary.lighter' : 'action.hover'
                        }
                    }}
                >
                    <HistoryIcon sx={{ mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: activeSection === 'transactions' ? 600 : 400 }}>
                        Transactions
                    </Typography>
                </IconButton>
            </Box>
        </Box>
    );
};

export default SharedLayout;
