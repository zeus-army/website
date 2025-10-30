// API route to get recent ENS subname registrations
const axios = require('axios');

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
    // Get recent subnames using Namespace API
    const response = await axios.post(
      'https://api.namespace.ninja/api/v1/subnames/search',
      {
        parentName: PARENT_ENS,
        page: 1,
        size: 10,
      },
      {
        headers: {
          'x-auth-token': NAMESPACE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Recent subnames fetched successfully:', response.data);

    return res.status(200).json({
      success: true,
      subnames: response.data,
    });
  } catch (error) {
    console.error('Error fetching recent subnames:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401 || status === 403) {
        return res.status(500).json({
          error: 'Authentication error with Namespace API',
          details: 'Please contact support',
        });
      }

      return res.status(500).json({
        error: 'Error fetching recent subnames',
        details: errorData,
      });
    }

    return res.status(500).json({
      error: 'Error fetching recent subnames',
      details: error.message,
    });
  }
};
