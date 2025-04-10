
const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',     // MySQL host
  user: 'root',          // MySQL username (default is root)
  password: '',          // MySQL password (replace with your password)
  database: 'survey_app' // Database name (create this in MySQL)
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error);
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
    
    console.log('Database tables initialized');
    
    // Check if admin user exists, if not create one
    const [admins] = await pool.query('SELECT * FROM users WHERE is_admin = true LIMIT 1');
    
    if (admins.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (email, password, is_admin) VALUES (?, ?, true)',
        ['admin@example.com', hashedPassword]
      );
      
      console.log('Default admin user created: admin@example.com / admin123');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  initDb
};
