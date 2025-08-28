import React from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface InactivityWarningProps {
  onDismiss: () => void;
}

const InactivityWarning: React.FC<InactivityWarningProps> = ({ onDismiss }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
        width: '100%',
      }}
    >
      <Alert
        severity="warning"
        icon={<AccessTimeIcon />}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onDismiss}
            sx={{ fontWeight: 600 }}
          >
            Stay Logged In
          </Button>
        }
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid #fbbf24',
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
          Session Timeout Warning
        </AlertTitle>
        <Typography variant="body2">
          You will be automatically logged out in 1 minute due to inactivity. 
          Click "Stay Logged In" to continue your session.
        </Typography>
      </Alert>
    </Box>
  );
};

export default InactivityWarning;
