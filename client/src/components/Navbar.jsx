import React, { useState } from 'react';
import { Compass, MapPin, Calculator, Train, Heart, Headphones, Menu, X, User, LogOut, Edit3 } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  wishlistCount = 0, 
  onWishlistClick, 
  user, 
  onOpenAuth, 
  onOpenProfile, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'places', label: 'Destinations', icon: Compass },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'budget', label: 'Budget Estimator', icon: Calculator },
    { id: 'trains', label: 'Where is My Train', icon: Train },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('hero')}>
            <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md shadow-sky-200">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Anti<span className="text-sky-600">Travel</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Wishlist Link with Red Heart Badge */}
            <button
              onClick={onWishlistClick}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all relative"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile / Auth CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-100 p-1.5 pl-3 rounded-full border border-slate-200 shadow-sm">
                <button
                  onClick={onOpenProfile}
                  title="Click to Edit Traveler Profile"
                  className="flex items-center space-x-2 text-slate-800 hover:text-sky-600 cursor-pointer"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-sky-500"
                  />
                  <span className="text-xs font-bold max-w-[110px] truncate">{user.name || 'Traveler'}</span>
                  <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1" />

                <button
                  onClick={onLogout}
                  title="Logout Account"
                  className="p-1 text-slate-500 hover:text-rose-600 rounded-full hover:bg-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md shadow-sky-100 active:scale-95 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onWishlistClick}
              className="text-rose-600 bg-rose-50 p-2 rounded-lg flex items-center space-x-1 text-xs font-bold"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{wishlistCount}</span>
            </button>

            {user ? (
              <button
                onClick={onOpenProfile}
                className="text-slate-700 bg-slate-100 p-2 rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <User className="w-4 h-4 text-sky-600" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-sky-50 hover:text-sky-600 text-left text-base font-medium"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
