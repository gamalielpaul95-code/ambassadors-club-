const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('join-admin', () => {
    socket.join('admin_room');
  });
  
  socket.on('send-feedback', (data) => {
    io.to('admin_room').emit('new-feedback', data);
  });
  
  socket.on('send-announcement', (data) => {
    io.emit('new-announcement', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    success: false
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
