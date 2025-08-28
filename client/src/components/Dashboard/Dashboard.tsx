import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAuth } from '../../context/AuthContext';
import { useAccounts } from '../../context/AccountContext';

const Dashboard = () => {
  const { username } = useAuth();
  const { accounts, loading } = useAccounts();
  const [showNotificationError, setShowNotificationError] = useState(false);

  // Convert currency to formatted string
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const [showBalance, setShowBalance] = useState(false);

  const handleNotificationClick = () => {
    setShowNotificationError(true);
  };

  const closeNotificationError = () => {
    setShowNotificationError(false);
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Dark Blue Header */}
      <Box
        sx={{
          bgcolor: '#1e3a8a', // Dark blue
          color: 'white',
          px: 3,
          py: 4,
          pb: 8,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Brand Logo and Info - Left Side */}
        <Box sx={{ position: 'absolute', top: 8, left: 16, textAlign: 'left' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{
              width: 48,
              height: 48,
              filter: 'brightness(0) invert(1)', // Makes logo white
              mb: 0.5,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {`Welcome back, ${username || 'User'} 👋`}
          </Typography>
        </Box>

        {/* Notification Bell */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <IconButton sx={{ color: 'white' }} onClick={handleNotificationClick}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Main Content Area - Proper spacing from header */}
      <Box
        sx={{
          px: 3,
          pb: 10, // Space for bottom navigation
          mt: 4, // Reduced margin to bring cards closer but not touching header
        }}
      >
        {/* Single Account Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <CardContent
            sx={{
              p: 3,
              borderLeft: '4px solid #10b981', // Green accent
              pl: 3,
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1f2937',
                  fontSize: '1.125rem',
                }}
              >
                Account
              </Typography>
              <IconButton aria-label={showBalance ? 'Hide balance' : 'Show balance'} onClick={() => setShowBalance((v) => !v)}>
                {showBalance ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Box>
            <Typography
              variant="h3"
              sx={{
                mb: 1,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.025em',
                fontSize: { xs: '2rem', sm: '2.5rem' },
                lineHeight: 1.1,
              }}
> 
              {showBalance ? (loading ? 'Loading…' : formatCurrency(accounts?.[0]?.balance ?? 0)) : '••••••'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {showBalance ? 'Available Balance' : 'Hidden'}
            </Typography>

          </CardContent>
        </Card>

        <Card sx={{ mt: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', bgcolor: '#1e3a8a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '.02em' }}>
                Markets
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                Snapshot • 12:31 PM ET
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '.08em' }}>
                  Equities
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>AAPL</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>Apple</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>$228.72</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#bbf7d0' }} />
                      <Typography variant="caption" sx={{ color: '#bbf7d0', fontWeight: 700 }}>+1.2%</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1, borderRadius: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>MSFT</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>Microsoft</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>$423.05</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#bbf7d0' }} />
                      <Typography variant="caption" sx={{ color: '#bbf7d0', fontWeight: 700 }}>+0.4%</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>TSLA</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>Tesla</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>$198.11</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <TrendingDownIcon sx={{ fontSize: 16, color: '#fecaca' }} />
                      <Typography variant="caption" sx={{ color: '#fecaca', fontWeight: 700 }}>-0.8%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '.08em' }}>
                  FX
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>EUR/USD</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>Euro / US Dollar</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>1.0884</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#bbf7d0' }} />
                      <Typography variant="caption" sx={{ color: '#bbf7d0', fontWeight: 700 }}>+0.21%</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1, borderRadius: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>GBP/USD</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>British Pound / US Dollar</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>1.2732</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <TrendingDownIcon sx={{ fontSize: 16, color: '#fecaca' }} />
                      <Typography variant="caption" sx={{ color: '#fecaca', fontWeight: 700 }}>-0.15%</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, px: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>USD/JPY</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>US Dollar / Japanese Yen</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>156.42</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#bbf7d0' }} />
                      <Typography variant="caption" sx={{ color: '#bbf7d0', fontWeight: 700 }}>+0.35%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Notification Error Modal */}
      <Dialog
        open={showNotificationError}
        onClose={closeNotificationError}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          m: 0,
          p: 3,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#e53e3e' }}>
            No New Notifications
          </Typography>
          <IconButton
            aria-label="close"
            onClick={closeNotificationError}
            sx={{
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
            You have no new notifications at this time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={closeNotificationError}
            variant="outlined"
            sx={{
              borderColor: '#e53e3e',
              color: '#e53e3e',
              '&:hover': {
                borderColor: '#c53030',
                bgcolor: 'rgba(229, 62, 62, 0.04)',
              }
            }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
