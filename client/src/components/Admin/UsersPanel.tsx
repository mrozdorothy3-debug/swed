import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Alert,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Tabs,
    Tab,
    Pagination,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    Search,
    FilterList,
    Visibility,
    Edit,
    Delete,
    PersonAdd,
    Refresh,
    AccountCircle,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    AccountBalance,
    Security,
    Settings,
    History,
    Block,
    CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL as string;

interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string;
    role: 'customer' | 'agent' | 'admin';
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    account?: {
        balance: number;
        transferFee: number;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    dateOfBirth?: string;
    profilePicture?: string;
    preferences?: {
        notifications?: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
        language?: string;
        timezone?: string;
    };
    security?: {
        twoFactorEnabled: boolean;
        loginAttempts: number;
        lockUntil?: string;
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const UsersPanel: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    
    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    
    // Dialog States
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [viewUserDialog, setViewUserDialog] = useState(false);
    const [editUserDialog, setEditUserDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [editTabValue, setEditTabValue] = useState(0);
    const [editFormData, setEditFormData] = useState<Partial<UserData>>({});

    const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    // Fetch Users
    const fetchUsers = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                sortBy,
                sortOrder,
            });

            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (searchTerm.trim()) params.append('search', searchTerm.trim());

            const response = await fetch(`${API_BASE_URL}/api/users?${params}`, {
                headers: { 'Content-Type': 'application/json', ...authHeader },
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.data || []);
            setTotalPages(data.pagination?.total || 1);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers(currentPage);
        }
    }, [token, currentPage, roleFilter, sortBy, sortOrder]);

    // Search Handler
    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers(1);
    };

    // User Actions
    const handleViewUser = (user: UserData) => {
        setSelectedUser(user);
        setViewUserDialog(true);
        setTabValue(0);
    };

    const handleEditUser = (user: UserData) => {
        setSelectedUser(user);
        setEditFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            account: user.account,
            address: user.address,
            preferences: user.preferences,
        });
        setEditTabValue(0);
        setEditUserDialog(true);
    };

    const handleEditFormChange = (field: string, value: any, nested?: string) => {
        setEditFormData(prev => {
            if (nested) {
                return {
                    ...prev,
                    [nested]: {
                        ...((prev as any)[nested] || {}),
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleSaveUser = async () => {
        if (!selectedUser || !editFormData.firstName || !editFormData.lastName || !editFormData.email) {
            setError('First name, last name, and email are required');
            return;
        }

        try {
            const updateData = {
                firstName: editFormData.firstName,
                lastName: editFormData.lastName,
                email: editFormData.email,
                phone: editFormData.phone,
                role: editFormData.role,
                isActive: editFormData.isActive,
                emailVerified: editFormData.emailVerified,
                phoneVerified: editFormData.phoneVerified,
                account: editFormData.account,
                address: editFormData.address,
                preferences: editFormData.preferences,
            };

            const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            setMessage(`User ${editFormData.firstName} ${editFormData.lastName} updated successfully`);
            setEditUserDialog(false);
            setEditFormData({});
            fetchUsers(currentPage);
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (user: UserData) => {
        if (!window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', ...authHeader },
            });

            if (!response.ok) throw new Error('Failed to delete user');

            setMessage(`User ${user.firstName} ${user.lastName} deleted successfully`);
            fetchUsers(currentPage);
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        }
    };

    const handleToggleUserStatus = async (user: UserData) => {
        try {
            const endpoint = user.isActive ? 'deactivate' : 'reactivate';
            const response = await fetch(`${API_BASE_URL}/api/users/${user._id}/${endpoint}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeader },
            });

            if (!response.ok) throw new Error('Failed to update user status');

            setMessage(`User ${user.isActive ? 'deactivated' : 'reactivated'} successfully`);
            fetchUsers(currentPage);
        } catch (err: any) {
            setError(err.message || 'Failed to update user status');
        }
    };

    // Filtered users for display
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive) ||
                (statusFilter === 'verified' && user.emailVerified) ||
                (statusFilter === 'unverified' && !user.emailVerified);

            return matchesStatus;
        });
    }, [users, statusFilter]);

    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'error';
            case 'agent': return 'warning';
            case 'customer': return 'primary';
            default: return 'default';
        }
    };

    const getUserInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Users Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage all user accounts in the system
                    </Typography>
                </Box>

                {/* Alerts */}
                {message && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Search and Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: 2,
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ flex: { xs: 1, md: 2 }, width: '100%' }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' }, minWidth: 120 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        label="Role"
                                    >
                                        <MenuItem value="all">All Roles</MenuItem>
                                        <MenuItem value="customer">Customer</MenuItem>
                                        <MenuItem value="agent">Agent</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' }, minWidth: 120 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                        <MenuItem value="verified">Verified</MenuItem>
                                        <MenuItem value="unverified">Unverified</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' }, minWidth: 120 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        label="Sort By"
                                    >
                                        <MenuItem value="createdAt">Created Date</MenuItem>
                                        <MenuItem value="firstName">First Name</MenuItem>
                                        <MenuItem value="lastName">Last Name</MenuItem>
                                        <MenuItem value="lastLogin">Last Login</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' }, minWidth: 120 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    startIcon={<Search />}
                                    fullWidth
                                    size="large"
                                    sx={{ height: 56 }}
                                >
                                    Search
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Users ({filteredUsers.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => fetchUsers(currentPage)}
                                    startIcon={<Refresh />}
                                    disabled={loading}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<PersonAdd />}
                                >
                                    Add User
                                </Button>
                            </Box>
                        </Box>

                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User</TableCell>
                                        <TableCell>Contact</TableCell>
                                        <TableCell>Role & Status</TableCell>
                                        <TableCell align="right">Balance</TableCell>
                                        <TableCell>Last Login</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography>Loading users...</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    No users found matching your criteria
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user._id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={user.profilePicture}
                                                            sx={{ width: 40, height: 40 }}
                                                        >
                                                            {getUserInitials(user.firstName, user.lastName)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {user.firstName} {user.lastName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                @{user.username}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {user.email}
                                                        </Typography>
                                                        {user.phone && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {user.phone}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Chip
                                                            label={user.role}
                                                            color={getRoleColor(user.role) as any}
                                                            size="small"
                                                        />
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Chip
                                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                                color={user.isActive ? 'success' : 'error'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            {user.emailVerified && (
                                                                <Chip
                                                                    label="Verified"
                                                                    color="info"
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {formatCurrency(user.account?.balance)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fee: {formatCurrency(user.account?.transferFee)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewUser(user)}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit User">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditUser(user)}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleUserStatus(user)}
                                                                color={user.isActive ? 'warning' : 'success'}
                                                            >
                                                                {user.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete User">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteUser(user)}
                                                                color="error"
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, page) => setCurrentPage(page)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* User Details Dialog */}
                <Dialog
                    open={viewUserDialog}
                    onClose={() => setViewUserDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 2 } }}
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
                        <Avatar
                            src={selectedUser?.profilePicture}
                            sx={{ width: 50, height: 50 }}
                        >
                            {selectedUser && getUserInitials(selectedUser.firstName, selectedUser.lastName)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6">
                                {selectedUser?.firstName} {selectedUser?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{selectedUser?.username} • {selectedUser?.role}
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                            <Tab icon={<AccountCircle />} label="Profile" />
                            <Tab icon={<AccountBalance />} label="Account" />
                            <Tab icon={<Security />} label="Security" />
                            <Tab icon={<Settings />} label="Preferences" />
                        </Tabs>

                        <TabPanel value={tabValue} index={0}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: 3,
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon><Email /></ListItemIcon>
                                            <ListItemText
                                                primary="Email"
                                                secondary={selectedUser?.email}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><Phone /></ListItemIcon>
                                            <ListItemText
                                                primary="Phone"
                                                secondary={selectedUser?.phone || 'Not provided'}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><CalendarToday /></ListItemIcon>
                                            <ListItemText
                                                primary="Date of Birth"
                                                secondary={selectedUser?.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : 'Not provided'}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><LocationOn /></ListItemIcon>
                                            <ListItemText
                                                primary="Address"
                                                secondary={selectedUser?.address ? 
                                                    `${selectedUser.address.street || ''} ${selectedUser.address.city || ''} ${selectedUser.address.state || ''} ${selectedUser.address.zipCode || ''}`.trim() || 'Not provided'
                                                    : 'Not provided'}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon><History /></ListItemIcon>
                                            <ListItemText
                                                primary="Member Since"
                                                secondary={selectedUser ? formatDate(selectedUser.createdAt) : ''}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><History /></ListItemIcon>
                                            <ListItemText
                                                primary="Last Login"
                                                secondary={selectedUser?.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><History /></ListItemIcon>
                                            <ListItemText
                                                primary="Profile Updated"
                                                secondary={selectedUser ? formatDate(selectedUser.updatedAt) : ''}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: 3,
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Account Balance
                                            </Typography>
                                            <Typography variant="h4" color="primary">
                                                {formatCurrency(selectedUser?.account?.balance)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Transfer Fee
                                            </Typography>
                                            <Typography variant="h4" color="secondary">
                                                {formatCurrency(selectedUser?.account?.transferFee)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <Box>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary="Two-Factor Authentication"
                                            secondary={selectedUser?.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        />
                                        <Chip
                                            label={selectedUser?.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                            color={selectedUser?.security?.twoFactorEnabled ? 'success' : 'default'}
                                        />
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Email Verified"
                                            secondary={selectedUser?.emailVerified ? 'Verified' : 'Not verified'}
                                        />
                                        <Chip
                                            label={selectedUser?.emailVerified ? 'Verified' : 'Not verified'}
                                            color={selectedUser?.emailVerified ? 'success' : 'warning'}
                                        />
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Phone Verified"
                                            secondary={selectedUser?.phoneVerified ? 'Verified' : 'Not verified'}
                                        />
                                        <Chip
                                            label={selectedUser?.phoneVerified ? 'Verified' : 'Not verified'}
                                            color={selectedUser?.phoneVerified ? 'success' : 'warning'}
                                        />
                                    </ListItem>
                                </List>
                            </Box>
                        </TabPanel>

                        <TabPanel value={tabValue} index={3}>
                            <Box>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary="Language"
                                            secondary={selectedUser?.preferences?.language || 'English'}
                                        />
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Timezone"
                                            secondary={selectedUser?.preferences?.timezone || 'UTC'}
                                        />
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText
                                            primary="Email Notifications"
                                            secondary={selectedUser?.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="SMS Notifications"
                                            secondary={selectedUser?.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Push Notifications"
                                            secondary={selectedUser?.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                                        />
                                    </ListItem>
                                </List>
                            </Box>
                        </TabPanel>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setViewUserDialog(false)}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setViewUserDialog(false);
                                if (selectedUser) handleEditUser(selectedUser);
                            }}
                            startIcon={<Edit />}
                        >
                            Edit User
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog
                    open={editUserDialog}
                    onClose={() => setEditUserDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 2 } }}
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
                        <Edit />
                        <Box>
                            <Typography variant="h6">
                                Edit User: {selectedUser?.firstName} {selectedUser?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{selectedUser?.username} • {selectedUser?.role}
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Tabs value={editTabValue} onChange={(_, newValue) => setEditTabValue(newValue)}>
                            <Tab icon={<AccountCircle />} label="Profile" />
                            <Tab icon={<AccountBalance />} label="Account" />
                            <Tab icon={<Security />} label="Security" />
                            <Tab icon={<Settings />} label="Preferences" />
                        </Tabs>

                        <TabPanel value={editTabValue} index={0}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                        gap: 2,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={editFormData.firstName || ''}
                                        onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={editFormData.lastName || ''}
                                        onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                                        required
                                    />
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={editFormData.email || ''}
                                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                                    required
                                />

                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={editFormData.role || 'customer'}
                                        onChange={(e) => handleEditFormChange('role', e.target.value)}
                                        label="Role"
                                    >
                                        <MenuItem value="customer">Customer</MenuItem>
                                        <MenuItem value="agent">Agent</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>

                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Address
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                        gap: 2,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Street"
                                        value={editFormData.address?.street || ''}
                                        onChange={(e) => handleEditFormChange('street', e.target.value, 'address')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="City"
                                        value={editFormData.address?.city || ''}
                                        onChange={(e) => handleEditFormChange('city', e.target.value, 'address')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="State"
                                        value={editFormData.address?.state || ''}
                                        onChange={(e) => handleEditFormChange('state', e.target.value, 'address')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="ZIP Code"
                                        value={editFormData.address?.zipCode || ''}
                                        onChange={(e) => handleEditFormChange('zipCode', e.target.value, 'address')}
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Country"
                                    value={editFormData.address?.country || ''}
                                    onChange={(e) => handleEditFormChange('country', e.target.value, 'address')}
                                />
                            </Box>
                        </TabPanel>

                        <TabPanel value={editTabValue} index={1}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Account Settings
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                        gap: 2,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Account Balance ($)"
                                        type="number"
                                        inputProps={{ step: '0.01', min: '0' }}
                                        value={editFormData.account?.balance || 0}
                                        onChange={(e) => handleEditFormChange('balance', parseFloat(e.target.value) || 0, 'account')}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Transfer Fee ($)"
                                        type="number"
                                        inputProps={{ step: '0.01', min: '0' }}
                                        value={editFormData.account?.transferFee || 0}
                                        onChange={(e) => handleEditFormChange('transferFee', parseFloat(e.target.value) || 0, 'account')}
                                    />
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel value={editTabValue} index={2}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Security Settings
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1">Account Status</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                User can log in and access the system
                                            </Typography>
                                        </Box>
                                        <FormControl size="small">
                                            <Select
                                                value={editFormData.isActive ? 'active' : 'inactive'}
                                                onChange={(e) => handleEditFormChange('isActive', e.target.value === 'active')}
                                            >
                                                <MenuItem value="active">Active</MenuItem>
                                                <MenuItem value="inactive">Inactive</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1">Email Verification</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                User email has been verified
                                            </Typography>
                                        </Box>
                                        <FormControl size="small">
                                            <Select
                                                value={editFormData.emailVerified ? 'verified' : 'unverified'}
                                                onChange={(e) => handleEditFormChange('emailVerified', e.target.value === 'verified')}
                                            >
                                                <MenuItem value="verified">Verified</MenuItem>
                                                <MenuItem value="unverified">Unverified</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1">Phone Verification</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                User phone number has been verified
                                            </Typography>
                                        </Box>
                                        <FormControl size="small">
                                            <Select
                                                value={editFormData.phoneVerified ? 'verified' : 'unverified'}
                                                onChange={(e) => handleEditFormChange('phoneVerified', e.target.value === 'verified')}
                                            >
                                                <MenuItem value="verified">Verified</MenuItem>
                                                <MenuItem value="unverified">Unverified</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                            </Box>
                        </TabPanel>

                        <TabPanel value={editTabValue} index={3}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    User Preferences
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                        gap: 2,
                                    }}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>Language</InputLabel>
                                        <Select
                                            value={editFormData.preferences?.language || 'en'}
                                            onChange={(e) => handleEditFormChange('language', e.target.value, 'preferences')}
                                            label="Language"
                                        >
                                            <MenuItem value="en">English</MenuItem>
                                            <MenuItem value="es">Spanish</MenuItem>
                                            <MenuItem value="fr">French</MenuItem>
                                            <MenuItem value="de">German</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Timezone</InputLabel>
                                        <Select
                                            value={editFormData.preferences?.timezone || 'UTC'}
                                            onChange={(e) => handleEditFormChange('timezone', e.target.value, 'preferences')}
                                            label="Timezone"
                                        >
                                            <MenuItem value="UTC">UTC</MenuItem>
                                            <MenuItem value="America/New_York">Eastern Time</MenuItem>
                                            <MenuItem value="America/Chicago">Central Time</MenuItem>
                                            <MenuItem value="America/Denver">Mountain Time</MenuItem>
                                            <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Notification Preferences
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1">Email Notifications</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive notifications via email
                                            </Typography>
                                        </Box>
                                        <FormControl size="small">
                                            <Select
                                                value={editFormData.preferences?.notifications?.email ? 'enabled' : 'disabled'}
                                                onChange={(e) => {
                                                    const notifications = editFormData.preferences?.notifications || {};
                                                    handleEditFormChange('notifications', {
                                                        ...notifications,
                                                        email: e.target.value === 'enabled'
                                                    }, 'preferences');
                                                }}
                                            >
                                                <MenuItem value="enabled">Enabled</MenuItem>
                                                <MenuItem value="disabled">Disabled</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1">SMS Notifications</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive notifications via SMS
                                            </Typography>
                                        </Box>
                                        <FormControl size="small">
                                            <Select
                                                value={editFormData.preferences?.notifications?.sms ? 'enabled' : 'disabled'}
                                                onChange={(e) => {
                                                    const notifications = editFormData.preferences?.notifications || {};
                                                    handleEditFormChange('notifications', {
                                                        ...notifications,
                                                        sms: e.target.value === 'enabled'
                                                    }, 'preferences');
                                                }}
                                            >
                                                <MenuItem value="enabled">Enabled</MenuItem>
                                                <MenuItem value="disabled">Disabled</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1">Push Notifications</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive push notifications in browser/app
                                            </Typography>
                                        </Box>
                                        <FormControl size="small">
                                            <Select
                                                value={editFormData.preferences?.notifications?.push ? 'enabled' : 'disabled'}
                                                onChange={(e) => {
                                                    const notifications = editFormData.preferences?.notifications || {};
                                                    handleEditFormChange('notifications', {
                                                        ...notifications,
                                                        push: e.target.value === 'enabled'
                                                    }, 'preferences');
                                                }}
                                            >
                                                <MenuItem value="enabled">Enabled</MenuItem>
                                                <MenuItem value="disabled">Disabled</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                            </Box>
                        </TabPanel>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setEditUserDialog(false);
                            setEditFormData({});
                        }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveUser}
                            disabled={!editFormData.firstName || !editFormData.lastName || !editFormData.email}
                        >
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default UsersPanel;
