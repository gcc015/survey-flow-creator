
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import config from '../config.js';

const router = express.Router();
const JWT_SECRET = config.JWT_SECRET;

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    console.log('Login attempt for:', email, 'Remember me:', rememberMe);
    
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }
    
    // 检查用户是否存在
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    const user = users[0];
    
    // 比较密码
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 设置令牌过期时间 - 根据"记住我"选项
    const expiresIn = rememberMe ? '7d' : '24h';
    console.log('Setting token expiry to:', expiresIn);
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn }
    );
    
    console.log('User logged in successfully:', email);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误，请稍后再试' });
  }
});

// 验证令牌有效性的路由
router.get('/verify-token', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ valid: false, message: 'Invalid or expired token' });
  }
});

export default router;
