import axiosCustom from "../utils/axiosCustom";
import type { SuccessApiResponse, PaginationResponse } from "../types/response";

// Quiz interfaces
export interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  total_questions: number;
  duration_minutes: number;
  is_active: boolean;
  teacher_id: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
}

// Quiz Session interfaces
export interface QuizSession {
  id: string;
  quiz_id: string;
  class_id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participants_count: number;
}

export interface CreateSessionRequest {
  quiz_id: string;
  class_id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// Student interfaces
export interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar?: string;
  joined_at: string;
}

// Class Detail interface
export interface ClassDetail {
  id: string;
  name: string;
  description: string;
  class_code: string;
  created_at: string;
  updated_at: string;
  teacher_id: string;
  is_active: boolean;
  students_count: number;
}

// Quiz API functions
export const getQuizzes = async (
  page: number = 1,
  pageSize: number = 10
): Promise<SuccessApiResponse<PaginationResponse<Quiz>>> => {
  const response = await axiosCustom.get("/quizzes", {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

export const createQuiz = async (
  quizData: CreateQuizRequest
): Promise<SuccessApiResponse<Quiz>> => {
  const response = await axiosCustom.post("/quizzes", quizData);
  return response.data;
};

export const getQuizById = async (quizId: string): Promise<SuccessApiResponse<Quiz>> => {
  const response = await axiosCustom.get(`/quizzes/${quizId}`);
  return response.data;
};

export const updateQuiz = async (
  quizId: string,
  quizData: Partial<CreateQuizRequest>
): Promise<SuccessApiResponse<Quiz>> => {
  const response = await axiosCustom.put(`/quizzes/${quizId}`, quizData);
  return response.data;
};

export const deleteQuiz = async (quizId: string): Promise<SuccessApiResponse<null>> => {
  const response = await axiosCustom.delete(`/quizzes/${quizId}`);
  return response.data;
};

// Quiz Session API functions
export const getQuizSessions = async (
  classId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SuccessApiResponse<PaginationResponse<QuizSession>>> => {
  const response = await axiosCustom.get(`/quiz-sessions`, {
    params: {
      class_id: classId,
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

export const createQuizSession = async (
  sessionData: CreateSessionRequest
): Promise<SuccessApiResponse<QuizSession>> => {
  const response = await axiosCustom.post("/quiz-sessions", sessionData);
  return response.data;
};

export const getQuizSessionById = async (
  sessionId: string
): Promise<SuccessApiResponse<QuizSession>> => {
  const response = await axiosCustom.get(`/quiz-sessions/${sessionId}`);
  return response.data;
};

export const updateQuizSession = async (
  sessionId: string,
  sessionData: Partial<CreateSessionRequest>
): Promise<SuccessApiResponse<QuizSession>> => {
  const response = await axiosCustom.put(`/quiz-sessions/${sessionId}`, sessionData);
  return response.data;
};

export const deleteQuizSession = async (
  sessionId: string
): Promise<SuccessApiResponse<null>> => {
  const response = await axiosCustom.delete(`/quiz-sessions/${sessionId}`);
  return response.data;
};

// Class Detail API functions
export const getClassDetail = async (classId: string): Promise<SuccessApiResponse<ClassDetail>> => {
  const response = await axiosCustom.get(`/classrooms/${classId}`);
  return response.data;
};

export const getClassStudents = async (
  classId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SuccessApiResponse<PaginationResponse<Student>>> => {
  const response = await axiosCustom.get(`/classrooms/${classId}/students`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

export const addStudentToClass = async (
  classId: string,
  studentData: { email: string } | { student_id: string }
): Promise<SuccessApiResponse<Student>> => {
  const response = await axiosCustom.post(`/classrooms/${classId}/students`, studentData);
  return response.data;
};

export const removeStudentFromClass = async (
  classId: string,
  studentId: string
): Promise<SuccessApiResponse<null>> => {
  const response = await axiosCustom.delete(`/classrooms/${classId}/students/${studentId}`);
  return response.data;
};

// Get quizzes for a specific teacher (for dropdown in session creation)
export const getTeacherQuizzes = async (): Promise<SuccessApiResponse<Quiz[]>> => {
  const response = await axiosCustom.get("/quizzes/teacher");
  return response.data;
};

// New interfaces for detailed quiz management
export interface Answer {
  answer_text: string;
  correct: boolean;
}

export interface MultipleChoiceQuestion {
  question_id: string;
  question_text: string;
  hint: string;
  time_limit: number;
  allow_multiple_answers: boolean;
  points: number;
  answers: Answer[];
}

export interface MultipleChoiceQuiz {
  id: string;
  quiz_id: string;
  questions: MultipleChoiceQuestion[];
}

export interface MatchingItem {
  content: string;
  matching_type: "TEXT" | "IMAGE";
}

export interface MatchingQuestion {
  id: string;
  item_a: MatchingItem;
  item_b: MatchingItem;
  points: number;
}

export interface MatchingQuiz {
  id: string;
  quiz_id: string;
  time_limit: number;
  questions: MatchingQuestion[];
}

export interface DetailedQuiz {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  subject_id: string;
  class_ids: string[];
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface QuizManagementItem {
  quiz: DetailedQuiz;
  multiple_choice_quiz: MultipleChoiceQuiz;
  matching_quiz: MatchingQuiz;
}

export interface QuizManagementResponse {
  page: number;
  page_size: number;
  pages: number;
  total: number;
  data: QuizManagementItem[];
}

// API function for quiz management
export const getQuizzesForManagement = async (
  page: number = 1,
  pageSize: number = 9
): Promise<SuccessApiResponse<QuizManagementResponse>> => {
  const response = await axiosCustom.get("/quizzes", {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

// New interfaces for creating quiz with full features
export interface CreateQuizAnswer {
  answer_text: string;
  correct: boolean;
}

export interface CreateMultipleChoiceQuestion {
  question_text: string;
  hint: string;
  time_limit: number;
  allow_multiple_answers: boolean;
  points: number;
  answers: CreateQuizAnswer[];
}

export interface CreateMultipleChoiceQuiz {
  questions: CreateMultipleChoiceQuestion[];
}

export interface CreateMatchingQuestion {
  content_a: string;
  type_a: "TEXT" | "IMAGE";
  content_b: string;
  type_b: "TEXT" | "IMAGE";
  points: number;
}

export interface CreateMatchingQuiz {
  time_limit: number;
  questions: CreateMatchingQuestion[];
}

export interface CreateFillInBlankQuestion {
  question_text: string;
  blank_text: string;
  correct_answers: string[];
  hint?: string;
  time_limit: number;
  points: number;
  case_sensitive: boolean;
}

export interface CreateFillInBlankQuiz {
  questions: CreateFillInBlankQuestion[];
}

export interface CreateTrueFalseQuestion {
  question_text: string;
  correct_answer: boolean;
  hint?: string;
  time_limit: number;
  points: number;
}

export interface CreateTrueFalseQuiz {
  questions: CreateTrueFalseQuestion[];
}

export interface CreateFullQuizRequest {
  name: string;
  description: string;
  subject_id: string; // Will be updated to use actual subject ID from subjects API
  is_active: boolean;
  class_ids?: string[];
  multiple_choice_quiz?: CreateMultipleChoiceQuiz;
  matching_quiz?: CreateMatchingQuiz;
  fill_in_blank_quiz?: CreateFillInBlankQuiz;
  true_false_quiz?: CreateTrueFalseQuiz;
}

// API function to create a full featured quiz
export const createFullQuiz = async (
  quizData: CreateFullQuizRequest
): Promise<SuccessApiResponse<QuizManagementItem>> => {
  const response = await axiosCustom.post("/quizzes", quizData);
  return response.data;
};

// Subject interfaces for future implementation
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  grade_level?: string;
  is_active: boolean;
}

// API function to get subjects (for future implementation)
export const getSubjects = async (): Promise<SuccessApiResponse<Subject[]>> => {
  const response = await axiosCustom.get("/subjects");
  return response.data;
};

// API function to get detailed quiz information by ID
export const getQuizDetail = async (
  quizId: string
): Promise<SuccessApiResponse<QuizManagementItem>> => {
  const response = await axiosCustom.get(`/quizzes/${quizId}`);
  return response.data;
};

// Interface for adding multiple choice questions
export interface AddMultipleChoiceAnswer {
  answer_text: string;
  correct: boolean;
}

export interface AddMultipleChoiceQuestion {
  question_text: string;
  hint?: string;
  time_limit: number;
  allow_multiple_answers: boolean;
  points: number;
  answers: AddMultipleChoiceAnswer[];
}

// API function to add multiple choice questions
export const addMultipleChoiceQuestions = async (
  quizId: string,
  questions: AddMultipleChoiceQuestion[]
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.post(
    `/quizzes/multiple-choice-quizzes/${quizId}/questions`,
    questions
  );
  return response.data;
};

// Interface for updating multiple choice questions
export interface UpdateMultipleChoiceQuestion {
  question_id: string;
  question_text: string;
  hint?: string;
  time_limit: number;
  allow_multiple_answers: boolean;
  points: number;
  answers: AddMultipleChoiceAnswer[];
}

// API function to update multiple choice questions
export const updateMultipleChoiceQuestions = async (
  quizId: string,
  questions: UpdateMultipleChoiceQuestion[]
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.put(
    `/quizzes/multiple-choice-quizzes/${quizId}/questions`,
    questions
  );
  return response.data;
};

// API function to delete multiple choice questions
export const deleteMultipleChoiceQuestions = async (
  quizId: string,
  questionIds: string[]
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.delete(
    `/quizzes/multiple-choice-quizzes/${quizId}/questions`,
    {
      data: questionIds
    }
  );
  return response.data;
};
