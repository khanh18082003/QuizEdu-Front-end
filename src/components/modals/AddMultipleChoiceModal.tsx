import { useState } from "react";
import { FaPlus, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import type { AddMultipleChoiceQuestion, AddMultipleChoiceAnswer } from "../../services/quizService";

interface AddMultipleChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questions: AddMultipleChoiceQuestion[]) => void;
  isLoading?: boolean;
}

const AddMultipleChoiceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: AddMultipleChoiceModalProps) => {
  const [questions, setQuestions] = useState<AddMultipleChoiceQuestion[]>([
    {
      question_text: "",
      hint: "",
      time_limit: 30,
      allow_multiple_answers: false,
      points: 5,
      answers: [
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false }
      ]
    }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        hint: "",
        time_limit: 30,
        allow_multiple_answers: false,
        points: 5,
        answers: [
          { answer_text: "", correct: false },
          { answer_text: "", correct: false },
          { answer_text: "", correct: false },
          { answer_text: "", correct: false }
        ]
      }
    ]);
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== questionIndex));
    }
  };

  const updateQuestion = (questionIndex: number, field: keyof AddMultipleChoiceQuestion, value: any) => {
    const updatedQuestions = [...questions];
    
    // Special handling for allow_multiple_answers
    if (field === 'allow_multiple_answers' && value === false) {
      // If switching from multiple to single selection, keep only the first correct answer
      const firstCorrectIndex = updatedQuestions[questionIndex].answers.findIndex(a => a.correct);
      updatedQuestions[questionIndex].answers.forEach((answer, index) => {
        if (index !== firstCorrectIndex) {
          answer.correct = false;
        }
      });
    }
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof AddMultipleChoiceAnswer, value: any) => {
    const updatedQuestions = [...questions];
    
    if (field === 'correct' && value === true) {
      // If this question doesn't allow multiple answers, uncheck all other answers first
      if (!updatedQuestions[questionIndex].allow_multiple_answers) {
        updatedQuestions[questionIndex].answers.forEach((answer, index) => {
          if (index !== answerIndex) {
            answer.correct = false;
          }
        });
      }
    }
    
    updatedQuestions[questionIndex].answers[answerIndex] = {
      ...updatedQuestions[questionIndex].answers[answerIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({ answer_text: "", correct: false });
    setQuestions(updatedQuestions);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].answers.length > 2) {
      updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  const handleSubmit = () => {
    // Validate questions
    const validQuestions = questions.filter(q => {
      const hasValidText = q.question_text.trim() !== "";
      const hasValidAnswers = q.answers.some(a => a.answer_text.trim() !== "");
      const hasCorrectAnswer = q.answers.some(a => a.correct);
      return hasValidText && hasValidAnswers && hasCorrectAnswer;
    });

    if (validQuestions.length === 0) {
      alert("Vui lòng nhập ít nhất một câu hỏi hợp lệ với đáp án đúng!");
      return;
    }

    // Filter out empty answers and ensure at least one correct answer per question
    const processedQuestions = validQuestions.map(q => ({
      ...q,
      answers: q.answers.filter(a => a.answer_text.trim() !== ""),
      hint: q.hint?.trim() || undefined
    }));

    onSubmit(processedQuestions);
  };

  const resetForm = () => {
    setQuestions([
      {
        question_text: "",
        hint: "",
        time_limit: 30,
        allow_multiple_answers: false,
        points: 5,
        answers: [
          { answer_text: "", correct: false },
          { answer_text: "", correct: false },
          { answer_text: "", correct: false },
          { answer_text: "", correct: false }
        ]
      }
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Thêm câu hỏi trắc nghiệm
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-8rem)]">
          <div className="space-y-8">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Câu hỏi {questionIndex + 1}
                  </h4>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="Xóa câu hỏi"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <InputField
                    label="Nội dung câu hỏi"
                    type="text"
                    value={question.question_text}
                    onChange={(e) => updateQuestion(questionIndex, 'question_text', e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    required
                  />
                </div>

                {/* Hint */}
                <div className="mb-4">
                  <InputField
                    label="Gợi ý (tùy chọn)"
                    type="text"
                    value={question.hint || ""}
                    onChange={(e) => updateQuestion(questionIndex, 'hint', e.target.value)}
                    placeholder="Nhập gợi ý cho học sinh..."
                  />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <InputField
                      label="Thời gian (giây)"
                      type="number"
                      value={question.time_limit}
                      onChange={(e) => updateQuestion(questionIndex, 'time_limit', parseInt(e.target.value) || 30)}
                      min={10}
                      max={300}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Điểm số
                    </label>
                    <input
                      type="text"
                      value={question.points.toString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ''); // Chỉ cho phép số
                        const numValue = value === '' ? 1 : parseInt(value, 10);
                        if (numValue >= 1 && numValue <= 100) {
                          updateQuestion(questionIndex, 'points', numValue);
                        }
                      }}
                      onBlur={(e) => {
                        // Đảm bảo có giá trị hợp lệ khi blur
                        if (e.target.value === '' || parseInt(e.target.value) < 1) {
                          updateQuestion(questionIndex, 'points', 1);
                        }
                      }}
                      placeholder="1-100"
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={question.allow_multiple_answers}
                        onChange={(e) => updateQuestion(questionIndex, 'allow_multiple_answers', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Cho phép chọn nhiều đáp án
                    </label>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Các đáp án
                    </label>
                    <button
                      onClick={() => addAnswer(questionIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <FaPlus className="text-xs" />
                      Thêm đáp án
                    </button>
                  </div>
                  
                  {/* Answer selection mode info */}
                  <div className={`text-xs p-2 rounded-lg ${
                    question.allow_multiple_answers 
                      ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                  }`}>
                    {question.allow_multiple_answers 
                      ? '✓ Có thể chọn nhiều đáp án đúng'
                      : '○ Chỉ được chọn một đáp án đúng'
                    }
                  </div>
                  
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => updateAnswer(questionIndex, answerIndex, 'correct', !answer.correct)}
                        className={`flex-shrink-0 w-6 h-6 ${
                          question.allow_multiple_answers ? 'rounded' : 'rounded-full'
                        } border-2 flex items-center justify-center transition-all ${
                          answer.correct 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-gray-200 border-gray-300 dark:bg-gray-600 dark:border-gray-500 hover:border-green-400'
                        }`}
                        title={
                          question.allow_multiple_answers 
                            ? (answer.correct ? 'Bỏ chọn đáp án đúng' : 'Chọn là đáp án đúng')
                            : (answer.correct ? 'Đáp án đúng' : 'Chọn làm đáp án đúng')
                        }
                      >
                        {answer.correct && (
                          question.allow_multiple_answers 
                            ? <FaCheck className="text-xs" />
                            : <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </button>
                      
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                        {String.fromCharCode(65 + answerIndex)}.
                      </span>
                      
                      <input
                        type="text"
                        value={answer.answer_text}
                        onChange={(e) => updateAnswer(questionIndex, answerIndex, 'answer_text', e.target.value)}
                        placeholder="Nhập nội dung đáp án..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      
                      {question.answers.length > 2 && (
                        <button
                          onClick={() => removeAnswer(questionIndex, answerIndex)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Xóa đáp án"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <div className="mt-6 text-center">
            <button
              onClick={addQuestion}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Thêm câu hỏi mới
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang thêm...
              </>
            ) : (
              <>
                <FaCheck />
                Thêm câu hỏi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMultipleChoiceModal;
