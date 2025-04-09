
export type QuestionType = 'single' | 'multiple' | 'grid' | 'scale' | 'ranking' | 'rating' | 'open' | 'numeric';

export interface QuestionOption {
  id: string;
  text: string;
  value?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
}

export interface Survey {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Record<string, any>;
  createdAt: string;
  respondent?: {
    id?: string;
    name?: string;
    email?: string;
  };
}
