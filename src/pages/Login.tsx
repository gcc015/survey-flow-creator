
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Logo from '@/components/Logo';
import { useAuth } from '@/App';

// 配置API URL，支持部署环境和本地开发环境
const getApiUrl = () => {
  // 首先尝试从环境变量获取API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 判断当前环境是否是Lovable预览环境
  const isLovableApp = window.location.hostname.includes('lovable.app');
  
  // 如果是Lovable预览环境，使用与当前域名同源的API URL
  if (isLovableApp) {
    // 提取当前域名的主机部分
    const currentHostname = window.location.hostname;
    // 使用相同主机名的API端点，但是端口为3001
    return `https://${currentHostname.replace('id-preview--', 'id-api--')}`;
  }
  
  // 默认情况下，使用本地开发服务器
  return 'http://localhost:3001';
};

// 使用函数获取API URL
const API_BASE_URL = getApiUrl();

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  // Check if already logged in
  useEffect(() => {
    if (checkAuth()) {
      navigate('/projects');
    }
  }, [checkAuth, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email, rememberMe });
      console.log('API URL:', `${API_BASE_URL}/api/auth/login`);
      
      // Send a login request to your backend API
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }
      
      // Store auth token and user info in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authToken', data.token);
      
      // Log token for debugging
      console.log('Token stored in localStorage:', data.token);
      
      toast.success('登录成功！');
      navigate('/projects');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : '邮箱或密码错误，请重试');
      toast.error('登录失败，请检查您的凭证');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo />
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  信任此设备（保持登录状态）
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-brand-500 hover:bg-brand-600" 
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-6 flex justify-center">
          <a href="#" className="text-sm text-brand-500 hover:text-brand-600 hover:underline">
            忘记密码？
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
