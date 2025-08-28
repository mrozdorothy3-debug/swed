import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = await login(username.trim(), password);
    if (!ok) {
      setError('Incorrect password.');
      return;
    }
    // Redirect based on role handled in AppRoutes
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/logo1.jpg"
              alt="Logo"
              sx={{
                width: 80,
                height: 80,
                mb: 2,
              }}
            />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>Welcome</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
            Sign in to continue
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
            <Button type="submit" variant="contained" size="large">Sign In</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;


