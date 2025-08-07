import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { FaEdit } from "react-icons/fa";
import type { QuizManagementItem, UpdateQuizRequest } from "../../services/quizService";

interface EditQuizModalProps {
  isOpen: boolean;
  quiz: QuizManagementItem | null;
  onClose: () => void;
  onUpdate: (formData: UpdateQuizRequest) => Promise<void>;
  isUpdating: boolean;
}

const EditQuizModal = ({ isOpen, quiz, onClose, onUpdate, isUpdating }: EditQuizModalProps) => {
  const [formData, setFormData] = useState<UpdateQuizRequest>({
    name: "",
    description: "",
    is_active: true,
    is_public: false
  });

  // Update form data when quiz changes
  useEffect(() => {
    if (quiz) {
      console.log('Setting form data from quiz:', quiz.quiz);
      console.log('Quiz public value:', quiz.quiz.public);
      
      setFormData({
        name: quiz.quiz.name || "",
        description: quiz.quiz.description || "",
        is_active: quiz.quiz.active,
        is_public: quiz.quiz.public
      });
    }
  }, [quiz]);

  const handleSubmit = async () => {
    console.log('Submitting form data:', formData);
    await onUpdate(formData);
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-auto">
        <div className="mb-6">
          {/* Edit Icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <FaEdit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Chỉnh sửa Quiz
          </h3>
          
          {/* Current Quiz Info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            Đang chỉnh sửa: <span className="font-medium">{quiz.quiz.name}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Quiz
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên quiz mới..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả quiz mới..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-2 gap-4">
            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Trạng thái</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formData.is_active ? 'Hoạt động' : 'Tạm dừng'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_active ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Quyền truy cập</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formData.is_public ? 'Công khai' : 'Riêng tư'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_public ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_public ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className="px-6"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-6"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang cập nhật...
              </div>
            ) : (
              "Cập nhật Quiz"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditQuizModal;
