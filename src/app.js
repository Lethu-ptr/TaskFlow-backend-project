//  Express server with security, CORS, rate-limiting, routes.


require('dotenv').config();

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const authRoutes  = require('./routes/auth');
const taskRoutes  = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

// Initialise DB (runs CREATE TABLE IF NOT EXISTS on first boot)
require('./models/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// Security headers 
app.use(helmet());

// CORS 
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Logging 
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for login/register
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please wait and try again.' },
});

app.use(globalLimiter);

//Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TaskFlow API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth',  authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);

//  404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// Centralised error handler (must be last)
app.use(errorHandler);

//Start server
app.listen(PORT, () => {
  console.log(`\n🚀  TaskFlow API running on http://localhost:${PORT}`);
  console.log(`📦  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑  JWT expires : ${process.env.JWT_EXPIRES_IN || '7d'}\n`);
});

module.exports = app;
