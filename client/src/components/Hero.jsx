import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, MapPin, DollarSign, Train, Search, ArrowRight, Star, Heart, ShieldCheck } from 'lucide-react';

export default function Hero({ onExploreClick, onPlanClick, searchQuery, onSearchChange }) {
  // Showcase Carousel Destinations for Landing Animation
  const featuredSpots = [
    {
      id: '1',
      title: 'Baga Beach',
      location: 'Goa, India',
      category: '🏖️ Beaches',
      rating: 4.8,
      cost: '₹3,600/day',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      badge: 'Most Popular Beach',
    },
    {
      id: '85',
      title: 'Kashi Vishwanath',
      location: 'Varanasi, India',
      category: '🛕 Temples',
      rating: 4.9,
      cost: '₹2,400/day',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      badge: 'Spiritual Sacred',
    },
    {
      id: '168',
      title: 'Solang Valley',
      location: 'Manali, India',
      category: '⛰️ Hill Stations',
      rating: 4.9,
      cost: '₹4,400/day',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      badge: 'Snow & Adventure',
    },
    {
      id: '252',
      title: 'Taj Mahal',
      location: 'Agra, India',
      category: '🏰 Historical',
      rating: 5.0,
      cost: '₹3,200/day',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      badge: 'Wonder of World',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [heroImgSrc, setHeroImgSrc] = useState(featuredSpots[0].image);

  // Auto slide timer for landing page showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredSpots.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [featuredSpots.length]);

  useEffect(() => {
    setHeroImgSrc(featuredSpots[activeSlide].image);
  }, [activeSlide]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <div id="hero" className="relative bg-slate-950 text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
      
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content Area */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-semibold text-sky-400 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Smart Tourist Trip Planner</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">500+ Famous</span> Places Across India
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Explore handpicked tourist destinations in Beaches, Temples, Hill Stations, Historical spots, Wildlife sanctuaries & Waterfalls with hotels, authentic dining, and AI recommendations.
            </p>

            {/* Search Input Box (Connected Live to Destination Filter) */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0 pt-2">
              <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                <Search className="w-5 h-5 text-sky-400 ml-3 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  placeholder="Search location (e.g. Goa, Manali, Varanasi, Taj Mahal...)"
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none pr-3 font-medium"
                />
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/30 flex items-center space-x-1.5 text-xs flex-shrink-0 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-left pl-2">
                💡 Try typing: <strong className="text-sky-300">Goa</strong>, <strong className="text-sky-300">Manali</strong>, <strong className="text-sky-300">Varanasi</strong>, or <strong className="text-sky-300">Taj Mahal</strong>
              </p>
            </form>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                <span>Explore 500 Places</span>
              </button>

              <button
                onClick={onPlanClick}
                className="inline-flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-7 py-3.5 rounded-xl transition-all active:scale-95 backdrop-blur-md cursor-pointer"
              >
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Trip Budget</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('trains');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Train className="w-5 h-5 text-slate-950" />
                <span>Where is My Train</span>
              </button>
            </div>

            {/* Animated Live Stats Strip */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">500+</span>
                <span className="text-xs text-slate-400 block font-medium mt-0.5">Famous Destinations</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">6</span>
                <span className="text-xs text-slate-400 block font-medium mt-0.5">Top Categories</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">100%</span>
                <span className="text-xs text-slate-400 block font-medium mt-0.5">Free & Responsive</span>
              </div>
            </div>

          </div>

          {/* Right Interactive Animated Destination Card Carousel */}
          <div className="lg:col-span-5 relative">
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -left-6 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl z-20 backdrop-blur-md hidden sm:flex items-center space-x-2 animate-bounce">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Wishlist Saved</span>
                <span className="text-xs font-bold text-white">Save Favorite Spots</span>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl z-20 backdrop-blur-md hidden sm:flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Smart AI Concierge</span>
                <span className="text-xs font-bold text-white">Groq AI Powered</span>
              </div>
            </div>

            {/* Interactive Showcase Card */}
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              
              {/* Image Banner */}
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img
                  src={heroImgSrc}
                  onError={() => setHeroImgSrc('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')}
                  alt={featuredSpots[activeSlide].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <span className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg tracking-wide uppercase">
                    {featuredSpots[activeSlide].badge}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center space-x-1 border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{featuredSpots[activeSlide].rating}</span>
                </div>

                {/* Spot Details Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
                    {featuredSpots[activeSlide].category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    {featuredSpots[activeSlide].title}
                  </h3>
                  <div className="flex items-center text-slate-300 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 mr-1" />
                    <span>{featuredSpots[activeSlide].location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-5 bg-slate-950 flex items-center justify-between border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Est. Daily Expense</span>
                  <span className="text-lg font-bold text-emerald-400">{featuredSpots[activeSlide].cost}</span>
                </div>

                {/* Carousel Progress Indicators */}
                <div className="flex items-center space-x-1.5">
                  {featuredSpots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-2 rounded-full transition-all ${
                        activeSlide === i ? 'w-6 bg-sky-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
