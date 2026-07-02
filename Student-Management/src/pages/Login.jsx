import React, { useState } from 'react';
import { Mail, Shield, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(identifier, password);
      onLoginSuccess(response.teacher);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Dynamic Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md px-6 z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 animate-bounce">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Apex College
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Student Attendance Portal • Teacher Login
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-card bg-slate-950/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-xl flex items-center space-x-2">
                <span className="h-1.5 w-1.5 bg-red-400 rounded-full inline-block animate-ping"></span>
                <span>{error}</span>
              </div>
            )}

            {/* Teacher ID or Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Teacher ID / Email
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter T1001 or email"
                  className="w-full bg-slate-900/60 border border-slate-800/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl pl-12 pr-12 py-3.5 text-slate-200 placeholder-slate-600 outline-none transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 focus:outline-none text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm">Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">Sign In Portal</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Sandbox Credentials
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('T1001', 'password123')}
                className="w-full flex items-center justify-between text-left text-xs bg-slate-900/40 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 px-4 py-3 rounded-xl transition-all"
              >
                <div>
                  <p className="font-semibold text-slate-200">Mr. John (AI & DS Dept)</p>
                  <p className="text-[10px] text-slate-500">ID: T1001 / Pass: password123</p>
                </div>
                <span className="text-indigo-400 text-[10px] font-bold uppercase">Load</span>
              </button>

              <button
                onClick={() => handleQuickLogin('sarah@college.edu', 'password123')}
                className="w-full flex items-center justify-between text-left text-xs bg-slate-900/40 hover:bg-purple-500/10 border border-slate-800 hover:border-purple-500/30 px-4 py-3 rounded-xl transition-all"
              >
                <div>
                  <p className="font-semibold text-slate-200">Mrs. Sarah (CSE Dept)</p>
                  <p className="text-[10px] text-slate-500">Email: sarah@college.edu / Pass: password123</p>
                </div>
                <span className="text-purple-400 text-[10px] font-bold uppercase">Load</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
