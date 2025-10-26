const { kv } = require('@vercel/kv');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const providedPassword = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (providedPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Invalid admin password' });
    }

    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Missing wallet address' });
    }

    const addressLower = address.toLowerCase();

    // Delete old structure (if exists)
    await kv.del(`wallet:${addressLower}`);

    // Delete from sorted set (if exists)
    await kv.zrem('leaderboard', addressLower);

    // Delete new structure
    await kv.del(`leaderboard:${addressLower}`);

    // Remove from wallets set
    await kv.srem('leaderboard:wallets', addressLower);

    return res.status(200).json({
      success: true,
      message: `Wallet ${addressLower} deleted from leaderboard`,
      deleted: {
        oldKey: `wallet:${addressLower}`,
        sortedSet: 'leaderboard',
        newHash: `leaderboard:${addressLower}`,
        walletsSet: 'leaderboard:wallets'
      }
    });

  } catch (error) {
    console.error('Delete wallet error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete wallet',
      details: error.message
    });
  }
};
