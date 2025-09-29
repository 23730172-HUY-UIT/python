import React, { useState } from 'react';
import { SpinnerIcon } from '../components/Icons';

const ForgotPasswordPage = ({ onNavigate }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
    };

    return (
        <div className="auth-form">
            <a href="#" className="back-link" onClick={() => !isLoading && onNavigate('login')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
                Back
            </a>

            <h2>Forgot Password</h2>
            <p className="subtitle">Enter your registered email address. we'll send you a code to reset your password.</p>

            <form onSubmit={handleSendOtp}>
                <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <input type="email" id="reset-email" defaultValue="mathew.west@ienetworksolutions.com" disabled={isLoading} />
                </div>
                <button type="submit" className="btn" style={{marginTop: '1rem'}} disabled={isLoading}>
                    {isLoading ? <SpinnerIcon /> : 'Send OTP'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
