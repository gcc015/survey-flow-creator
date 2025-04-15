
import express from 'express';
import fs from 'fs';
import path from 'path';
import { configureCors } from '../utils/cors.js';

// 设置需要数据库的路由的回退中间件
export const dbRequiredMiddleware = (req, res, next) => {
  if (!global.dbConnected) {
    return res.status(503).json({ 
      message: '数据库连接错误，请检查服务器配置',
      details: 'Database connection is not available. Please check server configuration.',
      configuration_valid: global.configValidation ? global.configValidation.valid : false,
      issues: global.configValidation ? global.configValidation.issues : ['配置验证未完成'],
      env_diagnostics: {
        cwd: process.cwd(),
        env_file_path: path.resolve(process.cwd(), '.env'),
        env_file_exists: fs.existsSync(path.resolve(process.cwd(), '.env'))
      }
    });
  }
  next();
};

// 请求日志中间件
export const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} 来源: ${req.get('origin') || '直接请求'}`);
  next();
};

// 配置应用中间件
export const setupMiddleware = (app) => {
  // 应用 CORS 中间件
  app.use(configureCors());
  
  // 应用 JSON 解析中间件
  app.use(express.json());
  
  // 应用请求日志中间件
  app.use(requestLogger);
  
  // 对所有需要数据库的路由使用 db 中间件
  app.use('/api/auth', dbRequiredMiddleware);
  app.use('/api/admin', dbRequiredMiddleware);
  app.use('/api/projects', dbRequiredMiddleware);
};
