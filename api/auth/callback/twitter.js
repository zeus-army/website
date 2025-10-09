const { kv } = require('@vercel/kv');
const { createPublicClient, http, getContract, parseAbi } = require('viem');
const { mainnet } = require('viem/chains');
const { verifyMessage } = require('viem');

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '[TWITTER_SECRET_REMOVED]';
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'https://zeus.army/api/auth/callback/twitter';
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
const ZEUS_TOKEN_ADDRESS = '0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8';

// Minimal ERC20 ABI for balanceOf
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
]);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect('/?error=missing_params');
    }

    // Decode state to get wallet info
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    const { address, signature, timestamp } = decodedState;

    // Verify signature
    const message = `Welcome to Zeus Army!\n\nBy signing this message, you join the elite ranks of ZEUS holders.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

    let isValid;
    try {
      isValid = await verifyMessage({
        address: address,
        message: message,
        signature: signature
      });
    } catch (error) {
      console.error('Signature verification error:', error);
      return res.redirect('/?error=invalid_signature');
    }

    if (!isValid) {
      return res.redirect('/?error=signature_mismatch');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: CALLBACK_URL,
        code_verifier: 'challenge'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      return res.redirect('/?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('User info error:', errorData);
      return res.redirect('/?error=user_info_failed');
    }

    const userData = await userResponse.json();
    const twitterHandle = `@${userData.data.username}`;

    // Get ZEUS balance
    const client = createPublicClient({
      chain: mainnet,
      transport: http(ETHEREUM_RPC_URL)
    });

    const tokenContract = getContract({
      address: ZEUS_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      client: client
    });

    const [balance, decimals, totalSupply] = await Promise.all([
      tokenContract.read.balanceOf([address]),
      tokenContract.read.decimals(),
      tokenContract.read.totalSupply()
    ]);

    const balanceFormatted = Number(balance) / Math.pow(10, Number(decimals));
    const totalSupplyFormatted = Number(totalSupply) / Math.pow(10, Number(decimals));
    const supplyPercentage = ((balanceFormatted / totalSupplyFormatted) * 100).toFixed(6);

    // Check if wallet already exists
    const existingWallet = await kv.get(`wallet:${address.toLowerCase()}`);

    if (existingWallet) {
      return res.redirect('/?error=already_joined');
    }

    // Store wallet info in Redis
    const walletData = {
      wallet_address: address.toLowerCase(),
      twitter_handle: twitterHandle,
      zeus_balance: balanceFormatted.toString(),
      supply_percentage: `${supplyPercentage}%`,
      timestamp: Date.now()
    };

    await kv.set(`wallet:${address.toLowerCase()}`, JSON.stringify(walletData));

    // Add to sorted set for leaderboard (score is the balance)
    await kv.zadd('leaderboard', {
      score: parseFloat(balanceFormatted),
      member: address.toLowerCase()
    });

    // Redirect back to main page with success
    return res.redirect('/?twitter_connected=true');

  } catch (error) {
    console.error('Twitter callback error:', error);
    return res.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
};
