import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaFlag,
  FaCheck,
  FaPlay,
  FaExclamationTriangle,
} from "react-icons/fa";

import { usePageTitle, PAGE_TITLES } from "../../utils/title";
import {
  getQuizQuestions,
  type QuizQuestionsResponse,
  type QuizQuestionMultipleChoice,
  type QuizQuestionMatchingItem,
} from "../../services/quizService";
import {
  submitQuizAnswer,
  type QuizSubmissionRequest,
  type MultipleChoiceAnswerSubmission,
  type MatchingAnswerSubmission,
  getQuizSessionDetail,
} from "../../services/quizSessionService";
import {
  connectSessionSocket,
  disconnectSessionSocket,
  type SessionSocketCallbacks,
} from "../../services/simpleJoinSocket";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import "../../styles/quiz-animations.css";
import { useSelector } from "react-redux";
import type { RegisterResponse } from "../../services/userService";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";

// Interface for quiz taking state
interface QuizTakingState {
  accessCode: string;
  quizSessionId?: string;
  quizSessionName?: string;
  quizId?: string;
  classroomId?: string;
  isWaitingForTeacher?: boolean;
}

// Interface for waiting room info
interface WaitingRoomInfo {
  quizSessionName: string;
  status: "LOBBY" | "ACTIVE" | "COMPLETED" | "PAUSED";
  totalQuestions?: number;
  teacherName?: string;
  estimatedStartTime?: string;
  quizId?: string;
}

// Combined question type for easy handling
interface CombinedQuestion {
  id: string;
  type: "multiple_choice" | "matching";
  question: string;
  points: number;
  time_limit?: number;
  hint?: string;
  // For multiple choice
  answers?: { answer_text: string }[];
  allow_multiple_answers?: boolean;
  // For matching
  item_a?: QuizQuestionMatchingItem[];
  item_b?: QuizQuestionMatchingItem[];
}

// User answer interface
interface UserAnswer {
  questionId: string;
  answer: string | string[] | Array<{ itemA: string; itemB: string }>;
  timeSpent: number;
}

const QuizTaking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { quizSessionId } = useParams<{ quizSessionId: string }>();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestionsResponse | null>(null);
  const [allQuestions, setAllQuestions] = useState<CombinedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(
    {},
  );
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [matchingSelections, setMatchingSelections] = useState<{
    itemA?: string;
    itemB?: string;
  }>({});
  const [matchingPairs, setMatchingPairs] = useState<
    Array<{ itemA: string; itemB: string }>
  >([]);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [lowTimeWarningPlayed, setLowTimeWarningPlayed] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [connectionPoints, setConnectionPoints] = useState<
    Array<{
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      itemAIndex: number;
      itemBIndex: number;
    }>
  >([]);

  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  // Quiz submission state
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get state from navigation
  const navigationState = location.state as QuizTakingState | null;
  const sessionId = quizSessionId || navigationState?.quizSessionId || "";
  const classroomId = navigationState?.classroomId || "";

  // Waiting room state
  const [waitingRoomInfo, setWaitingRoomInfo] = useState<WaitingRoomInfo>({
    quizSessionName: navigationState?.quizSessionName || "Quiz Session",
    status: "LOBBY",
  });
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Start exam countdown state
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  usePageTitle(PAGE_TITLES.QUIZ_TAKING);

  // Callback functions

  // Function to format and submit quiz answers
  const submitQuiz = useCallback(async () => {
    if (!sessionId || isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Format multiple choice answers
      const multipleChoiceAnswers = allQuestions
        .filter((q) => q.type === "multiple_choice")
        .map((question) => {
          const userAnswer = userAnswers[question.id];
          if (!userAnswer) return null;

          return {
            question_id: question.id,
            answer_participant: [
              {
                user_id: user.id,
                answer: Array.isArray(userAnswer.answer)
                  ? userAnswer.answer.join(",")
                  : String(userAnswer.answer),
              },
            ],
          };
        })
        .filter(Boolean);

      // Format matching answers
      const matchingAnswers = allQuestions
        .filter((q) => q.type === "matching")
        .flatMap((question) => {
          const userAnswer = userAnswers[question.id];
          if (!userAnswer || !Array.isArray(userAnswer.answer)) return [];

          return (userAnswer.answer as Array<{ itemA: string; itemB: string }>)
            .map((pair) => {
              // Find the matching items in separate arrays
              const itemA = question.item_a?.find(
                (item) => item.content === pair.itemA,
              );
              const itemB = question.item_b?.find(
                (item) => item.content === pair.itemB,
              );

              if (!itemA || !itemB) {
                console.warn("Could not find matching items for:", pair);
                return null;
              }

              // Create a simple pair ID by combining the indices or using actual IDs if available
              const pairId = itemA.id;

              return {
                match_pair_id: pairId,
                item_a: {
                  content: pair.itemA,
                  matching_type: itemA.matching_type,
                },
                item_b: {
                  content: pair.itemB,
                  matching_type: itemB.matching_type,
                },
              };
            })
            .filter(Boolean); // Remove null values
        });

      const submissionData: QuizSubmissionRequest = {
        quiz_session_id: sessionId,
        multiple_choice_answers:
          multipleChoiceAnswers as MultipleChoiceAnswerSubmission[],
        matching_answers: matchingAnswers as MatchingAnswerSubmission[],
      };

      console.log("Submitting quiz answers:");
      console.log("Multiple choice answers:", multipleChoiceAnswers);
      console.log("Matching answers:", matchingAnswers);
      console.log("Full submission data:", submissionData);

      const score = await submitQuizAnswer(submissionData);

      if (typeof score.data === "number") {
        setQuizScore(score.data);
        setShowResultsModal(true);
        setTimerActive(false); // Stop the timer
      } else {
        setError("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
      setError("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [sessionId, allQuestions, userAnswers, isSubmitting, user.id]);

  const handleNextQuestion = useCallback(async () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Reset matching state when moving to next question
      setMatchingSelections({});
      if (allQuestions[currentQuestionIndex + 1]?.type === "matching") {
        setMatchingPairs([]);
      }
    } else {
      // Last question - submit the quiz
      await submitQuiz();
    }
  }, [currentQuestionIndex, allQuestions, submitQuiz]);

  // Ref để tránh dependency issues với submitQuiz
  const submitQuizRef = useRef<() => Promise<void>>(async () => {});

  // Cập nhật ref mỗi khi submitQuiz thay đổi
  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  const handleTimeUp = useCallback(async () => {
    // Auto-advance to next question when time runs out
    if (currentQuestionIndex < allQuestions.length - 1) {
      handleNextQuestion();
    } else {
      // Quiz finished, handle submission
      console.log("Quiz time up, auto-submitting...");
      await submitQuiz();
    }
  }, [
    currentQuestionIndex,
    allQuestions.length,
    handleNextQuestion,
    submitQuiz,
  ]);

  // Effect to sync matching pairs with current question
  useEffect(() => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (currentQuestion?.type === "matching") {
      const existingAnswer = userAnswers[currentQuestion.id];
      if (existingAnswer && Array.isArray(existingAnswer.answer)) {
        setMatchingPairs(
          existingAnswer.answer as Array<{ itemA: string; itemB: string }>,
        );
      } else {
        setMatchingPairs([]);
      }
    }
  }, [currentQuestionIndex, allQuestions, userAnswers]);

  // Calculate connection points for SVG lines
  useEffect(() => {
    const updateConnectionPoints = () => {
      if (matchingPairs.length === 0) {
        setConnectionPoints([]);
        return;
      }

      const newConnectionPoints: Array<{
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        itemAIndex: number;
        itemBIndex: number;
      }> = [];

      const container = document.querySelector(".matching-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      matchingPairs.forEach((pair) => {
        const currentQuestion = allQuestions[currentQuestionIndex];
        if (!currentQuestion?.item_a || !currentQuestion?.item_b) return;

        const itemAIndex = currentQuestion.item_a.findIndex(
          (item) => item.content === pair.itemA,
        );
        const itemBIndex = currentQuestion.item_b.findIndex(
          (item) => item.content === pair.itemB,
        );

        if (itemAIndex === -1 || itemBIndex === -1) return;

        const itemAElement = document.getElementById(`item-a-${itemAIndex}`);
        const itemBElement = document.getElementById(`item-b-${itemBIndex}`);

        if (itemAElement && itemBElement) {
          const itemARect = itemAElement.getBoundingClientRect();
          const itemBRect = itemBElement.getBoundingClientRect();

          // Calculate relative positions within the container
          const startX = itemARect.right - containerRect.left;
          const startY =
            itemARect.top + itemARect.height / 2 - containerRect.top;
          const endX = itemBRect.left - containerRect.left;
          const endY = itemBRect.top + itemBRect.height / 2 - containerRect.top;

          newConnectionPoints.push({
            startX,
            startY,
            endX,
            endY,
            itemAIndex,
            itemBIndex,
          });
        }
      });

      setConnectionPoints(newConnectionPoints);
    };

    // Delay to ensure DOM elements are rendered
    const timeout = setTimeout(updateConnectionPoints, 100);

    window.addEventListener("resize", updateConnectionPoints);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateConnectionPoints);
    };
  }, [matchingPairs, allQuestions, currentQuestionIndex]);

  // Update connections when matching pairs change and DOM is ready
  useEffect(() => {
    if (matchingPairs.length > 0) {
      const timer = setTimeout(() => {
        // Force re-calculation of connection points
        const updateEvent = new Event("resize");
        window.dispatchEvent(updateEvent);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [matchingPairs]);

  // Timer management effect
  useEffect(() => {
    if (!isQuizStarted || allQuestions.length === 0) return;

    const currentQuestion = allQuestions[currentQuestionIndex];
    if (!currentQuestion?.time_limit) {
      setTimeLeft(null);
      setTimerActive(false);
      return;
    }

    // Start timer for current question
    setTimeLeft(currentQuestion.time_limit);
    setTimerActive(true);
    setTimerStartTime(Date.now());
    setLowTimeWarningPlayed(false); // Reset warning for new question
    setShowTimeWarning(false); // Hide any existing warning
  }, [currentQuestionIndex, isQuizStarted, allQuestions]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerActive || timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          // Auto-advance to next question when time runs out
          handleTimeUp();
          return 0;
        }

        // Play warning sound when 10 seconds left
        if (prev === 11 && !lowTimeWarningPlayed) {
          setLowTimeWarningPlayed(true);
          setShowTimeWarning(true);

          try {
            const audio = new Audio("/audio/ticking.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Ignore audio play errors (e.g., no user interaction yet)
            });
          } catch (error) {
            console.warn("Could not play warning sound:", error);
          }

          // Hide warning after 3 seconds
          setTimeout(() => setShowTimeWarning(false), 3000);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, handleTimeUp, lowTimeWarningPlayed]);

  // Load quiz data when we have quizId from session details
  useEffect(() => {
    const loadQuizData = async () => {
      const quizId = waitingRoomInfo.quizId;
      if (!quizId) {
        // Don't show error immediately, wait for session details to load
        if (!isLoadingSession) {
          setError("Quiz ID is required");
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const quizData = await getQuizQuestions(quizId);
        setQuiz(quizData.data);
        console.log("Loaded quiz data:", quizData.data);
        // Combine multiple choice and matching questions into a single array
        const combinedQuestions: CombinedQuestion[] = [];

        // Process multiple choice questions
        if (quizData.data.multiple_choice_quiz?.questions) {
          quizData.data.multiple_choice_quiz.questions.forEach(
            (mcq: QuizQuestionMultipleChoice) => {
              combinedQuestions.push({
                id: mcq.question_id,
                type: "multiple_choice",
                question: mcq.question_text,
                points: mcq.points,
                time_limit: mcq.time_limit,
                hint: mcq.hint,
                answers: mcq.answers,
                allow_multiple_answers: mcq.allow_multiple_answers,
              });
            },
          );
        }

        // Process matching questions - treat entire matching quiz as one question
        if (
          quizData.data.matching_quiz?.item_a &&
          quizData.data.matching_quiz.item_a.length > 0 &&
          quizData.data.matching_quiz?.item_b &&
          quizData.data.matching_quiz.item_b.length > 0
        ) {
          // Calculate total points for matching quiz
          const totalMatchingPoints = quizData.data.matching_quiz.item_a.length; // 1 point per pair by default

          combinedQuestions.push({
            id: "matching_quiz",
            type: "matching",
            question: "Ghép các cặp phù hợp",
            points: totalMatchingPoints,
            time_limit: quizData.data.matching_quiz.time_limit,
            item_a: quizData.data.matching_quiz.item_a,
            item_b: quizData.data.matching_quiz.item_b,
          });
        }

        setAllQuestions(combinedQuestions);
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError("Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [waitingRoomInfo.quizId, isLoadingSession]);

  // Load quiz session details on component mount
  useEffect(() => {
    if (!sessionId) {
      navigate("/student/classrooms");
      return;
    }

    const loadQuizSessionDetail = async () => {
      try {
        setIsLoadingSession(true);

        const response = await getQuizSessionDetail(sessionId);

        if (response.code === "M000" && response.data) {
          // Check if session is ACTIVE and student is trying to join without access code
          // (This prevents direct URL access to active sessions)
          if (
            response.data.status === "ACTIVE" &&
            !navigationState?.accessCode
          ) {
            setError(
              "Không thể tham gia: Quiz đã bắt đầu. Vui lòng chờ quiz tiếp theo.",
            );
            setTimeout(() => {
              navigate("/student/classrooms");
            }, 3000);
            return;
          }

          // Update waiting room info with the API response
          setWaitingRoomInfo((prev) => ({
            ...prev,
            status: response.data.status as
              | "LOBBY"
              | "ACTIVE"
              | "COMPLETED"
              | "PAUSED",
            totalQuestions: response.data.total_questions,
            teacherName: response.data.teacher.display_name,
            quizId: response.data.quiz_id,
          }));

          // If status is already "ACTIVE" and student has access code, auto-start the quiz
          if (
            response.data.status === "ACTIVE" &&
            navigationState?.accessCode
          ) {
            setIsQuizStarted(true);
          }
        }
      } catch (error) {
        console.error("Error loading quiz session details:", error);
        setError(t("quizWaitingRoom.loadFailed"));
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadQuizSessionDetail();
  }, [sessionId, navigate, t, navigationState?.accessCode]);

  // Connect to start exam socket
  useEffect(() => {
    if (!sessionId) return;

    console.log(
      "🔌 Setting up unified socket connection for session:",
      sessionId,
    );

    const handleStartExamMessage = (shouldStart: boolean) => {
      console.log("📡 Received START EXAM signal:", shouldStart);
      if (shouldStart) {
        setIsStartingExam(true);
        setCountdown(10);

        // Start countdown
        let timeLeft = 10;
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);

          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            setIsStartingExam(false);
            setCountdown(null);
            setIsQuizStarted(true);
          }
        }, 1000);
      }
    };

    const handleConnectionChange = (connected: boolean) => {
      console.log("🔗 Socket connection status:", connected);
      setIsSocketConnected(connected);
    };

    // Handler for close quiz session inside useEffect to avoid dependencies issue
    const handleCloseQuizMessageLocal = async (shouldClose: boolean) => {
      console.log("📡 Received CLOSE QUIZ signal:", shouldClose);
      if (shouldClose) {
        console.log("📡 Processing quiz close signal from teacher");
        // Auto-submit the quiz when teacher closes the session
        setTimerActive(false); // Stop the timer
        // Use ref to call submitQuiz
        if (submitQuizRef.current) {
          await submitQuizRef.current();
        }
      }
    };

    // Create unified callback structure for session socket
    const callbacks: SessionSocketCallbacks = {
      onStartExam: handleStartExamMessage,
      onCloseQuiz: handleCloseQuizMessageLocal,
      onConnectionChange: handleConnectionChange,
    };

    // Connect to unified session socket
    console.log("🚀 Connecting to unified session socket...");
    connectSessionSocket(sessionId, callbacks);

    // Cleanup on unmount
    return () => {
      // Disconnect session socket
      disconnectSessionSocket();
    };
  }, [sessionId]); // Chỉ dependency sessionId

  const handleBackToLobby = () => {
    navigate("/student/classrooms");
  };

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[] | Array<{ itemA: string; itemB: string }>,
  ) => {
    // Calculate time spent on this question
    const timeSpent = timerStartTime
      ? Math.floor((Date.now() - timerStartTime) / 1000)
      : 0;

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        timeSpent,
      },
    }));
  };

  const handleMatchingSelection = (item: string, type: "itemA" | "itemB") => {
    if (type === "itemA") {
      if (matchingSelections.itemA === item) {
        // Deselect if already selected
        setMatchingSelections((prev) => ({ ...prev, itemA: undefined }));
      } else {
        setMatchingSelections((prev) => ({ ...prev, itemA: item }));
        // If both are selected, create a pair
        if (matchingSelections.itemB) {
          const newPair = { itemA: item, itemB: matchingSelections.itemB };
          setMatchingPairs((prev) => [...prev, newPair]);
          setMatchingSelections({});
          // Update answer
          handleAnswerChange("matching_quiz", matchingPairs.concat(newPair));
        }
      }
    } else {
      if (matchingSelections.itemB === item) {
        setMatchingSelections((prev) => ({ ...prev, itemB: undefined }));
      } else {
        setMatchingSelections((prev) => ({ ...prev, itemB: item }));
        if (matchingSelections.itemA) {
          const newPair = { itemA: matchingSelections.itemA, itemB: item };
          setMatchingPairs((prev) => [...prev, newPair]);
          setMatchingSelections({});
          handleAnswerChange("matching_quiz", matchingPairs.concat(newPair));
        }
      }
    }
  };

  // Function to check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (!currentQuestion) return false;

    const answer = userAnswers[currentQuestion.id];
    if (!answer) return false;

    if (currentQuestion.type === "multiple_choice") {
      return (
        (answer.answer &&
          typeof answer.answer === "string" &&
          answer.answer.length > 0) ||
        (Array.isArray(answer.answer) && answer.answer.length > 0)
      );
    }

    if (currentQuestion.type === "matching") {
      return (
        matchingPairs.length ===
        Math.min(
          currentQuestion.item_a?.length || 0,
          currentQuestion.item_b?.length || 0,
        )
      );
    }

    return false;
  };

  // Function to toggle hint visibility
  const toggleHint = (questionId: string) => {
    setShowHints((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const renderQuestion = (question: CombinedQuestion) => {
    const currentAnswer = userAnswers[question.id]?.answer;
    const showHint = showHints[question.id] || false;

    if (question.type === "multiple_choice") {
      return (
        <div className="space-y-4">
          {question.hint && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleHint(question.id)}
                className="flex items-center gap-2"
              >
                💡 {showHint ? "Ẩn gợi ý" : "Hiển thị gợi ý"}
              </Button>

              {showHint && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>💡 Gợi ý:</strong> {question.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {question.answers?.map((answer, index: number) => (
              <label
                key={index}
                className="group flex cursor-pointer items-center rounded-lg border-2 border-gray-200 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10"
              >
                <input
                  type={question.allow_multiple_answers ? "checkbox" : "radio"}
                  name={`question-${question.id}`}
                  value={answer.answer_text}
                  checked={
                    question.allow_multiple_answers
                      ? Array.isArray(currentAnswer) &&
                        (currentAnswer as string[]).includes(answer.answer_text)
                      : currentAnswer === answer.answer_text
                  }
                  onChange={(e) => {
                    if (question.allow_multiple_answers) {
                      const currentAnswers = Array.isArray(currentAnswer)
                        ? (currentAnswer as string[])
                        : [];
                      if (e.target.checked) {
                        handleAnswerChange(question.id, [
                          ...currentAnswers,
                          answer.answer_text,
                        ]);
                      } else {
                        handleAnswerChange(
                          question.id,
                          currentAnswers.filter(
                            (a) => a !== answer.answer_text,
                          ),
                        );
                      }
                    } else {
                      handleAnswerChange(question.id, answer.answer_text);
                    }
                  }}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-gray-900 dark:text-white">
                  {answer.answer_text}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === "matching") {
      const itemsA = question.item_a?.map((item) => item.content) || [];
      const itemsB = question.item_b?.map((item) => item.content) || [];

      return (
        <div className="space-y-4">
          {/* Instructions */}
          <div className="text-center">
            <p className="text-base text-gray-700 dark:text-gray-300">
              {question.question}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ghép {Math.min(itemsA.length, itemsB.length)} cặp tương ứng
            </p>
          </div>

          {/* Hint section */}
          {question.hint && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleHint(question.id)}
                className="flex items-center gap-2"
              >
                💡 {showHint ? "Ẩn gợi ý" : "Hiển thị gợi ý"}
              </Button>

              {showHint && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>💡 Gợi ý:</strong> {question.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Matching Grid with Connection Lines */}
          <div className="matching-container relative">
            {/* SVG for connection lines */}
            <svg
              className="pointer-events-none absolute inset-0 z-10"
              style={{ width: "100%", height: "100%" }}
            >
              {connectionPoints.map((point, index) => {
                const lineColor = "#3b82f6";

                return (
                  <g key={index}>
                    <line
                      x1={point.startX}
                      y1={point.startY}
                      x2={point.endX}
                      y2={point.endY}
                      stroke={lineColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={point.startX}
                      cy={point.startY}
                      r="4"
                      fill={lineColor}
                    />
                    <circle
                      cx={point.endX}
                      cy={point.endY}
                      r="4"
                      fill={lineColor}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="relative z-20 grid grid-cols-2 gap-6">
              {/* Column A */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  Cột A ({itemsA.length} Items)
                </h3>
                <div className="space-y-2">
                  {itemsA.map((item, index) => {
                    const isSelected = matchingSelections.itemA === item;
                    const isMatched = matchingPairs.some(
                      (pair) => pair.itemA === item,
                    );

                    return (
                      <button
                        key={index}
                        id={`item-a-${index}`}
                        onClick={() => handleMatchingSelection(item, "itemA")}
                        disabled={isMatched}
                        className={`matching-item-hover matching-item-a-hover w-full rounded-lg border-2 p-3 text-left transition-all duration-200 ${
                          isMatched
                            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                            : isSelected
                              ? "border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-400"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              isMatched
                                ? "bg-blue-600 text-white"
                                : isSelected
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                            {item}
                          </span>
                          {isMatched && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                              <span className="text-xs text-white">✓</span>
                            </div>
                          )}
                          {isSelected && !isMatched && (
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column B */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-purple-600 dark:text-purple-400">
                  Cột B ({itemsB.length} Items)
                </h3>
                <div className="space-y-2">
                  {itemsB.map((item, index) => {
                    const isSelected = matchingSelections.itemB === item;
                    const isMatched = matchingPairs.some(
                      (pair) => pair.itemB === item,
                    );

                    const letter = String.fromCharCode(65 + index);

                    return (
                      <button
                        key={index}
                        id={`item-b-${index}`}
                        onClick={() => handleMatchingSelection(item, "itemB")}
                        disabled={isMatched}
                        className={`matching-item-hover matching-item-b-hover w-full rounded-lg border-2 p-3 text-left transition-all duration-200 ${
                          isMatched
                            ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20"
                            : isSelected
                              ? "border-purple-500 bg-purple-100 shadow-lg ring-2 ring-purple-200 dark:bg-purple-900/30 dark:ring-purple-400"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              isMatched
                                ? "bg-purple-600 text-white"
                                : isSelected
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {letter}
                          </div>
                          <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                            {item}
                          </span>
                          {isMatched && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                              <span className="text-xs text-white">✓</span>
                            </div>
                          )}
                          {isSelected && !isMatched && (
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Progress indicator */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tiến độ: {matchingPairs.length}/
                {Math.min(
                  question.item_a?.length || 0,
                  question.item_b?.length || 0,
                )}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(
                  (matchingPairs.length /
                    Math.max(
                      1,
                      Math.min(
                        question.item_a?.length || 0,
                        question.item_b?.length || 0,
                      ),
                    )) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{
                  width: `${(matchingPairs.length / Math.max(1, Math.min(question.item_a?.length || 0, question.item_b?.length || 0))) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Clear all pairs button */}
          {matchingPairs.length > 0 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMatchingPairs([]);
                  setMatchingSelections({});
                  handleAnswerChange(question.id, []);
                }}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                🗑️ Xóa tất cả cặp đã ghép
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingOverlay show={true} message={t("quiz.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <div className="text-center">
              <div className="mb-6 text-lg text-red-600 dark:text-red-400">
                {error}
              </div>
              <Button onClick={handleBackToLobby} variant="primary">
                {t("common.back")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <div className="text-center">
              <div className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                No quiz data available
              </div>
              <Button onClick={handleBackToLobby} variant="primary">
                {t("common.back")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If quiz not started yet, show waiting room screen
  if (!isQuizStarted) {
    // Handle loading states
    if (loading || isLoadingSession) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <LoadingOverlay show={true} message={t("quiz.loading")} />
        </div>
      );
    }

    // Show waiting room interface
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToLobby}
                  className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FaChevronLeft className="h-4 w-4" />
                  <span>{t("quizWaitingRoom.leave")}</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 lg:text-xl dark:text-white">
                  {waitingRoomInfo.quizSessionName}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            {/* Status icon */}
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              {isStartingExam && countdown !== null ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {countdown}
                  </div>
                </div>
              ) : waitingRoomInfo.status === "LOBBY" ? (
                <FaClock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              ) : waitingRoomInfo.status === "ACTIVE" ? (
                <FaPlay className="h-12 w-12 text-green-600 dark:text-green-400" />
              ) : (
                <FaExclamationTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              )}
            </div>

            {/* Quiz Title */}
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {isStartingExam && countdown !== null
                ? "Quiz sắp bắt đầu!"
                : waitingRoomInfo.quizSessionName}
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              {isStartingExam && countdown !== null
                ? "Chuẩn bị tinh thần, quiz sẽ bắt đầu ngay!"
                : waitingRoomInfo.status === "LOBBY"
                  ? t("quizWaitingRoom.reviewInfo")
                  : waitingRoomInfo.status === "ACTIVE"
                    ? "Quiz đã sẵn sàng bắt đầu!"
                    : "Đợi giáo viên bắt đầu quiz..."}
            </p>

            {/* Quiz Information Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {/* Session Information */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {t("quizWaitingRoom.sessionInfo")}
                </h3>
                <div className="space-y-3 text-sm">
                  {navigationState?.accessCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("quizWaitingRoom.accessCode")}:
                      </span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {navigationState.accessCode}
                      </span>
                    </div>
                  )}
                  {waitingRoomInfo.teacherName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("quizWaitingRoom.teacher")}:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {waitingRoomInfo.teacherName}
                      </span>
                    </div>
                  )}
                  {waitingRoomInfo.totalQuestions && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("quizWaitingRoom.totalQuestions")}:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {waitingRoomInfo.totalQuestions}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("quizWaitingRoom.status")}:
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        waitingRoomInfo.status === "LOBBY"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : waitingRoomInfo.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      }`}
                    >
                      {waitingRoomInfo.status === "LOBBY" ? (
                        <>
                          <FaClock className="h-3 w-3" />
                          {t("quizWaitingRoom.readyToStart")}
                        </>
                      ) : waitingRoomInfo.status === "ACTIVE" ? (
                        <>
                          <FaPlay className="h-3 w-3" />
                          Đang hoạt động
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle className="h-3 w-3" />
                          {waitingRoomInfo.status}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quiz Statistics */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Thống kê bài quiz
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Câu trắc nghiệm:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {quiz?.multiple_choice_quiz?.questions?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Câu ghép đôi:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.min(
                        quiz?.matching_quiz?.item_a?.length || 0,
                        quiz?.matching_quiz?.item_b?.length || 0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tổng số câu:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {allQuestions.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Rules */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t("quizWaitingRoom.quizRules")}
              </h3>
              <div className="grid gap-3 text-left text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.timeLimit")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.completionTime")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.noGoBack")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.integrity")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.connection")}</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-1 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="text-left">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                    {t("quizWaitingRoom.importantInstructions")}
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                    <li>• {t("quizWaitingRoom.instructions.readRules")}</li>
                    <li>
                      • {t("quizWaitingRoom.instructions.waitForTeacher")}
                    </li>
                    <li>
                      • {t("quizWaitingRoom.instructions.stableConnection")}
                    </li>
                    <li>• {t("quizWaitingRoom.instructions.noPause")}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={handleBackToLobby}>
                {t("quizWaitingRoom.leaveSession")}
              </Button>

              {/* Show countdown when exam is starting */}
              {isStartingExam && countdown !== null ? (
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-100 px-6 py-3 dark:bg-green-900/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {countdown}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Bắt đầu trong
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Show status message when not starting */
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
                  <div className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                  <span className="text-blue-700 dark:text-blue-300">
                    {isSocketConnected
                      ? "Đợi giáo viên bắt đầu quiz..."
                      : "Đang kết nối..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Smooth Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Quiz info + Progress */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {quiz.quiz.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    Câu {currentQuestionIndex + 1}/{allQuestions.length}
                  </span>
                  <span>•</span>
                  <span>{currentQuestion.points} điểm</span>
                  <span>•</span>
                  <span className="font-medium capitalize">
                    {currentQuestion.type === "multiple_choice"
                      ? "Trắc nghiệm"
                      : "Ghép cặp"}
                  </span>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="hidden items-center gap-3 md:flex">
                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Enhanced Question Navigation */}
              <div className="hidden items-center gap-1 lg:flex">
                {allQuestions.slice(0, 15).map((_, index) => {
                  const isAnswered = !!userAnswers[allQuestions[index].id];
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <div
                      key={index}
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                        isCurrent
                          ? "scale-125 bg-blue-600 ring-2 ring-blue-300"
                          : isAnswered
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  );
                })}
                {allQuestions.length > 15 && (
                  <span className="ml-2 text-sm text-gray-400">
                    +{allQuestions.length - 15}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Timer */}
            <div className="flex items-center gap-3">
              {/* Enhanced Timer */}
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    timeLeft <= 10
                      ? "animate-pulse bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : timeLeft <= 30
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  }`}
                >
                  <FaClock className="h-4 w-4" />
                  <span className="font-mono">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Time warning indicator */}
              {showTimeWarning && (
                <div className="flex animate-pulse items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <FaExclamationTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Sắp hết giờ!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Enhanced Layout */}
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex h-[calc(100vh-9rem)] flex-col rounded-xl bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          {/* Question Content - Maximized Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl leading-relaxed font-semibold text-gray-900 dark:text-white">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="min-h-0">{renderQuestion(currentQuestion)}</div>
          </div>

          {/* Enhanced Footer with Navigation */}
          <div className="rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Question answered indicator */}
                {isCurrentQuestionAnswered() ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <FaCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Đã trả lời</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <span className="text-sm">⚠️ Vui lòng chọn đáp án</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Next/Submit button */}
                <Button
                  variant="primary"
                  onClick={handleNextQuestion}
                  disabled={!isCurrentQuestionAnswered() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Đang nộp...</span>
                    </>
                  ) : currentQuestionIndex === allQuestions.length - 1 ? (
                    <>
                      <FaFlag className="h-4 w-4" />
                      <span>Nộp bài</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp theo</span>
                      <FaChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Warning Toast */}
      <Toast
        isVisible={showTimeWarning}
        type="error"
        message="⏰ Chỉ còn 10 giây để hoàn thành câu hỏi này!"
        onClose={() => setShowTimeWarning(false)}
      />

      {/* Simple Score Modal */}
      {showResultsModal && quizScore !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="text-2xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Hoàn thành bài quiz!
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {quiz?.quiz?.name}
                </p>
              </div>

              <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {quizScore}
                </div>
                <div className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  Điểm số của bạn
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowResultsModal(false);
                    if (classroomId) {
                      navigate(
                        `/student/classroom/${classroomId}?tab=classwork`,
                      );
                    } else {
                      navigate("/student/classrooms/");
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaking;
