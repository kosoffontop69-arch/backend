const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Initialize SQLite database
const sequelize = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const ideaRoutes = require('./routes/ideaRefiner');
const interviewRoutes = require('./routes/interviewSimulator');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration - Allow all origins for testing
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize SQLite database
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to SQLite database');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database tables synchronized');
  })
  .catch(err => {
    console.error('❌ SQLite connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ideas', authenticateToken, ideaRoutes);
app.use('/api/interviews', authenticateToken, interviewRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/uploads', authenticateToken, uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Learning Platform Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI Learning Platform Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      ideas: '/api/ideas',
      interviews: '/api/interviews',
      users: '/api/users',
      uploads: '/api/uploads'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 AI Learning Platform Backend v1.0.0`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
