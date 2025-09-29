

import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from '../components/Icons';
import { getUsers, updateUser } from '../api';

// Hàm lấy user hiện tại từ API session
const getCurrentUser = async () => {
    const res = await fetch('/api/me.php', { credentials: 'include' });
    if (!res.ok) throw new Error('Not logged in');
    const data = await res.json();
    if (data.success) return data.user;
    throw new Error('Not logged in');
};


const ProfilePage = () => {
    const [user, setUser] = useState({ name: '', email: '', role: '', id: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: '', id: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Lấy user hiện tại từ API session
    useEffect(() => {
        getCurrentUser()
            .then(u => {
                setUser(u);
                setFormData({
                    name: u.username || u.name || '',
                    email: u.email || '',
                    role: u.role || '',
                    id: u.user_id
                });
            })
            .catch(() => {
                // Nếu chưa đăng nhập hoặc session hết hạn, chuyển về trang đăng nhập
                window.location.href = '/login';
            });
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Nếu cancel, reset lại formData từ user
            setFormData({
                name: user.name,
                email: user.email || '',
                role: user.role,
            });
        }
        setIsEditing(!isEditing);
    };


    const handleProfileSave = async (e) => {
        e.preventDefault();
        // Only send user_id, username, email
        await updateUser({ user_id: user.user_id, username: formData.name, email: formData.email });
        setUser(prev => ({ ...prev, ...formData, user_id: user.user_id }));
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            alert("Please fill all password fields.");
            return;
        }
        // Log user_id gửi lên để kiểm tra
        console.log('Change password for user_id:', user.user_id);
        const res = await updateUser({ user_id: user.user_id, currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
        if (res && res.success) {
            alert('Password updated successfully!');
        } else {
            alert(res && res.message ? res.message : 'Password update failed!');
        }
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <h2>Settings</h2>
                <p>Manage your profile and security settings.</p>
            </div>
            
            <div className="profile-grid">
                <div className="card">
                    <form onSubmit={handleProfileSave}>
                        <div className="card-header">
                            <h3>Profile Information</h3>
                            <button type="button" className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`} onClick={handleEditToggle}>
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                        
                        <div className="profile-avatar-section">
                            <img src="https://i.pravatar.cc/100?u=mathias" alt={user.name} className="profile-avatar" />
                            {isEditing && <button type="button" className="avatar-change-btn">Change</button>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" className="form-control" value={formData.name ?? ''} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" className="form-control" value={formData.email ?? ''} disabled />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <input type="text" id="role" name="role" className="form-control" value={formData.role ?? ''} disabled style={{ textTransform: 'capitalize' }} />
                        </div>
                        
                        {isEditing && (
                            <div className="profile-form-actions">
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="card">
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="card-header">
                            <h3>Change Password</h3>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <div className="input-wrapper">
                                <input type={showPasswords.current ? 'text' : 'password'} id="currentPassword" name="currentPassword" value={passwordData.currentPassword ?? ''} onChange={handlePasswordChange} className="form-control" />
                                <button type="button" className="password-toggle" onClick={() => toggleShowPassword('current')}>
                                    {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="input-wrapper">
                                <input type={showPasswords.new ? 'text' : 'password'} id="newPassword" name="newPassword" value={passwordData.newPassword ?? ''} onChange={handlePasswordChange} className="form-control" />
                                 <button type="button" className="password-toggle" onClick={() => toggleShowPassword('new')}>
                                    {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <div className="input-wrapper">
                                <input type={showPasswords.confirm ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword ?? ''} onChange={handlePasswordChange} className="form-control" />
                                 <button type="button" className="password-toggle" onClick={() => toggleShowPassword('confirm')}>
                                    {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="profile-form-actions">
                            <button type="submit" className="btn btn-primary">Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;