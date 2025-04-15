
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateProjectData {
  name: string;
  description?: string;
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

const createProject = async (data: CreateProjectData) => {
  const token = localStorage.getItem('authToken');
  
  console.log('正在创建项目，数据:', data);
  console.log('使用API基础URL:', API_BASE_URL);
  console.log('认证令牌:', token ? '令牌存在' : '无令牌');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    console.log('请求状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('错误响应:', errorText);
      
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || '创建项目失败';
      } catch (e) {
        errorMessage = '创建项目失败: 服务器返回了无效的响应';
      }
      
      throw new Error(errorMessage);
    }
    
    const responseText = await response.text();
    console.log('响应文本:', responseText);
    
    // 处理空响应
    if (!responseText.trim()) {
      return { message: '项目创建成功！', id: Date.now().toString() };
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('解析JSON错误:', e, '响应文本:', responseText);
      return { message: '项目创建成功，但返回数据格式有误', id: Date.now().toString() };
    }
  } catch (error) {
    console.error('创建项目错误:', error);
    throw error;
  }
};

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(data.message || '项目创建成功！');
      navigate(`/projects/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败，请重试');
      console.error('Create error:', error);
    }
  });

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('请输入项目名称');
      return;
    }

    createProjectMutation.mutate({
      name: projectName,
      description: description || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="font-medium">创建新调查</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">项目名称</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="输入项目名称"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">项目描述（可选）</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="输入项目描述"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                取消
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? '创建中...' : '创建项目'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
