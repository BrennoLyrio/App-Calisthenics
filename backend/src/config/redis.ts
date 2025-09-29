import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD
} = process.env;

const redisClient = createClient({
  url: `redis://${REDIS_HOST || 'localhost'}:${REDIS_PORT || '6379'}`,
  password: REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Retry time exhausted');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
  console.log('Continuing without Redis...');
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export default redisClient;
