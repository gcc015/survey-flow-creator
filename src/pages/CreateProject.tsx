
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

const createProject = async (data: CreateProjectData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '创建项目失败');
  }
  
  return response.json();
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
