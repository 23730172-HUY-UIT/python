import React, { useState } from "react";
import {
  LogoIcon,
  EyeIcon,
  EyeOffIcon,
  SpinnerIcon,
} from "../components/Icons";


const LoginPage = ({ onNavigate, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      await onLogin(email, password);
    } catch (error) {
      // Log error chi tiết để debug
      console.error('Login error:', error);
      setErrorMsg(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <header className="auth-header">
        <LogoIcon />
        <h1>Inventory</h1>
      </header>

      <h2>Welcome 👋</h2>
      <p className="subtitle">Please login here</p>

      <form onSubmit={handleLoginSubmit}>
        {errorMsg && (
          <div style={{ color: 'var(--danger, #e74c3c)', background: 'rgba(231,76,60,0.08)', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: '0.98rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
            placeholder="Email or Username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              disabled={isLoading}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        <div className="form-options">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="remember"
              defaultChecked
              disabled={isLoading}
            />
            <label htmlFor="remember">Remember Me</label>
          </div>
          <a
            href="#"
            className="form-link"
            onClick={() => !isLoading && onNavigate("forgotPassword")}
          >
            Forgot Password?
          </a>
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? <SpinnerIcon /> : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
