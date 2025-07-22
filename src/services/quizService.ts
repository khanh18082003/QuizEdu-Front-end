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
