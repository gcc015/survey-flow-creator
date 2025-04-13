
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Check, Filter, MoreHorizontal, 
  ChevronDown, AlignJustify, BarChart3, LogOut, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/App';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
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

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除此项目吗？')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('您已成功退出登录');
    navigate('/login');
  };

  // Get initials for avatar
  const getUserInitials = () => {
    const email = localStorage.getItem('userEmail') || '';
    if (email) {
      // Get first letter of email or first two letters before @
      const parts = email.split('@');
      if (parts[0].length >= 2) {
        return parts[0].substring(0, 2).toUpperCase();
      } else {
        return email.substring(0, 1).toUpperCase();
      }
    }
    return 'JP'; // Default fallback
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-lg font-medium mr-1">DeepSurvey</div>
          <div className="text-sm text-gray-300"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white hover:bg-gray-800"
            >
              <AlignJustify className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white hover:bg-gray-800"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold">所有调查</h1>
            <ChevronDown className="w-4 h-4" />
          </div>
          <Button 
            onClick={handleCreateProject} 
            className="bg-brand-500 hover:bg-brand-600"
          >
            <Plus className="mr-2 h-4 w-4" /> 新建调查
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex items-center p-4 border-b">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 w-full"
                  placeholder="搜索项目..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="ml-4">
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                筛选
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Projects Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">加载中...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? '没有找到匹配的项目' : '还没有创建任何项目，点击"新建调查"开始'}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="w-12 px-4 py-3 text-left">
                      <div className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">名称</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">状态</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">创建日期</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">构建</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">回复数</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">报告</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${project.status === 'live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {project.status === 'live' ? 'LIVE' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-500">
                        {project.created}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button size="icon" variant="ghost">
                          <Check className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-blue-600">
                        {project.responses}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button size="icon" variant="ghost">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={(e) => handleDeleteProject(e, project.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>删除项目</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
