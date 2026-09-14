const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Routes
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trains', require('./routes/trainRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Anti Travel API',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('✈️ Tourist Trip Planner API Server is running!');
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Anti Travel Backend listening on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
