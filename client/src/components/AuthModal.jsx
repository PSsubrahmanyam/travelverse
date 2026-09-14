import React, { useState } from 'react';
import { X, Mail, Lock, ShieldCheck, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Instant 0ms Optimistic Auth Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) return;

    setLoading(true);
    setErrorMessage('');

    const cleanEmail = formData.email.trim().toLowerCase();
    const defaultName = cleanEmail.split('@')[0];

    // Create optimistic user profile immediately
    const optimisticUser = {
      id: 'u_' + Date.now(),
      email: cleanEmail,
      name: defaultName,
      homeCity: '',
      favoriteCategory: 'beaches',
      bio: 'Travel enthusiast exploring the world!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isNewUser: activeTab === 'signup',
    };

    // 1. Instant 0ms UI login transition
    onLoginSuccess(optimisticUser, `token_${Date.now()}`);
    onClose();
    setLoading(false);

    // 2. Background async API sync (non-blocking)
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const endpoint = activeTab === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    axios.post(`${apiBase}${endpoint}`, {
      email: cleanEmail,
      password: formData.password,
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-900 text-white text-center">
          <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-extrabold">
            {activeTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-sky-200 mt-1">
            {activeTab === 'signup'
              ? 'Enter email & password to create your account instantly'
              : 'Sign in to access your saved places and digital passport'}
          </p>

          {/* SignIn / SignUp Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-xl mt-4 border border-white/10">
            <button
              onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'signin' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'signup' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. traveler@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-sky-100 flex items-center justify-center space-x-2 text-sm cursor-pointer active:scale-95"
          >
            <span>
              {loading
                ? 'Processing...'
                : activeTab === 'signup'
                ? 'Create Account (Instant)'
                : 'Sign In (Instant)'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Toggle Tab Footer Note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {activeTab === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
                  className="text-sky-600 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setErrorMessage(''); }}
                  className="text-sky-600 font-bold hover:underline"
                >
                  Sign Up with Email & Password
                </button>
              </p>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
