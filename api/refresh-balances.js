const { createClient } = require('@vercel/kv');
const { createClient: createRedisClient } = require('redis');
const { createPublicClient, http, getContract, parseAbi } = require('viem');
const { mainnet } = require('viem/chains');

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';

// Minimal ERC20 ABI for balanceOf
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
]);

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
    const kvUrl = process.env.KV_REST_API_URL?.trim();
    const kvToken = process.env.KV_REST_API_TOKEN?.trim();

    redisClient = createClient({
      url: kvUrl,
      token: kvToken,
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
    console.log('Starting balance refresh...');
    const kv = await getRedisClient();
    const walletAddresses = await kv.smembers('leaderboard:wallets') || [];

    if (walletAddresses.length === 0) {
      console.log('No wallets to refresh');
      return res.status(200).json({
        success: true,
        message: 'No wallets to refresh',
        updated: 0
      });
    }

    console.log(`Refreshing ${walletAddresses.length} wallets...`);

    // Create viem client
    const client = createPublicClient({
      chain: mainnet,
      transport: http(ETHEREUM_RPC_URL)
    });

    const tokenContract = getContract({
      address: ZEUS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      client: client
    });

    // Get decimals and total supply once
    const [decimals, totalSupply] = await Promise.all([
      tokenContract.read.decimals(),
      tokenContract.read.totalSupply()
    ]);

    const totalSupplyFormatted = Number(totalSupply) / Math.pow(10, Number(decimals));
    let updatedCount = 0;

    // Refresh each wallet's balance
    for (const address of walletAddresses) {
      try {
        const entry = await kv.hgetall(`leaderboard:${address}`);

        if (!entry || !entry.wallet_address) {
          console.log(`Skipping invalid entry for ${address}`);
          continue;
        }

        // Get current balance from blockchain
        const balance = await tokenContract.read.balanceOf([entry.wallet_address]);
        const balanceFormatted = Number(balance) / Math.pow(10, Number(decimals));
        const supplyPercentage = ((balanceFormatted / totalSupplyFormatted) * 100).toFixed(6);

        // Update in Redis
        await kv.hset(`leaderboard:${address}`, {
          wallet_address: entry.wallet_address,
          twitter_handle: entry.twitter_handle || '',
          zeus_balance: balanceFormatted.toString(),
          supply_percentage: `${supplyPercentage}%`,
          timestamp: entry.timestamp || Date.now().toString(),
          last_refresh: Date.now().toString()
        });

        updatedCount++;
        console.log(`Updated ${entry.wallet_address}: ${balanceFormatted} ZEUS (${supplyPercentage}%)`);
      } catch (error) {
        console.error(`Error updating wallet ${address}:`, error.message);
      }
    }

    console.log(`Balance refresh completed: ${updatedCount}/${walletAddresses.length} wallets updated`);

    return res.status(200).json({
      success: true,
      message: 'Balances refreshed successfully',
      updated: updatedCount,
      total: walletAddresses.length
    });

  } catch (error) {
    console.error('Error refreshing balances:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to refresh balances',
      details: error.message
    });
  }
};
