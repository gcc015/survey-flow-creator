
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, createContext, useContext, useState, useCallback } from "react";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectEditor from "./pages/ProjectEditor";
import CreateProject from "./pages/CreateProject";
import SurveyChat from "./pages/SurveyChat";
import SurveyResults from "./pages/SurveyResults";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import jwt_decode from "jwt-decode";

const queryClient = new QueryClient();

// 创建认证上下文
interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  checkAuth: () => false,
  logout: () => {},
  refreshAuth: () => {},
});

export const useAuth = () => useContext(AuthContext);

// 检查令牌是否过期
const isTokenExpired = (token: string) => {
  try {
    const decoded: any = jwt_decode(token);
    // 检查令牌是否已过期，考虑30秒的缓冲时间
    return decoded.exp * 1000 < Date.now() - 30000;
  } catch (error) {
    console.error('Token decode error:', error);
    return true; // 如果解析失败，认为令牌无效
  }
};

// 认证提供者组件
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // 刷新认证状态，比如在app加载时或者操作后
  const refreshAuth = useCallback(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('authToken');
    
    if (isLoggedIn && token) {
      const tokenExpired = isTokenExpired(token);
      console.log('Token expired check:', tokenExpired);
      
      if (tokenExpired) {
        // 令牌已过期，注销用户
        console.log('Token expired, logging out');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    }
    
    setIsAuthenticated(false);
    return false;
  }, []);
  
  // 检查认证状态
  const checkAuth = useCallback(() => {
    return refreshAuth();
  }, [refreshAuth]);
  
  // 登出功能
  const logout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  }, []);
  
  // 组件挂载时检查认证状态
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!checkAuth()) {
      navigate('/login');
    }
  }, [checkAuth, navigate]);
  
  if (!checkAuth()) {
    return null; // 返回null，避免闪烁
  }
  
  return <>{children}</>;
};

const App = () => {
  // 记录路由以便调试
  useEffect(() => {
    console.log('Current route:', window.location.pathname);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects/:projectId" 
                element={
                  <ProtectedRoute>
                    <ProjectEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-project" 
                element={
                  <ProtectedRoute>
                    <CreateProject />
                  </ProtectedRoute>
                } 
              />
              <Route path="/survey/:surveyId" element={<SurveyChat />} />
              <Route 
                path="/results/:surveyId" 
                element={
                  <ProtectedRoute>
                    <SurveyResults />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
