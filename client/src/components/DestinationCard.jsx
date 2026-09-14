import React, { useState } from 'react';
import { Heart, MapPin, Star, Hotel, Utensils, CheckCircle2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const CATEGORY_FALLBACK_IMAGES = {
  beaches: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  temples: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
  hills: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  historical: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  wildlife: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
  waterfalls: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
};

export default function DestinationCard({
  destination,
  onSelectOnMap,
  isWishlisted,
  onToggleWishlist,
  isVisited,
  onToggleVisited,
  reviews = [],
}) {
  const [showHotels, setShowHotels] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const destId = destination.id || destination._id;
  const hotelCount = destination.nearbyHotels ? destination.nearbyHotels.length : 0;
  const restCount = destination.nearbyRestaurants ? destination.nearbyRestaurants.length : 0;

  // Determine correct image URL property with category fallback
  const fallbackImg = CATEGORY_FALLBACK_IMAGES[destination.category] || CATEGORY_FALLBACK_IMAGES.beaches;
  const [imgSrc, setImgSrc] = useState(destination.imageUrl || destination.image || fallbackImg);

  const handleImageError = () => {
    setImgSrc(fallbackImg);
  };

  // Convert estimate to Indian Rupees (₹)
  const costNum = typeof destination.avgCostPerDay === 'number'
    ? (destination.avgCostPerDay > 100 ? destination.avgCostPerDay : destination.avgCostPerDay * 80)
    : 2000;

  const formattedRupees = `₹${costNum.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      
      {/* Image Banner Container */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          onError={handleImageError}
          alt={destination.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Category Pill */}
        <div className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {destination.category}
        </div>

        {/* Visited Green Badge Indicator */}
        {isVisited && (
          <div className="absolute top-3 right-12 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-md animate-fadeIn">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Visited
          </div>
        )}

        {/* Heart Wishlist Toggle Button */}
        <button
          onClick={() => onToggleWishlist(destId)}
          aria-label="Toggle Wishlist"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-rose-500 shadow-md transition-all active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-800">{destination.rating}</span>
          <span className="text-[10px] text-slate-500">({destination.reviewsCount || 120})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center text-slate-500 text-xs font-medium mb-1">
            <MapPin className="w-3.5 h-3.5 text-sky-500 mr-1" />
            <span>{destination.locationName}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors line-clamp-1">
            {destination.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {destination.description}
          </p>

          {/* Quick Hotels & Dining Badge Pill */}
          <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
            <button
              onClick={() => setShowHotels(!showHotels)}
              className="flex items-center text-sky-700 font-semibold hover:underline focus:outline-none cursor-pointer"
              title="Click to toggle nearby hotels & stays"
            >
              <Hotel className="w-3.5 h-3.5 text-sky-500 mr-1" />
              {hotelCount} Stays {showHotels ? '▲' : '▼'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setShowRestaurants(!showRestaurants)}
              className="flex items-center text-amber-700 font-semibold hover:underline focus:outline-none cursor-pointer"
              title="Click to toggle nearby restaurants & cafes"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-500 mr-1" />
              {restCount} Dining {showRestaurants ? '▲' : '▼'}
            </button>
          </div>

          {/* Reviews Toggle Button */}
          {reviews.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="w-full flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold transition-colors border border-emerald-200/60"
              >
                <span className="flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {reviews.length} Traveler Review{reviews.length > 1 ? 's' : ''}
                </span>
                {showReviews ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Collapsible Reviews List */}
              {showReviews && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                        <span>{rev.reviewerName}</span>
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug italic">"{rev.comment}"</p>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">Visited: {rev.visitDate || rev.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Est. Budget / Day</span>
            <span className="font-extrabold text-emerald-700 text-sm sm:text-base">
              {formattedRupees} <span className="text-[10px] text-slate-500 font-normal">/ day</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mark Visited Action Button */}
            <button
              onClick={() => onToggleVisited(destId)}
              className={`text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                isVisited
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isVisited ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>{isVisited ? 'Visited' : '+ Visited'}</span>
            </button>

            {/* View on Map Action Button */}
            <button
              onClick={() => onSelectOnMap(destination)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              View on Map
            </button>
          </div>
        </div>

        {/* Collapsible Hotels Drawer */}
        {showHotels && destination.nearbyHotels && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs animate-fadeIn">
            <h4 className="font-bold text-slate-800 flex items-center text-[11px] uppercase tracking-wider">
              <Hotel className="w-3.5 h-3.5 text-sky-600 mr-1" />
              Nearby Hotels & Resorts
            </h4>
            {destination.nearbyHotels.map((h, i) => (
              <div key={i} className="bg-sky-50/70 p-2 rounded-lg flex justify-between items-start border border-sky-100">
                <div>
                  <span className="font-semibold text-slate-800 block">{h.name}</span>
                  <span className="text-[10px] text-slate-500">{h.type} • {h.distance}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sky-700 block">₹{h.pricePerNight}/night</span>
                  <span className="text-[10px] text-amber-600 font-bold">★ {h.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collapsible Restaurants Drawer */}
        {showRestaurants && destination.nearbyRestaurants && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs animate-fadeIn">
            <h4 className="font-bold text-slate-800 flex items-center text-[11px] uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5 text-amber-600 mr-1" />
              Top Authentic Dining
            </h4>
            {destination.nearbyRestaurants.map((r, i) => (
              <div key={i} className="bg-amber-50/70 p-2 rounded-lg flex justify-between items-start border border-amber-100">
                <div>
                  <span className="font-semibold text-slate-800 block">{r.name}</span>
                  <span className="text-[10px] text-slate-500">{r.cuisine} • {r.specialty}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700 block">₹{r.avgCostForTwo} for 2</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
