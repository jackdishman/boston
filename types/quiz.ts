// IQuiz interface
export interface IQuiz {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  proctor_fid: string | null;
  created_at: string;
  first_question_id: number | null;
}

// ISubmission interface
export interface ISubmission {
  id: number;
  quiz_id: number;
  fid: string | null;
  score: number | null;
  answers: IAnswerEntry[];
  time_completed: string | null;
  created_at: string;
}

// IAnswerEntry interface
export interface IAnswerEntry {
  question_id: number;
  answer: string;
  is_correct: boolean;
}

// IQuestion interface
export interface IQuestion {
  id: number;
  quiz_id: number;
  text: string;
  options: string[] | null;
  answer: string | null;
  explanation: string | null;
  image_url: string | null;
  question_type: "multiple_choice" | "short_answer";
  next_question_id?: number | null;
}

// IQuizBuilder interface
export interface IQuizBuilder {
  title: string;
  description: string | null;
  proctor_fid: string | null;
}

// IQuestionBuilder interface
export interface IQuestionBuilder {
  text: string;
  options?: string[]; // Optional for multiple choice
  answer?: string; // Optional for short answer
  explanation: string;
  image_url?: string;
  question_type: "multiple_choice" | "short_answer";
}
