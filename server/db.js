
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import config, { configValidation } from './config.js';

// 创建连接池，带有重试逻辑
const createPool = () => {
  try {
    console.log('尝试创建数据库连接池:');
    console.log(`- Host: ${config.DB_HOST}`);
    console.log(`- User: ${config.DB_USER ? config.DB_USER : '未设置'}`);
    console.log(`- Password: ${config.DB_PASSWORD ? '[已隐藏]' : '未设置'}`);
    console.log(`- Database: ${config.DB_DATABASE ? config.DB_DATABASE : '未设置'}`);
    
    return mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (error) {
    console.error('创建 MySQL 连接池错误:', error);
    return null;
  }
};

const pool = createPool();

// 测试连接，提供更详细的错误报告
async function testConnection() {
  // 如果配置验证失败，返回详细信息
  if (!configValidation.valid) {
    console.error('⚠️ 检测到配置问题:');
    configValidation.issues.forEach(issue => console.error(`- ${issue}`));
    console.error('\n请在根目录中创建 .env 文件，包含以下变量:');
    console.error('DB_HOST=localhost');
    console.error('DB_USER=你的MySQL用户名');
    console.error('DB_PASSWORD=你的MySQL密码');
    console.error('DB_DATABASE=surveyflow');
    console.error('JWT_SECRET=用于JWT令牌的密钥');
    return false;
  }

  if (!pool) {
    console.error('⚠️ MySQL 连接池无法创建');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL 连接成功!');
    connection.release();
    return true;
  } catch (error) {
    console.error('⚠️ MySQL 连接错误:', error);
    console.error('\n请检查 .env 文件中的数据库凭据:');
    console.error(`- Host: ${config.DB_HOST}`);
    console.error(`- User: ${config.DB_USER ? config.DB_USER : '未设置'}`);
    console.error(`- Password: ${config.DB_PASSWORD ? '[已隐藏]' : '未设置'}`);
    console.error(`- Database: ${config.DB_DATABASE ? config.DB_DATABASE : '未设置'}`);
    console.error('\n确保您的 MySQL 服务器正在运行并可访问。');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('错误: 无法连接到 MySQL 服务器。请确保 MySQL 服务已启动。');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('错误: 访问被拒绝。请检查您的用户名和密码。');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('错误: 数据库不存在。请创建数据库或更正数据库名称。');
    }
    
    return false;
  }
}

// 初始化数据库表
async function initDb() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create projects table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INT NOT NULL,
        status ENUM('live', 'draft') DEFAULT 'draft',
        responses INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Database tables initialized');
    
    // Check if admin user exists, if not create one
    const [admins] = await pool.query('SELECT * FROM users WHERE is_admin = true LIMIT 1');
    
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (email, password, is_admin) VALUES (?, ?, true)',
        ['admin@example.com', hashedPassword]
      );
      
      console.log('✅ Default admin user created: admin@example.com / admin123');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
}

export {
  pool,
  testConnection,
  initDb
};
