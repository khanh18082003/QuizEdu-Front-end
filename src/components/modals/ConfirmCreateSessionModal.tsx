import { FaTimes, FaQuestionCircle } from "react-icons/fa";
import Button from "../ui/Button";
import type { ClassroomQuiz } from "../../services/classroomService";

interface ConfirmCreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quiz: ClassroomQuiz | null;
  isLoading?: boolean;
}

const ConfirmCreateSessionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  quiz, 
  isLoading = false 
}: ConfirmCreateSessionModalProps) => {
  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaQuestionCircle className="text-blue-500" />
            Xác nhận tạo Session
          </h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaQuestionCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Bạn có chắc chắn muốn tạo session cho quiz này?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sau khi tạo, học sinh sẽ có thể tham gia làm bài ngay lập tức.
            </p>
          </div>

          {/* Quiz Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Thông tin Quiz
            </h3>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-blue-700 dark:text-blue-300 flex-shrink-0">Tên:</span>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100 text-right break-words">
                  {quiz.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">Trạng thái:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  quiz.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {quiz.active ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>
              {quiz.description && (
                <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Mô tả:</span>
                  <p className="text-sm text-blue-900 dark:text-blue-100 mt-1 break-words">
                    {quiz.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Lưu ý quan trọng
                </h4>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                  <li>• Session sẽ được tạo ngay lập tức</li>
                  <li>• Bạn sẽ được chuyển đến phòng chờ</li>
                  <li>• Học sinh có thể tham gia bằng mã session</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Xác nhận tạo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCreateSessionModal;
