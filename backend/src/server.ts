import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import exerciseRoutes from './routes/exercises';
import workoutRoutes from './routes/workouts';
import workoutHistoryRoutes from './routes/workoutHistory';
import goalRoutes from './routes/goals';
import customWorkoutRoutes from './routes/customWorkouts';
import thematicProgramRoutes from './routes/thematicPrograms';
import communityRoutes from './routes/community';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import Swagger
import swaggerSpec from './config/swagger';

// Import database
import { syncDatabase } from './models';
import connectMongoDB from './config/mongodb';
import redisClient from './config/redis';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : [
        'http://localhost:3000',
        'http://localhost:19006',
        'http://192.168.15.9:3000',
        'http://192.168.15.4:3000',
        'http://192.168.15.3:3000',
        'http://192.168.15.6:3000',
        'http://192.168.15.9:19006',
        'http://192.168.15.9:8081', // Expo dev server
        'exp://192.168.15.9:8081',
        
        'http://172.20.10.2:3000',
        'http://172.20.10.2:19006',
        'http://172.20.10.2:8081',
        'exp://172.20.10.2:8081',
        // Expo protocol
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware (must be before multer routes)
// Note: multer will handle multipart/form-data, so we exclude it from JSON parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (videos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Calisthenics App API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION
  });
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/exercises`, exerciseRoutes);
app.use(`/api/${API_VERSION}/workouts`, workoutRoutes);
app.use(`/api/${API_VERSION}/workout-history`, workoutHistoryRoutes);
app.use(`/api/${API_VERSION}/goals`, goalRoutes);
app.use(`/api/${API_VERSION}/custom-workouts`, customWorkoutRoutes);
app.use(`/api/${API_VERSION}/programs`, thematicProgramRoutes);
app.use(`/api/${API_VERSION}/community`, communityRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Calisthenics App API',
    version: API_VERSION,
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      exercises: `/api/${API_VERSION}/exercises`,
      workouts: `/api/${API_VERSION}/workouts`,
      workoutHistory: `/api/${API_VERSION}/workout-history`,
      goals: `/api/${API_VERSION}/goals`,
      customWorkouts: `/api/${API_VERSION}/custom-workouts`,
      programs: `/api/${API_VERSION}/programs`,
      community: `/api/${API_VERSION}/community`
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to databases
    await syncDatabase();
    await connectMongoDB();
    
    // Try to connect to Redis, but don't fail if it's not available
    try {
      await redisClient.connect();
    } catch (redisError) {
      console.log('Redis not available, continuing without cache...');
    }

    // Start HTTP server
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log(`🔗 API Base URL (Network): http://192.168.15.9:${PORT}/api/${API_VERSION}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
