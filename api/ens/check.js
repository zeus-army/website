// API route to check ENS subname availability using Namespace SDK
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

  const { subname } = req.query;

  if (!subname) {
    return res.status(400).json({ error: 'Subname is required' });
  }

  // Validate subname format (lowercase alphanumeric and hyphens)
  if (!/^[a-z0-9-]+$/.test(subname)) {
    return res.status(400).json({ error: 'Invalid subname format. Only lowercase letters, numbers, and hyphens are allowed.' });
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

    // Build full subname (e.g., 'alice.zeuscc8.eth')
    const fullSubname = `${subname}.${PARENT_ENS}`;

    // Check availability using SDK
    const result = await client.isSubnameAvailable(fullSubname);

    console.log('Availability check result:', result);

    return res.status(200).json({
      available: result.available
    });
  } catch (error) {
    console.error('Error checking availability:', error);

    // Handle SDK-specific errors
    if (error.name === 'SubnameAlreadyExistsError') {
      return res.status(200).json({ available: false });
    }

    if (error.name === 'SubnameNotFoundError') {
      return res.status(200).json({ available: true });
    }

    return res.status(500).json({
      error: 'Error checking availability',
      details: error.message,
    });
  }
};
