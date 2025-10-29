require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Database connection
const { testConnection, syncDatabase } = require('./config/database');

// Start polling service for push notifications
const { startPolling } = require('./services/pollingService');

// Initialize PostgreSQL notification listener
const { initializePgListener } = require('./services/pgNotificationListener');

// Socket.IO service
const socketService = require('./services/socketService');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const requestRoutes = require('./routes/requests');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const postRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');
const actionsRoutes = require('./routes/actions');
const pushTokenRoutes = require('./routes/pushToken');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration for React Native app
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'exp://192.168.1.1:8081'], // Expo dev server URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Aqra Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/push-token', pushTokenRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Aqra API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      teachers: '/api/teachers',
      students: '/api/students',
      requests: '/api/requests',
      messages: '/api/messages',
      reviews: '/api/reviews',
      posts: '/api/posts',
      profile: '/api/profile',
      actions: '/api/actions',
      pushToken: '/api/push-token'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  
  const status = err.status || err.statusCode || 500;
  
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database (create tables)
    await syncDatabase();
    
    // Create HTTP server from Express app
    const server = http.createServer(app);
    
    // Initialize Socket.IO
    socketService.initialize(server);
    
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Aqra Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      console.log(`🗄️  Database: PostgreSQL connected`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
      console.log(`⚡ Socket.IO real-time messaging enabled`);
      
      // Start push notification polling service
      console.log('');
      startPolling(5000); // Poll every 5 seconds
      
      // Initialize PostgreSQL notification listener
      initializePgListener();
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try using a different port.`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();