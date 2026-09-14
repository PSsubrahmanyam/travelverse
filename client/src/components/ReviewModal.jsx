import React, { useState } from 'react';
import { Star, CheckCircle, X, MessageSquare, User, Calendar, ThumbsUp } from 'lucide-react';

export default function ReviewModal({ destination, onClose, onSubmitReview }) {
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('Shanmukh Parimi');
  const [reviewText, setReviewText] = useState('');
  const [visitDate, setVisitDate] = useState('August 2026');
  const [hoverStar, setHoverStar] = useState(0);

  if (!destination) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview = {
      id: Date.now().toString(),
      destinationId: destination.id || destination._id,
      reviewerName: reviewerName.trim() || 'Anonymous Traveler',
      rating: rating,
      visitDate: visitDate,
      comment: reviewText.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    onSubmitReview(newReview);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>Marked as Visited</span>
          </div>

          <h3 className="text-xl font-extrabold leading-tight">
            Share Your Experience for {destination.title}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            Your review helps other travelers plan peaceful & memorable visits!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Your Overall Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverStar || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-600 font-mono">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Name & Visit Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Shanmukh Parimi"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visit Month / Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Review Experience Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Traveler Review & Tips <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows="3"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you love about this place? Any tips for future travelers (best visiting hours, local food, stay recommendations)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                required
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm active:scale-95 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Submit Traveler Review</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
