import React, { useState } from 'react';
import { X, User, MapPin, Heart, Lock, Camera, CheckCircle2, Sparkles, Save, LogOut, Award, Compass, Shield, Globe } from 'lucide-react';
import axios from 'axios';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateUser, 
  onLogout,
  visitedCount = 3,
  wishlistCount = 0
}) {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  ];

  const categories = [
    { id: 'beaches', label: '🏖️ Beaches' },
    { id: 'temples', label: '🛕 Temples' },
    { id: 'hills', label: '⛰️ Hill Stations' },
    { id: 'historical', label: '🏰 Historical' },
    { id: 'wildlife', label: '🦁 Wildlife' },
    { id: 'waterfalls', label: '🌊 Waterfalls' },
  ];

  const [formData, setFormData] = useState({
    name: user?.name || 'Traveler',
    homeCity: user?.homeCity || 'Hyderabad, India',
    favoriteCategory: user?.favoriteCategory || 'beaches',
    bio: user?.bio || 'Passionate traveler exploring beaches, hill stations, and heritage spots!',
    avatar: user?.avatar || avatars[0],
    newPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'passport'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Instant 0ms Optimistic Profile Update
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedUser = {
      ...user,
      name: formData.name,
      homeCity: formData.homeCity,
      favoriteCategory: formData.favoriteCategory,
      bio: formData.bio,
      avatar: formData.avatar,
    };

    // 1. Instant 0ms local state update
    onUpdateUser(updatedUser);
    setSuccessMsg('Profile updated instantly!');
    setLoading(false);

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1000);

    // 2. Background async API sync (non-blocking)
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    axios.put(`${apiBase}/api/auth/profile`, {
      email: user.email,
      name: formData.name,
      homeCity: formData.homeCity,
      favoriteCategory: formData.favoriteCategory,
      bio: formData.bio,
      avatar: formData.avatar,
      newPassword: formData.newPassword || undefined,
    }).catch(() => {});
  };

  const passportId = `AT-${(user.email.length * 37 + 1042).toString().slice(0, 5)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-sky-400 shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-sky-500 text-white p-1 rounded-full text-[10px]">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider block">Verified Traveler</span>
              <h3 className="text-xl font-extrabold">{formData.name || 'Traveler'}</h3>
              <p className="text-xs text-slate-300 font-mono">{user.email}</p>
            </div>
          </div>

          {/* Sub Navigation Tabs: Edit Profile vs Traveler Passport */}
          <div className="grid grid-cols-2 gap-1 bg-slate-800/80 p-1 rounded-xl mt-4 border border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'profile' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('passport')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'passport' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Digital Passport & Badges</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Edit Profile Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {avatars.map((imgUrl, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setFormData((prev) => ({ ...prev, avatar: imgUrl }))}
                    className={`relative rounded-full transition-transform ${
                      formData.avatar === imgUrl ? 'scale-110 ring-2 ring-sky-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Home City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Shanmukh Parimi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Home City / Country
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="homeCity"
                    value={formData.homeCity}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad, India"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Favorite Travel Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Favorite Travel Category
              </label>
              <select
                name="favoriteCategory"
                value={formData.favoriteCategory}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Traveler Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Short Traveler Bio / Tagline
              </label>
              <textarea
                name="bio"
                rows="2"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Passionate traveler exploring beaches, hill stations, and heritage spots..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none leading-relaxed"
              ></textarea>
            </div>

            {/* Change Password (Optional) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Change Password (Optional)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password to update"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex items-center space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Updates</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>

          </form>
        )}

        {/* Tab 2: Digital Traveler Passport & Achievement Badges */}
        {activeTab === 'passport' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
            
            {/* Passport Card */}
            <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-6 rounded-3xl shadow-xl border border-amber-500/40 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-amber-300" />
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-200">
                    AntiTravel Digital Passport
                  </span>
                </div>
                <span className="bg-amber-950/60 text-amber-200 border border-amber-400/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                  ID: {passportId}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
                />
                <div>
                  <h4 className="font-extrabold text-lg leading-tight">{formData.name}</h4>
                  <p className="text-xs text-amber-200 flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1 text-amber-300" />
                    {formData.homeCity || 'Explorer Base'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/20 text-center font-mono text-xs">
                <div>
                  <span className="text-[10px] text-amber-300 block font-sans uppercase">Visited</span>
                  <span className="font-extrabold text-base text-white">{visitedCount} Spots</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 block font-sans uppercase">Wishlist</span>
                  <span className="font-extrabold text-base text-white">{wishlistCount} Saved</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 block font-sans uppercase">Status</span>
                  <span className="font-extrabold text-xs text-emerald-300 block mt-1">Verified</span>
                </div>
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                <Award className="w-4 h-4 text-amber-500 mr-1.5" />
                Unlocked Traveler Badges
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
                    🏖️
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Beach Wanderer</h5>
                    <span className="text-[10px] text-emerald-600 font-bold block">Unlocked</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                    🛕
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Sacred Pilgrim</h5>
                    <span className="text-[10px] text-emerald-600 font-bold block">Unlocked</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">
                    ⛰️
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Highland Climber</h5>
                    <span className="text-[10px] text-emerald-600 font-bold block">Unlocked</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-xl">
                    💰
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Smart Budgeter</h5>
                    <span className="text-[10px] text-emerald-600 font-bold block">Unlocked</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
