// API route to mint ENS subname using Namespace SDK
const { createOffchainClient } = require('@thenamespace/offchain-manager');
const { createPublicClient, http } = require('viem');
const { mainnet } = require('viem/chains');

const NAMESPACE_API_KEY = process.env.NAMESPACEAPIKEY;
const PARENT_ENS = 'zeuscc8.eth';
const PAYMENT_ADDRESS = '0xeD85dd7540b916d909641645d96c738D9e7d0873';
const ALCHEMY_API_KEY = process.env.ALCHEMY || '';
const ETHEREUM_RPC_URL = ALCHEMY_API_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : 'https://eth.llamarpc.com';

// Pricing tiers in USD
const PRICING = {
  premium: 200,  // 1-3 characters
  medium: 50,    // 4-9 characters
  free: 0        // 10+ characters
};

// Calculate expected price based on subname length
function calculateExpectedPrice(subname) {
  const length = subname.length;
  if (length >= 10) return PRICING.free;
  if (length >= 4) return PRICING.medium;
  return PRICING.premium;
}

// Verify payment transaction on blockchain
async function verifyPayment(txHash, expectedUSD, ethPriceUSD) {
  if (expectedUSD === 0) {
    // Free tier, no payment needed
    return { valid: true, reason: 'Free tier' };
  }

  if (!txHash) {
    return { valid: false, reason: 'Payment transaction hash required for paid ENS' };
  }

  try {
    const client = createPublicClient({
      chain: mainnet,
      transport: http(ETHEREUM_RPC_URL)
    });

    const tx = await client.getTransaction({ hash: txHash });

    if (!tx) {
      return { valid: false, reason: 'Transaction not found' };
    }

    // Verify transaction was confirmed
    if (!tx.blockNumber) {
      return { valid: false, reason: 'Transaction not yet confirmed' };
    }

    // Verify recipient is the payment address
    if (tx.to.toLowerCase() !== PAYMENT_ADDRESS.toLowerCase()) {
      return { valid: false, reason: `Payment must be sent to ${PAYMENT_ADDRESS}` };
    }

    // Convert value from wei to ETH
    const valueInEth = Number(tx.value) / 1e18;

    // Calculate minimum required ETH (with 5% tolerance for price fluctuation)
    const expectedEth = expectedUSD / ethPriceUSD;
    const minRequiredEth = expectedEth * 0.95; // 5% tolerance

    if (valueInEth < minRequiredEth) {
      return {
        valid: false,
        reason: `Insufficient payment. Required: ~${expectedEth.toFixed(6)} ETH, Received: ${valueInEth.toFixed(6)} ETH`
      };
    }

    return { valid: true, reason: 'Payment verified' };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { valid: false, reason: `Payment verification failed: ${error.message}` };
  }
}

// Fetch current ETH price in USD
async function getEthPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    // Fallback price if API fails
    return 3000;
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subname, address, txHash } = req.body;

  // Validation
  if (!subname || !address) {
    return res.status(400).json({ error: 'Subname and address are required' });
  }

  // Validate subname format
  if (!/^[a-z0-9-]+$/.test(subname)) {
    return res.status(400).json({ error: 'Invalid subname format' });
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  if (!NAMESPACE_API_KEY) {
    console.error('NAMESPACEAPIKEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Step 1: Calculate expected price
    const expectedPriceUSD = calculateExpectedPrice(subname);
    console.log(`Expected price for "${subname}" (${subname.length} chars): $${expectedPriceUSD}`);

    // Step 2: Verify payment if required
    if (expectedPriceUSD > 0) {
      const ethPrice = await getEthPrice();
      console.log(`Current ETH price: $${ethPrice}`);

      const paymentVerification = await verifyPayment(txHash, expectedPriceUSD, ethPrice);

      if (!paymentVerification.valid) {
        console.error('Payment verification failed:', paymentVerification.reason);
        return res.status(402).json({
          error: 'Payment verification failed',
          details: paymentVerification.reason,
          expectedPrice: expectedPriceUSD,
          txHash: txHash || 'not provided'
        });
      }

      console.log('Payment verified:', paymentVerification.reason);
    } else {
      console.log('Free tier ENS, no payment required');
    }

    // Step 3: Initialize Namespace SDK client and mint
    const client = createOffchainClient({
      defaultApiKey: NAMESPACE_API_KEY,
    });

    // Create subname using SDK
    const result = await client.createSubname({
      parentName: PARENT_ENS,
      label: subname,
      addresses: [
        {
          chain: 'eth', // ChainName.Ethereum = 'eth'
          value: address,
        }
      ],
      texts: [
        {
          key: 'name',
          value: subname,
        },
        {
          key: 'description',
          value: 'Zeus Army Member',
        },
        {
          key: 'url',
          value: 'https://zeus.army',
        },
        {
          key: 'avatar',
          value: 'https://zeus.army/images/zeus-ens-avatar.png',
        }
      ],
    });

    console.log('Subname minted successfully:', result);

    return res.status(200).json({
      success: true,
      message: `${subname}.${PARENT_ENS} has been minted successfully`,
      data: result,
    });
  } catch (error) {
    console.error('Error minting subname:', error);

    // Handle SDK-specific errors
    if (error.name === 'SubnameAlreadyExistsError') {
      return res.status(400).json({
        error: 'Subname already exists',
        details: error.message,
      });
    }

    if (error.name === 'AuthenticationError') {
      return res.status(500).json({
        error: 'Authentication error with Namespace API',
        details: 'Please contact support',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message,
      });
    }

    return res.status(500).json({
      error: 'Error minting subname',
      details: error.message,
    });
  }
};
