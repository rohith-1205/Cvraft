require('dotenv').config();
const dns = require('dns');

// Configure Node.js to use Google and Cloudflare DNS servers
// This resolves the common 'querySrv ECONNREFUSED' issue when local DNS resolvers
// (like local loopback 127.0.0.1, VPNs, or ISP DNS) fail to resolve MongoDB Atlas SRV records.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('⚠️ Warning: Failed to set DNS servers to Google/Cloudflare:', err.message);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Cvraft API running ✅' });
});

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// MongoDB Connection with Retry Logic
const connectDB = async () => {
  const fallbackUri = 'mongodb+srv://cvraft_admin:9KJoIjjbaPEMsYKN@cvraft.3rjf1zw.mongodb.net/cvraft?retryWrites=true&w=majority&appName=Cvraft';
  const uri = process.env.MONGODB_URI || fallbackUri;
  
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ process.env.MONGODB_URI is not defined in environment variables. Using direct connection string fallback.');
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    family: 4 // Forces IPv4 to resolve DNS issues on some networks
  };

  const maxRetries = 5;
  const retryInterval = 5000; // 5 seconds
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`Attempting MongoDB connection... (Attempt ${attempt}/${maxRetries})`);
      await mongoose.connect(uri, options);
      console.log('MongoDB connected successfully ✅');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryInterval / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      } else {
        console.error('🚨 All MongoDB connection attempts failed. Please verify your network connection, DNS server, or Atlas IP whitelist rules.');
      }
    }
  }
};

// Start MongoDB connection (runs in background asynchronously)
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});

