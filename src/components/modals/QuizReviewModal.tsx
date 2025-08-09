import React, { useState } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaTrophy,
  FaQuestion,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Button from "../ui/Button";
import type { QuizSessionHistoryResponse } from "../../services/quizSessionService";

// Fallback image (inline SVG) for broken or invalid image URLs
const IMAGE_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="12">Image unavailable</text></svg>';

interface QuizReviewModalProps {
  isVisible: boolean;
  historyData: QuizSessionHistoryResponse | null;
  onClose: () => void;
  onGoHome: () => void;
  quizTitle?: string;
  userId: string;
}

interface ProcessedQuestion {
  id: string;
  type: "multiple_choice" | "matching";
  question: string;
  points: number;
  userAnswer:
    | string
    | string[]
    | Array<{ itemA: string; itemB: string }>
    | null;
  correctAnswer: string[] | Array<{ itemA: string; itemB: string }>;
  isCorrect: boolean;
  // For multiple choice
  options?: Array<{ text: string; isCorrect: boolean }>;
  allowMultiple?: boolean;
  // For matching: include type to render image/text correctly
  pairs?: Array<{
    itemA: string;
    itemB: string;
    typeA: string;
    typeB: string;
    isCorrect: boolean;
  }>;
  hint?: string;
}

const QuizReviewModal: React.FC<QuizReviewModalProps> = ({
  isVisible,
  historyData,
  onClose,
  onGoHome,
  quizTitle = "Quiz Review",
  userId,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  if (!isVisible || !historyData) return null;

  // Process questions from history data
  const processQuestions = (): ProcessedQuestion[] => {
    const questions: ProcessedQuestion[] = [];

    // Process multiple choice questions
    if (historyData.multiple_choice_quiz?.questions) {
      historyData.multiple_choice_quiz.questions.forEach((mcQuestion) => {
        // Collect ALL answers from this user (for allow_multiple_answers there can be many)
        const participantsForUser = (
          mcQuestion.answer_participants || []
        ).filter((p) => p.user_id === userId);
        const userAnswersAll = participantsForUser
          .map((p) => (typeof p.answer === "string" ? p.answer.trim() : ""))
          .filter((a) => a.length > 0);
        const userAnswersUnique = Array.from(new Set(userAnswersAll));

        const correctAnswers = mcQuestion.answers
          .filter((ans) => ans.correct)
          .map((ans) => ans.answer_text);
        const correctSet = new Set(correctAnswers);

        let isCorrect = false;
        let singlePicked: string | undefined;
        if (mcQuestion.allow_multiple_answers) {
          // Set equality: user must select all and only the correct answers
          const userSet = new Set(userAnswersUnique);
          if (userSet.size === correctSet.size && userSet.size > 0) {
            isCorrect = [...userSet].every((a) => correctSet.has(a));
          } else {
            isCorrect = false;
          }
        } else {
          // Single-answer: take the last non-empty submitted answer and compare
          singlePicked = userAnswersAll[userAnswersAll.length - 1];
          isCorrect = singlePicked ? correctSet.has(singlePicked) : false;
        }

        const processedQuestion: ProcessedQuestion = {
          id: mcQuestion.question_id,
          type: "multiple_choice",
          question: mcQuestion.question_text,
          points: mcQuestion.points,
          hint: mcQuestion.hint,
          // Show all selected answers for multi-select; single-select uses last or null
          userAnswer: mcQuestion.allow_multiple_answers
            ? userAnswersUnique
            : singlePicked || null,
          correctAnswer: correctAnswers,
          isCorrect,
          options: mcQuestion.answers.map((ans) => ({
            text: ans.answer_text,
            isCorrect: ans.correct,
          })),
          allowMultiple: mcQuestion.allow_multiple_answers,
        };

        questions.push(processedQuestion);
      });
    }

    // Process matching questions
    if (historyData.matching_quiz?.match_pairs) {
      const userParticipant =
        historyData.matching_quiz.answer_participants.find(
          (p) => p.user_id === userId,
        );

      const userPairsDisplay: Array<{ itemA: string; itemB: string }> =
        userParticipant?.answers
          ? userParticipant.answers.map((ans) => ({
              itemA: ans.item_a.content,
              itemB: ans.item_b.content,
            }))
          : [];

      const matchingQuestion: ProcessedQuestion = {
        id: "matching",
        type: "matching",
        question: "Ghép đôi các cặp phù hợp",
        points: historyData.matching_quiz.match_pairs.reduce(
          (sum, pair) => sum + pair.points,
          0,
        ),
        userAnswer: userPairsDisplay,
        correctAnswer: historyData.matching_quiz.match_pairs.map((pair) => ({
          itemA: pair.item_a.content,
          itemB: pair.item_b.content,
        })),
        isCorrect: false, // Will be calculated below
        pairs: historyData.matching_quiz.match_pairs.map((pair) => {
          const userAnswer = userParticipant?.answers.find(
            (ans) =>
              ans.match_pair_id === pair.id ||
              (ans.item_a.content === pair.item_a.content &&
                ans.item_b.content === pair.item_b.content),
          );
          return {
            itemA: pair.item_a.content,
            itemB: pair.item_b.content,
            typeA: pair.item_a.matching_type,
            typeB: pair.item_b.matching_type,
            isCorrect: userAnswer?.correct || false,
          };
        }),
      };

      // Calculate if matching question is correct (all pairs must be correct)
      matchingQuestion.isCorrect =
        matchingQuestion.pairs?.every((pair) => pair.isCorrect) || false;

      questions.push(matchingQuestion);
    }

    return questions;
  };

  const questions = processQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  // Calculate overall stats
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const getScoreColor = (isCorrect: boolean) => {
    return isCorrect ? "text-green-600" : "text-red-600";
  };

  const getScoreBgColor = (isCorrect: boolean) => {
    return isCorrect
      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
  };

  const renderMultipleChoiceQuestion = (question: ProcessedQuestion) => {
    const userAnswers: string[] = Array.isArray(question.userAnswer)
      ? (question.userAnswer as string[])
      : question.userAnswer
        ? [question.userAnswer as string]
        : [];

    return (
      <div className="space-y-4">
        {/* Question text */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {question.question}
          </h3>
          {question.hint && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Gợi ý:</span> {question.hint}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">Điểm:</span>
            <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {question.points} điểm
            </span>
          </div>
        </div>

        {/* Answer options */}
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isUserSelected = userAnswers.includes(option.text);
            const isCorrectOption = option.isCorrect;
            const showAsCorrect = showCorrectAnswers && isCorrectOption;
            const showAsIncorrect = isUserSelected && !isCorrectOption;
            const showAsSelected = isUserSelected && !showCorrectAnswers;

            let borderColor = "border-gray-200 dark:border-gray-700";
            let bgColor = "bg-white dark:bg-gray-800";
            let textColor = "text-gray-900 dark:text-white";

            if (showAsCorrect) {
              borderColor = "border-green-500";
              bgColor = "bg-green-50 dark:bg-green-900/20";
              textColor = "text-green-900 dark:text-green-100";
            } else if (showAsIncorrect) {
              borderColor = "border-red-500";
              bgColor = "bg-red-50 dark:bg-red-900/20";
              textColor = "text-red-900 dark:text-red-100";
            } else if (showAsSelected) {
              borderColor = "border-blue-500";
              bgColor = "bg-blue-50 dark:bg-blue-900/20";
              textColor = "text-blue-900 dark:text-blue-100";
            }

            return (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 ${borderColor} ${bgColor}`}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  {showAsCorrect ? (
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  ) : showAsIncorrect ? (
                    <FaTimesCircle className="h-5 w-5 text-red-600" />
                  ) : isUserSelected ? (
                    <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>
                <span className={`text-sm font-medium ${textColor}`}>
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className={`flex-1 ${textColor}`}>{option.text}</span>
                {showAsCorrect && (
                  <span className="text-xs font-medium text-green-600">
                    Đáp án đúng
                  </span>
                )}
                {isUserSelected && !showCorrectAnswers && (
                  <span className="text-xs font-medium text-blue-600">
                    Bạn đã chọn
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* User answer summary */}
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
            Kết quả của bạn:
          </h4>
          {userAnswers.length > 0 ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Câu trả lời: {userAnswers.join(", ")}
              </p>
              <p
                className={`text-sm font-medium ${getScoreColor(question.isCorrect)}`}
              >
                {question.isCorrect ? "✓ Chính xác" : "✗ Sai"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-600">Chưa trả lời</p>
          )}
        </div>
      </div>
    );
  };

  const renderMatchingQuestion = (question: ProcessedQuestion) => {
    return (
      <div className="space-y-4">
        {/* Question text */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {question.question}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">Tổng điểm:</span>
            <span className="rounded bg-purple-100 px-2 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {question.points} điểm
            </span>
          </div>
        </div>

        {/* Matching pairs */}
        <div className="space-y-3">
          {question.pairs?.map((pair, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-lg border-2 p-4 ${
                showCorrectAnswers || pair.isCorrect
                  ? pair.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="flex-1">
                  <div className="rounded bg-blue-100 p-2 text-center dark:bg-blue-900">
                    {pair.typeA === "IMAGE" ? (
                      <img
                        src={pair.itemA}
                        alt="Matching A"
                        className="mx-auto h-24 max-w-full rounded object-contain"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.onerror = null;
                          img.src = IMAGE_FALLBACK;
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {pair.itemA}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-px w-8 bg-gray-300"></div>
                  <div className="mx-2">
                    {pair.isCorrect ? (
                      <FaCheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <FaTimesCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="h-px w-8 bg-gray-300"></div>
                </div>
                <div className="flex-1">
                  <div className="rounded bg-purple-100 p-2 text-center dark:bg-purple-900">
                    {pair.typeB === "IMAGE" ? (
                      <img
                        src={pair.itemB}
                        alt="Matching B"
                        className="mx-auto h-24 max-w-full rounded object-contain"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.onerror = null;
                          img.src = IMAGE_FALLBACK;
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        {pair.itemB}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {pair.isCorrect ? (
                  <span className="text-xs font-medium text-green-600">
                    Đúng
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-600">Sai</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Matching result summary */}
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
            Kết quả ghép đôi:
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Số cặp đúng:{" "}
              {question.pairs?.filter((p) => p.isCorrect).length || 0}/
              {question.pairs?.length || 0}
            </p>
            <p
              className={`text-sm font-medium ${getScoreColor(question.isCorrect)}`}
            >
              {question.isCorrect ? "✓ Hoàn thành xuất sắc" : "✗ Cần cải thiện"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <FaTrophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{quizTitle}</h2>
              <p className="text-sm text-blue-100">
                Xem lại kết quả và đáp án chi tiết
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Tỷ lệ đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}
                </div>
                <div className="text-xs text-gray-500">Câu đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totalQuestions - correctCount}
                </div>
                <div className="text-xs text-gray-500">Câu sai</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
              className="flex items-center gap-2"
            >
              {showCorrectAnswers ? <FaEyeSlash /> : <FaEye />}
              {showCorrectAnswers ? "Ẩn đáp án" : "Xem đáp án"}
            </Button>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaQuestion className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Câu {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                <FaChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(totalQuestions - 1, currentQuestionIndex + 1),
                  )
                }
                disabled={currentQuestionIndex === totalQuestions - 1}
              >
                <FaChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {currentQuestion && (
            <div
              className={`rounded-lg border-2 p-4 ${getScoreBgColor(currentQuestion.isCorrect)}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Câu {currentQuestionIndex + 1}
                  </span>
                  {currentQuestion.isCorrect ? (
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${getScoreColor(currentQuestion.isCorrect)}`}
                >
                  {currentQuestion.isCorrect ? "Chính xác" : "Không chính xác"}
                </span>
              </div>

              {currentQuestion.type === "multiple_choice"
                ? renderMultipleChoiceQuestion(currentQuestion)
                : renderMatchingQuestion(currentQuestion)}
            </div>
          )}
        </div>

        {/* Question Overview */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Tổng quan các câu hỏi:
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-blue-600 text-white"
                    : q.isCorrect
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
          <Button
            onClick={onGoHome}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FaHome className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizReviewModal;
