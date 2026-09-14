import React from 'react';
import { Palmtree, Landmark, Mountain, History, Trees, Droplets, LayoutGrid, Heart, CheckCircle2 } from 'lucide-react';

export default function CategoryFilter({ selectedCategory, onSelectCategory, wishlistCount = 0, visitedCount = 0, totalCount = 520 }) {
  const categories = [
    { id: 'all', label: `All Places (${totalCount})`, icon: LayoutGrid },
    { id: 'visited', label: `Visited Places (${visitedCount})`, icon: CheckCircle2, isVisited: true },
    { id: 'wishlist', label: `My Wishlist (${wishlistCount})`, icon: Heart, isSpecial: true },
    { id: 'beaches', label: 'Beaches', icon: Palmtree },
    { id: 'temples', label: 'Temples', icon: Landmark },
    { id: 'hills', label: 'Hill Stations', icon: Mountain },
    { id: 'historical', label: 'Historical', icon: History },
    { id: 'wildlife', label: 'Wildlife', icon: Trees },
    { id: 'waterfalls', label: 'Waterfalls', icon: Droplets },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-2.5 my-6">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const isWishlist = cat.id === 'wishlist';
        const isVisited = cat.id === 'visited';

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              isSelected
                ? isVisited
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105'
                  : isWishlist
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200 scale-105'
                  : 'bg-sky-600 text-white shadow-md shadow-sky-200 scale-105'
                : isVisited
                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shadow-sm'
                : isWishlist
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isVisited
                  ? isSelected ? 'text-white' : 'text-emerald-600'
                  : isWishlist
                  ? isSelected ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'
                  : ''
              }`}
            />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
