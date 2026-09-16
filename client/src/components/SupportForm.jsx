import React, { useState, useEffect } from 'react';
import { Headphones, Send, User, Mail, HelpCircle, CheckCircle2, MessageSquare, Clock, Trash2, Ticket, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    supportType: 'Itinerary Guidance',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState(null);

  // Tickets persistence in localStorage
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('anti_travel_tickets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'TKT-8492',
          name: 'Shanmukh Parimi',
          email: 'shanmukhparimi82@gmail.com',
          supportType: 'Itinerary Guidance',
          message: 'Need help finding the best luxury resorts and daily travel itinerary in Goa for 4 days.',
          submittedAt: '16/09/2026, 19:30:00'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('anti_travel_tickets', JSON.stringify(tickets));
    } catch (e) {}
  }, [tickets]);

  const supportCategories = [
    'Itinerary Guidance',
    'Hotel & Resort Booking Support',
    'Budget & Expense Assistance',
    'Safety & Local Rules Question',
    'General Help & Feedback',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: ticketId,
      name: formData.name,
      email: formData.email,
      supportType: formData.supportType,
      message: formData.message,
      submittedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    // 1. Immediately append to live tickets board
    setTickets((prev) => [newTicket, ...prev]);
    setLastSubmittedId(ticketId);

    // 2. Try background backend save if online
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      axios.post(`${apiBase}/api/support/contact`, formData).catch(() => {});
    } catch (err) {}

    // Reset Form
    setFormData({
      name: '',
      email: '',
      supportType: 'Itinerary Guidance',
      message: '',
    });
    setLoading(false);

    // Smooth scroll down to ticket card
    setTimeout(() => {
      const el = document.getElementById(ticketId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const handleDeleteTicket = (id) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (lastSubmittedId === id) setLastSubmittedId(null);
  };

  const handleClearAllTickets = () => {
    if (window.confirm('Are you sure you want to clear all submitted support tickets?')) {
      setTickets([]);
      setLastSubmittedId(null);
    }
  };

  return (
    <section id="support" className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 text-sky-700 bg-sky-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 Traveler Help Desk</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Need Help Planning Your Trip? Contact Support
          </h2>
          <p className="text-slate-600 mt-2 text-sm max-w-xl mx-auto">
            Fill out your details below. Submitting immediately logs your exact ticket details on the live support board below!
          </p>
        </div>

        {/* Support Card Container */}
        <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-lg">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Shanmukh Parimi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium bg-white"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. shanmukhparimi82@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium bg-white"
                  required
                />
              </div>
            </div>

            {/* Support Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                What Type of Help Do You Need?
              </label>
              <div className="relative">
                <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  name="supportType"
                  value={formData.supportType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium bg-white appearance-none cursor-pointer"
                >
                  {supportCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Explain the Help You Need <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what help you need (e.g., best hotel deals, custom itinerary, budget guidance)..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium bg-white leading-relaxed"
                  required
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-sky-100 flex items-center justify-center space-x-2 text-sm active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Logging Support Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </div>

            {/* Success Banner */}
            {lastSubmittedId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm space-y-1 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <h5 className="font-bold text-emerald-900">Support Ticket #{lastSubmittedId} Logged Successfully!</h5>
                </div>
                <p className="text-emerald-700 text-xs pl-7">
                  Your exact entered details are now displayed live on the Submitted Tickets Board below.
                </p>
              </div>
            )}

          </form>

        </div>

        {/* LIVE SUBMITTED TICKETS BOARD */}
        <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live On-Screen Inquiry Board</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-sky-600" />
                <span>Submitted Traveler Support Tickets ({tickets.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View all support request details entered by travelers in real-time below.
              </p>
            </div>

            {tickets.length > 0 && (
              <button
                onClick={handleClearAllTickets}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Tickets</span>
              </button>
            )}
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200/80">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">No Support Tickets Logged Yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your details in the form above and click Submit Support Ticket to view your entry here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  id={t.id}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-sm transition-all ${
                    lastSubmittedId === t.id
                      ? 'border-emerald-500 ring-2 ring-emerald-400/20 shadow-md bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-sky-600 text-white font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                        #{t.id}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1"></span>
                        <span>Logged & Received</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {t.submittedAt}
                      </span>
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{t.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                      <a href={`mailto:${t.email}`} className="font-semibold text-sky-600 hover:underline text-xs mt-0.5 block truncate">
                        {t.email}
                      </a>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Help Category</span>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs mt-0.5 inline-block">
                        {t.supportType}
                      </span>
                    </div>
                  </div>

                  {/* Message Box */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Explain the Help You Need
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                      {t.message}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
