
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Check, Filter, MoreHorizontal, 
  ChevronDown, AlignJustify, BarChart3, LogOut 
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

interface Project {
  id: string;
  name: string;
  status: 'live' | 'draft';
  created: string;
  responses: number;
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for projects
  const [projects] = useState<Project[]>([
    { 
      id: 'FS-DRD-1316795-T2B7-市场调研类-290421', 
      name: 'FS-DRD-1316795-T2B7-市场调研类-290421', 
      status: 'live', 
      created: '04/05/2023', 
      responses: 732 
    },
    { 
      id: 'FS-DRD-1292929-S856-Female-study-Verson-BIB-2202264', 
      name: 'FS-DRD-1292929-S856-Female-study-Verson-BIB-2202264', 
      status: 'live', 
      created: '04/07/2023', 
      responses: 495 
    },
    { 
      id: 'Copy-of-用-隐藏的标-准设', 
      name: 'Copy of 用 隐藏的标 准设', 
      status: 'draft', 
      created: '04/08/2023', 
      responses: 0 
    },
    { 
      id: 'Copy-of-FS-市-场营-销耐用消费-品报-告-230424', 
      name: 'Copy of FS 市 场营 销耐用消费 品报 告 230424', 
      status: 'draft', 
      created: '04/10/2023', 
      responses: 0 
    },
    { 
      id: 'FS-营销服务市场规范问卷-2369351', 
      name: 'FS 营销服务市场规范问卷 2369351', 
      status: 'live', 
      created: '04/12/2023', 
      responses: 968 
    },
    { 
      id: 'Survey_Test', 
      name: 'Survey_Test', 
      status: 'draft', 
      created: '03/26/2023', 
      responses: 529 
    },
    { 
      id: 'FS-DRD-1231465-CMC7-D04-2920395', 
      name: 'FS-DRD-1231465-CMC7-D04-2920395', 
      status: 'live', 
      created: '03/25/2023', 
      responses: 533 
    },
  ]);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
