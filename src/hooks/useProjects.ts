
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
  
  console.log('Fetching projects with token:', token ? 'token exists' : 'no token');
  
  try {
    const response = await fetch('http://localhost:3001/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Failed to fetch projects');
    }
    
    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    
    if (!responseText.trim()) {
      return [];
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Fetch projects error:', error);
    throw error;
  }
};

const deleteProject = async (projectId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || 'Failed to delete project';
      } catch (e) {
        errorMessage = 'Failed to delete project: Invalid server response';
      }
      
      throw new Error(errorMessage);
    }
    
    const responseText = await response.text();
    
    if (!responseText.trim()) {
      return;
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return;
    }
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
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
