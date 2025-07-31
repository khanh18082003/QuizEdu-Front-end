import type { SuccessApiResponse } from "../types/response";
import api from "../utils/axiosCustom";
import type { RegisterResponse } from "./userService";

// Interface for quiz session response
export interface QuizSessionResponse {
  id: string;
  name: string;
  description: string;
  quiz_session_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

// Interface for quiz data
export interface QuizData {
  id: string;
  name: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    type: "multiple_choice" | "true_false" | "essay";
    options?: string[];
    correct_answer?: string;
    points: number;
  }>;
  total_points: number;
  time_limit?: number;
}

export interface QuizSessionDetail {
  id: string;
  quiz_id: string; // Add quiz_id to reference the quiz
  teacher: RegisterResponse;
  total_questions: number;
  status: string;
}

// Interface for join quiz session response
export interface JoinQuizSessionResponse {
  sessionToken: string;
  participant_id: string;
  quiz: QuizData;
}

/**
 * Join a quiz session with access code
 */
export const joinQuizSession = async (
  accessCode: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.post<SuccessApiResponse<void>>(
      `/quiz-sessions/joinQuizSession`,
      {
        access_code: accessCode,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error joining quiz session:", error);
    throw error;
  }
};

/**
 * Get quiz session status for waiting room polling
 */
export const getQuizSessionStatus = async (
  quizSessionId: string,
  sessionToken: string,
): Promise<
  SuccessApiResponse<{ status: string; participantCount: number }>
> => {
  try {
    const response = await api.get<
      SuccessApiResponse<{ status: string; participantCount: number }>
    >(`/quiz-sessions/${quizSessionId}/status`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz session status:", error);
    throw error;
  }
};

export const getQuizSessionDetail = async (
  quizSessionId: string,
): Promise<SuccessApiResponse<QuizSessionDetail>> => {
  try {
    const response = await api.get<SuccessApiResponse<QuizSessionDetail>>(
      `/quiz-sessions/${quizSessionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz session details:", error);
    throw error;
  }
};

// Quiz submission interfaces
export interface QuizSubmissionRequest {
  quiz_session_id: string;
  multiple_choice_answers: MultipleChoiceAnswerSubmission[];
  matching_answers: MatchingAnswerSubmission[];
}

export interface MultipleChoiceAnswerSubmission {
  question_id: string;
  answer_participant: {
    user_id: string;
    answer: string;
    correct: boolean;
  }[];
}

export interface MatchingAnswerSubmission {
  match_pair_id: string;
  item_a: {
    content: string;
    matching_type: string;
  };
  item_b: {
    content: string;
    matching_type: string;
  };
}

// API function to submit quiz answers
export const submitQuizAnswer = async (
  submissionData: QuizSubmissionRequest,
): Promise<SuccessApiResponse<number>> => {
  try {
    const response = await api.post<SuccessApiResponse<number>>(
      `/quiz-sessions/submitQuizSession`,
      submissionData,
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    throw error;
  }
};
