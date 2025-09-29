import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import BrandPage from './pages/BrandPage';
import OrderManagementPage from './pages/OrderManagementPage';
import OnHandPage from './pages/OnHandPage';
import ExportReportPage from './pages/ExportReportPage';
import TransactionPage from './pages/TransactionPage';
import ProfilePage from './pages/ProfilePage';
import ManagementPage from './pages/ManagementPage';
import DashboardContent from './pages/DashboardContent';
import DashboardContentWrapper from './pages/DashboardContentWrapper.js';

function App() {

    const [user, setUser] = useState(null);

    const handleLoginSuccess = (loggedInUser) => {
        setUser(loggedInUser);
        console.log('App setUser:', loggedInUser);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
                {user ? (
                    <Route path="/" element={<DashboardPage user={user} onLogout={handleLogout} />}>
                        <Route index element={<DashboardContentWrapper />} />
                        <Route path="items" element={<ItemsPage />} />
                        <Route path="brands" element={<BrandPage />} />
                        <Route path="orders" element={<OrderManagementPage />} />
                        <Route path="onhand" element={<OnHandPage />} />
                        <Route path="export" element={<ExportReportPage />} />
                        <Route path="transactions" element={<TransactionPage />} />
                        <Route path="profile" element={<ProfilePage user={user} onUpdateUser={setUser} />} />
                        <Route path="management" element={<ManagementPage />} />
                        <Route path="*" element={<Navigate to="/items" />} />
                    </Route>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
