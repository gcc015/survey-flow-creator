
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, testConnection, initDb } from './db.js';
import config from './config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// JWT secret key from config
const JWT_SECRET = config.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Requires admin privileges' });
  }
  next();
};

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
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

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, is_admin, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Add a new user (admin only)
app.post('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
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

// Delete a user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
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

// Projects API endpoints
// Get all projects for the authenticated user
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const [projects] = await pool.query(
      'SELECT id, name, status, DATE_FORMAT(created_at, "%m/%d/%Y") as created, responses FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: '获取项目列表失败' });
  }
});

// Create a new project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '项目名称不能为空' });
    }
    
    // Generate a unique project ID
    const projectId = `FS-${Date.now().toString().substring(6)}-${name.substring(0, 5).replace(/\s+/g, '-')}`;
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the project into the projects table
      const [result] = await connection.query(
        'INSERT INTO projects (id, name, description, user_id, status, responses) VALUES (?, ?, ?, ?, ?, ?)',
        [projectId, name, description || '', req.user.id, 'draft', 0]
      );
      
      // Create a project_questions table for this project
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_questions_${projectId.replace(/[^a-zA-Z0-9]/g, '_')} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL,
          options JSON,
          required BOOLEAN DEFAULT false,
          order_index INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create a project_responses table for this project
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_responses_${projectId.replace(/[^a-zA-Z0-9]/g, '_')} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          response_data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await connection.commit();
      
      res.status(201).json({
        id: projectId,
        name,
        description: description || '',
        status: 'draft',
        created: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        responses: 0,
        message: '项目创建成功'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: '创建项目失败' });
  }
});

// Delete a project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const sanitizedId = projectId.replace(/[^a-zA-Z0-9]/g, '_');

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if project exists and belongs to the user
      const [projects] = await connection.query(
        'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        [projectId, req.user.id]
      );
      
      if (projects.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: '项目不存在或无权限删除' });
      }
      
      // Delete the project
      await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);
      
      // Drop the project_questions table
      await connection.query(`DROP TABLE IF EXISTS project_questions_${sanitizedId}`);
      
      // Drop the project_responses table
      await connection.query(`DROP TABLE IF EXISTS project_responses_${sanitizedId}`);
      
      await connection.commit();
      
      res.json({ message: '项目删除成功' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: '删除项目失败' });
  }
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    // Initialize database tables
    await initDb();
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.error('Could not connect to database. Server not started.');
  }
}

startServer();
