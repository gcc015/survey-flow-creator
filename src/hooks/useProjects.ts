
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
    return `https://${currentHostname.replace('id-preview--', 'id-api--')}/api`;
  }
  
  // 默认情况下，使用本地开发服务器
  return 'http://localhost:3001';
};

// 使用函数获取API URL
const API_BASE_URL = getApiUrl();

// API 函数
const fetchProjects = async (): Promise<Project[]> => {
  const token = localStorage.getItem('authToken');
  
  console.log('正在获取项目列表...');
  console.log('使用API基础URL:', API_BASE_URL);
  console.log('认证令牌:', token ? '令牌存在' : '无令牌');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('请求状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('错误响应:', errorText);
      throw new Error('获取项目列表失败');
    }
    
    const responseText = await response.text();
    console.log('响应文本长度:', responseText.length);
    
    if (!responseText.trim()) {
      return [];
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('解析JSON错误:', e);
      throw new Error('服务器返回了无效的数据格式');
    }
  } catch (error) {
    console.error('获取项目列表错误:', error);
    throw error;
  }
};

const deleteProject = async (projectId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
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
        errorMessage = errorData.message || '删除项目失败';
      } catch (e) {
        errorMessage = '删除项目失败: 服务器返回了无效的响应';
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
      console.error('解析JSON错误:', e);
      return;
    }
  } catch (error) {
    console.error('删除项目错误:', error);
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
