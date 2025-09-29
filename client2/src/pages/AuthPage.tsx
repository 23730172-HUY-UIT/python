import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import { login } from '../api';


const AuthPage = ({ onLoginSuccess }) => {
    const [currentPage, setCurrentPage] = useState('login');
    const navigate = useNavigate();

    const handleNavigation = (page) => {
        setCurrentPage(page);
    };

    const handleLogin = async (email, password) => {
        const user = await login(email, password);
        // Map user về chuẩn {id, username, email, role}
        const mappedUser = {
            id: user.id || user.userId || user.user_id,
            username: user.username,
            email: user.email,
            role: user.role || '',
        };
        onLoginSuccess(mappedUser);
        // Đã lưu user vào localStorage ở App
        navigate('/dashboard');
    };

    return (
        <div className="auth-page-wrapper">
            <main className="auth-container">
                <div className="auth-panel"></div>
                <div className="auth-content">
                    {currentPage === 'login' && <LoginPage onNavigate={handleNavigation} onLogin={handleLogin} />}
                    {currentPage === 'forgotPassword' && <ForgotPasswordPage onNavigate={handleNavigation} />}
                </div>
            </main>
        </div>
    );
};

export default AuthPage;
