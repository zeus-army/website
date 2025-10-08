import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './_redis';

interface LeaderboardEntry {
  wallet_address: string;
  twitter_handle: string;
  zeus_balance: string;
  supply_percentage?: string;
  timestamp: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
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

    // Get all wallet addresses from the set
    const walletAddresses = await kv.smembers('leaderboard:wallets') || [];

    // Fetch all entries
    const entries: LeaderboardEntry[] = [];

    for (const address of walletAddresses as string[]) {
      const entry = await kv.hgetall(`leaderboard:${address}`) as any;
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

    // Sort by balance (descending)
    entries.sort((a, b) => parseFloat(b.zeus_balance) - parseFloat(a.zeus_balance));

    return res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
