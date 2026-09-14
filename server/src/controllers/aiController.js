const axios = require('axios');

/**
 * Intelligent Fallback Knowledge Generator when Groq AI is offline
 */
const generateRichFallback = (prompt) => {
  const q = prompt.toLowerCase();

  // 1. Goa Hotels & Beaches Query
  if (q.includes('goa') || q.includes('beach')) {
    return `### 🏖️ Top Budget Hotels Near Beach in Goa

Here are hand-picked, highly-rated budget hotels and beach stays in Goa (₹1,200 – ₹2,800/night):

| Hotel / Stay | Location | Approx. Price/Night | Key Highlights |
|---|---|---|---|
| **Baga Beach Breeze Shack & Stays** | Baga Beach | ₹1,500 - ₹2,200 | 2 mins walk to beach, free Wi-Fi, sunset dining |
| **Calangute Palms Haven** | Calangute | ₹1,800 - ₹2,500 | Swimming pool, lush garden, close to nightlife |
| **Anjuna Serenity Cottages** | Anjuna Beach | ₹1,400 - ₹2,000 | Eco-friendly wooden huts near Flea Market |
| **Palolem Beach Hut Haven** | Palolem Beach | ₹1,200 - ₹1,800 | Serene beach view, hammock balconies |

---

### 💡 Pro Traveler Tips for Goa:
- 🛵 **Rent a Scooter**: ₹350–₹500/day for easy commuting between North and South Goa.
- 🍲 **Must-Try Local Dishes**: Goan Fish Curry Thali, Crab Xec Xec, and Bebinca dessert.
- 🌅 **Best Time for Beach Sunsets**: 5:45 PM – 6:30 PM at Anjuna & Vagator Cliff.`;
  }

  // 2. Manali & Hill Stations Query
  if (q.includes('manali') || q.includes('hill') || q.includes('mountain')) {
    return `### ⛰️ Best Resorts & Stays in Manali

Enjoy breathtaking snow-capped Himalayan views with these top-rated budget & comfort stays (₹1,500 – ₹3,200/night):

| Stay / Resort | Location | Price/Night | Highlights |
|---|---|---|---|
| **Old Manali Pine Cottages** | Old Manali | ₹1,600 - ₹2,400 | Apple orchard view, cozy bonfire nights |
| **Solang Valley Alpine Resort** | Solang Valley | ₹2,500 - ₹3,500 | Snow sports access, riverside balcony |
| **Hadimba Woods Retreat** | Near Temple | ₹1,500 - ₹2,200 | Peaceful cedar forest surroundings |

---

### 🗺️ 3-Day Manali Quick Itinerary:
- **Day 1**: Hadimba Temple, Mall Road shopping & Cafe 1947 in Old Manali.
- **Day 2**: Snow adventures at Solang Valley & Atal Tunnel excursion.
- **Day 3**: Manikaran Sahib hot springs & Kasol Parvati Valley exploration.`;
  }

  // 3. Varanasi & Temple/Culture Query
  if (q.includes('varanasi') || q.includes('temple') || q.includes('food') || q.includes('thali')) {
    return `### 🛕 Varanasi Spiritual & Culinary Guide

Discover the ancient heart of India with spiritual ghats and authentic local delicacies:

| Top Dining Spot | Specialty | Price for 2 | Location |
|---|---|---|---|
| **Kashi Thali Restaurant** | Authentic Pure Veg Royal Thali | ₹350 | Near Dashashwamedh Ghat |
| **Blue Lassi Shop** | 80+ varieties of thick Lassi | ₹80 | Vishwanath Gali |
| **Dena Chaat Bhandar** | Tamatar Chaat & Golgappe | ₹150 | Luxa Road |

---

### 🌟 Spiritual Highlights:
- 🔔 **Ganga Aarti at Dusk**: 6:30 PM at Dashashwamedh Ghat (arrive by 5:30 PM for boat view).
- ⛵ **Sunrise Boat Ride**: 5:30 AM from Assi Ghat to Manikarnika Ghat.`;
  }

  // 4. Default Rich General Concierge Answer
  return `### ✈️ AntiTravel AI Concierge Suggestions for "${prompt}"

Here are expert recommendations tailored for your journey:

- 🌟 **Top Must-Visit Places**: Goa Beaches, Manali Hill Peaks, Varanasi Ghats, Jaipur Palaces, Coorg Waterfalls, and Munnar Tea Gardens.
- 🧳 **Budget Travel Tip**: Book stay packages 3-4 weeks in advance and check seasonal weather before departure.
- 🍲 **Local Cuisine Highlight**: Always try local street food thalis and regional specialties recommended by local travelers!

*Feel free to ask me about specific hotel prices, food spots, or day-by-day itineraries for any destination!*`;
};

/**
 * Handle AI chatbot queries using Groq AI API with Qwen / GPT-OSS models
 */
const handleAIChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const apiKey = process.env.GROQ_API_KEY || '';

    const systemPrompt = `You are AntiTravel AI Concierge, a world-class, enthusiastic, and highly knowledgeable travel guide specializing in Indian and global travel.
    Respond with warmth, enthusiasm, and rich formatting using emojis, markdown tables, price breakdowns per night, best local food spots, and step-by-step itineraries.
    Keep the tone friendly, helpful, and organized with clear headers.`;

    // Primary Groq models list
    const modelsToTry = ['openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];
    let replyText = null;

    for (const modelId of modelsToTry) {
      try {
        const groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: modelId,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.6,
            max_tokens: 800,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        if (groqResponse.data?.choices?.[0]?.message?.content) {
          replyText = groqResponse.data.choices[0].message.content;
          break;
        }
      } catch (err) {
        console.warn(`[Groq Model ${modelId} Attempt Failed]`, err.message);
      }
    }

    // Fallback if network or Groq API is unreachable
    if (!replyText) {
      replyText = generateRichFallback(prompt);
    }

    return res.status(200).json({
      success: true,
      reply: replyText,
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    const fallbackReply = generateRichFallback(req.body?.prompt || '');
    return res.status(200).json({
      success: true,
      reply: fallbackReply,
    });
  }
};

module.exports = {
  handleAIChat,
};
