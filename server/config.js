
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

// Load environment variables from .env file
dotenv.config();

// Default configuration with fallbacks
const config = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'surveyflow',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
};

// Function to validate configuration
const validateConfig = () => {
  const issues = [];

  if (!envExists) {
    issues.push('No .env file found. Please create a .env file in the root directory.');
  }

  if (!process.env.DB_USER) {
    issues.push('DB_USER is not set in .env file');
  }

  if (!process.env.DB_PASSWORD) {
    issues.push('DB_PASSWORD is not set in .env file');
  }

  if (!process.env.DB_DATABASE) {
    issues.push('DB_DATABASE is not set in .env file');
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

export const configValidation = validateConfig();
export default config;
