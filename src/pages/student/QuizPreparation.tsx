import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaClock,
  FaQuestionCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlay,
  FaUsers,
  FaCalendar,
  FaBook,
  FaLightbulb,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";

// Mock quiz data interface - replace with actual API types
interface QuizData {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  questionCount: number;
  totalPoints: number;
  attempts: number;
  maxAttempts: number;
  dueDate: Date;
  createdAt: Date;
  instructions: string[];
  classroom: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    avatar: string;
  };
  rules: string[];
  isActive: boolean;
  hasTimeLimit: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowMultipleAttempts: boolean;
}

const QuizPreparation = () => {
  const { classroomId, quizId } = useParams<{
    classroomId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingStart, setIsConfirmingStart] = useState(false);

  // Format date to be displayed in user's locale
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format duration to readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!classroomId || !quizId) {
          navigate("/student/classrooms");
          return;
        }

        // Mock data - replace with actual API call
        // const response = await getQuizDetail(quizId);

        // Mock quiz data for demonstration
        const mockQuiz: QuizData = {
          id: quizId,
          name: "Mathematics Quiz - Chapter 5",
          description:
            "Test your understanding of quadratic equations and algebraic expressions",
          duration: 45,
          questionCount: 20,
          totalPoints: 100,
          attempts: 0,
          maxAttempts: 3,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          instructions: [
            "Read each question carefully before answering",
            "You can navigate between questions using the navigation panel",
            "Make sure to submit your quiz before the time limit",
            "Once submitted, you cannot change your answers",
            "Use scratch paper if needed for calculations",
          ],
          classroom: {
            id: classroomId || "",
            name: "Advanced Mathematics - Class 12A",
          },
          teacher: {
            id: "teacher-1",
            name: "Dr. Sarah Johnson",
            avatar: "S",
          },
          rules: [
            "No external help or resources allowed",
            "Calculator is permitted for calculation questions",
            "Keep your workspace clean and organized",
            "Report any technical issues immediately",
            "Academic integrity must be maintained",
          ],
          isActive: true,
          hasTimeLimit: true,
          shuffleQuestions: true,
          showCorrectAnswers: false,
          allowMultipleAttempts: true,
        };

        setQuiz(mockQuiz);
        document.title = `${mockQuiz.name} - Quiz Preparation | Quiz Edu`;
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        setError("Failed to fetch quiz details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizDetails();
  }, [classroomId, quizId, navigate]);

  const handleGoBack = () => {
    navigate(`/student/classroom/${classroomId}`, {
      state: { activeTab: "classwork" },
    });
  };

  const handleStartQuiz = () => {
    if (!quiz) return;

    // Navigate to the actual quiz taking interface
    // This would be implemented later
    navigate(`/student/classroom/${classroomId}/quiz/${quizId}/take`);
  };

  const handleConfirmStart = () => {
    setIsConfirmingStart(true);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <SkeletonLoader height="40px" width="300px" animation="pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonLoader height="300px" width="100%" animation="pulse" />
          </div>
          <div>
            <SkeletonLoader height="400px" width="100%" animation="pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <FaExclamationTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
            {error || "Quiz not found"}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error
              ? "Please try again later."
              : "The quiz you're looking for doesn't exist."}
          </p>
          <Button variant="primary" onClick={handleGoBack}>
            Back to Classroom
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={handleGoBack}
        className="mb-6 flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <FaChevronLeft className="h-4 w-4" />
        <span>Back to {quiz.classroom.name}</span>
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Quiz Header */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {quiz.name}
                </h1>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {quiz.description}
                </p>

                {/* Quiz Meta Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FaBook className="h-4 w-4" />
                    <span>{quiz.classroom.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FaUsers className="h-4 w-4" />
                    <span>Teacher: {quiz.teacher.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FaCalendar className="h-4 w-4" />
                    <span>Due: {formatDate(quiz.dueDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FaCheckCircle className="h-4 w-4" />
                    <span>
                      Attempts: {quiz.attempts} / {quiz.maxAttempts}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="ml-4">
                {quiz.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <FaCheckCircle className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                    <FaClock className="h-3 w-3" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <FaLightbulb className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instructions
              </h2>
            </div>
            <ul className="space-y-2">
              {quiz.instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rules */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiz Rules
              </h2>
            </div>
            <ul className="space-y-2">
              {quiz.rules.map((rule, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"></span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz Details Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quiz Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaClock className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(quiz.duration)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaQuestionCircle className="h-4 w-4" />
                  <span>Questions</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {quiz.questionCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaCheckCircle className="h-4 w-4" />
                  <span>Total Points</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {quiz.totalPoints}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaUsers className="h-4 w-4" />
                  <span>Attempts Left</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {quiz.maxAttempts - quiz.attempts}
                </span>
              </div>
            </div>
          </div>

          {/* Quiz Features */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quiz Features
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${quiz.hasTimeLimit ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
                <span
                  className={`text-sm ${quiz.hasTimeLimit ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Time Limit: {quiz.hasTimeLimit ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${quiz.shuffleQuestions ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
                <span
                  className={`text-sm ${quiz.shuffleQuestions ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Shuffle Questions: {quiz.shuffleQuestions ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${quiz.allowMultipleAttempts ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
                <span
                  className={`text-sm ${quiz.allowMultipleAttempts ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Multiple Attempts: {quiz.allowMultipleAttempts ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${quiz.showCorrectAnswers ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
                <span
                  className={`text-sm ${quiz.showCorrectAnswers ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Show Answers:{" "}
                  {quiz.showCorrectAnswers ? "After submission" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {quiz.attempts >= quiz.maxAttempts ? (
              <div className="text-center">
                <FaExclamationTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                  You have used all your attempts for this quiz.
                </p>
                <Button variant="secondary" disabled className="w-full">
                  No Attempts Left
                </Button>
              </div>
            ) : !quiz.isActive ? (
              <div className="text-center">
                <FaClock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  This quiz is not currently available.
                </p>
                <Button variant="secondary" disabled className="w-full">
                  Quiz Inactive
                </Button>
              </div>
            ) : new Date() > quiz.dueDate ? (
              <div className="text-center">
                <FaExclamationTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                  This quiz is past its due date.
                </p>
                <Button variant="secondary" disabled className="w-full">
                  Quiz Overdue
                </Button>
              </div>
            ) : !isConfirmingStart ? (
              <div className="text-center">
                <FaInfoCircle className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Ready to start your quiz? Make sure you have read all
                  instructions and rules.
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleConfirmStart}
                >
                  <FaPlay className="mr-2 h-4 w-4" />
                  I'm Ready to Start
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <FaExclamationTriangle className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Once you start, the timer will begin. Are you sure you want to
                  proceed?
                </p>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleStartQuiz}
                  >
                    <FaPlay className="mr-2 h-4 w-4" />
                    Start Quiz Now
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setIsConfirmingStart(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreparation;
