import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationBarProps {
  message: string;
  onClose: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ message, onClose }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'primary.lighter',
        px: 2,
        py: 1.5,
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <NotificationsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
          {message}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ color: 'text.secondary' }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default NotificationBar;
