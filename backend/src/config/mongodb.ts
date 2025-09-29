import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { MONGODB_URI } = process.env;

const connectMongoDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      console.log('MongoDB URI not defined, skipping MongoDB connection');
      return;
    }

    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    console.log('Continuing without MongoDB...');
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Disconnected');
});

export default connectMongoDB;
