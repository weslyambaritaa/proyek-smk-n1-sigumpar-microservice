const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid Token Payload' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Extract Identity Error:', err);
    return res.status(500).json({ message: 'Internal Server Error in Identity Extraction' });
  }
};
