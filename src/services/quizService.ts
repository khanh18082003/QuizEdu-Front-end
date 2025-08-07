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
  is_public: boolean;
  teacher_id: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
  is_public: boolean;
}

// Update Quiz Request for editing quiz
export interface UpdateQuizRequest {
  name: string;
  description: string;
  is_active: boolean;
  is_public: boolean;
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
  pageSize: number = 10,
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
  quizData: CreateQuizRequest,
): Promise<SuccessApiResponse<Quiz>> => {
  const response = await axiosCustom.post("/quizzes", quizData);
  return response.data;
};

export const getQuizById = async (
  quizId: string,
): Promise<SuccessApiResponse<Quiz>> => {
  const response = await axiosCustom.get(`/quizzes/${quizId}`);
  return response.data;
};

export const updateQuiz = async (
  quizId: string,
  quizData: UpdateQuizRequest,
): Promise<SuccessApiResponse<Quiz>> => {
  const response = await axiosCustom.put(`/quizzes/${quizId}`, quizData);
  return response.data;
};

export const deleteQuiz = async (
  quizId: string,
): Promise<SuccessApiResponse<null>> => {
  const response = await axiosCustom.delete(`/quizzes/${quizId}`);
  return response.data;
};

// Quiz Session API functions
export const getQuizSessions = async (
  classId: string,
  page: number = 1,
  pageSize: number = 10,
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

export const getQuizSessionById = async (
  sessionId: string,
): Promise<SuccessApiResponse<QuizSession>> => {
  const response = await axiosCustom.get(`/quiz-sessions/${sessionId}`);
  return response.data;
};

export const updateQuizSession = async (
  sessionId: string,
  sessionData: Partial<CreateSessionRequest>,
): Promise<SuccessApiResponse<QuizSession>> => {
  const response = await axiosCustom.put(
    `/quiz-sessions/${sessionId}`,
    sessionData,
  );
  return response.data;
};

export const deleteQuizSession = async (
  sessionId: string,
): Promise<SuccessApiResponse<null>> => {
  const response = await axiosCustom.delete(`/quiz-sessions/${sessionId}`);
  return response.data;
};

// Class Detail API functions
export const getClassDetail = async (
  classId: string,
): Promise<SuccessApiResponse<ClassDetail>> => {
  const response = await axiosCustom.get(`/classrooms/${classId}`);
  return response.data;
};

export const getClassStudents = async (
  classId: string,
  page: number = 1,
  pageSize: number = 20,
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
  studentData: { email: string } | { student_id: string },
): Promise<SuccessApiResponse<Student>> => {
  const response = await axiosCustom.post(
    `/classrooms/${classId}/students`,
    studentData,
  );
  return response.data;
};

export const removeStudentFromClass = async (
  classId: string,
  studentId: string,
): Promise<SuccessApiResponse<null>> => {
  const response = await axiosCustom.delete(
    `/classrooms/${classId}/students/${studentId}`,
  );
  return response.data;
};

// Get quizzes for a specific teacher (for dropdown in session creation)
export const getTeacherQuizzes = async (): Promise<
  SuccessApiResponse<Quiz[]>
> => {
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
  class_ids: string[];
  created_at: string;
  updated_at: string;
  active: boolean;
  public: boolean;
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
  pageSize: number = 9,
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
  is_active: boolean;
  is_public: boolean;
  class_ids?: string[];
  multiple_choice_quiz?: CreateMultipleChoiceQuiz;
  matching_quiz?: CreateMatchingQuiz;
  fill_in_blank_quiz?: CreateFillInBlankQuiz;
  true_false_quiz?: CreateTrueFalseQuiz;
}

// API function to create a full featured quiz
export const createFullQuiz = async (
  quizData: CreateFullQuizRequest,
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

// Quiz Session interfaces and API
export interface QuizSessionRequest {
  quiz_id: string;
  class_id: string;
  teacher_id: string;
}

export interface QuizSessionResponse {
  id: string;
  quiz_id: string;
  class_id: string;
  teacher_id: string;
  status: string;
  access_code: string;
  start_time: string;
  end_time: string;
}

// API function to create quiz session
export const createQuizSession = async (
  sessionData: QuizSessionRequest,
): Promise<SuccessApiResponse<QuizSessionResponse>> => {
  const response = await axiosCustom.post("/quiz-sessions", sessionData);
  return response.data;
};

// API function to get detailed quiz information by ID
export const getQuizDetail = async (
  quizId: string,
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
  questions: AddMultipleChoiceQuestion[],
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.post(
    `/quizzes/multiple-choice-quizzes/${quizId}/questions`,
    questions,
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
  questions: UpdateMultipleChoiceQuestion[],
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.put(
    `/quizzes/multiple-choice-quizzes/${quizId}/questions`,
    questions,
  );
  return response.data;
};

// API function to delete multiple choice questions
export const deleteMultipleChoiceQuestions = async (
  quizId: string,
  questionIds: string[],
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.delete(
    `/quizzes/multiple-choice-quizzes/${quizId}/questions`,
    {
      data: questionIds,
    },
  );
  return response.data;
};
// Interface for adding matching questions
export interface AddMatchingQuestion {
  content_a?: string;
  file_content_a?: File;
  type_a: "TEXT" | "IMAGE";
  content_b?: string;
  file_content_b?: File;
  type_b: "TEXT" | "IMAGE";
  points: number;
}

// API function to add matching questions
export const addMatchingQuestions = async (
  quizId: string,
  questions: AddMatchingQuestion[],
): Promise<SuccessApiResponse<any>> => {
  const formData = new FormData();

  questions.forEach((question, index) => {
    // Add content or file for A
    if (question.type_a === "TEXT" && question.content_a) {
      formData.append(`questions[${index}].contentA`, question.content_a);
    } else if (question.type_a === "IMAGE" && question.file_content_a) {
      formData.append(
        `questions[${index}].fileContentA`,
        question.file_content_a,
      );
    }

    // Add content or file for B
    if (question.type_b === "TEXT" && question.content_b) {
      formData.append(`questions[${index}].contentB`, question.content_b);
    } else if (question.type_b === "IMAGE" && question.file_content_b) {
      formData.append(
        `questions[${index}].fileContentB`,
        question.file_content_b,
      );
    }

    formData.append(`questions[${index}].typeA`, question.type_a);
    formData.append(`questions[${index}].typeB`, question.type_b);
    formData.append(`questions[${index}].points`, question.points.toString());
  });

  const response = await axiosCustom.post(
    `/quizzes/matching-quizzes/${quizId}/questions`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// API function to update matching questions by type
export const updateMatchingQuestions = async (
  quizId: string,
  request: UpdateMatchingQuestionRequest,
): Promise<SuccessApiResponse<any>> => {
  console.log("=== UPDATE MATCHING QUESTIONS DEBUG ===");
  console.log("Quiz ID:", quizId);
  console.log("Request object:", request);

  const formData = new FormData();

  // Add timeLimit if provided
  if (request.timeLimit) {
    formData.append("timeLimit", request.timeLimit.toString());
    console.log("Added timeLimit:", request.timeLimit);
  }

  request.questions.forEach((question, index) => {
    console.log(`Question ${index}:`, question);

    if (question.id) {
      formData.append(`questions[${index}].id`, question.id);
      console.log(`Added questions[${index}].id:`, question.id);
    }

    if (question.type_a === "TEXT" && question.content_a) {
      formData.append(`questions[${index}].textContentA`, question.content_a);
      console.log(
        `Added questions[${index}].textContentA:`,
        question.content_a,
      );
    } else if (question.type_a === "IMAGE" && question.file_content_a) {
      formData.append(
        `questions[${index}].fileContentA`,
        question.file_content_a,
      );
      console.log(
        `Added questions[${index}].fileContentA:`,
        question.file_content_a,
      );
    }

    formData.append(`questions[${index}].typeA`, question.type_a);
    console.log(`Added questions[${index}].typeA:`, question.type_a);

    if (question.type_b === "TEXT" && question.content_b) {
      formData.append(`questions[${index}].textContentB`, question.content_b);
      console.log(
        `Added questions[${index}].textContentB:`,
        question.content_b,
      );
    } else if (question.type_b === "IMAGE" && question.file_content_b) {
      formData.append(
        `questions[${index}].fileContentB`,
        question.file_content_b,
      );
      console.log(
        `Added questions[${index}].fileContentB:`,
        question.file_content_b,
      );
    }

    formData.append(`questions[${index}].typeB`, question.type_b);
    console.log(`Added questions[${index}].typeB:`, question.type_b);

    formData.append(`questions[${index}].points`, question.points.toString());
    console.log(`Added questions[${index}].points:`, question.points);
  });

  // Log tất cả FormData entries
  console.log("=== FORM DATA ENTRIES ===");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  console.log("=== API CALL ===");
  console.log("URL:", `/matching-quizzes/${quizId}/questions`);

  console.log("=== API CALL ===");
  console.log("URL:", `/matching-quizzes/${quizId}/questions`);

  const response = await axiosCustom.put(
    `quizzes/matching-quizzes/${quizId}/questions`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log("=== RESPONSE ===");
  console.log("Response:", response.data);
  console.log("=== END DEBUG ===");

  return response.data;
};

// API function to delete matching questions
export const deleteMatchingQuestions = async (
  quizId: string,
  questionIds: string[],
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.delete(
    `/quizzes/matching-quizzes/${quizId}/questions`,
    {
      data: questionIds,
    },
  );
  return response.data;
};

// Interface for updating matching questions by type
export interface UpdateMatchingQuestionByType {
  id?: string; // Optional for new questions
  content_a?: string;
  file_content_a?: File;
  type_a: "TEXT" | "IMAGE";
  content_b?: string;
  file_content_b?: File;
  type_b: "TEXT" | "IMAGE";
  points: number;
}

export interface UpdateMatchingQuestionRequest {
  timeLimit?: number;
  questions: UpdateMatchingQuestionByType[];
}

// Interface for updating matching questions
export interface UpdateMatchingQuestion {
  id: string;
  content_a: string;
  type_a: "TEXT" | "IMAGE";
  content_b: string;
  type_b: "TEXT" | "IMAGE";
  points: number;
}

export interface UpdateMatchingQuizRequest {
  time_limit: number;
  questions: UpdateMatchingQuestion[];
}

// API function to update matching quiz
export const updateMatchingQuiz = async (
  quizId: string,
  quizData: UpdateMatchingQuizRequest,
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.put(
    `/quizzes/matching-quizzes/${quizId}/questions`,
    quizData,
  );
  return response.data;
};

// Interface for creating quiz types
export interface CreateQuizTypeRequest {
  type: "MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK";
  data:
    | CreateMatchingQuizData
    | CreateMultipleChoiceQuizData
    | CreateTrueFalseQuizData
    | CreateFillInBlankQuizData;
}

export interface CreateMatchingQuizData {
  time_limit: number;
  questions: CreateMatchingQuestionData[];
}

export interface CreateMatchingQuestionData {
  content_a: string;
  type_a: "TEXT" | "IMAGE";
  content_b: string;
  type_b: "TEXT" | "IMAGE";
  points: number;
}

export interface CreateMultipleChoiceQuizData {
  questions: CreateMultipleChoiceQuestionData[];
}

export interface CreateMultipleChoiceQuestionData {
  question_text: string;
  hint?: string;
  time_limit: number;
  allow_multiple_answers: boolean;
  points: number;
  answers: CreateMultipleChoiceAnswerData[];
}

export interface CreateMultipleChoiceAnswerData {
  answer_text: string;
  correct: boolean;
}

export interface CreateTrueFalseQuizData {
  questions: CreateTrueFalseQuestionData[];
}

export interface CreateTrueFalseQuestionData {
  question_text: string;
  correct_answer: boolean;
  hint?: string;
  time_limit: number;
  points: number;
}

export interface CreateFillInBlankQuizData {
  questions: CreateFillInBlankQuestionData[];
}

export interface CreateFillInBlankQuestionData {
  question_text: string;
  blank_text: string;
  correct_answers: string[];
  hint?: string;
  time_limit: number;
  points: number;
  case_sensitive: boolean;
}

// API function to create quiz type
export const createQuizType = async (
  quizId: string,
  quizTypeData: CreateQuizTypeRequest,
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.post(
    `/quizzes/${quizId}/add`,
    quizTypeData,
  );
  return response.data;
};

// API function to get quiz detail for classroom (for practice mode)
export const getQuizForPractice = async (
  quizId: string,
): Promise<SuccessApiResponse<QuizManagementItem>> => {
  const response = await axiosCustom.get(`/quizzes/${quizId}`);
  return response.data;
};

// API function to create quiz with FormData (supports file uploads)
export const createQuizWithFormData = async (
  formData: FormData,
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.post("/quizzes", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// API function to add quiz type with FormData (supports file uploads for questions)
export const addQuizTypeWithFormData = async (
  quizId: string,
  formData: FormData,
): Promise<SuccessApiResponse<any>> => {
  const response = await axiosCustom.post(`/quizzes/${quizId}/add`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
// New interfaces for quiz questions API
export interface QuizQuestionAnswer {
  answer_text: string;
}

export interface QuizQuestionMultipleChoice {
  question_id: string;
  question_text: string;
  hint: string;
  time_limit: number;
  allow_multiple_answers: boolean;
  points: number;
  answers: QuizQuestionAnswer[];
}

export interface QuizQuestionMultipleChoiceQuiz {
  id: string;
  quiz_id: string;
  questions: QuizQuestionMultipleChoice[];
}

export interface QuizQuestionMatchingItem {
  id?: string;
  content: string;
  matching_type: "TEXT" | "IMAGE";
}

export interface QuizQuestionMatchingQuiz {
  id: string;
  quiz_id: string;
  time_limit: number;
  item_a: QuizQuestionMatchingItem[];
  item_b: QuizQuestionMatchingItem[];
}

export interface QuizQuestionQuiz {
  id: string;
  name: string;
  description: string;
  public: boolean;
  active: boolean;
}

export interface QuizQuestionsResponse {
  quiz: QuizQuestionQuiz;
  multiple_choice_quiz: QuizQuestionMultipleChoiceQuiz;
  matching_quiz: QuizQuestionMatchingQuiz;
}

// API function to get quiz questions for taking quiz
export const getQuizQuestions = async (
  quizId: string,
): Promise<SuccessApiResponse<QuizQuestionsResponse>> => {
  const response = await axiosCustom.get(`/quizzes/${quizId}/questions`);
  return response.data;
};
