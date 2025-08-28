import React, { useState } from 'react';
import { Transaction } from '../types/Transaction';
import { mockTransactions } from '../mockData/transactions';
import './TransactionHistory.css';

const TransactionHistory: React.FC = () => {
    const [transactions] = useState<Transaction[]>(mockTransactions);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

return (
        <div className="transactions-container">
            <h1>Recent Transactions</h1>
            <div className="transactions-list">
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                        <div className="transaction-left">
                            <div className="transaction-date">{formatDate(transaction.date)}</div>
                            <div className="transaction-description">{transaction.description}</div>
                        </div>
                        <div className="transaction-right">
                            <div className={`transaction-amount ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}
                                {formatAmount(transaction.amount)}
                            </div>
                            <div className="transaction-account">{transaction.bankAccount}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionHistory;
