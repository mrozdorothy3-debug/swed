import { Transaction } from '../types/Transaction';

const bankAccounts = [
    'Main Checking *1234',
    'Savings Account *5678',
    'Joint Account *9012'
];

const descriptions = [
    'Grocery Shopping',
    'Salary Deposit',
    'Utility Bill Payment',
    'Online Purchase',
    'Restaurant',
    'ATM Withdrawal',
    'Investment Transfer',
    'Insurance Premium',
    'Mobile Phone Bill',
    'Subscription Service'
];

function generateRandomTransaction(date: Date, prevBalance: number): Transaction {
    const type = Math.random() > 0.6 ? 'credit' : 'debit';
    const amount = Math.floor(Math.random() * 1000) + (type === 'credit' ? 1000 : 10);
    const balance = type === 'credit' ? prevBalance + amount : prevBalance - amount;
    
    return {
        id: Math.random().toString(36).substr(2, 9),
        date: date.toISOString(),
        amount: amount,
        type: type,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        bankAccount: bankAccounts[Math.floor(Math.random() * bankAccounts.length)],
        balance: balance
    };
}

function generateTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    let currentBalance = 10000; // Starting balance
    
    // Generate transactions from 2020 to present
    const startDate = new Date('2020-01-01');
    const endDate = new Date();
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        // Generate 2-4 transactions per month
        const transactionsThisMonth = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < transactionsThisMonth; i++) {
            const transaction = generateRandomTransaction(currentDate, currentBalance);
            currentBalance = transaction.balance;
            transactions.push(transaction);
        }
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockTransactions = generateTransactions();
