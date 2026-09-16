import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import DestinationCard from './components/DestinationCard';
import MapView from './components/MapView';
import BudgetCalculator from './components/BudgetCalculator';
import AIChatbot from './components/AIChatbot';
import SupportForm from './components/SupportForm';
import ReviewModal from './components/ReviewModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import Footer from './components/Footer';
import { INITIAL_DESTINATIONS } from './data/destinations';
import { Heart, Search, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

// Sample initial community reviews
const INITIAL_REVIEWS = {
  '1': [
    { id: 'r1', destinationId: '1', reviewerName: 'Shanmukh Parimi', rating: 5, visitDate: 'Aug 2026', comment: 'Baga Beach is amazing! Clean sands, great water sports, and peaceful sunset dining.' },
    { id: 'r2', destinationId: '1', reviewerName: 'Ananya Sharma', rating: 4, visitDate: 'Jul 2026', comment: 'Loved the shacks and fresh seafood. Best to visit early morning!' }
  ],
  '85': [
    { id: 'r3', destinationId: '85', reviewerName: 'Rahul Verma', rating: 5, visitDate: 'Aug 2026', comment: 'Deeply spiritual atmosphere. The Ganga Aarti at dusk is an unforgettable experience.' }
  ],
  '168': [
    { id: 'r4', destinationId: '168', reviewerName: 'Priya Nair', rating: 5, visitDate: 'May 2026', comment: 'Breathtaking snow peaks and paragliding! Must pack warm layers.' }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('places');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allDestinations, setAllDestinations] = useState(INITIAL_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [reviewModalDest, setReviewModalDest] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('anti_travel_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    try {
      localStorage.setItem('anti_travel_user', JSON.stringify(userData));
      if (token) localStorage.setItem('anti_travel_token', token);
    } catch (e) {}

    // Prompt profile modal if new user or missing name
    if (userData.isNewUser || !userData.homeCity) {
      setIsProfileModalOpen(true);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('anti_travel_user', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('anti_travel_user');
      localStorage.removeItem('anti_travel_token');
    } catch (e) {}
  };

  // LocalStorage Wishlist persistence
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('anti_travel_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // LocalStorage Visited persistence
  const [visitedIds, setVisitedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('anti_travel_visited');
      return saved ? JSON.parse(saved) : ['1', '85', '168'];
    } catch (e) {
      return ['1', '85', '168'];
    }
  });

  // LocalStorage Reviews persistence
  const [reviewsMap, setReviewsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('anti_travel_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch (e) {
      return INITIAL_REVIEWS;
    }
  });

  const toggleWishlist = (id) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('anti_travel_wishlist', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Toggle Visited: 1st click = Mark Visited + Open Review Modal, 2nd click = Reset back to Default
  const toggleVisited = (id) => {
    const isCurrentlyVisited = visitedIds.includes(id);

    if (!isCurrentlyVisited) {
      // 1st click: Mark as visited and open Review Modal
      const updated = [...visitedIds, id];
      setVisitedIds(updated);
      try {
        localStorage.setItem('anti_travel_visited', JSON.stringify(updated));
      } catch (e) {}

      const destObj = allDestinations.find((d) => (d.id || d._id) === id);
      if (destObj) {
        setReviewModalDest(destObj);
      }
    } else {
      // 2nd click: Unmark visited and toggle back to default state
      const updated = visitedIds.filter((vId) => vId !== id);
      setVisitedIds(updated);
      try {
        localStorage.setItem('anti_travel_visited', JSON.stringify(updated));
      } catch (e) {}

      if (reviewModalDest && (reviewModalDest.id || reviewModalDest._id) === id) {
        setReviewModalDest(null);
      }
    }
  };

  const handleAddReview = (newReview) => {
    const destId = newReview.destinationId;
    setReviewsMap((prev) => {
      const existing = prev[destId] || [];
      const updated = { ...prev, [destId]: [newReview, ...existing] };
      try {
        localStorage.setItem('anti_travel_reviews', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setReviewModalDest(null);
  };

  // Fast background sync with backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const res = await axios.get(`${apiBase}/api/destinations`);
        if (isMounted && res.data && res.data.data && res.data.data.length > 0) {
          setAllDestinations(res.data.data);
        }
      } catch (err) {
        // Silently keep local instant dataset
      }
    };

    fetchDestinations();
    return () => { isMounted = false; };
  }, []);

  // Instant Memoized Filtering by Category, Visited, Wishlist & Search Query
  const filteredDestinations = useMemo(() => {
    let list = allDestinations;

    // 1. Filter by category, visited, or wishlist
    if (selectedCategory === 'visited') {
      list = allDestinations.filter((item) => visitedIds.includes(item.id || item._id));
    } else if (selectedCategory === 'wishlist') {
      list = allDestinations.filter((item) => wishlistIds.includes(item.id || item._id));
    } else if (selectedCategory !== 'all') {
      list = allDestinations.filter((item) => item.category === selectedCategory);
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.locationName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, allDestinations, wishlistIds, visitedIds, searchQuery]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setVisibleCount(12);
  };

  const handleSelectOnMap = (dest) => {
    setSelectedDestination(dest);
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Limit map markers to filtered items (max 50) for 60fps smooth Leaflet rendering
  const mapDestinations = useMemo(() => {
    const list = filteredDestinations.slice(0, 50);
    if (selectedDestination && !list.some(d => (d.id || d._id) === (selectedDestination.id || selectedDestination._id))) {
      return [selectedDestination, ...list];
    }
    return list;
  }, [filteredDestinations, selectedDestination]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wishlistCount={wishlistIds.length}
        onWishlistClick={() => {
          setSelectedCategory('wishlist');
          const el = document.getElementById('places');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(!isAIChatOpen)}
        onLogout={handleLogout}
      />

      {/* Hero Header with Search Input */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setVisibleCount(12);
        }}
        onExploreClick={() => {
          const el = document.getElementById('places');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onPlanClick={() => {
          const el = document.getElementById('budget');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 1. Tourist Places Showcase Section */}
      <section id="places" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
            Explore {allDestinations.length}+ Famous Destinations
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Top Tourist Destinations
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Filter places by categories, view your ✅ Visited places & Reviews, or saved ❤️ Wishlist spots.
          </p>
        </div>

        {/* Category Filter Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          wishlistCount={wishlistIds.length}
          visitedCount={visitedIds.length}
          totalCount={allDestinations.length}
        />

        {/* Active Search Banner Indicator */}
        {searchQuery.trim() && (
          <div className="max-w-md mx-auto mb-6 bg-sky-50 border border-sky-200 p-3 rounded-2xl flex items-center justify-between text-xs text-sky-900">
            <div className="flex items-center space-x-2 font-medium">
              <Search className="w-4 h-4 text-sky-600" />
              <span>Showing results for "<strong>{searchQuery}</strong>" ({filteredDestinations.length} found)</span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sky-700 hover:text-rose-600 flex items-center font-bold px-2 py-0.5 rounded hover:bg-sky-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </button>
          </div>
        )}

        {/* Visited or Wishlist Empty State */}
        {filteredDestinations.length === 0 ? (
          <div className="my-12 text-center bg-white p-10 rounded-2xl border border-slate-200/80 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              {selectedCategory === 'visited' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              ) : selectedCategory === 'wishlist' ? (
                <Heart className="w-8 h-8 text-rose-500" />
              ) : (
                <Search className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {selectedCategory === 'visited'
                ? 'No Visited Places Marked Yet'
                : selectedCategory === 'wishlist'
                ? 'Your Wishlist is Empty'
                : 'No Matching Destinations Found'}
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {selectedCategory === 'visited'
                ? 'Click the ✅ Visited checkmark on any destination card to mark where you have traveled and share your traveler review!'
                : `Browse all ${allDestinations.length} places to add spots to your list.`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-6 py-2.5 rounded-full transition-colors"
            >
              Show All {allDestinations.length} Destinations
            </button>
          </div>
        ) : (
          /* Destination Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredDestinations.slice(0, visibleCount).map((item) => {
              const itemId = item.id || item._id;
              return (
                <DestinationCard
                  key={itemId}
                  destination={item}
                  onSelectOnMap={handleSelectOnMap}
                  isWishlisted={wishlistIds.includes(itemId)}
                  onToggleWishlist={toggleWishlist}
                  isVisited={visitedIds.includes(itemId)}
                  onToggleVisited={toggleVisited}
                  reviews={reviewsMap[itemId] || []}
                />
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredDestinations.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Load More Destinations ({filteredDestinations.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </section>

      {/* 2. Interactive Location Finder (Leaflet.js Map) */}
      <MapView
        destinations={mapDestinations}
        selectedDestination={selectedDestination}
        onClearSelection={() => setSelectedDestination(null)}
        wishlistIds={wishlistIds}
        onToggleWishlist={toggleWishlist}
        visitedIds={visitedIds}
        onToggleVisited={toggleVisited}
      />

      {/* 3. Dynamic Budget Estimator */}
      <BudgetCalculator />

      {/* 5. Support & Contact Desk */}
      <SupportForm />

      {/* 5. Floating Robot Circle AI Chatbot (Fixed at Bottom Right) */}
      <AIChatbot
        isOpen={isAIChatOpen}
        onToggle={() => setIsAIChatOpen(!isAIChatOpen)}
      />

      {/* 6. Review Submission Modal */}
      {reviewModalDest && (
        <ReviewModal
          destination={reviewModalDest}
          onClose={() => setReviewModalDest(null)}
          onSubmitReview={handleAddReview}
        />
      )}

      {/* 7. Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 8. User Profile Editor Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        visitedCount={visitedIds.length}
        wishlistCount={wishlistIds.length}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
