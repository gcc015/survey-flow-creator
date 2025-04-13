
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  status: 'live' | 'draft';
  created: string;
  responses: number;
}

// API functions
const fetchProjects = async (): Promise<Project[]> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  return response.json();
};

const deleteProject = async (projectId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete project');
  }
  
  return response.json();
};

export const useProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  // Fetch projects from API
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('项目已成功删除');
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除项目失败');
    }
  });

  useEffect(() => {
    if (error) {
      toast.error('获取项目列表失败');
      console.error('Error fetching projects:', error);
    }
  }, [error]);

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除此项目吗？')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return {
    projects,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleDeleteProject
  };
};
