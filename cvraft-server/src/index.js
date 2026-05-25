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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://cvraft.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in the allowed static list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow Vercel deployments (cvraft.vercel.app and *.vercel.app subdomains)
    const isVercelOrigin = /^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin);
    if (isVercelOrigin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Security headers
app.use(helmet());

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

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Resume Routes
const resumeRoutes = require('./routes/resume');
app.use('/api/resume', resumeRoutes);

// Payment Routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// MongoDB Connection with Retry Logic
const connectDB = async () => {
  // Fail loudly if MONGODB_URI is not set — never use hardcoded credentials
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('🚨 MONGODB_URI environment variable is not set. Aborting.');
    process.exit(1);
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

// Global Express error handler — prevents stack traces leaking to clients
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Safety net for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

