const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
// Middleware
// app.use(cors({
//     origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://127.0.0.1:5501'],
//     credentials: true
//   }));
// Middleware
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static folder for main client application
app.use(express.static(path.join(__dirname, '../client')));

// REALM Routes
app.use('/', require('./routes/studentRoutes'));
app.use('/', require('./routes/listingRoutes'));

// Chatbot Routes
app.use('/api/items', require('./routes/itemRoutes'));

// Basic route for testing chatbot API
app.get('/api', (req, res) => {
  res.json({ message: 'REALM Vision API is running' });
});

// Route for the main listing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login/login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));