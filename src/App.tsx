
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, createContext, useContext, useState } from "react";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectEditor from "./pages/ProjectEditor";
import CreateProject from "./pages/CreateProject";
import SurveyChat from "./pages/SurveyChat";
import SurveyResults from "./pages/SurveyResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  checkAuth: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Auth provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  
  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('authToken');
    
    // You could also verify token validity here
    setIsAuthenticated(isLoggedIn && !!token);
    return isLoggedIn && !!token;
  };
  
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { checkAuth } = useAuth();
  
  if (!checkAuth()) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Log the route for debugging
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
