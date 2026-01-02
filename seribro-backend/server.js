// server.js - Seribro Backend Server (Phase 2.1)

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/dbconection');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { initializeSocketIO } = require('./backend/utils/socket/socketManager');

// Load environment variables
dotenv.config();


//what is benifit for add JWT-secured Socket.IO middleware this in our project .explinin hinglish with easy example
// Connect to Database
connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware
app.use(cookieParser());

// Static folder for temporary uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes with detailed logging
console.log('\n=== Loading Route Files ===');

console.log('1. Loading authRoutes...');
let authRoutes;
try {
  authRoutes = require('./backend/routes/authRoutes');
  console.log('   ✅ authRoutes loaded. Type:', typeof authRoutes);
  console.log('   ✅ authRoutes is router?', typeof authRoutes === 'function');
} catch (err) {
  console.error('   ❌ Error loading authRoutes:', err.message);
  process.exit(1);
}

console.log('\n2. Loading studentProfileRoutes...');
let studentProfileRoutes;
try {
  studentProfileRoutes = require('./backend/routes/studentProfileRoute');
  console.log('   ✅ studentProfileRoutes loaded. Type:', typeof studentProfileRoutes);
  console.log('   ✅ studentProfileRoutes is router?', typeof studentProfileRoutes === 'function');
} catch (err) {
  console.error('   ❌ Error loading studentProfileRoutes:', err.message);
  process.exit(1);
}

console.log('\n3. Loading companyProfileRoutes...');
let companyProfileRoutes;
try {
  companyProfileRoutes = require('./backend/routes/companyProfileRoutes');
  console.log('   ✅ companyProfileRoutes loaded. Type:', typeof companyProfileRoutes);
  console.log('   ✅ companyProfileRoutes is router?', typeof companyProfileRoutes === 'function');
} catch (err) {
  console.error('   ❌ Error loading companyProfileRoutes:', err.message);
  process.exit(1);
}

console.log('\n4. Loading studentDashboardRoutes (Phase 3)...');
let studentDashboardRoutes;
try {
  studentDashboardRoutes = require('./backend/routes/studentDashboard.routes');
  console.log('   ✅ studentDashboardRoutes loaded. Type:', typeof studentDashboardRoutes);
  console.log('   ✅ studentDashboardRoutes is router?', typeof studentDashboardRoutes === 'function');
} catch (err) {
  console.error('   ❌ Error loading studentDashboardRoutes:', err.message);
  process.exit(1);
}

console.log('\n5. Loading companyDashboardRoutes (Phase 3)...');
let companyDashboardRoutes;
try {
  companyDashboardRoutes = require('./backend/routes/companyDashboard.routes');
  console.log('   ✅ companyDashboardRoutes loaded. Type:', typeof companyDashboardRoutes);
  console.log('   ✅ companyDashboardRoutes is router?', typeof companyDashboardRoutes === 'function');
} catch (err) {
  console.error('   ❌ Error loading companyDashboardRoutes:', err.message);
  process.exit(1);
}

console.log('\n=== Mounting Routes ===');

try {
  console.log('📌 Mounting /api/auth...');
  app.use('/api/auth', authRoutes);
  console.log('   ✅ /api/auth mounted');
  // Mount Google OAuth routes at /auth so the redirect URI http://localhost:7000/auth/google/callback works
  console.log('📌 Mounting /auth (Google OAuth)...');
  app.use('/auth', require('./backend/routes/googleAuthRoutes'));
  console.log('   ✅ /auth (Google OAuth) mounted');
  
  console.log('📌 Mounting /api/student...');
  app.use('/api/student', studentProfileRoutes);
  console.log('   ✅ /api/student mounted');

  console.log('📌 Mounting /api/student (Phase 3 Dashboard)...');
  app.use('/api/student', studentDashboardRoutes);
  console.log('   ✅ /api/student dashboard routes mounted');
  
  console.log('📌 Mounting /api/company...');
  app.use('/api/company', companyProfileRoutes);
  console.log('   ✅ /api/company mounted');

  console.log('📌 Mounting /api/company (Phase 3 Dashboard)...');
  app.use('/api/company', companyDashboardRoutes);
  console.log('   ✅ /api/company dashboard routes mounted');
  
  // Phase 3.2: Admin verification routes mount (Hinglish: Admin routes yahan mount)
  app.use('/api/admin', require('./backend/routes/adminVerification.routes'));
  console.log('   ✅ /api/admin routes mounted');
  
  // Phase 4.1: Company Project routes mount (Company projects system)
  console.log('📌 Mounting /api/company/projects (Phase 4.1)...');
  app.use('/api/company/projects', require('./backend/routes/companyProjectRoutes'));
  console.log('   ✅ /api/company/projects routes mounted');

  // Phase 4.2: Student Project routes mount (Student browse, apply system)
  console.log('📌 Mounting /api/student/projects (Phase 4.2)...');
  app.use('/api/student/projects', require('./backend/routes/studentProjectRoutes'));
  console.log('   ✅ /api/student/projects routes mounted');

  // Phase 4.3: Company Application routes mount (Company application management)
  console.log('📌 Mounting /api/company/applications (Phase 4.3)...');
  app.use('/api/company/applications', require('./backend/routes/companyApplicationRoutes'));
  console.log('   ✅ /api/company/applications routes mounted');

  // Admin routes for project and application monitoring (Phase 2.1)
  console.log('📌 Mounting /api/admin/projects (Phase 2.1 Admin)...');
  app.use('/api/admin/projects', require('./backend/routes/adminProjectRoutes'));
  console.log('   ✅ /api/admin/projects routes mounted');

  console.log('📌 Mounting /api/admin/applications (Phase 2.1 Admin)...');
  app.use('/api/admin/applications', require('./backend/routes/adminApplicationRoutes'));
  console.log('   ✅ /api/admin/applications routes mounted');

  // Notification routes
  console.log('📌 Mounting /api/notifications (Phase 2.1)...');
  app.use('/api/notifications', require('./backend/routes/notificationRoutes'));
  console.log('   ✅ /api/notifications routes mounted');

  // Phase 5.1: Workspace routes (project message board)
  console.log('📌 Mounting /api/workspace (Phase 5.1)...');
  app.use('/api/workspace', require('./backend/routes/workspaceRoutes'));
  console.log('   ✅ /api/workspace routes mounted');

  // Phase 5.2: Work Submission & Review routes
  console.log('📌 Mounting /api/workspace (Phase 5.2 - submissions)...');
  app.use('/api/workspace', require('./backend/routes/workSubmissionRoutes'));
  console.log('   ✅ /api/workspace submissions routes mounted');

  // Phase 5.3: Payments and Ratings (mounting new routes)
  try {
    console.log('📌 Mounting /api/payments (Phase 5.3 - payments)...');
    app.use('/api/payments', require('./backend/routes/paymentRoutes'));
    console.log('   ✅ /api/payments routes mounted');

    console.log('📌 Mounting /api/ratings (Phase 5.3 - ratings)...');
    app.use('/api/ratings', require('./backend/routes/ratingRoutes'));
    console.log('   ✅ /api/ratings routes mounted');
  } catch (err) {
    console.warn('   ⚠️ /api/payments or /api/ratings mount skipped:', err.message);
  }

  /**
   * ⚠️ PHASE 6 - DORMANT / FUTURE WORK ⚠️
   * 
   * ARCHITECTURAL DECISION: Advanced Multi-Stage Selection System (DISABLED)
   *
   * Current MVP uses ONLY the simple approval flow:
   *   - `companyApplicationController.approveStudentForProject`
   *   - Routes: `/api/company/applications/:applicationId/approve`
   *
   * The advanced multi-stage selection system is reserved for Phase 6:
   *   - `applicationSelectionController` + `applicationSelectionRoutes`
   *   - Routes: `/api/applications/*` (shortlist, select, accept, decline)
   *   - Background job: `applicationTimeoutJob.js`
   *
   * This system is NOT mounted to ensure clean separation and prevent conflicts.
   * All related files are marked with "PHASE 6 - DORMANT" headers.
   *
   * To enable in Phase 6:
   *   1. Uncomment routes below
   *   2. Uncomment background job initialization
   *   3. Update frontend to use new endpoints
   *   4. Test thoroughly for conflicts with Project Workspace logic
   */
  // console.log('📌 Mounting /api/applications/selection (Phase 6)...');
  // app.use('/api/applications', require('./backend/routes/applicationSelectionRoutes'));
  // console.log('   ✅ /api/applications selection routes mounted');

  console.log('\n🚀 All routes mounted successfully!\n');
} catch (err) {
  console.error('\n💥 Route mounting error:', err);
  process.exit(1);
}

// Initialize Cron Jobs (Phase 2.1)
console.log('⏰ Starting Cron Job Scheduler...');
const { initializeCronJobs } = require('./backend/utils/cronScheduler');
initializeCronJobs();

/**
 * ⚠️ PHASE 6 - DORMANT / FUTURE WORK ⚠️
 * 
 * ARCHITECTURAL DECISION: Application Selection System Background Job (DISABLED)
 *
 * This background job is part of the advanced multi-stage selection system
 * reserved for Phase 6. The current MVP uses the simpler approveStudentForProject
 * flow which doesn't require timeout handling.
 *
 * To enable in Phase 6:
 *   1. Uncomment the block below
 *   2. Ensure selection routes are mounted above
 *   3. Test integration with Project Workspace logic
 */
// console.log('⏰ Starting Application Timeout Background Job (Phase 4.5)...');
// try {
//   const { startApplicationTimeoutJob } = require('./backend/utils/background/applicationTimeoutJob');
//   // Run auto-timeout check every 5 minutes
//   startApplicationTimeoutJob(5 * 60 * 1000);
//   console.log('   ✅ Application timeout job started (interval: 5 minutes)');
// } catch (err) {
//   console.error('   ⚠️  Warning: Could not start application timeout job:', err.message);
//   // Don't exit - system can still run without background job
// }

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running fine!' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error('Error Stack:', err.stack);
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Socket.io Configuration
const SOCKET_PORT = process.env.SOCKET_PORT || process.env.PORT || 7000;
const SOCKET_CORS_ORIGINS = process.env.SOCKET_CORS_ORIGIN 
  ? process.env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim())
  : allowedOrigins;

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);

console.log('[Socket.io] CORS origins:', SOCKET_CORS_ORIGINS);
console.log('[Socket.io] Port:', SOCKET_PORT);

// Initialize Socket.io with CORS configuration and optimized settings
initializeSocketIO(httpServer, SOCKET_CORS_ORIGINS);

httpServer.listen(SOCKET_PORT, () => {
    console.log(`🚀 Server running on port ${SOCKET_PORT}`);
    console.log(`📡 Socket.io ready for real-time connections`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ WebSocket transport: enabled`);
    console.log(`✅ Polling transport: enabled (fallback)`);
});