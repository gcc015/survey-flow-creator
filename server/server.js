
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { pool, testConnection, initDb } from './db.js';
import config, { configValidation } from './config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// JWT 密钥
const JWT_SECRET = config.JWT_SECRET;

// 允许的源列表
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://e1ce44ec-a95b-47c7-afa8-1d6491e4facc.lovableproject.com'
];

// 动态添加Lovable域名
if (process.env.LOVABLE_DOMAIN) {
  allowedOrigins.push(`https://${process.env.LOVABLE_DOMAIN}`);
}

// 中间件
app.use(cors({
  origin: function(origin, callback) {
    // 允许没有来源的请求（如Postman或curl直接请求）
    if (!origin) return callback(null, true);
    
    // 检查是否来自允许的来源
    if (allowedOrigins.indexOf(origin) === -1) {
      // 检查是否是Lovable预览环境
      if (origin.includes('lovable.app')) {
        return callback(null, true);
      }
      
      const msg = `此源 ${origin} 未被CORS策略允许`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} 来源: ${req.get('origin') || '直接请求'}`);
  next();
});

// 简单的健康检查端点，不需要数据库
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    database: {
      configured: configValidation.valid,
      connected: global.dbConnected === true
    }
  });
});

// 测试端点 - 不需要身份验证
app.get('/api/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({ 
    message: '服务器运行正常，API可访问',
    database: {
      configured: configValidation.valid,
      connected: global.dbConnected === true
    },
    env_diagnostics: {
      cwd: process.cwd(),
      env_file_path: path.resolve(process.cwd(), '.env'),
      env_file_exists: fs.existsSync(path.resolve(process.cwd(), '.env'))
    }
  });
});

// 设置需要数据库的路由的回退中间件
const dbRequiredMiddleware = (req, res, next) => {
  if (!global.dbConnected) {
    return res.status(503).json({ 
      message: '数据库连接错误，请检查服务器配置',
      details: 'Database connection is not available. Please check server configuration.',
      configuration_valid: configValidation.valid,
      issues: configValidation.issues,
      env_diagnostics: {
        cwd: process.cwd(),
        env_file_path: path.resolve(process.cwd(), '.env'),
        env_file_exists: fs.existsSync(path.resolve(process.cwd(), '.env'))
      }
    });
  }
  next();
};

// 身份验证中间件
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

// 管理员中间件
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Requires admin privileges' });
  }
  next();
};

// 对所有需要数据库的路由使用 db 中间件
app.use('/api/auth', dbRequiredMiddleware);
app.use('/api/admin', dbRequiredMiddleware);
app.use('/api/projects', dbRequiredMiddleware);

// 登录路由
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

// 获取所有用户（仅限管理员）
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, is_admin, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// 添加新用户（仅限管理员）
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

// 删除用户（仅限管理员）
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

// 项目 API 端点
// 获取已验证用户的所有项目
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/projects - User ID:', req.user.id);
    
    const [projects] = await pool.query(
      'SELECT id, name, status, DATE_FORMAT(created_at, "%m/%d/%Y") as created, responses FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    console.log('Projects found:', projects.length);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: '获取项目列表失败' });
  }
});

// 创建新项目
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/projects - Request body:', req.body);
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '项目名称不能为空' });
    }
    
    // Generate a unique project ID
    const projectId = `FS-${Date.now().toString().substring(6)}-${name.substring(0, 5).replace(/\s+/g, '-')}`;
    
    console.log('Generated project ID:', projectId);
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the project into the projects table
      const [result] = await connection.query(
        'INSERT INTO projects (id, name, description, user_id, status, responses) VALUES (?, ?, ?, ?, ?, ?)',
        [projectId, name, description || '', req.user.id, 'draft', 0]
      );
      
      console.log('Project inserted, creating project_questions table');
      
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
      
      console.log('Creating project_responses table');
      
      // Create a project_responses table for this project
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_responses_${projectId.replace(/[^a-zA-Z0-9]/g, '_')} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          response_data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await connection.commit();
      
      console.log('Project creation successful');
      
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
      console.error('Error in transaction:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: '创建项目失败: ' + error.message });
  }
});

// 删除项目
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const sanitizedId = projectId.replace(/[^a-zA-Z0-9]/g, '_');

    console.log(`DELETE /api/projects/${projectId} - User ID: ${req.user.id}`);

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
      
      console.log('Project found, deleting from projects table');
      
      // Delete the project
      await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);
      
      console.log('Dropping project_questions table');
      
      // Drop the project_questions table
      await connection.query(`DROP TABLE IF EXISTS project_questions_${sanitizedId}`);
      
      console.log('Dropping project_responses table');
      
      // Drop the project_responses table
      await connection.query(`DROP TABLE IF EXISTS project_responses_${sanitizedId}`);
      
      await connection.commit();
      
      console.log('Project deletion successful');
      
      res.json({ message: '项目删除成功' });
    } catch (error) {
      console.error('Error in transaction:', error);
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

// 错误处理中间件（必须在所有路由之后定义）
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: '服务器内部错误', error: err.message });
});

// 404 处理程序（必须在最后）
app.use((req, res) => {
  console.log(`Request for non-existent route: ${req.originalUrl}`);
  res.status(404).json({ message: '路由不存在' });
});

// 启动服务器函数，增强调试功能
async function startServer() {
  try {
    console.log('正在尝试启动服务器...');
    
    // 打印一些诊断信息
    console.log('当前工作目录:', process.cwd());
    console.log('.env 文件路径:', path.resolve(process.cwd(), '.env'));
    console.log('.env 文件是否存在:', fs.existsSync(path.resolve(process.cwd(), '.env')) ? '是' : '否');
    
    if (!fs.existsSync(path.resolve(process.cwd(), '.env'))) {
      console.log('根目录下的文件:');
      try {
        const files = fs.readdirSync(process.cwd());
        files.forEach(file => console.log(`- ${file}`));
      } catch (err) {
        console.error('无法读取目录:', err);
      }
    }
    
    // 测试数据库连接
    console.log('测试数据库连接...');
    global.dbConnected = await testConnection();
    
    if (global.dbConnected) {
      console.log('数据库连接成功!');
      
      // 初始化数据库表
      console.log('初始化数据库表...');
      await initDb();
      console.log('数据库表初始化完成!');
    } else {
      console.warn('⚠️ 正在启动服务器，但数据库功能有限。某些功能将受到限制。');
      console.warn('⚠️ 请检查您的数据库配置，并在修复后重新启动服务器。');
    }
    
    // 启动 Express 服务器
    app.listen(PORT, () => {
      console.log(`✅ 服务器运行在端口 ${PORT}`);
      console.log(`📡 API 端点可在 http://localhost:${PORT}/api 访问`);
      console.log(`🔍 测试端点: http://localhost:${PORT}/api/test`);
      console.log(`❤️ 健康检查: http://localhost:${PORT}/api/health`);
      
      if (!global.dbConnected) {
        console.log('\n⚠️ 数据库连接失败 ⚠️');
        console.log('服务器正在以有限功能运行。');
        console.log('依赖数据库的功能在修复之前将无法工作。');
        console.log('\n请确保:');
        console.log('1. 您已创建 .env 文件在项目根目录中');
        console.log('2. .env 文件包含必要的数据库凭据');
        console.log('3. MySQL 服务器正在运行且可访问');
        console.log('\n示例 .env 文件内容:');
        console.log('DB_HOST=localhost');
        console.log('DB_USER=你的MySQL用户名');
        console.log('DB_PASSWORD=你的MySQL密码');
        console.log('DB_DATABASE=surveyflow');
        console.log('JWT_SECRET=用于JWT令牌的密钥');
      }
    });
  } catch (error) {
    console.error('❌ 启动服务器错误:', error);
  }
}

// 调用函数启动服务器
console.log('正在启动应用服务器...');
startServer();
