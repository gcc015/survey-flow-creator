
import cors from 'cors';

// 允许的源列表
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://e1ce44ec-a95b-47c7-afa8-1d6491e4facc.lovableproject.com'
];

// 配置 CORS
export const configureCors = () => {
  // 动态添加Lovable域名
  if (process.env.LOVABLE_DOMAIN) {
    allowedOrigins.push(`https://${process.env.LOVABLE_DOMAIN}`);
  }

  return cors({
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
  });
};
