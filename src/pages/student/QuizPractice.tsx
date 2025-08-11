import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaFlag,
  FaCheck,
  FaPlay,
  FaExclamationTriangle,
  FaTrophy,
  FaHome,
  FaTimes,
  FaClipboardList,
} from "react-icons/fa";

import { usePageTitle, PAGE_TITLES } from "../../utils/title";
import { type PracticeQuizResponse } from "../../services/quizService";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import "../../styles/quiz-animations.css";

// Fallback image data URL for broken or non-http image sources
const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'>
  <rect width='100%' height='100%' fill='#e5e7eb'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-size='12'>Image</text>
</svg>`,
  );

// Interface for connection points for SVG lines
interface ConnectionPoint {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  itemAIndex: number;
  itemBIndex: number;
  isCorrect?: boolean;
  pairIndex: number;
}

// Practice state interface
interface PracticeState {
  practiceData: PracticeQuizResponse;
  classroomId: string;
  classroomName: string;
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
  answers?: { answer_text: string; correct: boolean }[];
  allow_multiple_answers?: boolean;
  // For matching
  item_a?: { content: string; matching_type: "TEXT" | "IMAGE" }[];
  item_b?: { content: string; matching_type: "TEXT" | "IMAGE" }[];
  // Filter indicating which A/B types this matching question contains
  matchingFilter?: { itemAType: "TEXT" | "IMAGE"; itemBType: "TEXT" | "IMAGE" };
}

// User answer interface
interface UserAnswer {
  questionId: string;
  type: "multiple_choice" | "matching";
  answer: string | string[] | Array<{ itemA: string; itemB: string }>;
  timeSpent: number;
  isCorrect?: boolean;
}

const QuizPractice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get practice data from navigation state
  const practiceState = location.state as PracticeState;

  // State management
  const [allQuestions, setAllQuestions] = useState<CombinedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(
    {},
  );
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<
    Array<{ itemA: string; itemB: string }>
  >([]);
  const [matchingSelections, setMatchingSelections] = useState<{
    itemA?: string;
    itemB?: string;
  }>({});
  // State for connection points for matching lines
  const [connectionPoints, setConnectionPoints] = useState<ConnectionPoint[]>(
    [],
  );

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState({
    correct: 0,
    total: 0,
    percentage: 0,
  });

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // Set page title
  usePageTitle(PAGE_TITLES.QUIZ_PRACTICE);

  // Toast helper wrapped in useCallback to prevent re-renders
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type, isVisible: true });
    },
    [],
  );

  // Get current question
  const currentQuestion = allQuestions[currentQuestionIndex];

  // Load current question's answers when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    const currentAnswer = userAnswers[currentQuestion.id];

    if (currentAnswer) {
      if (currentQuestion.type === "multiple_choice") {
        const mcAnswer = currentAnswer.answer;
        if (Array.isArray(mcAnswer) && typeof mcAnswer[0] === "string") {
          console.log("Setting selectedAnswers from array:", mcAnswer);
          setSelectedAnswers(mcAnswer as string[]);
        } else if (typeof mcAnswer === "string") {
          console.log("Setting selectedAnswers from string:", [mcAnswer]);
          setSelectedAnswers([mcAnswer]);
        } else {
          console.log("No valid MC answer found, clearing selectedAnswers");
          setSelectedAnswers([]);
        }
      } else if (currentQuestion.type === "matching") {
        const matchAnswer = currentAnswer.answer;
        if (
          Array.isArray(matchAnswer) &&
          matchAnswer.length > 0 &&
          typeof matchAnswer[0] === "object"
        ) {
          console.log("Setting matchingPairs:", matchAnswer);
          setMatchingPairs(
            matchAnswer as Array<{ itemA: string; itemB: string }>,
          );
        } else {
          console.log("No valid matching answer found, clearing matchingPairs");
          setMatchingPairs([]);
        }
      }
    } else {
      console.log("No existing answer found, clearing all selections");
      setSelectedAnswers([]);
      setMatchingPairs([]);
    }

    setMatchingSelections({});
  }, [currentQuestionIndex, currentQuestion, userAnswers]);

  // Process practice data into combined questions
  const processPracticeData = useCallback(
    (data: PracticeQuizResponse): CombinedQuestion[] => {
      const questions: CombinedQuestion[] = [];

      // Process multiple choice questions
      if (data.multiple_choice_quiz?.questions) {
        data.multiple_choice_quiz.questions.forEach((mcq) => {
          questions.push({
            id: mcq.question_id,
            type: "multiple_choice",
            question: mcq.question_text,
            points: mcq.points,
            time_limit: mcq.time_limit,
            hint: mcq.hint,
            answers: mcq.answers,
            allow_multiple_answers: mcq.allow_multiple_answers,
          });
        });
      }

      // Split matching questions by type pairs (TEXT/TEXT, TEXT/IMAGE, IMAGE/TEXT, IMAGE/IMAGE)
      if (
        data.matching_quiz?.questions &&
        data.matching_quiz.questions.length > 0
      ) {
        const buckets = {
          TT: [] as typeof data.matching_quiz.questions,
          TI: [] as typeof data.matching_quiz.questions,
          IT: [] as typeof data.matching_quiz.questions,
          II: [] as typeof data.matching_quiz.questions,
        };

        for (const mq of data.matching_quiz.questions) {
          const key = (mq.item_a.matching_type[0] +
            mq.item_b.matching_type[0]) as "TT" | "TI" | "IT" | "II";
          buckets[key].push(mq);
        }

        const buildQuestion = (
          key: "TT" | "TI" | "IT" | "II",
          label: string,
          itemAType: "TEXT" | "IMAGE",
          itemBType: "TEXT" | "IMAGE",
        ) => {
          const group = buckets[key];
          if (group.length === 0) return;

          const allItemA: {
            content: string;
            matching_type: "TEXT" | "IMAGE";
          }[] = [];
          const allItemB: {
            content: string;
            matching_type: "TEXT" | "IMAGE";
          }[] = [];
          let totalPoints = 0;

          for (const g of group) {
            totalPoints += g.points;
            allItemA.push(g.item_a);
            allItemB.push(g.item_b);
          }

          // Shuffle item_b to make it more challenging
          const shuffledItemB = [...allItemB].sort(() => Math.random() - 0.5);

          questions.push({
            id: `matching-${key.toLowerCase()}`,
            type: "matching",
            question: `Match ${label} pairs`,
            points: totalPoints,
            item_a: allItemA,
            item_b: shuffledItemB,
            matchingFilter: { itemAType, itemBType },
          });
        };

        buildQuestion("TT", "Text ↔ Text", "TEXT", "TEXT");
        buildQuestion("TI", "Text ↔ Image", "TEXT", "IMAGE");
        buildQuestion("IT", "Image ↔ Text", "IMAGE", "TEXT");
        buildQuestion("II", "Image ↔ Image", "IMAGE", "IMAGE");
      }

      return questions;
    },
    [],
  );

  // Initialize questions when component mounts
  useEffect(() => {
    if (!practiceState?.practiceData) {
      showToast("No practice data available. Redirecting...", "error");
      navigate("/student/classrooms");
      return;
    }

    const questions = processPracticeData(practiceState.practiceData);
    setAllQuestions(questions);

    // Set initial timer if first question has time limit
    if (questions.length > 0 && questions[0].time_limit) {
      setTimeLeft(questions[0].time_limit);
      setIsTimerActive(true);
    }

    setQuestionStartTime(Date.now());
  }, [practiceState, navigate, processPracticeData, showToast]);

  // Check if answer is correct
  const checkAnswer = useCallback(
    (
      question: CombinedQuestion,
      answer: string | string[] | Array<{ itemA: string; itemB: string }>,
    ): boolean => {
      if (question.type === "multiple_choice") {
        if (question.allow_multiple_answers) {
          const correctAnswers =
            question.answers
              ?.filter((a) => a.correct)
              .map((a) => a.answer_text) || [];
          const userAnswers = Array.isArray(answer)
            ? (answer as string[])
            : answer
              ? [answer as string]
              : [];

          console.log(
            "Multiple choice check - Correct answers:",
            correctAnswers,
          );
          console.log("Multiple choice check - User answers:", userAnswers);

          return (
            correctAnswers.length === userAnswers.length &&
            correctAnswers.every((ca) => userAnswers.includes(ca))
          );
        } else {
          const correctAnswer = question.answers?.find(
            (a) => a.correct,
          )?.answer_text;

          console.log("Single choice check - Correct answer:", correctAnswer);
          console.log("Single choice check - User answer:", answer);

          return answer === correctAnswer;
        }
      } else if (question.type === "matching") {
        // Build correctPairs filtered by this question's types
        const all = practiceState.practiceData.matching_quiz?.questions || [];
        const correctPairs = all
          .filter((mq) => {
            if (!question.matchingFilter) return true;
            return (
              mq.item_a.matching_type === question.matchingFilter.itemAType &&
              mq.item_b.matching_type === question.matchingFilter.itemBType
            );
          })
          .map((mq) => ({
            itemA: mq.item_a.content,
            itemB: mq.item_b.content,
          }));

        if (!Array.isArray(answer) || typeof answer[0] === "string")
          return false;

        const matchingAnswer = answer as Array<{
          itemA: string;
          itemB: string;
        }>;
        return (
          matchingAnswer.length === correctPairs.length &&
          matchingAnswer.every((pair) =>
            correctPairs.some(
              (cp) => cp.itemA === pair.itemA && cp.itemB === pair.itemB,
            ),
          )
        );
      }
      return false;
    },
    [practiceState.practiceData],
  );

  // Save current answer
  const saveCurrentAnswer = useCallback(
    (
      customSelectedAnswers?: string[],
      customMatchingPairs?: Array<{ itemA: string; itemB: string }>,
    ) => {
      console.log("=== SAVE CURRENT ANSWER DEBUG ===");
      console.log("Current Question:", currentQuestion);

      // Use passed parameters or current state
      const currentSelectedAnswers = customSelectedAnswers || selectedAnswers;
      const currentMatchingPairs = customMatchingPairs || matchingPairs;

      console.log("Selected Answers:", currentSelectedAnswers);
      console.log("Matching Pairs:", currentMatchingPairs);

      if (!currentQuestion) {
        console.log("No current question, returning");
        return;
      }

      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      let answer: string | string[] | Array<{ itemA: string; itemB: string }>;
      let isCorrect = false;

      if (currentQuestion.type === "multiple_choice") {
        // For multiple choice, ensure we have a valid answer
        if (currentQuestion.allow_multiple_answers) {
          answer =
            currentSelectedAnswers.length > 0 ? currentSelectedAnswers : [];
        } else {
          answer =
            currentSelectedAnswers.length > 0 ? currentSelectedAnswers[0] : "";
        }
        isCorrect = checkAnswer(currentQuestion, answer);
        console.log("MC Answer:", answer, "Is Correct:", isCorrect);
        console.log("Selected Answers used:", currentSelectedAnswers);
        console.log("Selected Answers length:", currentSelectedAnswers.length);
        console.log(
          "Allow multiple answers:",
          currentQuestion.allow_multiple_answers,
        );
      } else if (currentQuestion.type === "matching") {
        answer = currentMatchingPairs;
        isCorrect = checkAnswer(currentQuestion, answer);
        console.log("Matching Answer:", answer, "Is Correct:", isCorrect);
      } else {
        answer = "";
      }

      const userAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        type: currentQuestion.type,
        answer,
        timeSpent,
        isCorrect,
      };

      console.log("User Answer to save:", userAnswer);

      setUserAnswers((prev) => {
        const updated = {
          ...prev,
          [currentQuestion.id]: userAnswer,
        };
        console.log("Updated userAnswers:", updated);
        return updated;
      });
    },
    [
      currentQuestion,
      selectedAnswers,
      matchingPairs,
      questionStartTime,
      checkAnswer,
    ],
  );

  // Finish practice and calculate results
  const finishPractice = useCallback(() => {
    console.log("=== FINISH PRACTICE DEBUG ===");
    console.log("Current Question:", currentQuestion);
    console.log("Selected Answers:", selectedAnswers);
    console.log("Matching Pairs:", matchingPairs);
    console.log("Current userAnswers:", userAnswers);

    setIsTimerActive(false);

    // Save current answer with current state values before calculating final score
    if (currentQuestion) {
      // Manually pass current values to avoid stale closure
      saveCurrentAnswer(selectedAnswers, matchingPairs);

      // Calculate score - use a setTimeout to ensure the state update has been processed
      setTimeout(() => {
        setUserAnswers((currentUserAnswers) => {
          const correctAnswers = Object.values(currentUserAnswers).filter(
            (answer) => answer.isCorrect,
          ).length;
          const totalQuestions = allQuestions.length;
          const percentage =
            totalQuestions > 0
              ? Math.round((correctAnswers / totalQuestions) * 100)
              : 0;

          console.log(
            "Final Calculation - Correct Answers:",
            correctAnswers,
            "Total:",
            totalQuestions,
            "Percentage:",
            percentage,
          );

          setQuizScore({
            correct: correctAnswers,
            total: totalQuestions,
            percentage,
          });

          setShowResults(true);
          showToast(
            `Practice completed! Score: ${percentage}%`,
            percentage >= 70 ? "success" : "info",
          );

          return currentUserAnswers; // Return unchanged since we're only reading
        });
      }, 100); // Small delay to ensure state update
    }
  }, [
    currentQuestion,
    selectedAnswers,
    matchingPairs,
    userAnswers,
    allQuestions.length,
    showToast,
    saveCurrentAnswer,
  ]);

  // Handle next question from timer
  const handleNextQuestion = useCallback(() => {
    // Save current answer with current state values
    console.log("=== HANDLE NEXT QUESTION DEBUG ===");
    console.log("Current selectedAnswers before save:", selectedAnswers);
    console.log("Current matchingPairs before save:", matchingPairs);

    // Manually pass current values to avoid stale closure
    saveCurrentAnswer(selectedAnswers, matchingPairs);

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswers([]);
      setMatchingPairs([]);
      setMatchingSelections({});
      setQuestionStartTime(Date.now());

      // Set timer for next question
      const nextQuestion = allQuestions[currentQuestionIndex + 1];
      if (nextQuestion?.time_limit) {
        setTimeLeft(nextQuestion.time_limit);
        setIsTimerActive(true);
      } else {
        setTimeLeft(0);
        setIsTimerActive(false);
      }
    } else {
      finishPractice();
    }
  }, [
    currentQuestionIndex,
    allQuestions,
    saveCurrentAnswer,
    selectedAnswers,
    matchingPairs,
    finishPractice,
  ]);

  // Navigate to previous question
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // Save current answer with current state values
      saveCurrentAnswer(selectedAnswers, matchingPairs);
      setCurrentQuestionIndex((prev) => prev - 1);

      // Load previous answers
      const prevQuestion = allQuestions[currentQuestionIndex - 1];
      const prevAnswer = userAnswers[prevQuestion.id];

      if (prevAnswer) {
        if (prevQuestion.type === "multiple_choice") {
          const mcAnswer = prevAnswer.answer;
          if (Array.isArray(mcAnswer) && typeof mcAnswer[0] === "string") {
            setSelectedAnswers(mcAnswer as string[]);
          } else if (typeof mcAnswer === "string") {
            setSelectedAnswers([mcAnswer]);
          } else {
            setSelectedAnswers([]);
          }
        } else if (prevQuestion.type === "matching") {
          const matchAnswer = prevAnswer.answer;
          if (
            Array.isArray(matchAnswer) &&
            matchAnswer.length > 0 &&
            typeof matchAnswer[0] === "object"
          ) {
            setMatchingPairs(
              matchAnswer as Array<{ itemA: string; itemB: string }>,
            );
          } else {
            setMatchingPairs([]);
          }
        }
      } else {
        setSelectedAnswers([]);
        setMatchingPairs([]);
      }

      setMatchingSelections({});
      setQuestionStartTime(Date.now());

      // Set timer for previous question
      if (prevQuestion?.time_limit) {
        setTimeLeft(prevQuestion.time_limit);
        setIsTimerActive(true);
      } else {
        setTimeLeft(0);
        setIsTimerActive(false);
      }
    }
  }, [
    currentQuestionIndex,
    allQuestions,
    userAnswers,
    saveCurrentAnswer,
    selectedAnswers,
    matchingPairs,
  ]);

  // Handle multiple choice answer selection
  const handleAnswerSelect = useCallback(
    (answerText: string) => {
      if (!currentQuestion) return;

      if (currentQuestion.allow_multiple_answers) {
        setSelectedAnswers((prev) => {
          if (prev.includes(answerText)) {
            return prev.filter((a) => a !== answerText);
          } else {
            return [...prev, answerText];
          }
        });
      } else {
        setSelectedAnswers([answerText]);
      }
    },
    [currentQuestion],
  );

  // Handle matching item selection with automatic pair creation
  const handleMatchingSelect = useCallback(
    (item: string, column: "A" | "B") => {
      // Helper to compute total pairs for current matching section
      const getTotalPairs = () => {
        if (!currentQuestion || currentQuestion.type !== "matching") return 0;
        const filteredALen = (currentQuestion.item_a || []).filter(
          (it) =>
            !currentQuestion.matchingFilter ||
            it.matching_type === currentQuestion.matchingFilter.itemAType,
        ).length;
        const filteredBLen = (currentQuestion.item_b || []).filter(
          (it) =>
            !currentQuestion.matchingFilter ||
            it.matching_type === currentQuestion.matchingFilter.itemBType,
        ).length;
        return Math.min(filteredALen, filteredBLen);
      };

      if (column === "A") {
        if (matchingSelections.itemA === item) {
          setMatchingSelections((prev) => ({ ...prev, itemA: undefined }));
        } else {
          setMatchingSelections((prev) => ({ ...prev, itemA: item }));
          if (matchingSelections.itemB) {
            const newPair = { itemA: item, itemB: matchingSelections.itemB };
            const pairExists = matchingPairs.some(
              (pair) =>
                pair.itemA === newPair.itemA && pair.itemB === newPair.itemB,
            );
            if (!pairExists) {
              const totalPairs = getTotalPairs();
              const nextLen = matchingPairs.length + 1;
              setMatchingPairs((prev) => [...prev, newPair]);
              showToast("Pair created successfully!", "success");
              if (totalPairs > 0 && nextLen === totalPairs) {
                showToast("All pairs matched for this section!", "success");
              }
            } else {
              showToast("This pair already exists!", "info");
            }
            setMatchingSelections({});
          }
        }
      } else {
        if (matchingSelections.itemB === item) {
          setMatchingSelections((prev) => ({ ...prev, itemB: undefined }));
        } else {
          setMatchingSelections((prev) => ({ ...prev, itemB: item }));
          if (matchingSelections.itemA) {
            const newPair = { itemA: matchingSelections.itemA, itemB: item };
            const pairExists = matchingPairs.some(
              (pair) =>
                pair.itemA === newPair.itemA && pair.itemB === newPair.itemB,
            );
            if (!pairExists) {
              const totalPairs = getTotalPairs();
              const nextLen = matchingPairs.length + 1;
              setMatchingPairs((prev) => [...prev, newPair]);
              showToast("Pair created successfully!", "success");
              if (totalPairs > 0 && nextLen === totalPairs) {
                showToast("All pairs matched for this section!", "success");
              }
            } else {
              showToast("This pair already exists!", "info");
            }
            setMatchingSelections({});
          }
        }
      }
    },
    [matchingSelections, matchingPairs, showToast, currentQuestion],
  );

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            showToast("Time's up for this question!", "info");
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, showToast, handleNextQuestion]);

  // Calculate connection points for matching lines (stable, no jank)
  useEffect(() => {
    const updateConnectionPoints = () => {
      if (matchingPairs.length === 0) {
        setConnectionPoints([]);
        return;
      }

      const container = document.querySelector(
        ".matching-container",
      ) as HTMLElement | null;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newConnectionPoints: ConnectionPoint[] = [];

      matchingPairs.forEach((pair, pairIndex) => {
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
            pairIndex,
          });
        }
      });

      setConnectionPoints(newConnectionPoints);
    };

    // Initial calculation
    updateConnectionPoints();

    // Observe container resizes
    const container = document.querySelector(
      ".matching-container",
    ) as HTMLElement | null;
    let ro: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateConnectionPoints());
      ro.observe(container);
    }

    // Also recalc on window resize
    window.addEventListener("resize", updateConnectionPoints);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", updateConnectionPoints);
    };
  }, [matchingPairs, currentQuestion]);

  // Clear all matching pairs
  const clearMatchingPairs = useCallback(() => {
    setMatchingPairs([]);
    setMatchingSelections({});
    showToast("All pairs cleared!", "info");
  }, [showToast]);

  // Undo last matching pair
  const undoLastMatchingPair = useCallback(() => {
    setMatchingPairs((prev) => (prev.length ? prev.slice(0, -1) : prev));
    showToast("Last pair removed", "info");
  }, [showToast]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  const progress =
    allQuestions.length > 0
      ? ((currentQuestionIndex + 1) / allQuestions.length) * 100
      : 0;
  const answeredQuestions = Object.keys(userAnswers).length;

  // Handle going back to classroom
  const handleBackToClassroom = useCallback(() => {
    navigate(`/student/classroom/${practiceState.classroomId}?tab=practice`);
  }, [navigate, practiceState]);

  // Restart practice
  const handleRestartPractice = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedAnswers([]);
    setMatchingPairs([]);
    setMatchingSelections({});
    setShowResults(false);
    setQuizScore({ correct: 0, total: 0, percentage: 0 });
    setQuestionStartTime(Date.now());

    // Reset timer for first question
    if (allQuestions.length > 0 && allQuestions[0].time_limit) {
      setTimeLeft(allQuestions[0].time_limit);
      setIsTimerActive(true);
    } else {
      setTimeLeft(0);
      setIsTimerActive(false);
    }

    showToast("Practice restarted!", "info");
  }, [allQuestions, showToast]);

  // Show loading if no data
  if (!practiceState?.practiceData || allQuestions.length === 0) {
    return <LoadingOverlay show={true} />;
  }

  // Show results screen
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Results Header */}
            <div className="mb-6 rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800">
              <div className="mb-6">
                <FaTrophy
                  className={`mx-auto mb-4 text-6xl ${
                    quizScore.percentage >= 90
                      ? "text-yellow-500 dark:text-yellow-400"
                      : quizScore.percentage >= 70
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
                  Practice Complete!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {practiceState.classroomName} - Practice Session
                </p>
              </div>

              {/* Score Display */}
              <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {quizScore.correct}
                  </div>
                  <div className="text-sm text-blue-500 dark:text-blue-300">
                    Correct
                  </div>
                </div>
                <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {quizScore.total}
                  </div>
                  <div className="text-sm text-purple-500 dark:text-purple-300">
                    Total
                  </div>
                </div>
                <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quizScore.percentage}%
                  </div>
                  <div className="text-sm text-green-500 dark:text-green-300">
                    Score
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div
                className={`mb-6 rounded-xl p-4 ${
                  quizScore.percentage >= 90
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : quizScore.percentage >= 70
                      ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : quizScore.percentage >= 50
                        ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                        : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                <p className="font-medium">
                  {quizScore.percentage >= 90
                    ? "🎉 Excellent work! You've mastered this topic!"
                    : quizScore.percentage >= 70
                      ? "👏 Great job! You have a good understanding."
                      : quizScore.percentage >= 50
                        ? "👍 Good effort! Consider reviewing some topics."
                        : "📚 Keep practicing! Review the material and try again."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleRestartPractice}
                  className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <FaPlay className="mr-2" />
                  Practice Again
                </Button>
                <Button
                  onClick={handleBackToClassroom}
                  variant="outline"
                  className="w-full rounded-xl border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FaHome className="mr-2" />
                  Back to Classroom
                </Button>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
                <FaClipboardList />
                Detailed Results
              </h2>

              <div className="space-y-6">
                {allQuestions.map((question, questionIndex) => {
                  const userAnswer = userAnswers[question.id];
                  const isCorrect = userAnswer?.isCorrect || false;

                  return (
                    <div
                      key={question.id}
                      className={`rounded-xl border-2 p-6 ${
                        isCorrect
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      {/* Question Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              Question {questionIndex + 1}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                question.type === "multiple_choice"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              }`}
                            >
                              {question.type === "multiple_choice"
                                ? "Multiple Choice"
                                : question.matchingFilter
                                  ? `Matching · ${
                                      question.matchingFilter.itemAType ===
                                      "TEXT"
                                        ? "Text"
                                        : "Image"
                                    } ↔ ${
                                      question.matchingFilter.itemBType ===
                                      "TEXT"
                                        ? "Text"
                                        : "Image"
                                    }`
                                  : "Matching"}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {question.points} points
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {question.question}
                          </h3>
                        </div>
                        <div
                          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                            isCorrect
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {isCorrect ? <FaCheck /> : <FaTimes />}
                          {isCorrect ? "Correct" : "Incorrect"}
                        </div>
                      </div>

                      {/* Question Content and Answers */}
                      {question.type === "multiple_choice" && (
                        <div className="space-y-4">
                          {/* Student's Answer */}
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Your Answer:
                            </h4>
                            <div className="space-y-2">
                              {userAnswer?.answer !== undefined ? (
                                Array.isArray(userAnswer.answer) &&
                                userAnswer.answer.length > 0 &&
                                typeof userAnswer.answer[0] === "string" ? (
                                  (userAnswer.answer as string[]).map(
                                    (ans, idx) => (
                                      <div
                                        key={idx}
                                        className="rounded-lg border border-blue-300 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/30"
                                      >
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                          {ans}
                                        </span>
                                      </div>
                                    ),
                                  )
                                ) : typeof userAnswer.answer === "string" &&
                                  userAnswer.answer !== "" ? (
                                  <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 dark:border-blue-600 dark:bg-blue-900/30">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      {userAnswer.answer}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      No answer selected
                                    </span>
                                  </div>
                                )
                              ) : (
                                <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    No answer selected
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Correct Answers */}
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Correct Answer(s):
                            </h4>
                            <div className="space-y-2">
                              {question.answers
                                ?.filter((ans) => ans.correct)
                                .map((ans, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-600 dark:bg-green-900/30"
                                  >
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                      {ans.answer_text}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {question.type === "matching" && (
                        <div className="space-y-4">
                          {/* Student's Matching Pairs */}
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Your Matching Pairs:
                            </h4>
                            <div className="space-y-2">
                              {(() => {
                                const all =
                                  practiceState.practiceData.matching_quiz
                                    ?.questions || [];
                                const allowedPairs = all
                                  .filter((mq) => {
                                    if (!question.matchingFilter) return true;
                                    return (
                                      mq.item_a.matching_type ===
                                        question.matchingFilter.itemAType &&
                                      mq.item_b.matching_type ===
                                        question.matchingFilter.itemBType
                                    );
                                  })
                                  .map((mq) => ({
                                    itemA: mq.item_a.content,
                                    itemB: mq.item_b.content,
                                  }));

                                if (
                                  userAnswer?.answer &&
                                  Array.isArray(userAnswer.answer) &&
                                  userAnswer.answer.length > 0
                                ) {
                                  return (
                                    userAnswer.answer as Array<{
                                      itemA: string;
                                      itemB: string;
                                    }>
                                  ).map((pair, idx) => {
                                    const isCorrectPair = allowedPairs.some(
                                      (cp) =>
                                        cp.itemA === pair.itemA &&
                                        cp.itemB === pair.itemB,
                                    );
                                    // Determine types for rendering
                                    const typeA =
                                      (question.item_a || []).find(
                                        (it) => it.content === pair.itemA,
                                      )?.matching_type ||
                                      question.matchingFilter?.itemAType ||
                                      "TEXT";
                                    const typeB =
                                      (question.item_b || []).find(
                                        (it) => it.content === pair.itemB,
                                      )?.matching_type ||
                                      question.matchingFilter?.itemBType ||
                                      "TEXT";
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-center gap-4 rounded-lg border p-3 ${
                                          isCorrectPair
                                            ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/30"
                                            : "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/30"
                                        }`}
                                      >
                                        <div className="flex-1">
                                          {typeA === "IMAGE" ? (
                                            pair.itemA ? (
                                              <img
                                                src={pair.itemA}
                                                alt="Matching Item A"
                                                className="h-12 w-25 rounded-lg object-cover"
                                                onError={(e) =>
                                                  (e.currentTarget.src =
                                                    IMAGE_FALLBACK)
                                                }
                                              />
                                            ) : (
                                              <div className="flex h-12 w-25 items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200">
                                                <span className="text-xl">
                                                  🖼️
                                                </span>
                                              </div>
                                            )
                                          ) : (
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                              {pair.itemA}
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          className={`text-lg ${isCorrectPair ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                        >
                                          ↔
                                        </div>
                                        <div className="flex-1">
                                          {typeB === "IMAGE" ? (
                                            pair.itemB ? (
                                              <img
                                                src={pair.itemB}
                                                alt="Matching Item B"
                                                className="h-14 w-25 rounded-lg object-cover"
                                                onError={(e) =>
                                                  (e.currentTarget.src =
                                                    IMAGE_FALLBACK)
                                                }
                                              />
                                            ) : (
                                              <div className="flex h-14 w-25 items-center justify-center rounded-lg border-2 border-dashed border-purple-400 bg-gradient-to-br from-purple-100 to-purple-200">
                                                <span className="text-xl">
                                                  🖼️
                                                </span>
                                              </div>
                                            )
                                          ) : (
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                              {pair.itemB}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex-shrink-0">
                                          {isCorrectPair ? (
                                            <FaCheck className="text-green-600 dark:text-green-400" />
                                          ) : (
                                            <FaTimes className="text-red-600 dark:text-red-400" />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  });
                                }

                                return (
                                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      No pairs created
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Correct Matching Pairs */}
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Correct Matching Pairs:
                            </h4>
                            <div className="space-y-2">
                              {(() => {
                                const all =
                                  practiceState.practiceData.matching_quiz
                                    ?.questions || [];
                                const filtered = all.filter((mq) => {
                                  if (!question.matchingFilter) return true;
                                  return (
                                    mq.item_a.matching_type ===
                                      question.matchingFilter.itemAType &&
                                    mq.item_b.matching_type ===
                                      question.matchingFilter.itemBType
                                  );
                                });

                                return filtered.map((mq, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-600 dark:bg-green-900/30"
                                  >
                                    <div className="flex-1">
                                      {mq.item_a.matching_type === "TEXT" ? (
                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                          {mq.item_a.content}
                                        </span>
                                      ) : (
                                        <img
                                          src={mq.item_a.content}
                                          alt="Matching Item A"
                                          className="h-14 w-25 rounded-lg object-cover"
                                          onError={(e) =>
                                            (e.currentTarget.src =
                                              IMAGE_FALLBACK)
                                          }
                                        />
                                      )}
                                    </div>
                                    <div className="text-lg text-green-600 dark:text-green-400">
                                      ↔
                                    </div>
                                    <div className="flex-1">
                                      {mq.item_b.matching_type === "TEXT" ? (
                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                          {mq.item_b.content}
                                        </span>
                                      ) : (
                                        <img
                                          src={mq.item_b.content}
                                          alt="Matching Item B"
                                          className="h-14 w-25 rounded-lg object-cover"
                                          onError={(e) =>
                                            (e.currentTarget.src =
                                              IMAGE_FALLBACK)
                                          }
                                        />
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      <FaCheck className="text-green-600 dark:text-green-400" />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Time Spent */}
                      {userAnswer?.timeSpent && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaClock />
                          Time spent: {Math.floor(userAnswer.timeSpent / 60)}:
                          {(userAnswer.timeSpent % 60)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {toast.isVisible && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Compact Header */}
      <div className="border-b border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button and Title */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackToClassroom}
                variant="outline"
                className="border-gray-300 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <FaChevronLeft />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                  Quiz Practice
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {practiceState.classroomName}
                </p>
              </div>
            </div>

            {/* Center: Progress */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Question {currentQuestionIndex + 1} of {allQuestions.length}
                </div>
                <div className="mt-1 h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
                    timeLeft <= 10
                      ? "animate-pulse bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : timeLeft <= 30
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  }`}
                >
                  <FaClock className="text-current" />
                  <span className="font-mono font-medium">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Stats */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-800 dark:text-white">
                  {answeredQuestions}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Answered</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-800 dark:text-white">
                  {currentQuestion?.points || 0}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl">
          {/* Question Content */}
          <div className="mb-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            {/* Question Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center space-x-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      currentQuestion.type === "multiple_choice"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}
                  >
                    {currentQuestion.type === "multiple_choice"
                      ? "Multiple Choice"
                      : currentQuestion.matchingFilter
                        ? `Matching · ${
                            currentQuestion.matchingFilter.itemAType === "TEXT"
                              ? "Text"
                              : "Image"
                          } ↔ ${
                            currentQuestion.matchingFilter.itemBType === "TEXT"
                              ? "Text"
                              : "Image"
                          }`
                        : "Matching"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion.points} point
                    {currentQuestion.points !== 1 ? "s" : ""}
                  </span>
                </div>
                <h2 className="text-xl leading-relaxed font-semibold text-gray-800 dark:text-white">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.hint && (
                  <div className="mt-3 rounded-r-lg border-l-4 border-yellow-400 bg-yellow-50 p-3 dark:border-yellow-500 dark:bg-yellow-900/20">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <span className="font-medium">💡 Hint:</span>{" "}
                      {currentQuestion.hint}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Question Content Based on Type */}
            {currentQuestion.type === "multiple_choice" && (
              <div className="space-y-3">
                {currentQuestion.answers?.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(answer.answer_text)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      selectedAnswers.includes(answer.answer_text)
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selectedAnswers.includes(answer.answer_text)
                            ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                            : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {selectedAnswers.includes(answer.answer_text) && (
                          <FaCheck className="text-xs text-white" />
                        )}
                      </div>
                      <span className="flex-1 text-gray-900 dark:text-white">
                        {answer.answer_text}
                      </span>
                    </div>
                  </button>
                ))}

                {currentQuestion.allow_multiple_answers && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <FaExclamationTriangle className="mr-2 inline" />
                      You can select multiple answers for this question.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === "matching" && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="text-center">
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    {(() => {
                      const filteredALen = (
                        currentQuestion.item_a || []
                      ).filter(
                        (it) =>
                          !currentQuestion.matchingFilter ||
                          it.matching_type ===
                            currentQuestion.matchingFilter.itemAType,
                      ).length;
                      const filteredBLen = (
                        currentQuestion.item_b || []
                      ).filter(
                        (it) =>
                          !currentQuestion.matchingFilter ||
                          it.matching_type ===
                            currentQuestion.matchingFilter.itemBType,
                      ).length;
                      const totalPairs = Math.min(filteredALen, filteredBLen);
                      return currentQuestion.matchingFilter
                        ? `Match ${
                            currentQuestion.matchingFilter.itemAType === "TEXT"
                              ? "Text"
                              : "Image"
                          } items in Column A with ${
                            currentQuestion.matchingFilter.itemBType === "TEXT"
                              ? "Text"
                              : "Image"
                          } items in Column B (${totalPairs} pairs)`
                        : `Match the items from Column A with the correct items in Column B (${totalPairs} pairs)`;
                    })()}
                  </p>
                </div>

                {/* Matching Interface with Connection Lines */}
                <div className="matching-container relative min-h-[400px]">
                  {/* Simple SVG for connection lines */}
                  <svg
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {connectionPoints.map((point, index) => (
                      <g key={index}>
                        <line
                          x1={point.startX}
                          y1={point.startY}
                          x2={point.endX}
                          y2={point.endY}
                          stroke="#64748b" /* slate-500 */
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.9"
                        />
                      </g>
                    ))}
                  </svg>

                  <div className="relative z-20 grid grid-cols-2 gap-8">
                    {/* Column A */}
                    <div className="space-y-3">
                      <h3 className="text-center text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {(() => {
                          const count = (currentQuestion.item_a || []).filter(
                            (it) =>
                              !currentQuestion.matchingFilter ||
                              it.matching_type ===
                                currentQuestion.matchingFilter.itemAType,
                          ).length;
                          return `Column A (${count} Items)`;
                        })()}
                      </h3>
                      <div className="space-y-3">
                        {(currentQuestion.item_a || [])
                          .map((item, originalIndex) => ({
                            item,
                            originalIndex,
                          }))
                          .filter(
                            ({ item }) =>
                              !currentQuestion.matchingFilter ||
                              item.matching_type ===
                                currentQuestion.matchingFilter.itemAType,
                          )
                          .map(({ item, originalIndex }, filteredIndex) => {
                            const isSelected =
                              matchingSelections.itemA === item.content;
                            const isMatched = matchingPairs.some(
                              (pair) => pair.itemA === item.content,
                            );

                            return (
                              <button
                                key={`a-${originalIndex}`}
                                id={`item-a-${originalIndex}`}
                                onClick={() =>
                                  handleMatchingSelect(item.content, "A")
                                }
                                aria-pressed={isSelected}
                                disabled={isMatched}
                                className={`min-h-[80px] w-full rounded-xl border-2 p-4 text-left transition-colors ${
                                  isMatched
                                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-400/50"
                                    : isSelected
                                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-400 dark:bg-blue-900/40 dark:ring-blue-400/50"
                                      : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                                }`}
                              >
                                <div className="flex h-full items-center space-x-3">
                                  <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                                      isMatched
                                        ? "bg-blue-600 text-white dark:bg-blue-500"
                                        : isSelected
                                          ? "bg-blue-500 text-white dark:bg-blue-400"
                                          : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                                    }`}
                                  >
                                    {filteredIndex + 1}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    {item.matching_type === "IMAGE" ? (
                                      item.content ? (
                                        <div className="h-12 w-20">
                                          <img
                                            src={item.content}
                                            alt={`Item A ${filteredIndex + 1}`}
                                            className="h-full w-full rounded-lg border-2 border-blue-300 object-contain shadow-sm"
                                            onError={(e) =>
                                              (e.currentTarget.src =
                                                IMAGE_FALLBACK)
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex h-12 w-20 items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200">
                                          <span className="text-xl">🖼️</span>
                                        </div>
                                      )
                                    ) : (
                                      <span className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {item.content}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-shrink-0 items-center gap-2">
                                    {isMatched && (
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 dark:bg-green-400">
                                        <FaCheck className="text-[10px] text-white" />
                                      </div>
                                    )}
                                    {isSelected && !isMatched && (
                                      <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Column B */}
                    <div className="space-y-3">
                      <h3 className="text-center text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {(() => {
                          const count = (currentQuestion.item_b || []).filter(
                            (it) =>
                              !currentQuestion.matchingFilter ||
                              it.matching_type ===
                                currentQuestion.matchingFilter.itemBType,
                          ).length;
                          return `Column B (${count} Items)`;
                        })()}
                      </h3>
                      <div className="space-y-3">
                        {(currentQuestion.item_b || [])
                          .map((item, originalIndex) => ({
                            item,
                            originalIndex,
                          }))
                          .filter(
                            ({ item }) =>
                              !currentQuestion.matchingFilter ||
                              item.matching_type ===
                                currentQuestion.matchingFilter.itemBType,
                          )
                          .map(({ item, originalIndex }, filteredIndex) => {
                            const isSelected =
                              matchingSelections.itemB === item.content;
                            const isMatched = matchingPairs.some(
                              (pair) => pair.itemB === item.content,
                            );
                            const letter = String.fromCharCode(
                              65 + filteredIndex,
                            );

                            return (
                              <button
                                key={`b-${originalIndex}`}
                                id={`item-b-${originalIndex}`}
                                onClick={() =>
                                  handleMatchingSelect(item.content, "B")
                                }
                                aria-pressed={isSelected}
                                disabled={isMatched}
                                className={`min-h-[80px] w-full rounded-xl border-2 p-4 text-left transition-colors ${
                                  isMatched
                                    ? "border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:border-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-400/50"
                                    : isSelected
                                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200 dark:border-purple-400 dark:bg-purple-900/40 dark:ring-purple-400/50"
                                      : "border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-purple-500 dark:hover:bg-purple-900/20"
                                }`}
                              >
                                <div className="flex h-full items-center space-x-3">
                                  <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                                      isMatched
                                        ? "bg-purple-600 text-white dark:bg-purple-500"
                                        : isSelected
                                          ? "bg-purple-500 text-white dark:bg-purple-400"
                                          : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                                    }`}
                                  >
                                    {letter}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    {item.matching_type === "IMAGE" ? (
                                      item.content ? (
                                        <div className="h-12 w-20">
                                          <img
                                            src={item.content}
                                            alt={`Item B ${letter}`}
                                            className="h-full w-full rounded-lg border-2 border-purple-300 object-contain shadow-sm"
                                            onError={(e) =>
                                              (e.currentTarget.src =
                                                IMAGE_FALLBACK)
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex h-12 w-20 items-center justify-center rounded-lg border-2 border-dashed border-purple-400 bg-gradient-to-br from-purple-100 to-purple-200">
                                          <span className="text-xl">🖼️</span>
                                        </div>
                                      )
                                    ) : (
                                      <span className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {item.content}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-shrink-0 items-center gap-2">
                                    {isMatched && (
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 dark:bg-green-400">
                                        <FaCheck className="text-[10px] text-white" />
                                      </div>
                                    )}
                                    {isSelected && !isMatched && (
                                      <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400"></div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Removed Progress indicator in favor of toast feedback */}

                {/* Enhanced Action Buttons */}
                {matchingPairs.length > 0 && (
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                      onClick={clearMatchingPairs}
                      variant="outline"
                      className="border-red-300 px-6 py-3 text-red-600 hover:border-red-400 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      🗑️ Clear All Pairs
                    </Button>
                    <Button
                      onClick={undoLastMatchingPair}
                      variant="outline"
                      className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      ↩️ Undo Last Pair
                    </Button>
                  </div>
                )}

                {/* Enhanced Selection Status */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600">
                        <span className="text-lg text-white">💡</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                        How to Match Items
                      </h4>
                      <p className="mb-3 text-sm text-blue-700 dark:text-blue-300">
                        Click one item from Column A and one from Column B to
                        create a matching pair automatically.
                      </p>

                      {(matchingSelections.itemA ||
                        matchingSelections.itemB) && (
                        <div className="mt-3 rounded-lg border border-blue-300 bg-white/70 p-3 dark:border-blue-600 dark:bg-gray-800/70">
                          <div className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                            Currently Selected:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {matchingSelections.itemA && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                                  A
                                </span>
                                {currentQuestion.matchingFilter?.itemAType ===
                                "IMAGE" ? (
                                  matchingSelections.itemA ? (
                                    <img
                                      src={matchingSelections.itemA}
                                      alt="Selected A"
                                      className="ml-1 h-6 w-10 rounded object-cover"
                                      onError={(e) =>
                                        (e.currentTarget.src = IMAGE_FALLBACK)
                                      }
                                    />
                                  ) : (
                                    <span className="ml-1">[Image]</span>
                                  )
                                ) : matchingSelections.itemA.length > 20 ? (
                                  `${matchingSelections.itemA.substring(0, 20)}...`
                                ) : (
                                  matchingSelections.itemA
                                )}
                              </span>
                            )}
                            {matchingSelections.itemB && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                                  B
                                </span>
                                {currentQuestion.matchingFilter?.itemBType ===
                                "IMAGE" ? (
                                  matchingSelections.itemB ? (
                                    <img
                                      src={matchingSelections.itemB}
                                      alt="Selected B"
                                      className="ml-1 h-6 w-10 rounded object-cover"
                                      onError={(e) =>
                                        (e.currentTarget.src = IMAGE_FALLBACK)
                                      }
                                    />
                                  ) : (
                                    <span className="ml-1">[Image]</span>
                                  )
                                ) : matchingSelections.itemB.length > 20 ? (
                                  `${matchingSelections.itemB.substring(0, 20)}...`
                                ) : (
                                  matchingSelections.itemB
                                )}
                              </span>
                            )}
                          </div>

                          {matchingSelections.itemA &&
                            matchingSelections.itemB && (
                              <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                                ✨ Click any item to complete this pair!
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Navigation Footer */}
      <div className="border-t border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            {/* Previous Button */}
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="rounded-xl border-gray-300 px-6 py-3 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <FaChevronLeft className="mr-2" />
              Previous
            </Button>

            {/* Question Progress Indicator */}
            <div className="flex space-x-2">
              {allQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 rounded-full ${
                    index === currentQuestionIndex
                      ? "bg-blue-600 dark:bg-blue-500"
                      : userAnswers[allQuestions[index].id]
                        ? "bg-green-500 dark:bg-green-400"
                        : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Next/Finish Button */}
            <Button
              onClick={handleNextQuestion}
              className={`rounded-xl px-6 py-3 font-medium text-white ${
                currentQuestionIndex === allQuestions.length - 1
                  ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
            >
              {currentQuestionIndex === allQuestions.length - 1 ? (
                <>
                  <FaFlag className="mr-2" />
                  Finish Practice
                </>
              ) : (
                <>
                  Next
                  <FaChevronRight className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      )}
    </div>
  );
};

export default QuizPractice;
