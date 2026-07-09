import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

export default function ForgotPassword() {
  const { forgotPassword, loading, error, setError } = useAuth();
  const { success } = useNotification();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email) return;
    try {
      const token = await forgotPassword(email);
      setResetToken(token);
      setSent(true);
      success('Reset link generated! Use the link below to reset your password.');
    } catch { /* error via context */ }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__blob auth-bg__blob--1" />
        <div className="auth-bg__blob auth-bg__blob--2" />
      </div>
      <div className="auth-container auth-container--narrow animate-fadeInUp">
        <div className="auth-form-panel auth-form-panel--full">
          <div className="auth-form-wrap">
            <Link to="/login" className="auth-back-link"><ArrowLeft size={16} /> Back to login</Link>
            <div className="auth-form-header">
              <div className="auth-hero__logo auth-hero__logo--sm"><Zap size={22} /></div>
              <h2 className="auth-form-title">Forgot password?</h2>
              <p className="auth-form-subtitle">Enter your email and we'll send reset instructions.</p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <AlertCircle size={16} /><p>{error}</p>
              </div>
            )}

            {sent ? (
              <div className="auth-success" role="status">
                <CheckCircle size={20} />
                <p>Check your inbox! For demo purposes, use this reset link:</p>
                <button
                  type="button"
                  className="auth-submit"
                  onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                >
                  Reset Password <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="forgot-email">Email address</label>
                  <div className="auth-input-wrap">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="forgot-email"
                      type="email"
                      className="auth-input"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Sending…' : <>Send Reset Link <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
