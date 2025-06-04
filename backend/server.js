const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'https://user-side-application.netlify.app/',
    'http://localhost:3000','http://localhost:3001',
    'https://admin-side-app.netlify.app/'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Import routes
const menuItemRoutes = require('./routes/menuItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const clientRoutes = require('./routes/clientRoutes');

// Use routes
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/clients', clientRoutes);

// Enhanced CORS configuration (remove the duplicate one below)
app.use(cors({
  origin: [
    'https://user-side-application.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://admin-side-app.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Added this line to serve images from admin-app's uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../../admin-app/backend/uploads')));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
