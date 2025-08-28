import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Divider, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL as string;

type UserRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  account?: { balance?: number; transferFee?: number };
};

const AdminPage: React.FC = () => {
  const { token } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [transferFee, setTransferFee] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setMessage(null); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ firstName, lastName, password, account: { balance, transferFee } })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Create failed');
      }
      setMessage('User created successfully');
      setFirstName(''); setLastName(''); setPassword(''); setBalance(0); setTransferFee(0);
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'Create failed');
    }
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
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Create user accounts and manage balances/transfer fees.</Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Create New Account</Typography>
          <Box component="form" onSubmit={onCreate} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <TextField label="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Box />
            <TextField label="Balance" type="number" value={balance} onChange={e => setBalance(parseFloat(e.target.value || '0'))} />
            <TextField label="Transfer fee" type="number" value={transferFee} onChange={e => setTransferFee(parseFloat(e.target.value || '0'))} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Email will be auto-generated (first.last@local.test)</Typography>
            </Box>
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 1 }}>
              <Button type="submit" variant="contained">Create</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Existing Accounts</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="right">Transfer Fee</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u._id}>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={u.account?.balance ?? 0}
                      onChange={e => {
                        const val = parseFloat(e.target.value || '0');
                        setUsers(prev => prev.map(p => p._id === u._id ? { ...p, account: { ...p.account, balance: val } } : p));
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={u.account?.transferFee ?? 0}
                      onChange={e => {
                        const val = parseFloat(e.target.value || '0');
                        setUsers(prev => prev.map(p => p._id === u._id ? { ...p, account: { ...p.account, transferFee: val } } : p));
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={() => onSaveRow(u)}>Save</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPage;

