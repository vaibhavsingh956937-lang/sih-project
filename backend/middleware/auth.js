const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-access-token'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    const secret = process.env.JWT_SECRET || 'ayush_opd_secret_key_2026_secure';
    const decoded = jwt.verify(token, secret);
    req.doctor = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
};

module.exports = { requireAuth };
