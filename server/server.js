
import express from 'express';
import fs from 'fs';
import path from 'path';
import { pool, testConnection, initDb } from './db.js';
import config, { configValidation } from './config.js';
import { setupMiddleware } from './middleware/index.js';
import apiRoutes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 设置全局变量
global.configValidation = configValidation;

// 设置中间件
setupMiddleware(app);

// 挂载 API 路由
app.use('/api', apiRoutes);

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
