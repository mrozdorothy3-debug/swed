export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    bankAccount: string;
    balance: number;
}
