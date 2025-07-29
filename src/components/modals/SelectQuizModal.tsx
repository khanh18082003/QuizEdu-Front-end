import { useState } from "react";
import { FaTimes, FaQuestionCircle, FaCheck, FaClock } from "react-icons/fa";
import Button from "../ui/Button";
import type { ClassroomQuiz } from "../../services/classroomService";

interface SelectQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuiz: (quiz: ClassroomQuiz) => void;
  quizzes: ClassroomQuiz[];
}

const SelectQuizModal = ({ isOpen, onClose, onSelectQuiz, quizzes }: SelectQuizModalProps) => {
  const [selectedQuiz, setSelectedQuiz] = useState<ClassroomQuiz | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedQuiz) {
      onSelectQuiz(selectedQuiz);
      setSelectedQuiz(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedQuiz(null);
    onClose();
  };

  const activeQuizzes = quizzes.filter(quiz => quiz.active);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FaQuestionCircle className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chọn bài kiểm tra
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chọn một bài quiz để bắt đầu làm bài kiểm tra
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Không có bài quiz nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hiện tại không có bài quiz nào đang hoạt động để làm bài.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuiz(quiz)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedQuiz?.id === quiz.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {quiz.name}
                        </h3>
                        {selectedQuiz?.id === quiz.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {quiz.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                      <FaCheck className="text-xs" />
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeQuizzes.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedQuiz}
              className="flex items-center gap-2"
            >
              <FaClock />
              Bắt đầu làm bài
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectQuizModal;
