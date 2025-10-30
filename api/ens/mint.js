// API route to mint ENS subname using Namespace API
const axios = require('axios');

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
    // Mint subname using Namespace API
    // Reference: https://docs.namespace.tech/dev-docs/offchain-subnames-api/minting/create-a-new-ens-subname
    const response = await axios.post(
      'https://api.namespace.tech/v1/subnames',
      {
        parent: PARENT_ENS,
        label: subname,
        owner: address,
        // Set address record to point to the owner's address
        addresses: {
          eth: address,
        },
        // Optional: Add text records
        texts: {
          description: 'Zeus Army Member',
          url: 'https://zeusarmy.com',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${NAMESPACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Subname minted successfully:', response.data);

    return res.status(200).json({
      success: true,
      message: `${subname}.${PARENT_ENS} has been minted successfully`,
      data: response.data,
    });
  } catch (error) {
    console.error('Error minting subname:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 409) {
        return res.status(400).json({
          error: 'Subname already exists',
          details: errorData,
        });
      }

      if (status === 401 || status === 403) {
        return res.status(500).json({
          error: 'Authentication error with Namespace API',
          details: 'Please contact support',
        });
      }

      return res.status(500).json({
        error: 'Error minting subname',
        details: errorData,
      });
    }

    return res.status(500).json({
      error: 'Error minting subname',
      details: error.message,
    });
  }
};
