import { useState } from "react";
import { FaTimes, FaTrash, FaCheck } from "react-icons/fa";
import Button from "../ui/Button";
import type { MultipleChoiceQuestion } from "../../services/quizService";

interface DeleteMultipleChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionIds: string[]) => void;
  questions: MultipleChoiceQuestion[];
  isLoading?: boolean;
}

const DeleteMultipleChoiceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  questions,
  isLoading = false 
}: DeleteMultipleChoiceModalProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.question_id));
    }
  };

  const handleSubmit = () => {
    if (selectedQuestions.length === 0) {
      alert("Vui lòng chọn ít nhất một câu hỏi để xóa!");
      return;
    }
    onSubmit(selectedQuestions);
  };

  const resetForm = () => {
    setSelectedQuestions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Xóa câu hỏi trắc nghiệm
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chọn các câu hỏi bạn muốn xóa. Hành động này không thể hoàn tác.
            </p>
            
            {/* Select All Button */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedQuestions.length === questions.length 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedQuestions.length === questions.length && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </div>
                <span className="font-medium">
                  {selectedQuestions.length === questions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </span>
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Đã chọn: {selectedQuestions.length} / {questions.length}
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div 
                key={question.question_id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedQuestions.includes(question.question_id)
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleQuestionToggle(question.question_id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                    selectedQuestions.includes(question.question_id)
                      ? 'bg-red-600 border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedQuestions.includes(question.question_id) && (
                      <FaCheck className="text-white text-xs" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium text-lg mb-2 ${
                      selectedQuestions.includes(question.question_id)
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      Câu {index + 1}: {question.question_text}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        selectedQuestions.includes(question.question_id)
                          ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {question.points} điểm
                      </span>
                      <span className={`px-3 py-1 rounded-full ${
                        selectedQuestions.includes(question.question_id)
                          ? 'bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {question.time_limit}s
                      </span>
                      <span className={`text-xs ${
                        selectedQuestions.includes(question.question_id)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {question.answers.length} đáp án
                      </span>
                    </div>
                    
                    {question.hint && (
                      <div className={`mt-2 text-sm ${
                        selectedQuestions.includes(question.question_id)
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        💡 {question.hint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
            disabled={isLoading || selectedQuestions.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xóa...
              </>
            ) : (
              <>
                <FaTrash />
                Xóa {selectedQuestions.length > 0 ? `${selectedQuestions.length} câu hỏi` : 'câu hỏi'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMultipleChoiceModal;
