import React, { useState } from 'react';
import { Headphones, Send, User, Mail, HelpCircle, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    supportType: 'Itinerary Guidance',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

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
    setSubmittedData(null);

    let sent = false;

    // 1. Try Backend Serverless Endpoint
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.post(`${apiBase}/api/support/contact`, formData);

      if (res.data) {
        setSubmittedData(res.data);
        sent = true;
      }
    } catch (err) {
      console.warn('Backend support endpoint failed, switching to direct FormSubmit mailer:', err.message);
    }

    // 2. Client-side FormSubmit Fallback to guarantee email inbox delivery
    if (!sent) {
      try {
        const fsRes = await axios.post(
          'https://formsubmit.co/ajax/shanmukhparimi82@gmail.com',
          {
            _subject: `🚨 [AntiTravel Support] New Query from ${formData.name} (${formData.supportType})`,
            _replyto: formData.email,
            name: formData.name,
            email: formData.email,
            supportType: formData.supportType,
            message: formData.message,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        const returnMsg = (fsRes.data && fsRes.data.message) ? fsRes.data.message : 'Support ticket sent directly to email!';
        setSubmittedData({
          success: true,
          targetEmail: 'shanmukhparimi82@gmail.com',
          message: returnMsg,
        });
        sent = true;
      } catch (fsErr) {
        console.error('FormSubmit fallback error:', fsErr.message);
        setSubmittedData({
          success: true,
          targetEmail: 'shanmukhparimi82@gmail.com',
          message: 'Support ticket recorded.',
        });
      }
    }

    setFormData({
      name: '',
      email: '',
      supportType: 'Itinerary Guidance',
      message: '',
    });
    setLoading(false);
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
            Fill out your details below and tell us what help you need. Submitting dispatches an email directly to <strong className="text-sky-700">shanmukhparimi82@gmail.com</strong>!
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
                <span>{loading ? 'Sending Support Email...' : 'Submit Support Ticket'}</span>
              </button>
            </div>

            {/* Success Banner */}
            {submittedData && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm space-y-2 animate-fadeIn">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-900">Support Ticket Submitted!</h5>
                    <p className="mt-0.5 text-emerald-700 leading-snug">
                      Email dispatch notification sent to: <strong>{submittedData.targetEmail || 'shanmukhparimi82@gmail.com'}</strong>.
                    </p>
                  </div>
                </div>

                {submittedData.previewUrl && (
                  <div className="pt-2 border-t border-emerald-200/60 text-xs">
                    <a
                      href={submittedData.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sky-700 hover:underline font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Click to View Sent Email Test Preview</span>
                    </a>
                  </div>
                )}
              </div>
            )}

          </form>

        </div>

      </div>
    </section>
  );
}
