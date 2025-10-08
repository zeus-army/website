import { createClient as createVercelKV } from '@vercel/kv';
import { createClient as createRedisClient } from 'redis';

// In-memory store for local development when Redis is not available
interface MemoryStore {
  [key: string]: any;
}

const store: MemoryStore = {};

const memoryStore = {
  hgetall: async (key: string) => {
    return store[key] || {};
  },

  hset: async (key: string, data: any) => {
    store[key] = { ...store[key], ...data };
    return Promise.resolve();
  },

  smembers: async (key: string) => {
    if (!store[key]) {
      store[key] = [];
    }
    return store[key];
  },

  sadd: async (key: string, ...members: string[]) => {
    if (!Array.isArray(store[key])) {
      store[key] = [];
    }
    for (const member of members) {
      if (!store[key].includes(member)) {
        store[key].push(member);
      }
    }
    return Promise.resolve();
  }
};

// Type for our unified Redis interface
interface RedisInterface {
  hgetall: (key: string) => Promise<any>;
  hset: (key: string, data: any) => Promise<any>;
  smembers: (key: string) => Promise<string[]>;
  sadd: (key: string, ...members: string[]) => Promise<any>;
}

let redisClient: RedisInterface | null = null;

export async function getRedisClient(): Promise<RedisInterface> {
  if (redisClient) return redisClient;

  // Check if we're in production (Vercel) or development (local)
  const isProduction = process.env.VERCEL ||
    (process.env.KV_REST_API_URL &&
     process.env.KV_REST_API_TOKEN &&
     process.env.KV_REST_API_URL !== 'not_used_in_local');

  if (isProduction) {
    // Use Vercel KV in production
    console.log('Using Vercel KV');
    redisClient = createVercelKV({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  } else {
    // Try to connect to local Redis, fall back to memory store
    try {
      console.log('Attempting to connect to local Redis...');
      const client = createRedisClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 2000
        }
      });

      await client.connect();
      console.log('✅ Connected to local Redis');

      redisClient = {
        hgetall: async (key: string) => {
          return await client.hGetAll(key);
        },
        hset: async (key: string, data: any) => {
          return await client.hSet(key, data);
        },
        smembers: async (key: string) => {
          return await client.sMembers(key);
        },
        sadd: async (key: string, ...members: string[]) => {
          return await client.sAdd(key, members);
        }
      };
    } catch (error) {
      console.warn('⚠️  Redis not available, using in-memory store for development');
      redisClient = memoryStore;
    }
  }

  return redisClient;
}
