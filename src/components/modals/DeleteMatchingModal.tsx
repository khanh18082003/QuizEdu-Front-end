import { useState } from "react";
import { FaTimes, FaTrash, FaExchangeAlt } from "react-icons/fa";
import Button from "../ui/Button";
import type { MatchingQuestion } from "../../services/quizService";

interface DeleteMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionIds: string[]) => void;
  questions: MatchingQuestion[];
  isLoading?: boolean;
}

const DeleteMatchingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  questions,
  isLoading = false 
}: DeleteMatchingModalProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const handleSubmit = () => {
    if (selectedQuestions.length === 0) {
      alert("Vui lòng chọn ít nhất một cặp ghép đôi để xóa!");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    onSubmit(selectedQuestions);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const resetForm = () => {
    setSelectedQuestions([]);
  };

  const handleClose = () => {
    resetForm();
    setShowConfirmDialog(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FaTrash className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Xóa cặp ghép đôi
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chọn các cặp ghép đôi bạn muốn xóa
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <FaExchangeAlt className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Không có cặp ghép đôi nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có cặp ghép đôi nào được tạo trong quiz này.
              </p>
            </div>
          ) : (
            <>
              {/* Select All Checkbox */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedQuestions.length === questions.length && questions.length > 0}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectAll();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isLoading}
                    className="w-5 h-5 text-red-500 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 focus:ring-2 disabled:opacity-50"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn tất cả ({questions.length} cặp)
                  </label>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Đã chọn: {selectedQuestions.length}/{questions.length}
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      selectedQuestions.includes(question.id)
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
                    }`}
                    onClick={() => handleQuestionToggle(question.id)}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleQuestionToggle(question.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isLoading}
                        className="w-5 h-5 text-red-500 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 focus:ring-2 mt-1 disabled:opacity-50"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Cặp ghép đôi #{index + 1}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                            {question.points} điểm
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {/* Item A */}
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                A
                              </span>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {question.item_a.matching_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {question.item_a.content}
                            </p>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center py-2">
                            <FaExchangeAlt className="text-gray-400 dark:text-gray-500" />
                          </div>

                          {/* Item B */}
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 bg-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                                B
                              </span>
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                {question.item_b.matching_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {question.item_b.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        {questions.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaTrash className="text-red-500" />
              <span>
                {selectedQuestions.length === 0 
                  ? "Chưa chọn cặp nào" 
                  : `Sẽ xóa ${selectedQuestions.length} cặp ghép đôi`
                }
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading || selectedQuestions.length === 0}
                className="px-6 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaTrash />
                    Xóa đã chọn
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            {/* Confirm Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <FaTrash className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Xác nhận xóa
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Bạn có chắc chắn muốn xóa <span className="font-semibold text-red-600 dark:text-red-400">{selectedQuestions.length} cặp ghép đôi</span> đã chọn không?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Cảnh báo: Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục!
                </p>
              </div>
            </div>

            {/* Confirm Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Button
                variant="secondary"
                onClick={handleCancelDelete}
                disabled={isLoading}
                className="px-6"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="px-6 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaTrash />
                    Xác nhận xóa
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteMatchingModal;
