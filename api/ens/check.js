// API route to check ENS subname availability
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
    // Check availability using Namespace API
    // Note: You may need to adjust this endpoint based on Namespace API docs
    const response = await axios.get(
      `https://api.namespace.tech/v1/subnames/${PARENT_ENS}/${subname}`,
      {
        headers: {
          'Authorization': `Bearer ${NAMESPACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // If we get a 200 response, the subname exists (not available)
    return res.status(200).json({ available: false });
  } catch (error) {
    // If we get a 404, the subname doesn't exist (available)
    if (error.response && error.response.status === 404) {
      return res.status(200).json({ available: true });
    }

    // Other errors
    console.error('Error checking availability:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Error checking availability',
      details: error.response?.data || error.message,
    });
  }
};
