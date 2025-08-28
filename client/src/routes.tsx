import { RouteObject } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Dashboard />
    },
    {
        path: '/transfer',
        element: <Transfer />
    }
];
