import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import proxyRoutes from './routes/proxyRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request logger middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/proxy', proxyRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Learnify API is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Learnify API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            student: '/api/student',
            faculty: '/api/faculty',
            proxy: '/api/proxy',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Create HTTP server and Socket.io instance
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join student room for real-time updates
    socket.on('join-student-room', (studentId) => {
        socket.join(`student-${studentId}`);
        console.log(`👤 Student ${studentId} joined their room`);
    });

    // Join faculty room for real-time updates
    socket.on('join-faculty-room', (facultyId) => {
        socket.join(`faculty-${facultyId}`);
        console.log(`👨‍🏫 Faculty ${facultyId} joined their room`);
    });

    // Join code submissions room (all faculty can see)
    socket.on('join-code-submissions-room', () => {
        socket.join('code-submissions');
        console.log(`📝 Client joined code submissions room`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// Make io available to other modules
app.set('io', io);

// Start server
httpServer.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Learnify API Server`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🔌 Socket.io enabled for real-time updates`);
    console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    httpServer.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('✅ Process terminated');
    });
});

export { app, io };
