const { createClient } = require('@vercel/kv');
const { createClient: createRedisClient } = require('redis');
const { createPublicClient, http, getContract, parseAbi } = require('viem');
const { mainnet } = require('viem/chains');

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';
const WZEUS_TOKEN_ADDRESS = '0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9';
const COINGECKO_API_KEY = process.env.COINGECKO || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

// Cache duration for top 10 holders (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Minimal ERC20 ABI
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
]);

// In-memory store
const memoryStore = (() => {
  const store = {};
  return {
    get: async (key) => store[key],
    set: async (key, value) => { store[key] = value; },
    hgetall: async (key) => store[key] || {},
    hset: async (key, data) => { store[key] = { ...store[key], ...data }; },
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
        get: async (key) => await client.get(key),
        set: async (key, value) => await client.set(key, value),
        hgetall: async (key) => await client.hGetAll(key),
        hset: async (key, data) => await client.hSet(key, data),
      };
    } catch (error) {
      console.warn('⚠️  Redis not available, using in-memory store');
      redisClient = memoryStore;
    }
  }

  return redisClient;
}

// Format balance to human-readable format (T/B/M/K)
function formatBalance(balance, decimals) {
  const num = Number(balance) / Math.pow(10, Number(decimals));

  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  } else if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else {
    return num.toFixed(2);
  }
}

// Get raw balance value for calculations
function getRawBalance(balance, decimals) {
  return Number(balance) / Math.pow(10, Number(decimals));
}

// Fetch ZEUS price from CoinGecko
async function fetchZeusPrice() {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=zeus-network&vs_currencies=usd${COINGECKO_API_KEY ? `&x_cg_demo_api_key=${COINGECKO_API_KEY}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    return data['zeus-network']?.usd || 0;
  } catch (error) {
    console.error('Error fetching ZEUS price:', error);
    return 0;
  }
}

// Resolve ENS name for an address
async function resolveENS(address, viemClient) {
  try {
    const ensName = await viemClient.getEnsName({
      address: address,
    });
    return ensName;
  } catch (error) {
    console.log(`No ENS found for ${address}`);
    return null;
  }
}

// Fetch holders from Etherscan
async function fetchHoldersFromEtherscan(contractAddress, page = 1, offset = 100) {
  try {
    const url = `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=${page}&offset=${offset}${ETHERSCAN_API_KEY ? `&apikey=${ETHERSCAN_API_KEY}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      return data.result.map(holder => ({
        address: holder.TokenHolderAddress,
        balance: holder.TokenHolderQuantity
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching holders from Etherscan:', error);
    return [];
  }
}

// Aggregate holders from both ZEUS and wZEUS
async function aggregateHolders(zeusHolders, wzeusHolders) {
  const holderMap = new Map();

  // Add ZEUS holders
  zeusHolders.forEach(holder => {
    holderMap.set(holder.address.toLowerCase(), {
      address: holder.address,
      zeusBalance: BigInt(holder.balance),
      wzeusBalance: BigInt(0)
    });
  });

  // Add or update with wZEUS holders
  wzeusHolders.forEach(holder => {
    const addr = holder.address.toLowerCase();
    if (holderMap.has(addr)) {
      holderMap.get(addr).wzeusBalance = BigInt(holder.balance);
    } else {
      holderMap.set(addr, {
        address: holder.address,
        zeusBalance: BigInt(0),
        wzeusBalance: BigInt(holder.balance)
      });
    }
  });

  // Calculate total and convert to array
  const aggregated = Array.from(holderMap.values()).map(holder => ({
    address: holder.address,
    zeusBalance: holder.zeusBalance,
    wzeusBalance: holder.wzeusBalance,
    totalBalance: holder.zeusBalance + holder.wzeusBalance
  }));

  // Sort by total balance descending
  aggregated.sort((a, b) => Number(b.totalBalance - a.totalBalance));

  return aggregated;
}

// Get top 10 holders (cached)
async function getTop10Holders(viemClient, decimals, totalSupply, zeusPrice) {
  const kv = await getRedisClient();

  // Check cache
  const cacheKey = 'holders:top10';
  const cached = await kv.get(cacheKey);

  if (cached) {
    const cachedData = JSON.parse(cached);
    if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log('Returning cached top 10 holders');
      return cachedData.holders;
    }
  }

  console.log('Fetching fresh top 10 holders...');

  // Fetch holders from Etherscan for both tokens
  const [zeusHolders, wzeusHolders] = await Promise.all([
    fetchHoldersFromEtherscan(ZEUS_TOKEN_ADDRESS, 1, 100),
    fetchHoldersFromEtherscan(WZEUS_TOKEN_ADDRESS, 1, 100)
  ]);

  // Aggregate holders
  const aggregated = await aggregateHolders(zeusHolders, wzeusHolders);

  // Get top 10
  const top10 = aggregated.slice(0, 10);

  // Resolve ENS for top 10
  const top10WithENS = await Promise.all(
    top10.map(async (holder, index) => {
      const ensName = await resolveENS(holder.address, viemClient);
      const rawTotal = getRawBalance(holder.totalBalance.toString(), decimals);
      const usdValue = rawTotal * zeusPrice;
      const supplyPercentage = ((rawTotal / getRawBalance(totalSupply.toString(), decimals)) * 100).toFixed(4);

      return {
        rank: index + 1,
        address: holder.address,
        ensName: ensName,
        zeusBalance: formatBalance(holder.zeusBalance.toString(), decimals),
        wzeusBalance: formatBalance(holder.wzeusBalance.toString(), decimals),
        totalBalance: formatBalance(holder.totalBalance.toString(), decimals),
        totalBalanceRaw: rawTotal,
        usdValue: usdValue.toFixed(2),
        supplyPercentage: `${supplyPercentage}%`
      };
    })
  );

  // Cache the results
  await kv.set(cacheKey, JSON.stringify({
    timestamp: Date.now(),
    holders: top10WithENS
  }));

  // Also save individual entries in Redis for future reference
  for (const holder of top10WithENS) {
    await kv.hset(`holder:${holder.address.toLowerCase()}`, {
      address: holder.address,
      ensName: holder.ensName || '',
      zeusBalance: holder.zeusBalance,
      wzeusBalance: holder.wzeusBalance,
      totalBalance: holder.totalBalance,
      totalBalanceRaw: holder.totalBalanceRaw.toString(),
      usdValue: holder.usdValue,
      supplyPercentage: holder.supplyPercentage,
      rank: holder.rank.toString(),
      timestamp: Date.now().toString()
    });
  }

  return top10WithENS;
}

// Get additional holders (real-time)
async function getAdditionalHolders(viemClient, decimals, totalSupply, zeusPrice, offset = 10, limit = 20) {
  console.log(`Fetching additional holders (offset: ${offset}, limit: ${limit})...`);

  // Calculate which page to fetch from Etherscan
  const page = Math.floor(offset / 100) + 1;
  const etherscanOffset = Math.max(offset + limit, 100);

  // Fetch holders from Etherscan for both tokens
  const [zeusHolders, wzeusHolders] = await Promise.all([
    fetchHoldersFromEtherscan(ZEUS_TOKEN_ADDRESS, page, etherscanOffset),
    fetchHoldersFromEtherscan(WZEUS_TOKEN_ADDRESS, page, etherscanOffset)
  ]);

  // Aggregate holders
  const aggregated = await aggregateHolders(zeusHolders, wzeusHolders);

  // Get the requested slice
  const requestedHolders = aggregated.slice(offset, offset + limit);

  // Resolve ENS for requested holders (in batches to avoid rate limits)
  const holdersWithData = await Promise.all(
    requestedHolders.map(async (holder, index) => {
      // Try to get ENS, but don't wait too long for each one
      let ensName = null;
      try {
        ensName = await Promise.race([
          resolveENS(holder.address, viemClient),
          new Promise((resolve) => setTimeout(() => resolve(null), 1000))
        ]);
      } catch (error) {
        console.log(`Error resolving ENS for ${holder.address}:`, error);
      }

      const rawTotal = getRawBalance(holder.totalBalance.toString(), decimals);
      const usdValue = rawTotal * zeusPrice;
      const supplyPercentage = ((rawTotal / getRawBalance(totalSupply.toString(), decimals)) * 100).toFixed(4);

      return {
        rank: offset + index + 1,
        address: holder.address,
        ensName: ensName,
        zeusBalance: formatBalance(holder.zeusBalance.toString(), decimals),
        wzeusBalance: formatBalance(holder.wzeusBalance.toString(), decimals),
        totalBalance: formatBalance(holder.totalBalance.toString(), decimals),
        totalBalanceRaw: rawTotal,
        usdValue: usdValue.toFixed(2),
        supplyPercentage: `${supplyPercentage}%`
      };
    })
  );

  return holdersWithData;
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
    const { offset = '0', limit = '10' } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);

    // Create viem client
    const client = createPublicClient({
      chain: mainnet,
      transport: http(ETHEREUM_RPC_URL)
    });

    const zeusContract = getContract({
      address: ZEUS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      client: client
    });

    // Get decimals, total supply, and price
    const [decimals, totalSupply, zeusPrice] = await Promise.all([
      zeusContract.read.decimals(),
      zeusContract.read.totalSupply(),
      fetchZeusPrice()
    ]);

    console.log(`ZEUS Price: $${zeusPrice}`);

    let holders = [];

    if (offsetNum === 0 && limitNum <= 10) {
      // Return top 10 from cache
      holders = await getTop10Holders(client, decimals, totalSupply, zeusPrice);
      holders = holders.slice(0, limitNum);
    } else if (offsetNum < 10) {
      // Return combination of cached top 10 and additional
      const top10 = await getTop10Holders(client, decimals, totalSupply, zeusPrice);
      const cachedPart = top10.slice(offsetNum, Math.min(10, offsetNum + limitNum));

      if (offsetNum + limitNum > 10) {
        // Need additional holders beyond top 10
        const additionalNeeded = (offsetNum + limitNum) - 10;
        const additional = await getAdditionalHolders(client, decimals, totalSupply, zeusPrice, 10, additionalNeeded);
        holders = [...cachedPart, ...additional];
      } else {
        holders = cachedPart;
      }
    } else {
      // All additional holders (real-time)
      holders = await getAdditionalHolders(client, decimals, totalSupply, zeusPrice, offsetNum, limitNum);
    }

    return res.status(200).json({
      success: true,
      data: holders,
      price: zeusPrice,
      offset: offsetNum,
      limit: limitNum,
      count: holders.length
    });

  } catch (error) {
    console.error('Error fetching holders:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch holders',
      details: error.message
    });
  }
};
