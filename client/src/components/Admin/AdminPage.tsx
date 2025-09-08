import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Divider, Table, TableHead, TableRow, TableCell, TableBody, Alert, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { Visibility, VisibilityOff, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL as string;

type UserRow = {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  role: string;
  isActive?: boolean;
  account?: { balance?: number; transferFee?: number };
  createdAt?: string;
  lastLogin?: string;
};

const AdminPage: React.FC = () => {
  const { token } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [balance, setBalance] = useState<string>('');
  const [transferFee, setTransferFee] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState<UserRow | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadUsers = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users?limit=100&role=customer`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch users');
    }
  };

  useEffect(() => { if (token) loadUsers(); }, [token]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); setError(null); setLoading(true);
    
    try {
      // Prepare user data
      const account: { balance?: number; transferFee?: number } = {};
      if (balance.trim() !== '') account.balance = parseFloat(balance) || 0;
      if (transferFee.trim() !== '') account.transferFee = parseFloat(transferFee) || 0;

      const userData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password,
        role: 'customer'
      };

      if (Object.keys(account).length) userData.account = account;

      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(userData)
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to create user');
      }
      
      const result = await res.json();
      setMessage(`Customer created successfully! Login: "${result.data.firstName} ${result.data.lastName}" with password.`);
      
      // Clear form
      setFirstName(''); 
      setLastName(''); 
      setUsername('');
      setEmail('');
      setPassword(''); 
      setBalance(''); 
      setTransferFee('');
      
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }
    
    setMessage(null); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader }
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      
      setMessage(`User ${userName} deleted successfully`);
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'Failed to delete user');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onSaveRow = async (row: UserRow) => {
    setMessage(null); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${row._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ account: row.account })
      });
      if (!res.ok) throw new Error('Update failed');
      setMessage('User updated');
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Admin Console</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Create customer accounts. Users login with their full name (first + last name) and password.</Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Create New Customer Account</Typography>
          </Box>
          
          <Box component="form" onSubmit={onCreate} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {/* Personal Information */}
            <TextField 
              label="First Name" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              required 
              placeholder="e.g. Stella"
              helperText="User will login with: First Last (e.g. Stella Carson)"
            />
            <TextField 
              label="Last Name" 
              value={lastName} 
              onChange={e => setLastName(e.target.value)} 
              required 
              placeholder="e.g. Carson"
            />
            
            
            <Box sx={{ position: 'relative' }}>
              <TextField 
                label="Password" 
                type={showPassword ? 'text' : 'password'}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="e.g. $PStell00125"
                helperText="Strong password recommended"
              />
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => setShowPassword(!showPassword)}
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>
            <Box />
            
            {/* Account Settings */}
            <TextField 
              label="Initial Balance ($)" 
              type="number" 
              value={balance} 
              onChange={e => setBalance(e.target.value)} 
              placeholder="e.g. 183209"
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            <TextField 
              label="Transfer Fee ($)" 
              type="number" 
              value={transferFee} 
              onChange={e => setTransferFee(e.target.value)} 
              placeholder="e.g. 3300"
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            
            <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                startIcon={<PersonAdd />}
                size="large"
              >
                {loading ? 'Creating...' : 'Create User Account'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>User Accounts ({users.length})</Typography>
            <Button variant="outlined" onClick={loadUsers} size="small">
              Refresh
            </Button>
          </Box>
          
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body2">No users found. Create your first user above!</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Login Info</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="right">Transfer Fee</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {u.firstName} {u.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {u._id.slice(-8)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {u.username ? `@${u.username}` : 'No username'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={u.isActive !== false ? 'Active' : 'Inactive'} 
                        color={u.isActive !== false ? 'success' : 'error'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={u.account?.balance ?? 0}
                        onChange={e => {
                          const val = parseFloat(e.target.value || '0');
                          setUsers(prev => prev.map(p => p._id === u._id ? { ...p, account: { ...p.account, balance: val } } : p));
                        }}
                        InputProps={{
                          startAdornment: '$',
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={u.account?.transferFee ?? 0}
                        onChange={e => {
                          const val = parseFloat(e.target.value || '0');
                          setUsers(prev => prev.map(p => p._id === u._id ? { ...p, account: { ...p.account, transferFee: val } } : p));
                        }}
                        InputProps={{
                          startAdornment: '$',
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => onSaveRow(u)}
                          sx={{ minWidth: 60 }}
                        >
                          Save
                        </Button>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => onDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                          title="Delete user"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPage;

