const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app FIRST (this fixes your error)
const app = express();

// Create HTTP server
const server = http.createServer(app);

// ==========================
// MIDDLEWARE
// ==========================
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// ROUTES
// ==========================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MethLinkMe API is running'
  });
});

// ==========================
// SOCKET.IO SETUP
// ==========================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Make io accessible in routes if needed
app.set('io', io);

// ==========================
// ERROR HANDLING
// ==========================

// MUST be after routes
app.use(errorHandler);

// 404 handler (LAST middleware)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
app.use("/api/chat", require("./routes/chatRoutes"));