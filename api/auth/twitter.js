// Twitter OAuth 2.0 credentials
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '5XMxEleWjF3i3brGvBi-drktHoYH-6hZRQP8kHW5CkACnQTc1O';
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'https://www.zeus.army/api/auth/callback/twitter';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get wallet address from query params
    const { address, signature, timestamp } = req.query;

    if (!address || !signature || !timestamp) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Store wallet info in state
    const state = Buffer.from(JSON.stringify({
      address,
      signature,
      timestamp
    })).toString('base64');

    // Generate code challenge for PKCE (optional but recommended)
    const codeChallenge = Buffer.from(Math.random().toString()).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_').substring(0, 43);

    // Build Twitter OAuth 2.0 authorization URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', TWITTER_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', CALLBACK_URL);
    authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'plain');

    res.status(200).json({
      success: true,
      authUrl: authUrl.toString()
    });

  } catch (error) {
    console.error('Twitter auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Twitter authentication',
      details: error.message
    });
  }
};
