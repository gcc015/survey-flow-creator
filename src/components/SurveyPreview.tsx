
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Question } from '@/types/survey';

interface SurveyPreviewProps {
  questions: Question[];
}

interface Message {
  id: string;
  content: string | React.ReactNode;
  sender: 'bot' | 'user';
  questionId?: string;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ questions }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when questions change
    setMessages([]);
    setCurrentQuestion(0);
    setAnswers({});
    setIsComplete(false);

    // Add welcome message with first question if available
    if (questions.length > 0) {
      // Welcome message
      const welcomeMessage = {
        id: '0',
        content: '您好！接下来我想问您几个关于化妆品的问题。您的答案对于我来说非常重要！您是否愿意继续回答呢？',
        sender: 'bot' as const
      };
      setMessages([welcomeMessage]);
    }
  }, [questions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (userInput.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setUserInput('');
    
    // Handle first welcome message
    if (messages.length === 1 && !messages[0].questionId) {
      // Show first question
      setTimeout(() => {
        if (questions.length > 0) {
          const botMessage: Message = {
            id: Date.now().toString(),
            content: questions[0].title,
            sender: 'bot',
            questionId: questions[0].id
          };
          setMessages(prev => [...prev, botMessage]);
        }
      }, 500);
      return;
    }

    // If we reach here, this is a text answer to a question
    const currentQ = questions[currentQuestion];
    
    if (currentQ) {
      // Save answer
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: userInput
      }));
      
      // Move to next question
      moveToNextQuestion();
    }
  };

  const handleOptionSelect = (optionId: string, optionText: string) => {
    const currentQ = questions[currentQuestion];
    
    // Add user message with selected option
    const userMessage: Message = {
      id: Date.now().toString(),
      content: optionText,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Save answer
    if (currentQ.type === 'multiple') {
      // For multiple choice, store as array
      const currentAnswers = answers[currentQ.id] || [];
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: [...currentAnswers, optionId]
      }));
    } else {
      // For single choice
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: optionId
      }));
      
      // For single choice, move to next question automatically
      moveToNextQuestion();
    }
  };

  const handleMultipleSubmit = () => {
    const currentQ = questions[currentQuestion];
    const selectedOptions = answers[currentQ.id] || [];
    
    if (currentQ.required && selectedOptions.length === 0) {
      // Show error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '请至少选择一个选项',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    
    if (nextQuestion < questions.length) {
      // Set next question
      setCurrentQuestion(nextQuestion);
      
      // Add bot message with next question
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
      // Survey complete
      setIsComplete(true);
      
      // Add completion message
      setTimeout(() => {
        const completionMessage: Message = {
          id: Date.now().toString(),
          content: '感谢您的确认！我很高兴您愿意参与这个话题。为了更好了解您的化妆品偏好和知识，我可以问一下您知道或使用过哪些化妆品品牌吗？无论是高端品牌、大众品牌还是小众品牌都可以分享。',
          sender: 'bot'
        };
        setMessages(prev => [...prev, completionMessage]);
      }, 500);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.sender === 'user') {
      return (
        <div className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          {message.content}
        </div>
      );
    }
    
    // Bot message
    const questionId = message.questionId;
    if (!questionId) {
      return (
        <div className="px-4 py-2 bg-gray-200 rounded-lg">
          {message.content}
        </div>
      );
    }
    
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      return (
        <div className="px-4 py-2 bg-gray-200 rounded-lg">
          {message.content}
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="px-4 py-2 bg-gray-200 rounded-lg">
          {message.content}
        </div>
        
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
        
        {(question.type === 'open' || question.type === 'numeric') && (
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder={`请输入${question.type === 'numeric' ? '数字' : '回答'}...`}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={currentQuestion !== questions.findIndex(q => q.id === questionId) || isComplete}
              type={question.type === 'numeric' ? 'number' : 'text'}
            />
            <Button
              onClick={handleSend}
              disabled={!userInput.trim() || currentQuestion !== questions.findIndex(q => q.id === questionId) || isComplete}
            >
              发送
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderInputSection = () => {
    if (isComplete) {
      return null;
    }
    
    // For the initial greeting message
    if (messages.length === 1 && !messages[0].questionId) {
      return (
        <div className="flex space-x-2">
          <Button
            className="w-full"
            onClick={() => {
              const userMessage: Message = {
                id: Date.now().toString(),
                content: '好的',
                sender: 'user',
              };
              
              setMessages(prev => [...prev, userMessage]);
              
              // Show first question
              setTimeout(() => {
                if (questions.length > 0) {
                  const botMessage: Message = {
                    id: Date.now().toString(),
                    content: questions[0].title,
                    sender: 'bot',
                    questionId: questions[0].id
                  };
                  setMessages(prev => [...prev, botMessage]);
                }
              }, 500);
            }}
          >
            好的
          </Button>
        </div>
      );
    }
    
    if (messages.length === 0 || !questions.length) {
      return null;
    }

    const currentQ = questions[currentQuestion];
    if (!currentQ) return null;
    
    if (currentQ.type === 'single' || currentQ.type === 'multiple') {
      return null; // No input for choice questions, they have their own UI
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
        <Button onClick={handleSend} disabled={!userInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
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
      
      {/* Input Area */}
      <div className="border-t p-4">
        {renderInputSection()}
      </div>
    </div>
  );
};

export default SurveyPreview;
