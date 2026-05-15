require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

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
app.use('/api/orders', require('./routes/orderRoutes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io`);
});
