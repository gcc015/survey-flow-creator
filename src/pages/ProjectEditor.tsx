
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Save, Plus, ArrowLeft, Share2, Settings, Menu, Grid, 
  Radio, CheckSquare, Star, SortAsc, PenLine, Hash, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import QuestionEditor from '@/components/QuestionEditor';
import SurveyPreview from '@/components/SurveyPreview';

const ProjectEditor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('build');
  const [projectName, setProjectName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(true);
  const [surveyLink, setSurveyLink] = useState('');

  useEffect(() => {
    if (projectId) {
      setProjectName(projectId);
      setQuestions([
        {
          id: '1',
          type: 'single',
          title: '过去3个月相较于3-6个月之前，您认为TikTok Shop的运费和价格优惠是怎么变化的（包括免运门槛、打折活动、返现等)？',
          required: true,
          options: [
            { id: '1', text: '明显变多了' },
            { id: '2', text: '略有增加' },
            { id: '3', text: '差不多' },
            { id: '4', text: '略有减少' },
            { id: '5', text: '明显变少了' }
          ]
        }
      ]);
      
      // Generate survey link based on current URL
      const baseUrl = window.location.origin;
      setSurveyLink(`${baseUrl}/survey/${projectId}`);
    }
  }, [projectId]);

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('项目已保存');
    } catch (error) {
      toast.error('保存失败');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type: type,
      title: '',
      required: true,
      options: type === 'single' || type === 'multiple' ? [
        { id: '1', text: '选项 1' },
        { id: '2', text: '选项 2' }
      ] : []
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (updatedQuestion) => {
    setQuestions(questions.map((q) => q.id === updatedQuestion.id ? updatedQuestion : q));
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    toast.success('问题已删除');
  };

  const handleCreateShareLink = () => {
    // Use the properly generated link
    navigator.clipboard.writeText(surveyLink);
    toast.success('分享链接已复制到剪贴板');
    
    // Show a toast with a link to the survey
    toast(
      <div className="flex flex-col">
        <span>链接已复制！</span>
        <a 
          href={surveyLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          点击此处打开问卷
        </a>
      </div>
    );
  };

  const questionTypes = [
    { type: 'single', icon: Radio, label: '单选题' },
    { type: 'multiple', icon: CheckSquare, label: '多选题' },
    { type: 'grid', icon: Grid, label: '矩阵题' },
    { type: 'scale', icon: Star, label: '量表题' },
    { type: 'ranking', icon: SortAsc, label: '排序题' },
    { type: 'rating', icon: Star, label: '评分题' },
    { type: 'open', icon: PenLine, label: '开放题' },
    { type: 'numeric', icon: Hash, label: '数字题' }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white mr-2"
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm text-gray-300">编辑项目：</div>
            <div className="ml-2 font-medium">{projectName}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-gray-800"
              onClick={handleSaveProject}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-gray-800"
              onClick={handleCreateShareLink}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-gray-800"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-semibold">JP</span>
            </div>
          </div>
        </header>

        <div className="bg-white border-b flex-1 flex flex-col">
          <div className="container mx-auto flex-1 flex flex-col">
            <Tabs 
              defaultValue="build" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-none h-auto">
                <TabsTrigger 
                  value="overview" 
                  className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
                >
                  概览
                </TabsTrigger>
                <TabsTrigger 
                  value="build" 
                  className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
                >
                  构建
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
                >
                  预览
                </TabsTrigger>
                <TabsTrigger 
                  value="responses" 
                  className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
                >
                  回复
                </TabsTrigger>
                <TabsTrigger 
                  value="report" 
                  className="py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-brand-500"
                >
                  报告
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 flex">
                <TabsContent value="build" className="flex-1 flex m-0 p-0">
                  {showQuestionsPanel && (
                    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-800 mb-2">问题类型</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {questionTypes.map(({ type, icon: Icon, label }) => (
                            <TooltipProvider key={type}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex flex-col items-center justify-center h-16 p-1 gap-1"
                                    onClick={() => handleAddQuestion(type)}
                                  >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-xs">{label}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>添加{label}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4"
                        onClick={() => setShowQuestionsPanel(!showQuestionsPanel)}
                      >
                        <Menu className="h-4 w-4 mr-2" />
                        {showQuestionsPanel ? '隐藏问题面板' : '显示问题面板'}
                      </Button>

                      <div className="mb-6">
                        <Input
                          className="text-2xl font-semibold border-none bg-transparent focus-visible:ring-0 px-0"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="输入调查标题..."
                        />
                        <Textarea
                          className="mt-2 resize-none"
                          placeholder="输入调查说明..."
                        />
                      </div>

                      <div className="space-y-4">
                        {questions.map((question) => (
                          <QuestionEditor
                            key={question.id}
                            question={question}
                            onChange={handleQuestionChange}
                            onDelete={() => handleDeleteQuestion(question.id)}
                          />
                        ))}
                      </div>

                      <Button
                        onClick={() => handleAddQuestion('single')}
                        className="mt-6"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        添加问题
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="flex-1 m-0 p-0 flex flex-col h-full">
                  <div className="flex flex-col h-full">
                    <div className="bg-white border-b p-2 flex justify-between items-center">
                      <div className="text-sm font-medium">问卷预览</div>
                      <div className="flex items-center">
                        <Link to={surveyLink} target="_blank" className="flex items-center text-sm text-blue-600 hover:underline">
                          <Eye className="h-4 w-4 mr-1" /> 
                          在新窗口打开
                        </Link>
                      </div>
                    </div>
                    <div className="flex-1 p-4 bg-gray-100 overflow-auto">
                      <div className="mx-auto max-w-lg h-[600px] bg-white rounded-lg shadow overflow-hidden flex flex-col">
                        <SurveyPreview questions={questions} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="overview" className="flex-1 p-4">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">项目概览</h2>
                    <p>暂无数据</p>
                  </div>
                </TabsContent>

                <TabsContent value="responses" className="flex-1 p-4">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">回复列表</h2>
                    <p>暂无回复数据</p>
                  </div>
                </TabsContent>

                <TabsContent value="report" className="flex-1 p-4">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">数据报告</h2>
                    <p>暂无报告数据</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ProjectEditor;
