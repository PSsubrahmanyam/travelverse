import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, X, ExternalLink, Hotel, Utensils, Star, Heart, CheckCircle2 } from 'lucide-react';

// Custom Default Marker (Blue)
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2f80ed.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Highlighted Active Marker (Red)
const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -38],
  shadowSize: [45, 45]
});

// Component to handle smooth fly-to ONLY when selected destination changes
function MapFlyControl({ selectedDestination }) {
  const map = useMap();
  const prevIdRef = useRef(null);

  useEffect(() => {
    const currentId = selectedDestination ? (selectedDestination.id || selectedDestination._id) : null;
    
    if (currentId && currentId !== prevIdRef.current) {
      prevIdRef.current = currentId;
      map.flyTo([selectedDestination.lat, selectedDestination.lng], 12, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    } else if (!currentId && prevIdRef.current) {
      prevIdRef.current = null;
      map.flyTo([20.5937, 78.9629], 5, {
        duration: 1.5,
      });
    }
  }, [selectedDestination, map]);

  return null;
}

export default function MapView({ 
  destinations, 
  selectedDestination, 
  onClearSelection, 
  wishlistIds = [], 
  onToggleWishlist,
  visitedIds = [],
  onToggleVisited
}) {
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const initialZoom = 5;

  const [activeTab, setActiveTab] = useState('hotels');

  const selectedId = selectedDestination ? (selectedDestination.id || selectedDestination._id) : null;
  const isSelectedWishlisted = selectedId ? wishlistIds.includes(selectedId) : false;
  const isSelectedVisited = selectedId ? visitedIds.includes(selectedId) : false;

  return (
    <div id="map" className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 text-sky-600 bg-sky-50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Navigation className="w-3.5 h-3.5" />
            <span>Interactive Location, Hotel & Dining Finder</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Map Spot, Nearby Hotels & Restaurants
          </h2>
          <p className="text-slate-600 mt-2 text-sm max-w-xl mx-auto">
            Click "View on Map" to pinpoint exact coordinates. Mark spots as ✅ Visited or add to ❤️ Wishlist.
          </p>
        </div>

        {/* Selected Destination Banner with Hotels & Restaurants Panel */}
        {selectedDestination && (
          <div className="mb-6 bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 animate-fadeIn">
            
            {/* Top Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-900 to-slate-900 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-md">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider block">
                    Selected Destination ({selectedDestination.category})
                  </span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-white flex items-center space-x-2">
                    <span>{selectedDestination.title}</span>
                    <span className="font-normal text-xs text-slate-300">({selectedDestination.locationName})</span>
                    {isSelectedVisited && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Visited</span>
                      </span>
                    )}
                  </h3>
                  <div className="text-xs font-mono text-emerald-400 mt-0.5">
                    📍 Lat: <strong>{selectedDestination.lat}</strong> | Lng: <strong>{selectedDestination.lng}</strong> | Est. Cost: <strong>₹{(selectedDestination.avgCostPerDay > 100 ? selectedDestination.avgCostPerDay : selectedDestination.avgCostPerDay * 80).toLocaleString('en-IN')}/day</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Visited Mark Button on Banner */}
                {onToggleVisited && (
                  <button
                    onClick={() => onToggleVisited(selectedId)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                      isSelectedVisited
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{isSelectedVisited ? 'Marked Visited' : '+ Mark Visited'}</span>
                  </button>
                )}

                {/* Wishlist Heart Toggle on Banner */}
                {onToggleWishlist && (
                  <button
                    onClick={() => onToggleWishlist(selectedId)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                      isSelectedWishlisted
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSelectedWishlisted ? 'fill-white text-white' : 'text-rose-400'}`} />
                    <span>{isSelectedWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/search/hotels+and+restaurants+near+${encodeURIComponent(selectedDestination.title + ' ' + selectedDestination.locationName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>

                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-xl font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs for Hotels vs Restaurants */}
            <div className="bg-slate-800/80 px-4 pt-3 flex items-center space-x-3 border-b border-white/10">
              <button
                onClick={() => setActiveTab('hotels')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'hotels'
                    ? 'bg-slate-900 text-sky-400 border-t-2 border-sky-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hotel className="w-4 h-4 text-sky-400" />
                <span>Nearby Hotels & Stays ({selectedDestination.nearbyHotels?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('restaurants')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'restaurants'
                    ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Nearby Restaurants & Cafes ({selectedDestination.nearbyRestaurants?.length || 0})</span>
              </button>
            </div>

            {/* Content Panel */}
            <div className="p-5 bg-slate-950">
              {activeTab === 'hotels' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                    <Hotel className="w-4 h-4 text-sky-400 mr-1.5" />
                    Recommended Stays Near {selectedDestination.title}
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedDestination.nearbyHotels?.map((hotel, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-sky-500/50 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                              {hotel.type}
                            </span>
                            <span className="text-xs font-bold text-amber-400 flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {hotel.rating}
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-sm mt-1 leading-snug">{hotel.name}</h5>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{hotel.distance}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Est. Price</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">${hotel.pricePerNight}<span className="text-[10px] text-slate-400 font-normal">/night</span></span>
                          </div>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' ' + selectedDestination.locationName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center"
                          >
                            <span>Book / View</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'restaurants' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                    <Utensils className="w-4 h-4 text-amber-400 mr-1.5" />
                    Top Authentic Dining & Cafes Near {selectedDestination.title}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedDestination.nearbyRestaurants?.map((rest, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/50 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                              {rest.cuisine}
                            </span>
                            <span className="text-xs font-bold text-amber-400 flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {rest.rating}
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-sm mt-1 leading-snug">{rest.name}</h5>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{rest.distance}</p>
                          {rest.specialty && (
                            <p className="text-[11px] text-amber-200/80 italic mt-1.5 bg-amber-950/40 p-1.5 rounded border border-amber-900/30">
                              ✨ {rest.specialty}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Avg for Two</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">${rest.avgPriceForTwo}</span>
                          </div>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(rest.name + ' ' + selectedDestination.locationName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center"
                          >
                            <span>Menu / View</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Leaflet Map Container with Stable Control Settings */}
        <div className="h-[520px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 relative z-10">
          <MapContainer
            center={defaultCenter}
            zoom={initialZoom}
            zoomSnap={0.5}
            zoomDelta={0.5}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <MapFlyControl selectedDestination={selectedDestination} />
            
            {/* OpenStreetMap Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Markers for Destinations */}
            {destinations.map((dest) => {
              const dId = dest.id || dest._id;
              const isSelected = selectedDestination && (selectedDestination.id === dest.id || selectedDestination._id === dest._id);
              const isWish = wishlistIds.includes(dId);
              const isVis = visitedIds.includes(dId);

              return (
                <Marker
                  key={dId}
                  position={[dest.lat, dest.lng]}
                  icon={isSelected ? activeIcon : defaultIcon}
                  ref={(ref) => {
                    if (isSelected && ref) {
                      ref.openPopup();
                    }
                  }}
                >
                  <Popup autoPan={true}>
                    <div className="p-1.5 max-w-xs font-sans">
                      <img
                        src={dest.image}
                        alt={dest.title}
                        className="w-full h-28 object-cover rounded-lg mb-2 shadow-sm"
                      />
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 inline-block">
                          {dest.category}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {onToggleVisited && (
                            <button
                              onClick={() => onToggleVisited(dId)}
                              title={isVis ? "Visited" : "Mark Visited"}
                              className={`p-1 transition-transform ${isVis ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {onToggleWishlist && (
                            <button
                              onClick={() => onToggleWishlist(dId)}
                              title="Wishlist"
                              className="p-1 text-rose-500 hover:scale-110 transition-transform"
                            >
                              <Heart className={`w-4 h-4 ${isWish ? 'fill-rose-500' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{dest.title}</h4>
                      <p className="text-xs text-slate-500 mb-2 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-500 mr-1" />
                        {dest.locationName}
                      </p>
                      
                      {/* Hotels & Restaurants Quick Count */}
                      <div className="bg-slate-100 p-2 rounded-md text-[11px] text-slate-700 space-y-1 mb-2">
                        <div className="flex items-center text-sky-700 font-medium">
                          <Hotel className="w-3 h-3 mr-1" />
                          <span>{dest.nearbyHotels?.length || 3} Nearby Stays</span>
                        </div>
                        <div className="flex items-center text-amber-700 font-medium">
                          <Utensils className="w-3 h-3 mr-1" />
                          <span>{dest.nearbyRestaurants?.length || 3} Dining Spots</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-1.5 rounded border text-[10px] font-mono text-slate-600">
                        Lat: {dest.lat} | Lng: {dest.lng}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
