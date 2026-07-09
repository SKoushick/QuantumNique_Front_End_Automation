import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, AlertCircle, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

export default function ResetPassword() {
  const { resetPassword, loading, error, setError } = useAuth();
  const { success } = useNotification();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await resetPassword(token, form.password);
      success('Password updated successfully!');
      navigate('/login', { replace: true });
    } catch { /* error via context */ }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container auth-container--narrow">
          <div className="auth-form-panel auth-form-panel--full">
            <div className="auth-form-wrap">
              <div className="auth-error" role="alert">
                <AlertCircle size={16} /><p>Invalid reset link.</p>
              </div>
              <Link to="/forgot-password" className="auth-submit auth-submit--link">Request new link</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-bg__blob auth-bg__blob--1" /></div>
      <div className="auth-container auth-container--narrow animate-fadeInUp">
        <div className="auth-form-panel auth-form-panel--full">
          <div className="auth-form-wrap">
            <Link to="/login" className="auth-back-link"><ArrowLeft size={16} /> Back to login</Link>
            <div className="auth-form-header">
              <div className="auth-hero__logo auth-hero__logo--sm"><Zap size={22} /></div>
              <h2 className="auth-form-title">Reset password</h2>
              <p className="auth-form-subtitle">Choose a strong new password.</p>
            </div>
            {error && <div className="auth-error" role="alert"><AlertCircle size={16} /><p>{error}</p></div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-password">New password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="new-password"
                    type={show ? 'text' : 'password'}
                    className="auth-input"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShow((s) => !s)}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="confirm-password">Confirm password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="confirm-password"
                    type="password"
                    className="auth-input"
                    value={form.confirm}
                    onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Updating…' : <>Update Password <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
