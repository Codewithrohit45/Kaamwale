require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const initCronJobs = require('./utils/cronJobs');

// Connect Database
connectDB().then(() => {
  // Initialize Background Jobs
  initCronJobs();
});

const app = express();
const server = http.createServer(app);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

// Track online users: { userId: socketId }
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });

  // Handle sending a message
  socket.on('sendMessage', (data) => {
    const { receiverId } = data;
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('newMessage', data);
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ receiverId, senderName }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('userTyping', { senderName });
    }
  });

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('userStopTyping');
    }
  });

  socket.on('bookingUpdate', ({ receiverId, bookingId, status }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('bookingStatusChanged', { bookingId, status });
    }
  });

  socket.on('updateWorkerLocation', ({ receiverId, bookingId, coords }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('workerLocationChanged', { bookingId, coords });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Base Route
app.get('/', (req, res) => {
  res.send('Kaamwale API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payouts', require('./routes/payoutRoutes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io`);
});
