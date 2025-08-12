import type { SuccessApiResponse } from "../types/response";
import api from "../utils/axiosCustom";
import type { RegisterResponse } from "./userService";

// Interface for quiz session response
export interface QuizSessionDetailResponse {
  id: string;
  name: string;
  description: string;
  quiz_session_id: string;
  access_code: string;
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

// Interface for quiz session history response
export interface QuizSessionHistoryResponse {
  quiz: {
    id: string;
    name: string;
    description: string;
    teacher_id: string;
    class_ids: string[];
    created_at: string;
    updated_at: string;
    public: boolean;
    active: boolean;
  };
  multiple_choice_quiz: {
    id: string;
    questions: Array<{
      question_id: string;
      question_text: string;
      hint: string;
      time_limit: number;
      allow_multiple_answers: boolean;
      points: number;
      answers: Array<{
        answer_text: string;
        correct: boolean;
      }>;
      answer_participants: Array<{
        user_id: string;
        answer: string;
        correct: boolean;
        quiz_session_id: string;
      }>;
    }>;
    quiz_id: string;
    quiz_session_id: string | null;
  };
  matching_quiz: {
    id: string;
    time_limit: number;
    quiz_id: string;
    quiz_session_id: string | null;
    match_pairs: Array<{
      id: string;
      item_a: {
        content: string;
        matching_type: string;
      };
      item_b: {
        content: string;
        matching_type: string;
      };
      points: number;
    }>;
    answer_participants: Array<{
      user_id: string;
      answers: Array<{
        match_pair_id: string;
        item_a: {
          content: string;
          matching_type: string;
        };
        item_b: {
          content: string;
          matching_type: string;
        };
        correct: boolean;
      }>;
      quiz_session_id: string;
    }>;
  };
}

// Interface for quiz submission response (for results modal)
export interface QuizSubmissionResponse {
  percentage: number;
  total_score: number;
  max_score: number;
  submitted_at: string;
  correct_answers: number;
  total_questions: number;
  multiple_choice_details: {
    correct: number;
    total: number;
    score: number;
  };
  matching_details: {
    correct: number;
    total: number;
    score: number;
  };
}

// Interface for scoreboard entry
export interface ScoreboardEntry {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  score: number;
  rank: number;
  quiz_session_id: string;
}

// New: Student scores across quiz sessions
export interface StudentQuizSessionScore {
  score?: number;
  quiz_session_id: string;
  quiz_name: string;
  classroom_name: string;
  start_time?: string;
  end_time?: string;
}

export interface StudentScoreStats {
  attempts: number; // total sessions in list
  completed: number; // sessions with a score
  avgScore: number | null;
  bestScore: number | null;
  worstScore: number | null;
  trend: Array<{ t: string; score: number | null; label: string }>;
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

export const startQuizSession = async (
  quizSessionId: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.put<SuccessApiResponse<void>>(
      `/quiz-sessions/start/${quizSessionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error starting quiz session:", error);
    throw error;
  }
};

export const endQuizSession = async (
  quizSessionId: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.put<SuccessApiResponse<void>>(
      `/quiz-sessions/close/${quizSessionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error ending quiz session:", error);
    throw error;
  }
};

export const getQuizSessionHistory = async (
  quizSessionId: string,
  userId: string,
): Promise<SuccessApiResponse<QuizSessionHistoryResponse>> => {
  try {
    const response = await api.get<
      SuccessApiResponse<QuizSessionHistoryResponse>
    >(`/quiz-sessions/history/${quizSessionId}`, {
      params: {
        uid: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting quiz session history:", error);
    throw error;
  }
};

export const getStudentsInQuizSession = async (
  quizSessionId: string,
): Promise<SuccessApiResponse<RegisterResponse[]>> => {
  try {
    const response = await api.get<SuccessApiResponse<RegisterResponse[]>>(
      `/quiz-sessions/${quizSessionId}/students`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching students in quiz session:", error);
    throw error;
  }
};

export const getQuizSessionScoreboard = async (
  sessionId: string,
): Promise<SuccessApiResponse<ScoreboardEntry[]>> => {
  try {
    const response = await api.get<SuccessApiResponse<ScoreboardEntry[]>>(
      `/quiz-sessions/${sessionId}/scoreboard`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz session scoreboard:", error);
    throw error;
  }
};

export const getStudentQuizSessionScores = async (): Promise<
  SuccessApiResponse<StudentQuizSessionScore[]>
> => {
  try {
    const response = await api.get<
      SuccessApiResponse<StudentQuizSessionScore[]>
    >(`/quiz-sessions/student/scores`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student quiz session scores:", error);
    throw error;
  }
};

export const computeStudentScoreStats = (
  data: StudentQuizSessionScore[],
): StudentScoreStats => {
  const attempts = data.length;
  const withScores = data.filter((d) => typeof d.score === "number");
  const completed = withScores.length;

  const avgScore = completed
    ? parseFloat(
        (
          withScores.reduce((sum, d) => sum + (d.score as number), 0) /
          completed
        ).toFixed(2),
      )
    : null;

  const bestScore = completed
    ? withScores.reduce((max, d) => Math.max(max, d.score as number), -Infinity)
    : null;
  const worstScore = completed
    ? withScores.reduce((min, d) => Math.min(min, d.score as number), Infinity)
    : null;

  // Sort by time ascending for trend (fallback to index order when no time)
  const sorted = [...data].sort((a, b) => {
    const ta = new Date(a.end_time || a.start_time || 0).getTime();
    const tb = new Date(b.end_time || b.start_time || 0).getTime();
    return ta - tb;
  });

  const trend = sorted.map((d) => ({
    t: (d.end_time || d.start_time || "") as string,
    score: typeof d.score === "number" ? (d.score as number) : null,
    label: d.quiz_name,
  }));

  return { attempts, completed, avgScore, bestScore, worstScore, trend };
};
