// API route to mint ENS subname using Namespace SDK
const { createOffchainClient } = require('@thenamespace/offchain-manager');

const NAMESPACE_API_KEY = process.env.NAMESPACEAPIKEY;
const PARENT_ENS = 'zeuscc8.eth';

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

  const { subname, address } = req.body;

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
    // Initialize Namespace SDK client
    const client = createOffchainClient({
      defaultApiKey: NAMESPACE_API_KEY,
    });

    // Create subname using SDK
    const result = await client.createSubname({
      parentName: PARENT_ENS,
      label: subname,
      addresses: [
        {
          chain: 'Ethereum', // Using string as per SDK docs
          value: address,
        }
      ],
      texts: [
        {
          key: 'description',
          value: 'Zeus Army Member',
        },
        {
          key: 'url',
          value: 'https://zeusarmy.com',
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
