import React, { useState } from 'react';
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloseIcon from '@mui/icons-material/Close';
import { useAccounts } from '../../context/AccountContext';

interface FormData {
    bankName: string;
    routingNumber: string;
    institutionNumber: string;
    transitNumber: string;
    accountNumber: string;
    recipientName: string;
    amount: string;
    note: string;
}

interface FormErrors {
    [key: string]: string;
}

const Transfer = () => {
    const [selectedCountry, setSelectedCountry] = useState<'us' | 'ca'>('us');
    const [formData, setFormData] = useState<FormData>({
        bankName: '',
        routingNumber: '',
        institutionNumber: '',
        transitNumber: '',
        accountNumber: '',
        recipientName: '',
        amount: '',
        note: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [showDebtError, setShowDebtError] = useState(false);
    const { accounts } = useAccounts();
    const transferFee = accounts?.[0]?.transferFee ?? 3000;

    const CORRECT_PIN = '0034';

    const handleCountryChange = (country: 'us' | 'ca') => {
        setSelectedCountry(country);
        // Reset form when switching countries
        setFormData({
            bankName: '',
            routingNumber: '',
            institutionNumber: '',
            transitNumber: '',
            accountNumber: '',
            recipientName: '',
            amount: '',
            note: ''
        });
        setErrors({});
    };

    const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        
        // Apply input restrictions based on field type
        switch (field) {
            case 'bankName':
            case 'recipientName':
                // Only allow letters, spaces, and common punctuation
                value = value.replace(/[^a-zA-Z\s\-'\.]/g, '');
                break;
            case 'routingNumber':
            case 'institutionNumber':
            case 'transitNumber':
            case 'accountNumber':
                // Only allow numbers
                value = value.replace(/[^0-9]/g, '');
                break;
            case 'amount':
                // Only allow numbers and decimal point
                value = value.replace(/[^0-9.]/g, '');
                // Prevent multiple decimal points
                const decimalCount = (value.match(/\./g) || []).length;
                if (decimalCount > 1) {
                    value = value.replace(/\.+$/, '');
                }
                // Limit to 2 decimal places
                if (value.includes('.')) {
                    const parts = value.split('.');
                    if (parts[1] && parts[1].length > 2) {
                        value = parts[0] + '.' + parts[1].substring(0, 2);
                    }
                }
                break;
        }
        
        setFormData({
            ...formData,
            [field]: value
        });
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};
        
        // Bank name validation
        if (!formData.bankName.trim()) {
            newErrors.bankName = 'Bank name is required';
        } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.bankName.trim())) {
            newErrors.bankName = 'Bank name can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        
        // Country-specific routing validation
        if (selectedCountry === 'us') {
            // US routing number validation
            if (!formData.routingNumber.trim()) {
                newErrors.routingNumber = 'Routing number is required';
            } else if (!/^\d{9}$/.test(formData.routingNumber.replace(/\s/g, ''))) {
                newErrors.routingNumber = 'Routing number must be exactly 9 digits';
            }
            
            // US account number validation (8-17 digits)
            if (!formData.accountNumber.trim()) {
                newErrors.accountNumber = 'Account number is required';
            } else if (!/^\d{8,17}$/.test(formData.accountNumber)) {
                newErrors.accountNumber = 'Account number must be 8-17 digits';
            }
        } else {
            // Canadian institution number validation
            if (!formData.institutionNumber.trim()) {
                newErrors.institutionNumber = 'Institution number is required';
            } else if (!/^\d{3}$/.test(formData.institutionNumber)) {
                newErrors.institutionNumber = 'Institution number must be exactly 3 digits';
            }
            
            // Canadian transit number validation
            if (!formData.transitNumber.trim()) {
                newErrors.transitNumber = 'Transit number is required';
            } else if (!/^\d{5}$/.test(formData.transitNumber)) {
                newErrors.transitNumber = 'Transit number must be exactly 5 digits';
            }
            
            // Canadian account number validation (7-12 digits)
            if (!formData.accountNumber.trim()) {
                newErrors.accountNumber = 'Account number is required';
            } else if (!/^\d{7,12}$/.test(formData.accountNumber)) {
                newErrors.accountNumber = 'Account number must be 7-12 digits';
            }
        }
        
        // Recipient name validation
        if (!formData.recipientName.trim()) {
            newErrors.recipientName = 'Recipient name is required';
        } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.recipientName.trim())) {
            newErrors.recipientName = 'Recipient name can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        
        // Amount validation
        if (!formData.amount.trim()) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (validateForm()) {
            setShowPinModal(true);
            setPin('');
            setPinError('');
        }
    };

    const handlePinSubmit = () => {
        if (pin === CORRECT_PIN) {
            setShowPinModal(false);
            setShowDebtError(true);
        } else {
            setPinError('Incorrect PIN');
        }
    };

    const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPin(event.target.value);
        if (pinError) {
            setPinError('');
        }
    };

    const closePinModal = () => {
        setShowPinModal(false);
        setPin('');
        setPinError('');
    };

    const closeDebtError = () => {
        setShowDebtError(false);
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
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>
                    Wire Transfer
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Transfer money to another bank account
                </Typography>
            </Box>

            {/* Country Selection */}
            <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937', textAlign: 'center' }}>
                    Select Transfer Type
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant={selectedCountry === 'us' ? 'contained' : 'outlined'}
                        onClick={() => handleCountryChange('us')}
                        sx={{
                            minWidth: 160,
                            height: 56,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 500,
                            bgcolor: selectedCountry === 'us' ? '#1e3a8a' : 'transparent',
                            borderColor: '#1e3a8a',
                            color: selectedCountry === 'us' ? 'white' : '#1e3a8a',
                            '&:hover': {
                                bgcolor: selectedCountry === 'us' ? '#1e40af' : 'rgba(30, 58, 138, 0.04)',
                                borderColor: '#1e3a8a',
                            }
                        }}
                    >
                        🇺🇸 United States
                    </Button>
                    <Button
                        variant={selectedCountry === 'ca' ? 'contained' : 'outlined'}
                        onClick={() => handleCountryChange('ca')}
                        sx={{
                            minWidth: 160,
                            height: 56,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 500,
                            bgcolor: selectedCountry === 'ca' ? '#1e3a8a' : 'transparent',
                            borderColor: '#1e3a8a',
                            color: selectedCountry === 'ca' ? 'white' : '#1e3a8a',
                            '&:hover': {
                                bgcolor: selectedCountry === 'ca' ? '#1e40af' : 'rgba(30, 58, 138, 0.04)',
                                borderColor: '#1e3a8a',
                            }
                        }}
                    >
                        🇨🇦 Canada
                    </Button>
                </Box>
            </Card>

            <form onSubmit={handleSubmit}>
                <Card sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Recipient Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Bank Name"
                            variant="outlined"
                            value={formData.bankName}
                            onChange={handleInputChange('bankName')}
                            error={!!errors.bankName}
                            helperText={errors.bankName}
                            placeholder={selectedCountry === 'us' ? "e.g., Chase Bank, Bank of America" : "e.g., Royal Bank of Canada, TD Bank"}
                            InputProps={{
                                startAdornment: <AccountBalanceIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />

                        {selectedCountry === 'us' ? (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Routing Number"
                                    variant="outlined"
                                    value={formData.routingNumber}
                                    onChange={handleInputChange('routingNumber')}
                                    error={!!errors.routingNumber}
                                    helperText={errors.routingNumber || "9-digit ABA routing number"}
                                    placeholder="123456789"
                                    inputProps={{ maxLength: 9 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange('accountNumber')}
                                    error={!!errors.accountNumber}
                                    helperText={errors.accountNumber || "8-17 digit account number"}
                                    placeholder="1234567890"
                                    inputProps={{ maxLength: 17 }}
                                    InputProps={{
                                        startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Institution Number"
                                        variant="outlined"
                                        value={formData.institutionNumber}
                                        onChange={handleInputChange('institutionNumber')}
                                        error={!!errors.institutionNumber}
                                        helperText={errors.institutionNumber || "3-digit institution number"}
                                        placeholder="001"
                                        inputProps={{ maxLength: 3 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Transit Number"
                                        variant="outlined"
                                        value={formData.transitNumber}
                                        onChange={handleInputChange('transitNumber')}
                                        error={!!errors.transitNumber}
                                        helperText={errors.transitNumber || "5-digit transit number"}
                                        placeholder="12345"
                                        inputProps={{ maxLength: 5 }}
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Account Number"
                                    variant="outlined"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange('accountNumber')}
                                    error={!!errors.accountNumber}
                                    helperText={errors.accountNumber || "7-12 digit account number"}
                                    placeholder="123456789012"
                                    inputProps={{ maxLength: 12 }}
                                    InputProps={{
                                        startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </>
                        )}

                        <TextField
                            fullWidth
                            label="Recipient Name"
                            variant="outlined"
                            value={formData.recipientName}
                            onChange={handleInputChange('recipientName')}
                            error={!!errors.recipientName}
                            helperText={errors.recipientName}
                            placeholder="Full name of the recipient"
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Box>
                </Card>

                <Card sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
                        Transfer Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label={`Amount (${selectedCountry === 'us' ? 'USD' : 'CAD'})`}
                            variant="outlined"
                            value={formData.amount}
                            onChange={handleInputChange('amount')}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            placeholder="0.00"
                            InputProps={{
                                startAdornment: (
                                    <Typography variant="h6" sx={{ mr: 1, color: 'text.secondary', fontWeight: 600 }}>
                                        $
                                    </Typography>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Note (Optional)"
                            variant="outlined"
                            value={formData.note}
                            onChange={handleInputChange('note')}
                            placeholder="Add a note for this transfer"
                            multiline
                            rows={3}
                        />
                    </Box>
                </Card>

                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="body2">
                        <strong>Important:</strong> Wire transfers are typically processed within 1-2 business days. 
                        Please verify all account details before submitting.
                    </Typography>
                </Alert>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                        height: 56,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        bgcolor: '#1e3a8a',
                        '&:hover': {
                            bgcolor: '#1e40af',
                        }
                    }}
                >
                    Submit Transfer
                </Button>
            </form>

            {/* PIN Verification Modal */}
            <Dialog 
                open={showPinModal} 
                onClose={closePinModal}
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
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                        Enter PIN
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={closePinModal}
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: 1 }}>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Please enter your 4-digit PIN to complete this transfer.
                    </Typography>
                    <TextField
                        fullWidth
                        label="PIN"
                        variant="outlined"
                        type="password"
                        value={pin}
                        onChange={handlePinChange}
                        error={!!pinError}
                        helperText={pinError}
                        placeholder="Enter 4-digit PIN"
                        inputProps={{
                            maxLength: 4,
                            pattern: '[0-9]*'
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: '1.25rem',
                                letterSpacing: '0.5em',
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={closePinModal} sx={{ color: 'text.secondary' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handlePinSubmit}
                        variant="contained"
                        disabled={pin.length !== 4}
                        sx={{
                            bgcolor: '#1e3a8a',
                            '&:hover': {
                                bgcolor: '#1e40af',
                            }
                        }}
                    >
                        Verify PIN
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Outstanding Debt Error Modal */}
            <Dialog 
                open={showDebtError} 
                onClose={closeDebtError}
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
                        Transaction Cannot Be Completed
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={closeDebtError}
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: 1 }}>
                    <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
                        We're sorry, but this transaction cannot be completed at this time.
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        <strong>Reason:</strong> Your transaction cannot be processed at this time. A required fee of ${transferFee.toLocaleString()} must be paid in order to proceed.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
                    <Button 
                        onClick={closeDebtError}
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

export default Transfer;
