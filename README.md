# ✈️ AntiTravel - Smart Tourist Trip Planner

A complete, responsive, full-stack tourist trip planner web application built with **React 18 + Vite**, **Tailwind CSS**, **Leaflet.js**, **Node.js / Express**, **MongoDB Atlas**, and **Google Gemini AI API**.

---

## 🌟 Key Features

1. **Tourist Places Showcase**: Browse destinations with high-resolution imagery, detailed descriptions, ratings, and category filters (*beaches*, *temples*, *hills*, *historical*).
2. **Interactive Location Finder**: Powered by Leaflet.js and OpenStreetMap (100% free alternative to Google Maps API, no credit card required) to display latitude/longitude markers.
3. **Dynamic Budget Estimator**: Real-time calculator form for travel, stay, food, and misc expenses with automatic total calculation.
4. **AI Travel Assistant**: Integrated AI Chatbot powered by Google Gemini API to answer travel queries, itinerary tips, and packing lists.
5. **Zero-Cost Deployment Ready**: Pre-configured for deployment on Vercel/Netlify (Frontend), Render (Backend), and MongoDB Atlas (Database).

---

## 📁 Project Folder Structure

```
anti-travel/
├── client/                      # Frontend React Application (Vite + React + TailwindCSS)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Sticky Navigation Bar
│   │   │   ├── Hero.jsx              # Hero Banner & Feature Highlights
│   │   │   ├── CategoryFilter.jsx    # Category Pills (Beaches, Temples, Hills, Historical)
│   │   │   ├── DestinationCard.jsx   # Destination Card Component
│   │   │   ├── MapView.jsx           # Leaflet.js Map with Lat/Lng markers
│   │   │   ├── BudgetCalculator.jsx  # Interactive Expense Calculator Form
│   │   │   ├── AIChatbot.jsx         # Gemini AI Floating/Embedded Chatbot
│   │   │   └── Footer.jsx            # Footer Component
│   │   ├── data/
│   │   │   └── destinations.js       # Fallback / Initial Seed Data
│   │   ├── App.jsx                   # Main State & App Component
│   │   ├── main.jsx                  # React Entry Point
│   │   └── index.css                 # Tailwind CSS Directives
│   ├── index.html                    # Leaflet CSS inclusion & Meta tags
│   ├── package.json
│   ├── vite.config.js                # Dev Proxy Configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── server/                      # Backend Node.js / Express Application
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose Connection to MongoDB Atlas
│   │   ├── models/
│   │   │   ├── Destination.js        # Mongoose Destination Schema
│   │   │   └── BudgetPlan.js         # Mongoose Saved Budget Schema
│   │   ├── controllers/
│   │   │   ├── destinationController.js # Category filtering & retrieval
│   │   │   ├── budgetController.js      # Budget calculation & persistence
│   │   │   └── aiController.js          # Google Gemini AI Integration
│   │   ├── routes/
│   │   │   ├── destinationRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   └── aiRoutes.js
│   │   └── server.js                 # Express Application Entry Point
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🚀 Local Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Free [Google Gemini API Key](https://aistudio.google.com/)

### 1. Setup Backend (`/server`)
```bash
cd server
npm install

# Create environment variables file
cp .env.example .env
```
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/anti-travel
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 2. Setup Frontend (`/client`)
Open a new terminal window:
```bash
cd client
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🌐 100% Free Hosting & Deployment Instructions

### Step 1: Database - MongoDB Atlas (Free Shared M0 Cluster)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g. `admin` + password).
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere).
5. Copy your connection string (`mongodb+srv://...`).

### Step 2: Backend API - Render Web Service (Free Tier)
1. Push your repository to GitHub.
2. Sign up at [Render](https://render.com/).
3. Click **New +** -> **Web Service** -> Connect your GitHub repo.
4. Set **Root Directory**: `server`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node src/server.js`
7. Add **Environment Variables**:
   - `MONGO_URI`: *Your MongoDB connection string*
   - `GEMINI_API_KEY`: *Your Google Gemini API key*
   - `CLIENT_URL`: *Your Vercel/Netlify URL (e.g. https://your-app.vercel.app)*
8. Click **Create Web Service**. Note down your Render API URL (e.g. `https://anti-travel-backend.onrender.com`).

### Step 3: Frontend - Vercel or Netlify (Free Tier)
1. Sign up at [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Set **Root Directory**: `client`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add **Environment Variable**:
   - `VITE_API_BASE_URL`: `https://anti-travel-backend.onrender.com` (Your Render backend URL)
7. Click **Deploy**. Your website will be live with free SSL!

---

## 💡 Suggestions for Extending Features

1. **User Reviews & Star Ratings**:
   - Add a `Review` sub-schema in MongoDB (`user`, `comment`, `rating`, `createdAt`).
   - Create a rating component on `DestinationCard` allowing logged-in users to submit reviews.
2. **Multi-Currency Converter**:
   - Integrate an open API like `https://api.exchangerate-api.com/v4/latest/USD`.
   - Add a currency dropdown (USD, EUR, INR, GBP) in the `BudgetCalculator` to instantly convert totals.
3. **User Authentication (JWT / Firebase / Supabase Auth)**:
   - Allow travelers to create accounts, bookmark favorite destinations, and save custom itineraries.
4. **Export Itinerary as PDF**:
   - Use `jspdf` or `html2pdf.js` to enable 1-click downloading of generated budget plans and AI trip schedules.
