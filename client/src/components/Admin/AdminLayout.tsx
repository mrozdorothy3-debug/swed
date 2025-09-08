import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    Container,
    Avatar,
    Button,
    Menu,
    MenuItem,
    Chip,
    Divider,
} from '@mui/material';
import {
    Dashboard,
    People,
    PersonAdd,
    Settings,
    ExitToApp,
    AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AdminPage from './AdminPage';
import UsersPanel from './UsersPanel';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const AdminLayout: React.FC = () => {
    const { username, logout } = useAuth();
    const [currentTab, setCurrentTab] = useState(0);
    const [profileMenu, setProfileMenu] = useState<null | HTMLElement>(null);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setProfileMenu(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenu(null);
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        logout();
    };

    const getUserInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return 'A';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const tabs = [
        {
            label: 'User Management',
            icon: <People />,
            description: 'Create and manage user accounts',
        },
        {
            label: 'Users Panel',
            icon: <PersonAdd />,
            description: 'View and manage all users',
        },
        {
            label: 'System Settings',
            icon: <Settings />,
            description: 'Configure system settings',
        },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Top App Bar */}
            <AppBar 
                position="sticky" 
                sx={{ 
                    bgcolor: 'white', 
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AdminPanelSettings sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Admin Console
                        </Typography>
                        <Chip 
                            label="Administrator" 
                            color="primary" 
                            size="small" 
                            variant="outlined"
                        />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Welcome, {username || 'Admin'}
                        </Typography>
                        <Button
                            onClick={handleProfileMenuOpen}
                            sx={{ 
                                minWidth: 'auto', 
                                p: 0.5,
                                borderRadius: '50%',
                            }}
                        >
                            <Avatar
                                sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    bgcolor: 'primary.main',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {username ? username.charAt(0).toUpperCase() : 'A'}
                            </Avatar>
                        </Button>
                    </Box>
                </Toolbar>

                {/* Navigation Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Container maxWidth="xl">
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ minHeight: 64 }}
                        >
                            {tabs.map((tab, index) => (
                                <Tab
                                    key={index}
                                    icon={tab.icon}
                                    label={tab.label}
                                    iconPosition="start"
                                    sx={{
                                        minHeight: 64,
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        '&.Mui-selected': {
                                            color: 'primary.main',
                                        },
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Container>
                </Box>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={profileMenu}
                open={Boolean(profileMenu)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: { mt: 1, minWidth: 200 }
                }}
            >
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar
                        sx={{ 
                            width: 50, 
                            height: 50, 
                            bgcolor: 'primary.main',
                            mx: 'auto',
                            mb: 1,
                        }}
                    >
                        {username ? username.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                        {username || 'Administrator'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Administrator
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                    <Settings sx={{ mr: 2, fontSize: 20 }} />
                    Account Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                    <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
                    Sign Out
                </MenuItem>
            </Menu>

            {/* Tab Content */}
            <TabPanel value={currentTab} index={0}>
                <AdminPage />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
                <UsersPanel />
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 400,
                            textAlign: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        <Settings sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h5" gutterBottom>
                            System Settings
                        </Typography>
                        <Typography variant="body1">
                            System configuration panel coming soon...
                        </Typography>
                    </Box>
                </Container>
            </TabPanel>
        </Box>
    );
};

export default AdminLayout;
