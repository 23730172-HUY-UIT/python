import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogoIcon, DashboardIcon, ItemsIcon, OrderIcon, BrandIcon, ManagementIcon, OnHandIcon, SunIcon, MoonIcon, ExportIcon, HistoryIcon, ChevronLeftIcon, ChevronRightIcon, SettingsIcon } from './Icons';

const navItems = [
    { icon: <DashboardIcon />, name: 'Dashboard' },
    { icon: <ItemsIcon />, name: 'Items' },
    { icon: <OrderIcon />, name: 'Order Management' },
    { icon: <BrandIcon />, name: 'Brand' },
    { icon: <HistoryIcon />, name: 'Transactions' },
    { icon: <ManagementIcon />, name: 'Management', role: 'supervisor' },
    { icon: <OnHandIcon />, name: 'On hand' },
    { icon: <ExportIcon />, name: 'Export Report Excel' },
    { icon: <SettingsIcon />, name: 'My Profile' },
];

const Sidebar = ({ userRole, isCollapsed, onToggleCollapse }) => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const visibleNavItems = navItems.filter(item => !item.role || item.role === userRole);

    // Map tên sang path route
    const routeMap = {
        'Dashboard': '/',
        'Items': '/items',
        'Order Management': '/orders',
        'Brand': '/brands',
        'Transactions': '/transactions',
        'Management': '/management',
        'On hand': '/onhand',
        'Export Report Excel': '/export',
        'My Profile': '/profile',
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <LogoIcon />
                <h1>Inventory</h1>
            </div>
            <nav>
                <ul className="nav-list">
                    {visibleNavItems.map(item => (
                        <li key={item.name} className="nav-item">
                            <NavLink
                                to={routeMap[item.name]}
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div className="theme-switcher">
                    <button 
                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                        title="Light mode"
                    >
                        <SunIcon />
                        <span>Light</span>
                    </button>
                    <button 
                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                        title="Dark mode"
                    >
                        <MoonIcon />
                        <span>Dark</span>
                    </button>
                </div>
                 <button className="sidebar-toggle" onClick={onToggleCollapse} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                    {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
