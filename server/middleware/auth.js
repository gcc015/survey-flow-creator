
import jwt from 'jsonwebtoken';
import config from '../config.js';

const JWT_SECRET = config.JWT_SECRET;

// 身份验证中间件
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Token verification attempt:', token ? 'Token provided' : 'No token');
  
  if (!token) return res.status(401).json({ message: 'Access denied: No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully for user:', decoded.email);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token', details: error.message });
  }
};

// 管理员中间件
export const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Requires admin privileges' });
  }
  next();
};
