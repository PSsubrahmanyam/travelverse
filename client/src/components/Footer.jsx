import React from 'react';
import { Compass, Heart, Github, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-sky-600 p-1.5 rounded-lg">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">AntiTravel</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A free, modern full-stack web application designed for smart tourist trip planning, budget estimation, map pinpoints, and AI-powered recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('places')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tourist Destinations
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Interactive Location Map
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('budget')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Budget Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Support & Help
                </button>
              </li>
            </ul>
          </div>

          {/* Free Tech Stack */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 uppercase tracking-wider">Tech Stack</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>React 18 + Vite</li>
              <li>Tailwind CSS</li>
              <li>Node.js / Express</li>
              <li>MongoDB Atlas / Leaflet</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} AntiTravel. Built for zero-cost deployment.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for travelers everywhere.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
