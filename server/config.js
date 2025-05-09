
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 项目根目录的路径
const rootDir = process.cwd();
console.log('当前工作目录 (CWD):', rootDir);

// 检查 .env 文件是否存在
const envPath = path.resolve(rootDir, '.env');
console.log('正在检查 .env 文件:', envPath);

// 尝试查找和加载 .env 文件
let envExists = fs.existsSync(envPath);
console.log('.env 文件是否存在:', envExists ? '是' : '否');

// 如果当前目录没有 .env 文件，尝试向上查找一级 
if (!envExists) {
  const parentDirEnvPath = path.resolve(rootDir, '..', '.env');
  console.log('尝试在上级目录查找 .env 文件:', parentDirEnvPath);
  
  if (fs.existsSync(parentDirEnvPath)) {
    console.log('在上级目录找到 .env 文件');
    dotenv.config({ path: parentDirEnvPath });
    envExists = true;
  }
} else {
  // 加载找到的 .env 文件
  dotenv.config({ path: envPath });
}

// 如果仍未找到 .env 文件，显示目录列表以帮助诊断
if (!envExists) {
  console.log('根目录下的文件列表:');
  try {
    const files = fs.readdirSync(rootDir);
    files.forEach(file => {
      console.log(`- ${file} (${path.resolve(rootDir, file)})`);
    });
  } catch (error) {
    console.error('无法读取目录内容:', error.message);
  }
}

// 打印环境变量列表（仅用于调试）
console.log('\n环境变量检查:');
console.log('DB_HOST:', process.env.DB_HOST || '未设置');
console.log('DB_USER:', process.env.DB_USER || '未设置');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[已设置]' : '未设置');
console.log('DB_DATABASE:', process.env.DB_DATABASE || '未设置');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[已设置]' : '未设置');

// 默认配置，提供回退值
const config = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'surveyflow',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
};

// 配置验证函数
const validateConfig = () => {
  const issues = [];

  if (!envExists) {
    issues.push(`没有找到 .env 文件。请在 ${rootDir} 目录下创建 .env 文件。`);
  }

  if (!process.env.DB_USER) {
    issues.push('在 .env 文件中未设置 DB_USER');
  }

  if (!process.env.DB_PASSWORD) {
    issues.push('在 .env 文件中未设置 DB_PASSWORD');
  }

  if (!process.env.DB_DATABASE) {
    issues.push('在 .env 文件中未设置 DB_DATABASE');
  }

  // 在控制台输出用于调试
  if (issues.length > 0) {
    console.log('\n环境变量诊断:');
    issues.forEach(issue => console.log(`- ${issue}`));
    console.log('\n.env 文件应包含以下内容:');
    console.log('DB_HOST=localhost');
    console.log('DB_USER=你的MySQL用户名');
    console.log('DB_PASSWORD=你的MySQL密码');
    console.log('DB_DATABASE=surveyflow');
    console.log('JWT_SECRET=用于JWT令牌的密钥');
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

// 执行配置验证
export const configValidation = validateConfig();

// 导出配置对象
export default config;
