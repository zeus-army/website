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

    // Get ALL subnames from SDK (not just page 1)
    let allSubnames = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await client.getFilteredSubnames({
        parentName: PARENT_ENS,
        page: page,
        size: 100,
      });

      const pageData = result.data || result.items || result;
      if (Array.isArray(pageData) && pageData.length > 0) {
        allSubnames = allSubnames.concat(pageData);
        hasMore = pageData.length === result.size;
        page++;
      } else {
        hasMore = false;
      }
    }

    console.log(`Fetched ${allSubnames.length} total subnames`);

    // Get the last 9 and reverse them (newest first)
    const last9 = allSubnames.slice(-9).reverse();

    console.log('Showing last 9 reversed (newest first)');

    // Return data in a format compatible with the frontend
    return res.status(200).json({
      success: true,
      subnames: {
        items: last9,
        total: allSubnames.length,
        page: 1,
        size: 9,
      },
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
