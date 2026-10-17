require('dotenv').config();

const http    = require('http');
const express = require('express');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { supabase } = require('./db');

const authRoutes        = require('./routes/auth');
const usersRoutes       = require('./routes/users');
const departmentsRoutes = require('./routes/departments');
const projectsRoutes    = require('./routes/projects');
const tasksRoutes       = require('./routes/tasks');
const workloadRoutes    = require('./routes/workload');
const analyticsRoutes   = require('./routes/analytics');
const chatRoutes        = require('./routes/chat');
const auditRoutes       = require('./routes/audit');
const dashboardRoutes   = require('./routes/dashboard');
const mlRoutes          = require('./routes/ml');
const aiRoutes          = require('./routes/ai');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : []),
];

// ── Socket.io (real-time chat) ────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on('connection', (socket) => {
  console.log('[Socket.io] Client connected:', socket.id);

  socket.on('join-channel', (channelId) => {
    socket.join(`channel-${channelId}`);
  });

  socket.on('send-message', async ({ channelId, message }) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    try {
      // Save directly to Supabase
      const { data: msg } = await supabase
        .from('chat_messages')
        .insert([{
          channel_id: parseInt(channelId),
          sender: message.sender,
          sender_id: message.sender_id || null,
          content: message.content,
          time: timeStr,
        }])
        .select('*')
        .single();

      // Update channel preview
      await supabase
        .from('chat_channels')
        .update({
          last_message: (message.content || '').slice(0, 50),
          last_time: timeStr,
        })
        .eq('id', parseInt(channelId));

      const payload = {
        id: msg?.id || Date.now(),
        sender: message.sender,
        sender_id: message.sender_id,
        content: message.content,
        time: timeStr,
        createdAt: msg?.created_at || new Date().toISOString(),
      };

      io.to(`channel-${channelId}`).emit('new-message', { channelId, message: payload });
    } catch (err) {
      console.error('[Socket send error]', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket.io] Client disconnected:', socket.id);
  });
});

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Stricter limit on auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many login attempts, please try again later.' },
  });
  app.use('/api/auth/login', authLimiter);
}

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/employees',   usersRoutes);   // alias
app.use('/api/departments', departmentsRoutes);
app.use('/api/projects',    projectsRoutes);
app.use('/api/tasks',       tasksRoutes);
app.use('/api/workload',    workloadRoutes);
app.use('/api/analytics',   analyticsRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/audit-logs',  auditRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/ml',          mlRoutes);
app.use('/api/ai',          aiRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Enterprise SaaS API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'supabase (PostgreSQL)',
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`\n🚀  Enterprise SaaS API running at http://localhost:${PORT}`);
    console.log(`📡  Health: http://localhost:${PORT}/api/health`);
    console.log(`💾  Database: Supabase PostgreSQL Connected`);
    console.log(`🔌  WebSocket: socket.io enabled`);
    console.log(`\n  Demo credentials:`);
    console.log(`  Admin    → admin@enterprise.ai / admin123`);
    console.log(`  Manager  → manager@enterprise.ai / manager123`);
    console.log(`  Employee → employee@enterprise.ai / employee123\n`);
  });
}

module.exports = app;
module.exports.server = server;
