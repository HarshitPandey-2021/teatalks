const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');

dotenv.config();
connectDB();
initCloudinary();

const app = express();

// Middleware
app.disable('x-powered-by');

// Render (and most PaaS) run behind a reverse proxy.
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin(origin, callback) {
      const raw = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      const allowList = raw.length
        ? raw
        : ['https://teatalks-six.vercel.app', 'http://localhost:3000'];

      // Allow non-browser traffic (curl, server-to-server) that does not send Origin.
      if (!origin) return callback(null, true);
      return callback(null, allowList.includes(origin));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
});
const toxicityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', forgotPasswordLimiter);
app.use('/api/users/forgot-password/verify-otp', otpVerifyLimiter);
app.use('/api/users/forgot-password/reset', otpVerifyLimiter);
app.use('/api/users/detect-toxicity', toxicityLimiter);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/professors', require('./routes/professorRoutes'));

app.get('/', (req, res) => {
  res.send('API Running...');
});

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1;
  return res.status(dbConnected ? 200 : 503).json({
    ok: true,
    dbConnected,
    dbState,
  });
});

// Centralized error handler (keeps stack traces out of prod responses).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode || 500);
  const message =
    process.env.NODE_ENV === 'production'
      ? status >= 500
        ? 'Internal server error'
        : String(err?.message || 'Request failed')
      : String(err?.message || 'Request failed');

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ message });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

let isShuttingDown = false;
async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await mongoose.connection.close(false);
    } catch (err) {
      console.error('Error while closing Mongo connection', err);
    } finally {
      process.exit(0);
    }
  });

  // Hard-exit if something prevents closing cleanly.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception', err);
  shutdown('uncaughtException');
});
