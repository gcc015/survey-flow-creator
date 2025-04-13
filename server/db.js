
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import config, { configValidation } from './config.js';

// Create a connection pool with retry logic
const createPool = () => {
  try {
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
    console.error('Error creating MySQL pool:', error);
    return null;
  }
};

const pool = createPool();

// Test the connection with more detailed error reporting
async function testConnection() {
  // If configuration validation failed, return detailed information
  if (!configValidation.valid) {
    console.error('⚠️ Configuration issues detected:');
    configValidation.issues.forEach(issue => console.error(`- ${issue}`));
    console.error('\nPlease create a .env file in the root directory with the following variables:');
    console.error('DB_HOST=localhost');
    console.error('DB_USER=your_mysql_username');
    console.error('DB_PASSWORD=your_mysql_password');
    console.error('DB_DATABASE=surveyflow');
    console.error('JWT_SECRET=your_secret_key_for_jwt_tokens');
    return false;
  }

  if (!pool) {
    console.error('⚠️ MySQL connection pool could not be created');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful!');
    connection.release();
    return true;
  } catch (error) {
    console.error('⚠️ MySQL connection error:', error);
    console.error('\nPlease check your database credentials in the .env file:');
    console.error(`- Host: ${config.DB_HOST}`);
    console.error(`- User: ${config.DB_USER}`);
    console.error(`- Password: ${config.DB_PASSWORD ? '[HIDDEN]' : '[EMPTY]'}`);
    console.error(`- Database: ${config.DB_DATABASE}`);
    console.error('\nMake sure your MySQL server is running and accessible.');
    return false;
  }
}

// Initialize database tables
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
