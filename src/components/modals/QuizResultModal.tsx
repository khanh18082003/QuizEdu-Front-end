import React from "react";
import { FaTrophy, FaCheckCircle, FaHome, FaRedo } from "react-icons/fa";
import Button from "../ui/Button";
import type { QuizSubmissionResponse } from "../../services/quizSessionService";

interface QuizResultModalProps {
  isVisible: boolean;
  result: QuizSubmissionResponse | null;
  onGoHome: () => void;
  onRetryQuiz?: () => void;
  quizTitle?: string;
}

const QuizResultModal: React.FC<QuizResultModalProps> = ({
  isVisible,
  result,
  onGoHome,
  onRetryQuiz,
  quizTitle = "Quiz",
}) => {
  if (!isVisible || !result) return null;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-500";
    if (percentage >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        {/* Header with trophy */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5"></div>

          <div className="relative text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r ${getScoreGradient(result.percentage)} shadow-lg`}
            >
              <FaTrophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold">Hoàn thành Quiz!</h2>
            <p className="text-lg text-blue-100">{quizTitle}</p>
          </div>
        </div>

        {/* Results content */}
        <div className="p-8">
          {/* Score overview */}
          <div className="mb-8 text-center">
            <div
              className={`mb-4 text-6xl font-bold ${getScoreColor(result.percentage)}`}
            >
              {result.percentage.toFixed(1)}%
            </div>
            <div className="text-xl text-gray-600 dark:text-gray-400">
              {result.total_score} / {result.max_score} điểm
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Hoàn thành lúc: {formatDateTime(result.submitted_at)}
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Multiple choice results */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                  <FaCheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Trắc nghiệm
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {result.multiple_choice_details.correct}/
                    {result.multiple_choice_details.total} câu đúng
                  </p>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  Điểm số
                </span>
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  {result.multiple_choice_details.score} điểm
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                  style={{
                    width: `${(result.multiple_choice_details.correct / result.multiple_choice_details.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Matching results */}
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
                  <FaCheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                    Ghép đôi
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    {result.matching_details.correct}/
                    {result.matching_details.total} cặp đúng
                  </p>
                </div>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-purple-700 dark:text-purple-300">
                  Điểm số
                </span>
                <span className="font-medium text-purple-800 dark:text-purple-200">
                  {result.matching_details.score} điểm
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-purple-200 dark:bg-purple-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000"
                  style={{
                    width: `${(result.matching_details.correct / result.matching_details.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Overall accuracy */}
          <div className="mb-8 rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Độ chính xác tổng thể
              </span>
              <span
                className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}
              >
                {result.correct_answers}/{result.total_questions}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(result.percentage)} transition-all duration-1000`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
            <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {result.percentage >= 80
                ? "🎉 Xuất sắc!"
                : result.percentage >= 60
                  ? "👍 Tốt!"
                  : "💪 Cần cố gắng thêm!"}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={onGoHome}
              variant="primary"
              size="lg"
              className="flex items-center justify-center gap-2 px-8 py-3"
            >
              <FaHome className="h-5 w-5" />
              Về trang chủ
            </Button>

            {onRetryQuiz && (
              <Button
                onClick={onRetryQuiz}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 px-8 py-3"
              >
                <FaRedo className="h-5 w-5" />
                Làm lại
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultModal;
