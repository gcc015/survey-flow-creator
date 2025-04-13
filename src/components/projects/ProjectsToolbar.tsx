
import React from 'react';
import { ChevronDown, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsToolbarProps {
  onCreateProject: () => void;
  isLoading?: boolean;
}

const ProjectsToolbar: React.FC<ProjectsToolbarProps> = ({ 
  onCreateProject, 
  isLoading = false 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold">所有调查</h1>
        <ChevronDown className="w-4 h-4" />
      </div>
      <Button 
        onClick={onCreateProject} 
        className="bg-brand-500 hover:bg-brand-600"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 加载中...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" /> 新建调查
          </>
        )}
      </Button>
    </div>
  );
};

export default ProjectsToolbar;
