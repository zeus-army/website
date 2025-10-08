const { createClient } = require('@vercel/kv');
const { createClient: createRedisClient } = require('redis');
const { ethers } = require('ethers');

const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';
const ETHEREUM_RPC = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kv = await getRedisClient();
    const { address, signature, message, twitterHandle } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!twitterHandle || !twitterHandle.startsWith('@')) {
      return res.status(400).json({ error: 'Twitter handle must start with @' });
    }

    // Verify signature
    const expectedMessage = `Welcome to Zeus Army!\n\nBy signing this message, you join the elite ranks of ZEUS holders.\n\nWallet: ${address}\nTimestamp: ${message.timestamp}`;
    const recoveredAddress = ethers.utils.verifyMessage(expectedMessage, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if wallet already exists
    const existingEntry = await kv.hgetall(`leaderboard:${address.toLowerCase()}`);
    if (existingEntry && Object.keys(existingEntry).length > 0) {
      return res.status(409).json({ error: 'Wallet already registered' });
    }

    // Get ZEUS balance
    const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
    const contract = new ethers.Contract(ZEUS_TOKEN_ADDRESS, ERC20_ABI, provider);

    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);

    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    const balanceNum = parseFloat(formattedBalance);

    // Minimum balance requirement: 100 ZEUS
    if (balanceNum < 100) {
      return res.status(400).json({
        error: 'Minimum balance required',
        details: 'You need at least 100 ZEUS tokens to join the whale leaderboard'
      });
    }

    // Calculate percentage of total supply
    const TOTAL_SUPPLY = 420.69e12; // 420.69 trillion
    const percentage = (balanceNum / TOTAL_SUPPLY) * 100;
    const supplyPercentage = percentage < 0.001 ? '<0.001%' : `${percentage.toFixed(3)}%`;

    // Store in Redis
    const timestamp = Date.now();
    const entry = {
      wallet_address: address.toLowerCase(),
      twitter_handle: twitterHandle,
      zeus_balance: formattedBalance,
      supply_percentage: supplyPercentage,
      signature,
      timestamp: timestamp.toString(),
    };

    await kv.hset(`leaderboard:${address.toLowerCase()}`, entry);
    await kv.sadd('leaderboard:wallets', address.toLowerCase());

    return res.status(200).json({
      success: true,
      wallet: entry,
    });
  } catch (error) {
    console.error('Error joining leaderboard:', error);
    return res.status(500).json({
      error: 'Failed to join leaderboard',
      details: error.message
    });
  }
};
