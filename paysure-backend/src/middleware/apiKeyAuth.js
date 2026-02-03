const crypto = require('crypto');

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const expectedKey = process.env.API_KEY_SECRET;
  
  if (apiKey !== expectedKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
};

const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { apiKeyAuth, generateApiKey };
