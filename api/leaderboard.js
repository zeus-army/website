const { createClient } = require('@vercel/kv');
const { createClient: createRedisClient } = require('redis');

// In-memory store
const memoryStore = (() => {
  const store = {};
  return {
    hgetall: async (key) => store[key] || {},
    hset: async (key, data) => { store[key] = { ...store[key], ...data }; },
    smembers: async (key) => store[key] || [],
    sadd: async (key, ...members) => {
      if (!Array.isArray(store[key])) store[key] = [];
      members.forEach(m => { if (!store[key].includes(m)) store[key].push(m); });
    }
  };
})();

let redisClient = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  const isProduction = process.env.VERCEL ||
    (process.env.KV_REST_API_URL &&
     process.env.KV_REST_API_TOKEN &&
     process.env.KV_REST_API_URL !== 'not_used_in_local');

  if (isProduction) {
    console.log('Using Vercel KV');
    redisClient = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  } else {
    try {
      console.log('Attempting to connect to local Redis...');
      const client = createRedisClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: { connectTimeout: 2000 }
      });

      await client.connect();
      console.log('✅ Connected to local Redis');

      redisClient = {
        hgetall: async (key) => await client.hGetAll(key),
        hset: async (key, data) => await client.hSet(key, data),
        smembers: async (key) => await client.sMembers(key),
        sadd: async (key, ...members) => await client.sAdd(key, members)
      };
    } catch (error) {
      console.warn('⚠️  Redis not available, using in-memory store');
      redisClient = memoryStore;
    }
  }

  return redisClient;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kv = await getRedisClient();
    const walletAddresses = await kv.smembers('leaderboard:wallets') || [];
    const entries = [];

    for (const address of walletAddresses) {
      const entry = await kv.hgetall(`leaderboard:${address}`);
      if (entry && entry.wallet_address) {
        entries.push({
          wallet_address: entry.wallet_address,
          twitter_handle: entry.twitter_handle || '',
          zeus_balance: entry.zeus_balance || '0',
          supply_percentage: entry.supply_percentage || '0%',
          timestamp: parseInt(entry.timestamp || '0'),
        });
      }
    }

    entries.sort((a, b) => parseFloat(b.zeus_balance) - parseFloat(a.zeus_balance));

    return res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
