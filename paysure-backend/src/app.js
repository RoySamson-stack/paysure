const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const depositRoutes = require('./routes/deposits');
const walletRoutes = require('./routes/wallet');
const apiRoutes = require('./routes/api');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : '*',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'PaySure Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      deposits: '/api/deposits',
      wallet: '/api/wallet',
      integration: '/api/v1'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/v1', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');
    
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized');
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
