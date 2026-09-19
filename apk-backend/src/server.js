import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import { runMigrations } from './db/migrate.js';
import { query } from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS for mobile app & local dev
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[APK-API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoints (Requirement 13)
app.get(['/health', '/api/health', '/api/v1/health'], async (req, res) => {
  try {
    const dbTest = await query('SELECT current_database(), NOW()');
    res.json({
      status: 'ok',
      health: 'healthy',
      server: 'logisync-apk-backend',
      timestamp: new Date().toISOString(),
      database: dbTest.rows[0].current_database,
      db_time: dbTest.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      health: 'unhealthy',
      server: 'logisync-apk-backend',
      error: err.message
    });
  }
});

// Mount routes for both /api and /api/v1 (Requirement 11, 13, 14, 21)
app.use('/api', authRoutes);
app.use('/api', transportRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', transportRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[APK-API ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

// Start server and run migrations
async function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 LogiSyncPRO Dedicated APK Backend RUNNING`);
    console.log(`📍 PORT: ${PORT}`);
    console.log(`🌐 CORS: open (mobile clients allowed)`);
    console.log(`====================================================`);
  });

  // Run migrations after bind (non-blocking startup)
  try {
    await runMigrations();
    console.log('[APK-API] ✅ Database schema verified successfully.');
  } catch (err) {
    console.error('[APK-API] ⚠️ Migration warning (server still running):', err.message);
    console.error('[APK-API]    Check DATABASE_URL env var and Neon connectivity.');
  }
}

startServer();

