const { createClient } = require('@vercel/kv');
const { createClient: createRedisClient } = require('redis');
const { createPublicClient, http, getContract, parseAbi } = require('viem');
const { mainnet } = require('viem/chains');

const ALCHEMY_API_KEY = process.env.ALCHEMY || '';
const ETHEREUM_RPC_URL = ALCHEMY_API_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';
const WZEUS_TOKEN_ADDRESS = '0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9';
const UNISWAP_V2_POOL = '0xf97503af8230a7e72909d6614f45e88168ff3c10';
const COINGECKO_API_KEY = process.env.COINGECKO || '';

// Cache duration for top 10 holders (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Minimal ERC20 ABI
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
]);

// Uniswap V2 Pool ABI
const UNISWAP_V2_POOL_ABI = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)'
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

// Fetch ZEUS price from CoinGecko (with fallback to Dexscreener)
async function fetchZeusPrice() {
  // Try CoinGecko first
  if (COINGECKO_API_KEY) {
    try {
      // Use Pro API endpoint for Pro API keys
      const baseUrl = 'https://pro-api.coingecko.com/api/v3';
      const url = `${baseUrl}/simple/token_price/ethereum?contract_addresses=${ZEUS_TOKEN_ADDRESS}&vs_currencies=usd&x_cg_pro_api_key=${COINGECKO_API_KEY}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const price = data[ZEUS_TOKEN_ADDRESS.toLowerCase()]?.usd || 0;
        if (price > 0) {
          console.log('ZEUS price from CoinGecko:', price);
          return price;
        }
      } else {
        console.error('CoinGecko API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching from CoinGecko:', error.message);
    }
  }

  // Fallback to Dexscreener
  try {
    console.log('Fetching price from Dexscreener...');
    const url = `https://api.dexscreener.com/latest/dex/tokens/${ZEUS_TOKEN_ADDRESS}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        const price = parseFloat(data.pairs[0].priceUsd) || 0;
        console.log('ZEUS price from Dexscreener:', price);
        return price;
      }
    }
  } catch (error) {
    console.error('Error fetching from Dexscreener:', error.message);
  }

  console.error('Could not fetch ZEUS price from any source');
  return 0;
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

// Fetch holders using Alchemy - we get addresses from Transfer events, then query balances
async function fetchHoldersWithAlchemy(viemClient, contractAddress, limit = 100) {
  try {
    console.log(`Fetching holders for ${contractAddress} using Alchemy...`);

    // Get recent Transfer events to find active holders
    const currentBlock = await viemClient.getBlockNumber();
    // Get last 50k blocks (roughly 1 week of data)
    const fromBlock = currentBlock - 50000n;

    console.log(`Fetching Transfer events from block ${fromBlock} to ${currentBlock}`);

    const logs = await viemClient.getLogs({
      address: contractAddress,
      event: parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)'])[0],
      fromBlock: fromBlock,
      toBlock: 'latest'
    });

    // Collect unique addresses
    const addressSet = new Set();
    logs.forEach(log => {
      if (log.args.from && log.args.from !== '0x0000000000000000000000000000000000000000') {
        addressSet.add(log.args.from.toLowerCase());
      }
      if (log.args.to && log.args.to !== '0x0000000000000000000000000000000000000000') {
        addressSet.add(log.args.to.toLowerCase());
      }
    });

    console.log(`Found ${addressSet.size} unique addresses, fetching balances...`);

    // Get balances for all addresses
    const contract = getContract({
      address: contractAddress,
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      client: viemClient
    });

    const holders = [];
    const addresses = Array.from(addressSet).slice(0, 300); // Limit to avoid timeout

    // Batch requests for efficiency
    const batchSize = 50;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const balances = await Promise.all(
        batch.map(async (addr) => {
          try {
            const balance = await contract.read.balanceOf([addr]);
            return { address: addr, balance: balance.toString() };
          } catch (error) {
            console.error(`Error fetching balance for ${addr}:`, error.message);
            return null;
          }
        })
      );

      holders.push(...balances.filter(h => h !== null && BigInt(h.balance) > 0n));
      console.log(`Fetched batch ${i / batchSize + 1}, total holders so far: ${holders.length}`);
    }

    // Sort by balance descending
    holders.sort((a, b) => {
      const balanceA = BigInt(a.balance);
      const balanceB = BigInt(b.balance);
      return balanceA > balanceB ? -1 : balanceA < balanceB ? 1 : 0;
    });

    console.log(`Found ${holders.length} total holders with balance`);
    return holders.slice(0, limit);
  } catch (error) {
    console.error('Error fetching holders with Alchemy:', error);
    return [];
  }
}

// Get Uniswap V2 LP token holders and calculate their ZEUS positions
async function getUniswapLPHolders(viemClient, decimals) {
  try {
    console.log('Fetching Uniswap V2 LP holders...');

    const poolContract = getContract({
      address: UNISWAP_V2_POOL,
      abi: UNISWAP_V2_POOL_ABI,
      client: viemClient
    });

    // Get pool info
    const [totalSupply, reserves, token0] = await Promise.all([
      poolContract.read.totalSupply(),
      poolContract.read.getReserves(),
      poolContract.read.token0()
    ]);

    // Check which token is ZEUS (token0 or token1)
    const isToken0Zeus = token0.toLowerCase() === ZEUS_TOKEN_ADDRESS.toLowerCase();
    const zeusReserve = isToken0Zeus ? reserves[0] : reserves[1];

    console.log('Pool Total Supply:', totalSupply.toString());
    console.log('ZEUS Reserve:', zeusReserve.toString());

    // Fetch Transfer events for LP tokens to find holders
    const holders = await fetchHoldersWithAlchemy(viemClient, UNISWAP_V2_POOL, 200);

    console.log(`Found ${holders.length} LP token holders`);

    // Calculate ZEUS position for each LP holder
    const lpPositions = holders.map(holder => {
      const lpBalance = BigInt(holder.balance);
      const totalSupplyBigInt = BigInt(totalSupply.toString());
      const zeusReserveBigInt = BigInt(zeusReserve.toString());

      // Calculate: (lpBalance / totalSupply) * zeusReserve
      const zeusAmount = (lpBalance * zeusReserveBigInt) / totalSupplyBigInt;

      return {
        address: holder.address,
        balance: zeusAmount.toString(),
        isLPPosition: true // Mark as LP position
      };
    }).filter(holder => BigInt(holder.balance) > 0n);

    console.log(`LP holders with non-zero ZEUS positions: ${lpPositions.length}`);
    return lpPositions;
  } catch (error) {
    console.error('Error fetching Uniswap LP holders:', error);
    return [];
  }
}

// Aggregate holders from both ZEUS and wZEUS
async function aggregateHolders(zeusHolders, wzeusHolders, lpHolders = []) {
  const holderMap = new Map();

  // Add ZEUS holders
  zeusHolders.forEach(holder => {
    holderMap.set(holder.address.toLowerCase(), {
      address: holder.address,
      zeusBalance: BigInt(holder.balance),
      wzeusBalance: BigInt(0),
      lpZeusBalance: BigInt(0)
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
        wzeusBalance: BigInt(holder.balance),
        lpZeusBalance: BigInt(0)
      });
    }
  });

  // Add or update with LP positions (ZEUS from Uniswap pool)
  lpHolders.forEach(holder => {
    const addr = holder.address.toLowerCase();
    if (holderMap.has(addr)) {
      holderMap.get(addr).lpZeusBalance = BigInt(holder.balance);
    } else {
      holderMap.set(addr, {
        address: holder.address,
        zeusBalance: BigInt(0),
        wzeusBalance: BigInt(0),
        lpZeusBalance: BigInt(holder.balance)
      });
    }
  });

  // Calculate total and convert to array
  const aggregated = Array.from(holderMap.values()).map(holder => ({
    address: holder.address,
    zeusBalance: holder.zeusBalance,
    wzeusBalance: holder.wzeusBalance,
    lpZeusBalance: holder.lpZeusBalance,
    totalBalance: holder.zeusBalance + holder.wzeusBalance + holder.lpZeusBalance
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
    // Vercel KV returns objects directly, no need to JSON.parse
    const cachedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
    if (cachedData && cachedData.timestamp && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log('Returning cached top 10 holders');
      return cachedData.holders;
    }
  }

  console.log('Fetching fresh top 10 holders...');

  // Fetch holders using Alchemy for both tokens and LP positions
  const [zeusHolders, wzeusHolders, lpHolders] = await Promise.all([
    fetchHoldersWithAlchemy(viemClient, ZEUS_TOKEN_ADDRESS, 100),
    fetchHoldersWithAlchemy(viemClient, WZEUS_TOKEN_ADDRESS, 100),
    getUniswapLPHolders(viemClient, decimals)
  ]);

  // Aggregate holders
  const aggregated = await aggregateHolders(zeusHolders, wzeusHolders, lpHolders);

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
        lpZeusBalance: formatBalance(holder.lpZeusBalance.toString(), decimals),
        totalBalance: formatBalance(holder.totalBalance.toString(), decimals),
        totalBalanceRaw: rawTotal,
        usdValue: usdValue.toFixed(2),
        supplyPercentage: `${supplyPercentage}%`
      };
    })
  );

  // Cache the results
  // Vercel KV accepts objects directly
  await kv.set(cacheKey, {
    timestamp: Date.now(),
    holders: top10WithENS
  });

  // Also save individual entries in Redis for future reference
  for (const holder of top10WithENS) {
    await kv.hset(`holder:${holder.address.toLowerCase()}`, {
      address: holder.address,
      ensName: holder.ensName || '',
      zeusBalance: holder.zeusBalance,
      wzeusBalance: holder.wzeusBalance,
      lpZeusBalance: holder.lpZeusBalance,
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

  // Fetch more holders if needed
  const fetchLimit = Math.min(offset + limit + 50, 300);

  // Fetch holders using Alchemy for both tokens and LP positions
  const [zeusHolders, wzeusHolders, lpHolders] = await Promise.all([
    fetchHoldersWithAlchemy(viemClient, ZEUS_TOKEN_ADDRESS, fetchLimit),
    fetchHoldersWithAlchemy(viemClient, WZEUS_TOKEN_ADDRESS, fetchLimit),
    getUniswapLPHolders(viemClient, decimals)
  ]);

  // Aggregate holders
  const aggregated = await aggregateHolders(zeusHolders, wzeusHolders, lpHolders);

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
        lpZeusBalance: formatBalance(holder.lpZeusBalance.toString(), decimals),
        totalBalance: formatBalance(holder.totalBalance.toString(), decimals),
        totalBalanceRaw: rawTotal,
        usdValue: usdValue.toFixed(2),
        supplyPercentage: `${supplyPercentage}%`
      };
    })
  );

  return holdersWithData;
}

// Search for a specific address
async function searchAddress(address, viemClient, decimals, totalSupply, zeusPrice) {
  try {
    const normalizedAddress = address.toLowerCase();

    // Check if address is valid
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return null;
    }

    const zeusContract = getContract({
      address: ZEUS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      client: viemClient
    });

    const wzeusContract = getContract({
      address: WZEUS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      client: viemClient
    });

    const poolContract = getContract({
      address: UNISWAP_V2_POOL,
      abi: UNISWAP_V2_POOL_ABI,
      client: viemClient
    });

    // Fetch balances for both tokens and LP position
    const [zeusBalance, wzeusBalance, lpBalance, poolTotalSupply, reserves, token0, ensName] = await Promise.all([
      zeusContract.read.balanceOf([address]),
      wzeusContract.read.balanceOf([address]),
      poolContract.read.balanceOf([address]),
      poolContract.read.totalSupply(),
      poolContract.read.getReserves(),
      poolContract.read.token0(),
      resolveENS(address, viemClient)
    ]);

    const zeusBalanceBigInt = BigInt(zeusBalance.toString());
    const wzeusBalanceBigInt = BigInt(wzeusBalance.toString());

    // Calculate LP position ZEUS value
    let lpZeusBalance = 0n;
    if (BigInt(lpBalance.toString()) > 0n) {
      const isToken0Zeus = token0.toLowerCase() === ZEUS_TOKEN_ADDRESS.toLowerCase();
      const zeusReserve = isToken0Zeus ? reserves[0] : reserves[1];
      const lpBalanceBigInt = BigInt(lpBalance.toString());
      const totalSupplyBigInt = BigInt(poolTotalSupply.toString());
      const zeusReserveBigInt = BigInt(zeusReserve.toString());

      // Calculate: (lpBalance / totalSupply) * zeusReserve
      lpZeusBalance = (lpBalanceBigInt * zeusReserveBigInt) / totalSupplyBigInt;
    }

    const totalBalance = zeusBalanceBigInt + wzeusBalanceBigInt + lpZeusBalance;

    // If no balance, return null
    if (totalBalance === 0n) {
      return null;
    }

    const rawTotal = getRawBalance(totalBalance.toString(), decimals);
    const usdValue = rawTotal * zeusPrice;
    const supplyPercentage = ((rawTotal / getRawBalance(totalSupply.toString(), decimals)) * 100).toFixed(4);

    return {
      rank: null, // Will be calculated if needed
      address: address,
      ensName: ensName,
      zeusBalance: formatBalance(zeusBalanceBigInt.toString(), decimals),
      wzeusBalance: formatBalance(wzeusBalanceBigInt.toString(), decimals),
      lpZeusBalance: formatBalance(lpZeusBalance.toString(), decimals),
      totalBalance: formatBalance(totalBalance.toString(), decimals),
      totalBalanceRaw: rawTotal,
      usdValue: usdValue.toFixed(2),
      supplyPercentage: `${supplyPercentage}%`
    };
  } catch (error) {
    console.error('Error searching address:', error);
    return null;
  }
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
    const { offset = '0', limit = '10', address, lpOnly, lpOffset = '0', lpLimit = '5' } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);
    const lpOffsetNum = parseInt(lpOffset);
    const lpLimitNum = parseInt(lpLimit);

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

    const wzeusContract = getContract({
      address: WZEUS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      client: client
    });

    // Get decimals, total supply, wZEUS supply, and price
    const [decimals, totalSupply, wzeusSupply, zeusPrice] = await Promise.all([
      zeusContract.read.decimals(),
      zeusContract.read.totalSupply(),
      wzeusContract.read.totalSupply(),
      fetchZeusPrice()
    ]);

    console.log(`ZEUS Price: $${zeusPrice}`);

    // If lpOnly is requested, return only LP holders
    if (lpOnly === 'true') {
      const lpHoldersRaw = await getUniswapLPHolders(client, decimals);
      const lpHoldersSlice = lpHoldersRaw.slice(lpOffsetNum, lpOffsetNum + lpLimitNum);

      // Format LP holders with all data
      const lpHoldersFormatted = await Promise.all(
        lpHoldersSlice.map(async (holder) => {
          const ensName = await resolveENS(holder.address, client);
          const rawBalance = getRawBalance(holder.balance, decimals);
          const usdValue = rawBalance * zeusPrice;
          const supplyPercentage = ((rawBalance / getRawBalance(totalSupply.toString(), decimals)) * 100).toFixed(4);

          return {
            rank: lpOffsetNum + lpHoldersSlice.indexOf(holder) + 1,
            address: holder.address,
            ensName: ensName,
            zeusBalance: formatBalance('0', decimals),
            wzeusBalance: formatBalance('0', decimals),
            lpZeusBalance: formatBalance(holder.balance, decimals),
            totalBalance: formatBalance(holder.balance, decimals),
            totalBalanceRaw: rawBalance,
            usdValue: usdValue.toFixed(2),
            supplyPercentage: `${supplyPercentage}%`,
            isLPPosition: true
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: lpHoldersFormatted,
        price: zeusPrice,
        marketCap: 0,
        wzeusValue: 0,
        totalSupply: 0,
        wzeusSupply: 0,
        offset: lpOffsetNum,
        limit: lpLimitNum,
        count: lpHoldersFormatted.length,
        totalLPHolders: lpHoldersRaw.length
      });
    }

    let holders = [];

    // Check if searching for a specific address
    if (address) {
      const holder = await searchAddress(address, client, decimals, totalSupply, zeusPrice);
      if (holder) {
        holders = [holder];
      } else {
        return res.status(404).json({
          success: false,
          error: 'Address not found or has no balance'
        });
      }
    } else {
      // Normal pagination flow
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
    }

    // Calculate market cap and wZEUS value
    const totalSupplyRaw = getRawBalance(totalSupply.toString(), decimals);
    const wzeusSupplyRaw = getRawBalance(wzeusSupply.toString(), decimals);
    const marketCap = totalSupplyRaw * zeusPrice;
    const wzeusValue = wzeusSupplyRaw * zeusPrice;

    return res.status(200).json({
      success: true,
      data: holders,
      price: zeusPrice,
      marketCap: marketCap,
      wzeusValue: wzeusValue,
      totalSupply: totalSupplyRaw,
      wzeusSupply: wzeusSupplyRaw,
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
