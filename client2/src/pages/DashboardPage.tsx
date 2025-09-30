import React, { useState, useEffect } from 'react';
import { getItems, getBrands, getCategories, getOrders, getUsers, getIssues, getOnHandItems, getTransactions } from '../api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DashboardPage = ({ user, onLogout }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        items: [],
        brands: [],
        categories: [],
        orders: [],
        users: [],
        issues: [],
        onHandItems: [],
        transactions: [],
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [items, brands, categories, orders, users, issues, onHandItems, transactions] = await Promise.all([
                    getItems(),
                    getBrands(),
                    getCategories(),
                    getOrders(),
                    getUsers(),
                    getIssues(),
                    getOnHandItems(),
                    getTransactions(),
                ]);
                setDashboardData({ items, brands, categories, orders, users, issues, onHandItems, transactions });
                // Lọc các item có minStock và quantity hợp lệ
                const lowStock = items.filter(item => {
                    const minStock = Number(item.minStock);
                    const quantity = Number(item.quantity);
                    return !isNaN(minStock) && !isNaN(quantity) && quantity < minStock;
                });
                setLowStockItems(lowStock);
            } catch (err) {
                setLowStockItems([]);
            }
        };
        fetchDashboardData();
    }, []);
    const navigate = useNavigate();
    const location = useLocation();

    // Điều hướng khi click My Profile
    const handleNavigate = (page) => {
        if (page === 'My Profile') navigate('/profile');
    };
    return (
        <div className="dashboard-container">
            <Sidebar 
                userRole={user?.role}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Header 
                    user={user}
                    onLogout={onLogout}
                    lowStockItems={lowStockItems}
                    onNavigate={handleNavigate}
                    dashboardData={dashboardData}
                />
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardPage;
