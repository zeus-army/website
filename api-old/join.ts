import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './_redis';
import { ethers } from 'ethers';

const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';
const ETHEREUM_RPC = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';

// Minimal ERC20 ABI for balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
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

    // Validate Twitter handle format
    if (!twitterHandle || !twitterHandle.startsWith('@')) {
      return res.status(400).json({ error: 'Twitter handle must start with @' });
    }

    // Verify the signature
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

    // Calculate percentage of total supply
    const TOTAL_SUPPLY = 420.69e12; // 420.69 trillion
    const balanceNum = parseFloat(formattedBalance);
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

    // Save to hash
    await kv.hset(`leaderboard:${address.toLowerCase()}`, entry);

    // Add to set of wallet addresses
    await kv.sadd('leaderboard:wallets', address.toLowerCase());

    return res.status(200).json({
      success: true,
      wallet: entry,
    });
  } catch (error: any) {
    console.error('Error joining leaderboard:', error);
    return res.status(500).json({
      error: 'Failed to join leaderboard',
      details: error.message
    });
  }
}
