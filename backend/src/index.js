const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Zeus Army Backend is running!' });
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT wallet_address, ens_name, zeus_balance FROM leaderboard ORDER BY zeus_balance DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit signature and join leaderboard
app.post('/api/join', async (req, res) => {
  const { address, signature, message } = req.body;

  if (!address || !signature || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify the signature
    const expectedMessage = `Welcome to Zeus Army!\n\nBy signing this message, you join the elite ranks of ZEUS holders.\n\nWallet: ${address}\nTimestamp: ${message.timestamp}`;
    const recoveredAddress = ethers.utils.verifyMessage(expectedMessage, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if wallet already exists
    const existingUser = await pool.query(
      'SELECT * FROM leaderboard WHERE wallet_address = $1',
      [address.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Wallet already registered' });
    }

    // Get ENS name (optional)
    let ensName = null;
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${process.env.INFURA_KEY || '9aa3d95b3bc440fa88ea12eaa4456161'}`
      );
      ensName = await provider.lookupAddress(address);
    } catch (error) {
      console.error('Error fetching ENS:', error);
    }

    // Insert into database
    const result = await pool.query(
      'INSERT INTO leaderboard (wallet_address, ens_name, signature) VALUES ($1, $2, $3) RETURNING *',
      [address.toLowerCase(), ensName, signature]
    );

    res.json({
      success: true,
      wallet: result.rows[0]
    });
  } catch (error) {
    console.error('Error joining leaderboard:', error);
    res.status(500).json({ error: 'Failed to join leaderboard' });
  }
});

// Update Zeus balance for a wallet
app.post('/api/update-balance', async (req, res) => {
  const { address, balance } = req.body;

  if (!address || balance === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'UPDATE leaderboard SET zeus_balance = $1 WHERE wallet_address = $2 RETURNING *',
      [balance, address.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      success: true,
      wallet: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Zeus Army Backend running on port ${port}`);
});