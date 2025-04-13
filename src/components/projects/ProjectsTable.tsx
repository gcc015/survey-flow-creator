
import React from 'react';
import ProjectTableHeader from './ProjectTableHeader';
import ProjectTableRow from './ProjectTableRow';

interface Project {
  id: string;
  name: string;
  status: 'live' | 'draft';
  created: string;
  responses: number;
}

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  searchTerm: string;
  onProjectClick: (projectId: string) => void;
  onDeleteProject: (e: React.MouseEvent, projectId: string) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  isLoading,
  searchTerm,
  onProjectClick,
  onDeleteProject
}) => {
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {searchTerm ? '没有找到匹配的项目' : '还没有创建任何项目，点击"新建调查"开始'}
      </div>
    );
  }

  return (
    <table className="w-full">
      <ProjectTableHeader />
      <tbody>
        {filteredProjects.map((project) => (
          <ProjectTableRow
            key={project.id}
            project={project}
            onProjectClick={onProjectClick}
            onDeleteProject={onDeleteProject}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ProjectsTable;
