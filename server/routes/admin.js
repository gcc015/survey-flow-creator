
import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有用户（仅限管理员）
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, is_admin, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// 添加新用户（仅限管理员）
router.post('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    res.status(201).json({
      id: result.insertId,
      email,
      message: '用户创建成功'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: '创建用户失败' });
  }
});

// 删除用户（仅限管理员）
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: '不能删除当前登录的管理员账户' });
    }
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

export default router;
