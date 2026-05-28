import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import assignmentRoutes from './routes/assignment.routes.js';
import './workers/assignment.worker.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/veda-ai';
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// WebSocket
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-assignment', (assignmentId) => {
    socket.join(assignmentId);
    console.log(`User joined assignment room: ${assignmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Export io for use in other files
export { io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
