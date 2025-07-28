import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaClock,
  FaChevronLeft,
  FaPlay,
  FaPause,
  FaFlag,
  FaExclamationTriangle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { usePageTitle, PAGE_TITLES } from "../../utils/title";
import type { QuizData } from "../../services/quizSessionService";

// Interface for quiz taking state
interface QuizTakingState {
  accessCode: string;
  quiz?: QuizData;
  sessionData?: Record<string, unknown>; // Additional session data if needed
  quizSessionId?: string;
  quizSessionName?: string;
  isWaitingForTeacher?: boolean;
}

// Interface for user answers
interface UserAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
}

const QuizTaking = () => {
  const { t } = useTranslation();
  usePageTitle(PAGE_TITLES.QUIZ_TAKING);

  const navigate = useNavigate();
  const location = useLocation();

  // Get quiz data from navigation state
  const quizState = location.state as QuizTakingState | null;

  const [quiz] = useState<QuizData | null>(quizState?.quiz || null);
  const [isWaitingForTeacher, setIsWaitingForTeacher] = useState(
    quizState?.isWaitingForTeacher || false,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize timer
  useEffect(() => {
    if (quiz?.time_limit && timeRemaining === null) {
      setTimeRemaining(quiz.time_limit * 60); // Convert minutes to seconds
    }
  }, [quiz, timeRemaining]);

  // Handle quiz submission
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || !quizState) return;

    try {
      setIsSubmitting(true);

      // TODO: Call API to submit quiz answers
      // const response = await submitQuizAnswers(quizState.sessionToken, answers);

      // For now, simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to results page (temporary - just go back for now)
      navigate("/student/classrooms", {
        replace: true,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      // Handle error
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
      setHasUnsavedChanges(false);
    }
  }, [quiz, quizState, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Auto submit when time is up
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused, handleSubmitQuiz]);

  // Track time spent on current question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Redirect if no quiz data
  useEffect(() => {
    if (!quizState) {
      navigate("/student/classrooms");
    }
  }, [quizState, navigate]);

  // Prevent accidental page exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  // Navigate to question
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < (quiz?.questions.length || 0)) {
        setCurrentQuestionIndex(index);
      }
    },
    [quiz?.questions.length],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser shortcuts

      switch (e.key) {
        case "ArrowLeft":
          if (currentQuestionIndex > 0) {
            goToQuestion(currentQuestionIndex - 1);
          }
          break;
        case "ArrowRight":
          if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            goToQuestion(currentQuestionIndex + 1);
          }
          break;
        case "Enter":
          if (e.shiftKey) {
            // Shift+Enter to submit
            setShowSubmitConfirm(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, quiz?.questions.length, goToQuestion]);

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle answer change
  const handleAnswerChange = (
    questionId: string,
    answer: string | string[],
  ) => {
    const timeSpent = Date.now() - questionStartTime;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        timeSpent: (prev[questionId]?.timeSpent || 0) + timeSpent,
      },
    }));
    setQuestionStartTime(Date.now());
    setHasUnsavedChanges(true);
  };

  // Render question based on type
  const renderQuestion = (question: QuizData["questions"][0]) => {
    const currentAnswer = answers[question.id]?.answer;

    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case "true_false":
        return (
          <div className="space-y-3">
            {["True", "False"].map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case "essay":
        return (
          <textarea
            value={typeof currentAnswer === "string" ? currentAnswer : ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Type your answer here..."
          />
        );

      default:
        return (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  if (!quizState) {
    return (
      <LoadingOverlay
        show={true}
        message="Loading quiz..."
        variant="fullscreen"
      />
    );
  }

  // Show waiting for teacher screen if quiz hasn't started yet
  if (isWaitingForTeacher || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FaChevronLeft className="h-4 w-4" />
                  <span>{t("quizTaking.back")}</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 lg:text-xl dark:text-white">
                  {quizState?.quizSessionName || t("quizTaking.quizSession")}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Waiting Content */}
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            {/* Status icon */}
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FaPause className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>

            {/* Main message */}
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {t("quizTaking.waitingForTeacher")}
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              {t("quizTaking.waitingMessage")}
            </p>

            {/* Status info */}
            <div className="mx-auto mb-8 max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t("quizTaking.quizStatus")}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("quizTaking.accessCode")}:
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {quizState?.accessCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("quizTaking.status")}:
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                    <FaPause className="h-3 w-3" />
                    {t("quizTaking.waitingForTeacher")}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                    {t("quizTaking.waitingInstructions")}
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                    <li>• {t("quizTaking.waitingRules.stayOnTab")}</li>
                    <li>• {t("quizTaking.waitingRules.stableConnection")}</li>
                    <li>• {t("quizTaking.waitingRules.autoStart")}</li>
                    <li>• {t("quizTaking.waitingRules.reviewRules")}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Test button to simulate teacher starting quiz */}
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                {t("quizTaking.leaveQuizRoom")}
              </Button>

              {/* Test button - remove in production */}
              <Button
                variant="primary"
                onClick={() => {
                  setIsWaitingForTeacher(false);
                  // Simulate getting quiz data from API
                  // In real implementation, this would come from polling or websocket
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <FaPlay className="mr-2 h-4 w-4" />
                {t("quizTaking.startQuizTest")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no quiz data is available, show loading
  if (!quiz) {
    return (
      <LoadingOverlay
        show={true}
        message={t("quizTaking.loadingQuizData")}
        variant="fullscreen"
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (
                      window.confirm(
                        "You have unsaved changes. Are you sure you want to leave?",
                      )
                    ) {
                      navigate(-1);
                    }
                  } else {
                    navigate(-1);
                  }
                }}
                className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FaChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <h1 className="text-lg font-bold text-gray-900 lg:text-xl dark:text-white">
                {quiz.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-4">
              {/* Timer */}
              {timeRemaining !== null && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm lg:text-base ${
                    timeRemaining < 300
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  <FaClock className="h-4 w-4" />
                  <span className="font-mono font-bold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              {/* Pause/Resume */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="hidden lg:flex"
              >
                {isPaused ? (
                  <FaPlay className="h-4 w-4" />
                ) : (
                  <FaPause className="h-4 w-4" />
                )}
                <span className="ml-2">{isPaused ? "Resume" : "Pause"}</span>
              </Button>

              {/* Mobile pause button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="lg:hidden"
              >
                {isPaused ? (
                  <FaPlay className="h-4 w-4" />
                ) : (
                  <FaPause className="h-4 w-4" />
                )}
              </Button>

              {/* Submit */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
              >
                <FaFlag className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Submit Quiz</span>
                <span className="lg:hidden">Submit</span>
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {answeredQuestions} answered
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Question navigation sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-3">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`h-10 w-10 rounded-lg border-2 text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? "border-blue-500 bg-blue-500 text-white"
                        : answers[quiz.questions[index].id]
                          ? "border-green-500 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Keyboard shortcuts info */}
              <div className="mt-4 hidden text-xs text-gray-500 lg:block dark:text-gray-400">
                <p className="font-medium">Keyboard shortcuts:</p>
                <p>← → Navigate questions</p>
                <p>Shift+Enter Submit quiz</p>
              </div>
            </div>
          </div>

          {/* Main question area */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-6 dark:border-gray-700 dark:bg-gray-800">
              {currentQuestion && (
                <>
                  <div className="mb-6">
                    <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Question {currentQuestionIndex + 1}
                      </h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currentQuestion.points} point
                        {currentQuestion.points !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-base text-gray-900 lg:text-lg dark:text-white">
                      {currentQuestion.question}
                    </p>
                  </div>

                  <div className="mb-8">{renderQuestion(currentQuestion)}</div>

                  {/* Navigation buttons */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => goToQuestion(currentQuestionIndex - 1)}
                      disabled={currentQuestionIndex === 0}
                      className="w-full lg:w-auto"
                    >
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={() => goToQuestion(currentQuestionIndex + 1)}
                          className="flex-1 lg:flex-none"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => setShowSubmitConfirm(true)}
                          className="flex-1 lg:flex-none"
                        >
                          <FaFlag className="mr-2 h-4 w-4" />
                          Submit Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Submit Quiz?
              </h3>
            </div>

            <p className="mb-6 text-gray-600 dark:text-gray-400">
              You have answered {answeredQuestions} out of{" "}
              {quiz.questions.length} questions. Are you sure you want to submit
              your quiz? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for submission */}
      {isSubmitting && (
        <LoadingOverlay
          show={true}
          message="Submitting your quiz..."
          variant="fullscreen"
        />
      )}
    </div>
  );
};

export default QuizTaking;
