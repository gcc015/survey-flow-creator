
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
};

export default config;
