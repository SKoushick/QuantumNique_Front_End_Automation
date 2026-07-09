/**
 * Login page — authentication entry point
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const DEMO_CREDS = [
  { email: 'admin@nexushr.com',    password: 'admin123',    role: 'Admin',    color: '#4285F4' },
  { email: 'hr@nexushr.com',       password: 'hr123',       role: 'HR',       color: '#8B5CF6' },
  { email: 'manager@nexushr.com',  password: 'manager123',  role: 'Manager',  color: '#10B981' },
  { email: 'employee@nexushr.com', password: 'employee123', role: 'Employee', color: '#F59E0B' },
];

export default function Login() {
  const { login, loading, error, setError } = useAuth();
  const { success }                          = useNotification();
  const navigate                             = useNavigate();

  const [form, setForm]           = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      success(`Welcome back, ${user.firstName}! 👋`);
      navigate('/', { replace: true });
    } catch {/* error shown via context */ }
  };

  const handleDemoLogin = (cred) => {
    setForm({ email: cred.email, password: cred.password, rememberMe: false });
    setFieldErrors({}); 
    setError(null);
  };

  return (
    <div className="auth-page">
      {/* Background gradient blobs */}
      <div className="auth-bg">
        <div className="auth-bg__blob auth-bg__blob--1" />
        <div className="auth-bg__blob auth-bg__blob--2" />
        <div className="auth-bg__blob auth-bg__blob--3" />
      </div>

      <div className="auth-container animate-fadeInUp">
        {/* ── Left panel: branding ─────────────────── */}
        <div className="auth-hero">
          <div className="auth-hero__content">
            <div className="auth-hero__logo">
              <Zap size={28} strokeWidth={2.5} />
            </div>
            <h1 className="auth-hero__title">NexusHR</h1>
            <p className="auth-hero__subtitle">Enterprise Human Resources Platform</p>
            <p className="auth-hero__desc">
              Streamline your workforce management with intelligent tools for HR teams, managers, and employees.
            </p>

            <div className="auth-hero__stats">
              {[
                { label: 'Companies', value: '2,400+' },
                { label: 'Employees', value: '180K+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((s) => (
                <div key={s.label} className="auth-hero__stat">
                  <span className="auth-hero__stat-value">{s.value}</span>
                  <span className="auth-hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: form ────────────────────── */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Welcome back</h2>
              <p className="auth-form-subtitle">Sign in to your NexusHR account</p>
            </div>

            {/* Demo credentials */}
            <div className="auth-demo">
              <span className="auth-demo__label">Quick demo login:</span>
              <div className="auth-demo__buttons">
                {DEMO_CREDS.map((c) => (
                  <button
                    key={c.role}
                    type="button"
                    className="auth-demo__btn"
                    style={{ '--demo-color': c.color }}
                    onClick={() => handleDemoLogin(c)}
                  >
                    {c.role}
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-divider"><span>or sign in manually</span></div>

            {/* Error banner */}
            {error && (
              <div className="auth-error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    className={`auth-input ${fieldErrors.email ? 'auth-input--error' : ''}`}
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    autoComplete="email"
                    autoFocus
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    aria-invalid={!!fieldErrors.email}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="auth-field-error" id="email-error" role="alert">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">
                  Password
                  <Link to="/forgot-password" className="auth-label-link">Forgot password?</Link>
                </label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${fieldErrors.password ? 'auth-input--error' : ''}`}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    autoComplete="current-password"
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    aria-invalid={!!fieldErrors.password}
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="auth-field-error" id="password-error" role="alert">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <label className="auth-remember">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm((p) => ({ ...p, rememberMe: e.target.checked }))}
                />
                <span>Keep me signed in for 30 days</span>
              </label>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer-note">
              By signing in, you agree to our{' '}
              <a href="#">Terms of Service</a> and{' '}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
