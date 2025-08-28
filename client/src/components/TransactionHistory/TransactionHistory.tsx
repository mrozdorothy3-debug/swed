import React from 'react';
import {
    Box,
    Card,
    Typography,
    IconButton,
    Divider,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import './TransactionHistory.css';

const TransactionHistory = () => {
    // Mock transaction data
    const transactions = [
        {
            id: 1,
            type: 'transfer',
            description: 'Transfer to John Doe',
            date: '2025-08-20',
            amount: -500.00,
            icon: <SwapHorizIcon />
        },
        {
            id: 2,
            type: 'payment',
            description: 'Netflix Subscription',
            date: '2025-08-20',
            amount: -15.99,
            icon: <CreditCardIcon />
        },
        {
            id: 3,
            type: 'deposit',
            description: 'Salary Deposit',
            date: '2025-08-19',
            amount: 3000.00,
            icon: <AccountBalanceIcon />
        },
        {
            id: 4,
            type: 'payment',
            description: 'Online Purchase - Amazon',
            date: '2025-08-19',
            amount: -75.50,
            icon: <ShoppingCartIcon />
        },
        {
            id: 5,
            type: 'payment',
            description: 'Restaurant Payment',
            date: '2025-08-18',
            amount: -45.80,
            icon: <CreditCardIcon />
        },
        {
            id: 6,
            type: 'refund',
            description: 'Refund - Return Items',
            date: '2025-08-18',
            amount: 29.99,
            icon: <AttachMoneyIcon />
        }
    ];

    return (
        <div className="transaction-history-container">
            <div className="transaction-history-header">
                <h1>Transaction History</h1>
            </div>
            
            <div className="transaction-history-content">
                <Card className="transaction-list">
                    {Object.entries(
                        transactions.reduce((groups, transaction) => {
                            const date = transaction.date;
                            if (!groups[date]) {
                                groups[date] = [];
                            }
                            groups[date].push(transaction);
                            return groups;
                        }, {} as { [key: string]: typeof transactions })
                    )
                        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                        .map(([date, dayTransactions], groupIndex) => (
                            <React.Fragment key={date}>
                                {groupIndex > 0 && <Divider />}
                                <div className="transaction-date-group">
                                    <Typography 
                                        variant="subtitle2" 
                                        color="textSecondary"
                                        sx={{ 
                                            px: 2, 
                                            py: 1, 
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        {new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                    {dayTransactions.map((transaction) => (
                                        <div key={transaction.id} className="transaction-item">
                                            <div className="transaction-icon">
                                                {transaction.icon}
                                            </div>
                                            <div className="transaction-details">
                                                <Typography variant="subtitle1">
                                                    {transaction.description}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="textSecondary"
                                                    sx={{ fontSize: '0.75rem' }}
                                                >
                                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                </Typography>
                                            </div>
                                            <div className="transaction-amount">
                                                <Typography 
                                                    variant="subtitle1" 
                                                    className={transaction.amount >= 0 ? 'amount-positive' : 'amount-negative'}
                                                >
                                                    {transaction.amount >= 0 ? '+' : ''}
                                                    ${Math.abs(transaction.amount).toFixed(2)}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </React.Fragment>
                        ))
                    }
                </Card>
            </div>
        </div>
    );
};

export default TransactionHistory;
