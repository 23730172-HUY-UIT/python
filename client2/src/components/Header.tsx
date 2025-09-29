import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon, UserIcon, LogOutIcon } from './Icons';

const Header = ({ user, lowStockItems, onNavigate, onLogout }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileRef]);

    const handleLogout = () => {
        if(onLogout) {
            onLogout();
        }
    };
    
    const handleProfileDoubleClick = () => {
        onNavigate('My Profile');
        setIsProfileOpen(false);
    };

    const firstName = user && user.name ? user.name.split(' ')[0] : '';
    return (
        <header className="dashboard-header">
            <div className="greeting">
                <h2>Hello {firstName} 👋</h2>
                <p>Good Morning</p>
            </div>
            <div className="header-actions">
                <div className="search-bar">
                    <SearchIcon />
                    <input type="text" placeholder="Search" />
                </div>
                <div className="user-profile" ref={profileRef}>
                    <div className="notification-container">
                        <button className="notification-btn" aria-label="Notifications" onClick={() => setShowNotifications(prev => !prev)}>
                            <BellIcon />
                            {lowStockItems && lowStockItems.length > 0 && (
                                <span className="notification-badge">{lowStockItems.length}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    {lowStockItems && lowStockItems.length > 0 ? 'Low Stock Alerts' : 'Notifications'}
                                </div>
                                {lowStockItems && lowStockItems.length > 0 ? (
                                    <ul>
                                        {lowStockItems.map(item => (
                                            <li key={item.product_id}>
                                                <strong>{item.product_name}</strong> is low on stock!
                                                <span>Current: {item.quantity}, Min: {item.minStock}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-notifications">No new notifications</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div 
                        className="profile-dropdown"
                        onClick={() => setIsProfileOpen(prev => !prev)}
                        onDoubleClick={handleProfileDoubleClick}
                    >
                        <img src="https://i.pravatar.cc/40?u=mathias" alt={user.name} />
                        <div className="profile-info">
                            <strong>{user.name}</strong>
                            <span style={{textTransform: 'capitalize'}}>{user.role}</span>
                        </div>
                        <ChevronDownIcon />
                    </div>

                     {isProfileOpen && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                <img src="https://i.pravatar.cc/40?u=mathias" alt={user.name} />
                                <div className="profile-info">
                                    <strong>{user.name}</strong>
                                    <span style={{textTransform: 'capitalize'}}>{user.role}</span>
                                </div>
                            </div>
                            <ul className="profile-menu-list">
                                <li className="profile-menu-item">
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('My Profile'); setIsProfileOpen(false); }}>
                                        <UserIcon /> My Profile
                                    </a>
                                </li>
                                <li className="profile-menu-item">
                                    <button onClick={handleLogout}>
                                        <LogOutIcon /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;