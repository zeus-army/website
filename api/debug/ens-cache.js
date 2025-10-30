// Debug endpoint to check ENS cache status
const { createOffchainClient } = require('@thenamespace/offchain-manager');

const NAMESPACE_API_KEY = process.env.NAMESPACEAPIKEY;
const PARENT_ENS = 'zeuscc8.eth';

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is configured
    if (!NAMESPACE_API_KEY) {
      return res.status(500).json({
        error: 'NAMESPACE_API_KEY not configured',
        configured: false
      });
    }

    // Try to fetch subdomains
    const client = createOffchainClient({
      defaultApiKey: NAMESPACE_API_KEY,
    });

    const result = await client.getFilteredSubnames({
      parentName: PARENT_ENS,
      page: 1,
      size: 5
    });

    const subnames = result.items || result.data || result || [];

    // Build cache map
    const cacheMap = {};
    for (const subname of subnames) {
      const ensFullName = subname.fullName || (subname.label ? `${subname.label}.${PARENT_ENS}` : null);

      if (subname.addresses && subname.addresses['60']) {
        const ethAddress = subname.addresses['60'];
        cacheMap[ethAddress.toLowerCase()] = ensFullName;
      }
    }

    return res.status(200).json({
      success: true,
      configured: true,
      apiKeyPresent: !!NAMESPACE_API_KEY,
      apiKeyLength: NAMESPACE_API_KEY ? NAMESPACE_API_KEY.length : 0,
      totalSubnames: subnames.length,
      cacheSize: Object.keys(cacheMap).length,
      subnames: subnames.map(s => ({
        fullName: s.fullName,
        label: s.label,
        addresses: s.addresses
      })),
      cacheMap
    });
  } catch (error) {
    console.error('Error in ENS cache debug:', error);
    return res.status(500).json({
      error: 'Error fetching ENS cache',
      details: error.message,
      stack: error.stack
    });
  }
};
