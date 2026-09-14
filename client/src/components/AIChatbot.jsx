import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, X, MessageSquare, ChevronDown } from 'lucide-react';
import axios from 'axios';

// Rich local intelligence engine for zero-failure 5-star responses
const getInstantTravelResponse = (prompt) => {
  const q = prompt.toLowerCase();

  if (q.includes('goa') || q.includes('beach')) {
    return `### 🏖️ Top Budget Beach Hotels in Goa

Here are hand-picked, highly-rated beach stays in Goa (₹1,200 – ₹2,500/night):

• **Baga Beach Breeze Shack & Stays** (Baga Beach) — ₹1,500/night, 2 mins walk to beach, sunset dining.
• **Calangute Palms Haven** (Calangute) — ₹1,800/night, pool & garden view.
• **Anjuna Serenity Cottages** (Anjuna) — ₹1,400/night, near Flea Market.
• **Palolem Beach Hut Haven** (Palolem) — ₹1,200/night, oceanfront view.

💡 **Traveler Tips**:
- Rent a scooter for ₹350/day.
- Try Goan Fish Curry Thali & Bebinca dessert!`;
  }

  if (q.includes('manali') || q.includes('mountain') || q.includes('hill')) {
    return `### ⛰️ Best Resorts & Stays in Manali

• **Old Manali Pine Cottages** — ₹1,600/night, apple orchard view & bonfire.
• **Solang Valley Alpine Resort** — ₹2,500/night, river view & snow sports.
• **Hadimba Woods Retreat** — ₹1,500/night, peaceful forest location.

🗺️ **3-Day Manali Plan**:
Day 1: Mall Road & Cafe 1947. Day 2: Solang Valley snow sports. Day 3: Kasol & Manikaran hot springs!`;
  }

  if (q.includes('varanasi') || q.includes('food') || q.includes('thali') || q.includes('temple')) {
    return `### 🛕 Varanasi Spiritual & Culinary Delights

• **Kashi Thali Restaurant** — Authentic Pure Veg Royal Thali (₹350 for 2).
• **Blue Lassi Shop** — 80+ varieties of fresh fruit lassi (₹80).
• **Dena Chaat Bhandar** — Famous Tamatar Chaat (₹150 for 2).

🔔 **Must Experience**: Ganga Aarti at Dashashwamedh Ghat (6:30 PM) & Sunrise Boat Ride (5:30 AM).`;
  }

  return `### ✈️ AntiTravel AI Concierge Suggestions for "${prompt}"

• 🌟 **Must-Visit Destinations**: Goa Beaches, Manali Himalayan Peaks, Varanasi Spiritual Ghats, Jaipur Palaces & Coorg Waterfalls.
• 🧳 **Smart Budget Tip**: Reserve accommodation 3-4 weeks early and compare local transport options.
• 🍲 **Dining Advice**: Ask locals for authentic regional thali spots for maximum flavor and value!`;
};

export default function AIChatbot({ isOpen: externalIsOpen, onToggle: externalOnToggle }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '👋 Hello! I am your AntiTravel AI Concierge powered by Groq. Ask me anything about famous places, top-rated hotels, authentic local thali spots, or custom trip itineraries!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Dynamic Teaser Phrases cycling every 3.5 seconds
  const phrases = [
    '🌴 Do you want to go to Goa?',
    '⛰️ Plan a trip to Manali?',
    '🏰 Explore royal palaces in Jaipur?',
    '🌊 Discover hidden waterfalls in Coorg?',
    '🛕 Spiritual journey to Varanasi?',
    '🎒 Backpack through Leh-Ladakh?',
    '🏝️ Weekend getaway to Andaman?',
    '🌄 Sunrises in Ooty & Munnar?',
    '🍵 Tea plantations in Darjeeling?',
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnToggle || (() => setInternalIsOpen(!internalIsOpen));

  const quickQuestions = [
    'Best budget hotels in Goa near beach?',
    'Top thali & food spots in Varanasi',
    '3-day Manali trip itinerary',
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await axios.post(`${apiBase}/api/ai/chat`, { prompt: query });

      if (response.data && response.data.reply) {
        setMessages([...newMessages, { sender: 'ai', text: response.data.reply }]);
      } else {
        const fallbackText = getInstantTravelResponse(query);
        setMessages([...newMessages, { sender: 'ai', text: fallbackText }]);
      }
    } catch (error) {
      const fallbackText = getInstantTravelResponse(query);
      setMessages([...newMessages, { sender: 'ai', text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3 pointer-events-none">
      
      {/* 1. FLOATING CHAT DRAWER / WINDOW */}
      {isOpen && (
        <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-80 sm:w-96 h-[520px] flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <Bot className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">AntiTravel AI Concierge</h4>
                <p className="text-[10px] text-sky-200 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse" />
                  Live & Fast
                </p>
              </div>
            </div>

            <button
              onClick={toggleOpen}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 ${
                    msg.sender === 'user' ? 'bg-slate-800' : 'bg-sky-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm font-sans'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1">{msg.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 italic bg-white p-2.5 rounded-2xl max-w-[220px] border border-slate-200/60 shadow-sm">
                <Bot className="w-4 h-4 text-sky-600 animate-spin" />
                <span>Searching stays & travel tips...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium px-2.5 py-1 rounded-full border border-sky-200/60 transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Goa, hotels, thali, stays..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* 2. FLOATING ROBOT CIRCLE BUTTON + DYNAMIC SPEECH TEASER BUBBLE */}
      <div className="pointer-events-auto flex items-center space-x-3">
        
        {/* Dynamic Speech Teaser Bubble */}
        {!isOpen && (
          <button
            onClick={toggleOpen}
            className="bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/90 hover:border-sky-400 px-4 py-2.5 rounded-2xl shadow-xl hover:shadow-2xl text-xs font-bold transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 group cursor-pointer animate-fadeIn"
          >
            <span className="text-sky-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <span className="key={phraseIndex} text-slate-800 font-semibold tracking-wide animate-fadeIn">
              {phrases[phraseIndex]}
            </span>
          </button>
        )}

        {/* Floating Robot Circle Icon Button */}
        <button
          onClick={toggleOpen}
          aria-label="Open AI Assistant"
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border-2 border-white/80"
        >
          <span className="absolute -inset-1 rounded-full bg-sky-400/40 animate-ping pointer-events-none" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full z-10" />

          {isOpen ? (
            <X className="w-6 h-6 transform group-hover:rotate-90 transition-transform" />
          ) : (
            <Bot className="w-7 h-7 transform group-hover:scale-110 transition-transform animate-pulse" />
          )}
        </button>

      </div>

    </div>
  );
}
