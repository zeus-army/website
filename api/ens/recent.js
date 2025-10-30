// API route to get recent ENS subname registrations using Namespace SDK
const { createOffchainClient } = require('@thenamespace/offchain-manager');

const NAMESPACE_API_KEY = process.env.NAMESPACEAPIKEY;
const PARENT_ENS = 'zeuscc8.eth';

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Get recent subnames using SDK
    const result = await client.getFilteredSubnames({
      parentName: PARENT_ENS,
      page: 1,
      size: 10,
    });

    console.log('Recent subnames fetched successfully:', result);

    return res.status(200).json({
      success: true,
      subnames: result,
    });
  } catch (error) {
    console.error('Error fetching recent subnames:', error);

    // Handle SDK-specific errors
    if (error.name === 'AuthenticationError') {
      return res.status(500).json({
        error: 'Authentication error with Namespace API',
        details: 'Please contact support',
      });
    }

    return res.status(500).json({
      error: 'Error fetching recent subnames',
      details: error.message,
    });
  }
};
