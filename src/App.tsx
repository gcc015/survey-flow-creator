
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectEditor from "./pages/ProjectEditor";
import CreateProject from "./pages/CreateProject";
import SurveyChat from "./pages/SurveyChat";
import SurveyResults from "./pages/SurveyResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simple auth check
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/projects" 
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/projects/:projectId" 
              element={
                <PrivateRoute>
                  <ProjectEditor />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/create-project" 
              element={
                <PrivateRoute>
                  <CreateProject />
                </PrivateRoute>
              } 
            />
            <Route path="/survey/:surveyId" element={<SurveyChat />} />
            <Route 
              path="/results/:surveyId" 
              element={
                <PrivateRoute>
                  <SurveyResults />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
