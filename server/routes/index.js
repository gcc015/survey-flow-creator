
import express from 'express';
import fs from 'fs';
import path from 'path';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import projectsRoutes from './projects.js';

const router = express.Router();

// 简单的健康检查端点，不需要数据库
router.get('/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    database: {
      configured: global.configValidation ? global.configValidation.valid : false,
      connected: global.dbConnected === true
    }
  });
});

// 测试端点 - 不需要身份验证
router.get('/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({ 
    message: '服务器运行正常，API可访问',
    database: {
      configured: global.configValidation ? global.configValidation.valid : false,
      connected: global.dbConnected === true
    },
    env_diagnostics: {
      cwd: process.cwd(),
      env_file_path: path.resolve(process.cwd(), '.env'),
      env_file_exists: fs.existsSync(path.resolve(process.cwd(), '.env'))
    }
  });
});

// 挂载其他路由
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/projects', projectsRoutes);

export default router;
