
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Question, QuestionType } from '@/types/survey';

interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: 'bot' | 'user';
  questionId?: string;
}

const SurveyChat: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        type: 'single',
        title: '您好！接下来我想问您几个关于化妆品的问题。您的答案对于我来说非常重要！您是否愿意继续回答呢？',
        required: true,
        options: [
          { id: '1', text: '好的' },
          { id: '2', text: '不愿意' }
        ]
      },
      {
        id: '2',
        type: 'open',
        title: '感谢您的确认！我很高兴您愿意参与这个话题。为了更好了解您的化妆品偏好和知识，我可以问一下您知道或使用过哪些化妆品品牌吗？无论是高端品牌、大众品牌还是小众品牌都可以分享。',
        required: true,
      },
      {
        id: '3',
        type: 'multiple',
        title: '您通常在哪些渠道购买化妆品？',
        required: true,
        options: [
          { id: '1', text: '实体商店' },
          { id: '2', text: '电商平台' },
          { id: '3', text: '品牌官网' },
          { id: '4', text: '代购' },
          { id: '5', text: '其他' }
        ]
      }
    ];
    
    setQuestions(mockQuestions);
    
    setMessages([
      {
        id: '0',
        content: mockQuestions[0].title,
        sender: 'bot',
        questionId: mockQuestions[0].id
      }
    ]);
  }, [surveyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (userInput.trim() === '') return;
    
    const currentQ = questions[currentQuestion];
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: userInput
    }));
    
    setUserInput('');
    
    moveToNextQuestion();
  };

  const handleOptionSelect = (optionId: string, optionText: string) => {
    const currentQ = questions[currentQuestion];
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: optionText,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const multipleChoiceTypes: QuestionType[] = ['multiple'];
    
    if (multipleChoiceTypes.includes(currentQ.type)) {
      const currentAnswers = answers[currentQ.id] || [];
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: [...currentAnswers, optionId]
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: optionId
      }));
      
      moveToNextQuestion();
    }
  };

  const handleMultipleSubmit = () => {
    const currentQ = questions[currentQuestion];
    const selectedOptions = answers[currentQ.id] || [];
    
    if (currentQ.required && selectedOptions.length === 0) {
      toast.error('请至少选择一个选项');
      return;
    }
    
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      
      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now().toString(),
          content: questions[nextQuestion].title,
          sender: 'bot',
          questionId: questions[nextQuestion].id
        };
        setMessages(prev => [...prev, botMessage]);
      }, 500);
    } else {
      setIsComplete(true);
      
      setTimeout(() => {
        const completionMessage: Message = {
          id: Date.now().toString(),
          content: '谢谢您完成了这次调查！您的回答对我们非常有价值。',
          sender: 'bot'
        };
        setMessages(prev => [...prev, completionMessage]);
      }, 500);
      
      handleSubmitSurvey();
    }
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting answers:', answers);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('调查已提交，谢谢您的参与！');
    } catch (error) {
      toast.error('提交失败，请重试');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.sender === 'user') {
      return <div className="px-4 py-2 bg-blue-500 text-white rounded-lg">{message.content}</div>;
    }
    
    const questionId = message.questionId;
    if (!questionId) {
      return <div className="px-4 py-2 bg-gray-200 rounded-lg">{message.content}</div>;
    }
    
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      return <div className="px-4 py-2 bg-gray-200 rounded-lg">{message.content}</div>;
    }
    
    return (
      <div className="space-y-3">
        <div className="px-4 py-2 bg-gray-200 rounded-lg">{message.content}</div>
        
        {question.type === 'single' && (
          <div className="flex flex-col space-y-2 mt-2">
            {question.options?.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={`justify-start ${
                  answers[question.id] === option.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleOptionSelect(option.id, option.text)}
                disabled={currentQuestion !== questions.findIndex(q => q.id === questionId) || isComplete}
              >
                {option.text}
              </Button>
            ))}
          </div>
        )}
        
        {question.type === 'multiple' && (
          <div className="space-y-2 mt-2">
            <div className="flex flex-col space-y-2">
              {question.options?.map((option) => {
                const isSelected = (answers[question.id] || []).includes(option.id);
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className={`justify-start ${
                      isSelected ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleOptionSelect(option.id, option.text)}
                    disabled={currentQuestion !== questions.findIndex(q => q.id === questionId) || isComplete}
                  >
                    {option.text}
                  </Button>
                );
              })}
            </div>
            
            {currentQuestion === questions.findIndex(q => q.id === questionId) && !isComplete && (
              <Button 
                className="w-full mt-2"
                onClick={handleMultipleSubmit}
              >
                提交
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderInputSection = () => {
    if (isComplete) {
      return null;
    }
    
    const currentQ = questions[currentQuestion];
    if (!currentQ) return null;
    
    if (['single', 'multiple'].includes(currentQ.type)) {
      return null; // No input for choice questions
    }
    
    return (
      <div className="flex space-x-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="输入您的回答..."
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <Button onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto border">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t p-4">
        {renderInputSection()}
      </div>
    </div>
  );
};

export default SurveyChat;
