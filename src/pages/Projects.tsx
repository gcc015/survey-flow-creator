
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { toast } from 'sonner';

// Imported Components
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsToolbar from '@/components/projects/ProjectsToolbar';
import ProjectsSearchFilter from '@/components/projects/ProjectsSearchFilter';
import ProjectsTable from '@/components/projects/ProjectsTable';

// Custom Hook
import { useProjects } from '@/hooks/useProjects';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    projects, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    handleDeleteProject 
  } = useProjects();

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('您已成功退出登录');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectsHeader onLogout={handleLogout} />

      <div className="container mx-auto py-8 px-4">
        <ProjectsToolbar onCreateProject={handleCreateProject} />

        <div className="bg-white rounded-lg shadow mb-6">
          <ProjectsSearchFilter 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />

          <div className="overflow-x-auto">
            <ProjectsTable 
              projects={projects}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onProjectClick={handleProjectClick}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
