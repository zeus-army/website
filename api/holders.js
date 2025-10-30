const { createClient } = require('@vercel/kv');
const { createClient: createRedisClient } = require('redis');
const { createPublicClient, http, getContract, parseAbi } = require('viem');
const { mainnet } = require('viem/chains');
const { createOffchainClient } = require('@thenamespace/offchain-manager');

const ALCHEMY_API_KEY = process.env.ALCHEMY || '';
const ETHEREUM_RPC_URL = ALCHEMY_API_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';
const WZEUS_TOKEN_ADDRESS = '0xA56B06AA7Bfa6cbaD8A0b5161ca052d86a5D88E9';
const UNISWAP_V2_POOL = '0xf97503af8230a7e72909d6614f45e88168ff3c10';
const COINGECKO_API_KEY = process.env.COINGECKO || '';
const NAMESPACE_API_KEY = process.env.NAMESPACEAPIKEY;
const PARENT_ENS = 'zeuscc8.eth';

// Cache duration for top 10 holders (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// ENS cache for zeuscc8.eth subdomains
let ensCache = new Map();
let lastCacheUpdate = 0;
const ENS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    del: async (key) => { delete store[key]; },
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
        del: async (key) => await client.del(key),
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

// Build ENS cache for zeuscc8.eth subdomains
async function buildENSCache() {
  // Check if cache is still valid
  if (Date.now() - lastCacheUpdate < ENS_CACHE_TTL) {
    console.log(`Using cached ENS data (${ensCache.size} entries)`);
    return;
  }

  if (!NAMESPACE_API_KEY) {
    console.error('[ENS Cache] NAMESPACE_API_KEY not configured - ENS names will not be resolved');
    console.error('[ENS Cache] Please set NAMESPACEAPIKEY environment variable in Vercel');
    return;
  }

  console.log('[ENS Cache] API Key configured, length:', NAMESPACE_API_KEY.length);

  try {
    console.log('Building ENS cache for zeuscc8.eth subdomains...');
    const client = createOffchainClient({
      defaultApiKey: NAMESPACE_API_KEY,
    });

    let page = 1;
    let hasMore = true;
    ensCache.clear();
    let totalSubnames = 0;

    while (hasMore) {
      const result = await client.getFilteredSubnames({
        parentName: PARENT_ENS,
        page: page,
        size: 100
      });

      // Namespace SDK returns items array directly
      const subnames = result.items || result.data || result || [];

      for (const subname of subnames) {
        // Get the full ENS name - Namespace SDK uses "fullName" field
        const ensFullName = subname.fullName || (subname.label ? `${subname.label}.${PARENT_ENS}` : null);

        if (!ensFullName) {
          console.warn('Could not determine ENS name for subname:', subname);
          continue;
        }

        // Map address to ENS name
        // Namespace SDK returns addresses as an object where keys are coin types
        // Coin type 60 = Ethereum (https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
        if (subname.addresses && subname.addresses['60']) {
          const ethAddress = subname.addresses['60'];
          ensCache.set(ethAddress.toLowerCase(), ensFullName);
          totalSubnames++;
        }
      }

      // Check if there are more pages
      // If we got a full page of results, there might be more
      hasMore = subnames.length === result.size;
      page++;
    }

    lastCacheUpdate = Date.now();
    console.log(`[ENS Cache] Built successfully with ${totalSubnames} subdomains from ${page - 1} pages`);
    console.log('[ENS Cache] Total entries in cache:', ensCache.size);

    // Log sample entries for debugging
    const sampleEntries = Array.from(ensCache.entries()).slice(0, 3);
    sampleEntries.forEach(([addr, ens]) => {
      console.log(`[ENS Cache] ${addr} -> ${ens}`);
    });
  } catch (error) {
    console.error('Error building ENS cache:', error);
  }
}

// Resolve ENS name for an address
async function resolveENS(address, viemClient) {
  // First, try to build/refresh the cache
  await buildENSCache();

  // Check the cache for zeuscc8.eth subdomains
  const normalizedAddress = address.toLowerCase();
  const cachedENS = ensCache.get(normalizedAddress);

  if (cachedENS) {
    console.log(`[ENS Resolve] Found cached ENS for ${normalizedAddress}: ${cachedENS}`);
    return cachedENS;
  } else {
    console.log(`[ENS Resolve] No cached ENS for ${normalizedAddress}, trying onchain...`);
  }

  // Fallback to onchain ENS resolution
  try {
    const ensName = await viemClient.getEnsName({
      address: address,
    });
    if (ensName) {
      console.log(`[ENS Resolve] Found onchain ENS for ${normalizedAddress}: ${ensName}`);
    }
    return ensName;
  } catch (error) {
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

// Fetch LP holders using Alchemy's Asset Transfers API (for old, inactive pools)
async function fetchLPHoldersWithAlchemyTransfers(contractAddress, viemClient) {
  try {
    console.log(`Fetching LP token transfers using Alchemy Asset Transfers API...`);

    const url = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          contractAddresses: [contractAddress],
          category: ['erc20'],
          maxCount: '0x3e8', // 1000 max
          order: 'desc',
          withMetadata: false
        }],
        id: 1
      })
    });

    const data = await response.json();
    const transfers = data.result?.transfers || [];
    console.log(`Transfers found: ${transfers.length}`);

    // Collect unique addresses (only recipients - "to" addresses)
    const holdersSet = new Set();
    transfers.forEach(t => {
      // Only add "to" addresses (recipients of LP tokens)
      // Exclude burn address
      if (t.to && t.to !== '0x0000000000000000000000000000000000000000') {
        holdersSet.add(t.to.toLowerCase());
      }
    });

    console.log(`Unique holder addresses: ${holdersSet.size}`);

    // Get balances for all addresses
    const contract = getContract({
      address: contractAddress,
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      client: viemClient
    });

    const holders = [];
    const addresses = Array.from(holdersSet);

    // Batch check balances
    const batchSize = 20;
    for (let i = 0; i < Math.min(addresses.length, 100); i += batchSize) {
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
    }

    console.log(`Holders with non-zero balance: ${holders.length}`);

    // Sort by balance descending
    holders.sort((a, b) => {
      const balanceA = BigInt(a.balance);
      const balanceB = BigInt(b.balance);
      return balanceA > balanceB ? -1 : balanceA < balanceB ? 1 : 0;
    });

    return holders;
  } catch (error) {
    console.error('Error fetching LP holders with Alchemy Transfers API:', error);
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

    // Fetch LP token holders using Alchemy Asset Transfers API
    console.log('Calling fetchLPHoldersWithAlchemyTransfers for LP token...');
    const holders = await fetchLPHoldersWithAlchemyTransfers(UNISWAP_V2_POOL, viemClient);

    console.log(`Found ${holders.length} LP token holders`);
    if (holders.length > 0) {
      console.log('First holder sample:', holders[0]);
    }

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

  // Build ENS cache first to get latest ENS data
  await buildENSCache();

  // Include ENS cache timestamp in cache key to invalidate when ENS cache updates
  const cacheKey = `holders:top10:ens${Math.floor(lastCacheUpdate / (5 * 60 * 1000))}`;
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

  // Clean up old holder cache keys (keep only last 2 ENS cache periods)
  try {
    const currentPeriod = Math.floor(lastCacheUpdate / (5 * 60 * 1000));
    const oldKeys = [
      `holders:top10:ens${currentPeriod - 1}`,
      `holders:top10:ens${currentPeriod - 2}`,
      'holders:top10' // Old key format
    ];
    for (const oldKey of oldKeys) {
      await kv.del(oldKey);
    }
  } catch (error) {
    // Ignore cleanup errors
    console.log('Error cleaning up old cache keys:', error);
  }

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

    // Calculate global rank by fetching all holders
    let rank = null;
    try {
      console.log('Calculating global rank for address:', address);

      // Fetch all holders from all sources
      const [zeusHolders, wzeusHolders, lpHolders] = await Promise.all([
        fetchHoldersWithAlchemy(viemClient, ZEUS_TOKEN_ADDRESS, 500),
        fetchHoldersWithAlchemy(viemClient, WZEUS_TOKEN_ADDRESS, 500),
        getUniswapLPHolders(viemClient, decimals)
      ]);

      // Aggregate all holders
      const aggregated = await aggregateHolders(zeusHolders, wzeusHolders, lpHolders);

      // Find the rank of the searched address
      const rankIndex = aggregated.findIndex(holder =>
        holder.address.toLowerCase() === normalizedAddress
      );

      if (rankIndex !== -1) {
        rank = rankIndex + 1;
        console.log(`Found rank ${rank} for address ${address}`);
      } else {
        console.log(`Address ${address} not found in aggregated holders list`);
      }
    } catch (rankError) {
      console.error('Error calculating rank:', rankError);
      // Continue without rank if calculation fails
    }

    return {
      rank: rank,
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
    const { offset = '0', limit = '10', address, lpOnly, lpOffset = '0', lpLimit = '5', wzeusOnly, wzeusOffset = '0', wzeusLimit = '5' } = req.query;
    const offsetNum = parseInt(offset);
    const limitNum = parseInt(limit);
    const lpOffsetNum = parseInt(lpOffset);
    const lpLimitNum = parseInt(lpLimit);
    const wzeusOffsetNum = parseInt(wzeusOffset);
    const wzeusLimitNum = parseInt(wzeusLimit);

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

    // If wzeusOnly is requested, return only wZEUS holders
    if (wzeusOnly === 'true') {
      const wzeusHoldersRaw = await fetchHoldersWithAlchemy(client, WZEUS_TOKEN_ADDRESS, 500);
      const wzeusHoldersSlice = wzeusHoldersRaw.slice(wzeusOffsetNum, wzeusOffsetNum + wzeusLimitNum);

      // Format wZEUS holders with all data
      const wzeusHoldersFormatted = await Promise.all(
        wzeusHoldersSlice.map(async (holder) => {
          const ensName = await resolveENS(holder.address, client);
          const rawBalance = getRawBalance(holder.balance, decimals);
          const usdValue = rawBalance * zeusPrice;
          const supplyPercentage = ((rawBalance / getRawBalance(totalSupply.toString(), decimals)) * 100).toFixed(4);

          return {
            rank: wzeusOffsetNum + wzeusHoldersSlice.indexOf(holder) + 1,
            address: holder.address,
            ensName: ensName,
            zeusBalance: formatBalance('0', decimals),
            wzeusBalance: formatBalance(holder.balance, decimals),
            lpZeusBalance: formatBalance('0', decimals),
            totalBalance: formatBalance(holder.balance, decimals),
            totalBalanceRaw: rawBalance,
            usdValue: usdValue.toFixed(2),
            supplyPercentage: `${supplyPercentage}%`
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: wzeusHoldersFormatted,
        price: zeusPrice,
        marketCap: 0,
        wzeusValue: 0,
        totalSupply: 0,
        wzeusSupply: 0,
        offset: wzeusOffsetNum,
        limit: wzeusLimitNum,
        count: wzeusHoldersFormatted.length,
        totalWZEUSHolders: wzeusHoldersRaw.length
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
