
import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from '@/components/ui/card';
import { Question, QuestionType } from '@/types/survey';

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  question, 
  onChange, 
  onDelete 
}) => {
  const [bulkOptionsText, setBulkOptionsText] = useState('');
  const [showBulkEditor, setShowBulkEditor] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'QUESTION',
    item: { id: question.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const handleTitleChange = (title: string) => {
    onChange({ ...question, title });
  };

  const handleRequiredChange = (required: boolean) => {
    onChange({ ...question, required });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    const updatedOptions = question.options?.map(option => 
      option.id === optionId ? { ...option, text } : option
    );
    onChange({ ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    const newOptionId = String(Date.now());
    const updatedOptions = [
      ...(question.options || []),
      { id: newOptionId, text: `选项 ${(question.options?.length || 0) + 1}` }
    ];
    onChange({ ...question, options: updatedOptions });
  };

  const handleRemoveOption = (optionId: string) => {
    const updatedOptions = question.options?.filter(option => option.id !== optionId);
    onChange({ ...question, options: updatedOptions });
  };

  const handleBulkOptionsSubmit = () => {
    if (!bulkOptionsText.trim()) {
      setShowBulkEditor(false);
      return;
    }

    const optionLines = bulkOptionsText
      .split('\n')
      .filter(line => line.trim().length > 0);
      
    const newOptions = optionLines.map((text, index) => ({
      id: `bulk_${Date.now()}_${index}`,
      text: text.trim()
    }));
    
    if (newOptions.length > 0) {
      onChange({ ...question, options: newOptions });
    }
    
    setBulkOptionsText('');
    setShowBulkEditor(false);
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    const typeMap: Record<QuestionType, string> = {
      single: '单选题',
      multiple: '多选题',
      grid: '矩阵题',
      scale: '量表题',
      ranking: '排序题',
      rating: '评分题',
      open: '开放题',
      numeric: '数字题'
    };
    return typeMap[type] || '未知类型';
  };

  const renderQuestionOptions = () => {
    if (!['single', 'multiple'].includes(question.type)) {
      return null;
    }
    
    return (
      <>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-medium">选项</Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkEditor(!showBulkEditor)}
              >
                批量导入
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                添加选项
              </Button>
            </div>
          </div>

          {showBulkEditor ? (
            <div className="space-y-2 mt-2">
              <Textarea
                placeholder="每行一个选项..."
                value={bulkOptionsText}
                onChange={(e) => setBulkOptionsText(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkEditor(false)}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkOptionsSubmit}
                >
                  确认
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <div className="w-6 text-center">{index + 1}.</div>
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <Card className={`border ${isDragging ? 'opacity-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div ref={drag} className="flex items-center cursor-move">
          <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
          <div className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
            {getQuestionTypeLabel(question.type)}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">问题标题</Label>
            <Textarea
              value={question.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="输入问题..."
              className="mt-1"
            />
          </div>
          
          {renderQuestionOptions()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between py-3 border-t">
        <div className="flex items-center space-x-2">
          <Switch
            id={`required-${question.id}`}
            checked={question.required}
            onCheckedChange={handleRequiredChange}
          />
          <Label htmlFor={`required-${question.id}`}>必答题</Label>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuestionEditor;
