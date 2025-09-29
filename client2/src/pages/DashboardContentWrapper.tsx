import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardContent from './DashboardContent';

const DashboardContentWrapper = () => {
    const navigate = useNavigate();
    const handleNavigate = (page, filter) => {
        if (page === 'Items') {
            if (filter === 'low-stock') {
                navigate('/items?filter=low-stock');
            } else {
                navigate('/items');
            }
        } else if (page === 'Orders') {
            navigate('/orders');
        }
    };
    return <DashboardContent onNavigate={handleNavigate} />;
};

export default DashboardContentWrapper;