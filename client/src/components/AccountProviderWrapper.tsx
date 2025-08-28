import React from 'react';
import { AccountProvider } from '../context/AccountContext';

interface AccountProviderWrapperProps {
    children: React.ReactNode;
}

const AccountProviderWrapper: React.FC<AccountProviderWrapperProps> = ({ children }) => {
    return (
        <AccountProvider>
            {children}
        </AccountProvider>
    );
};

export default AccountProviderWrapper;
