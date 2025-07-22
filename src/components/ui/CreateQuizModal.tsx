import { useState } from "react";
import Button from "./Button";
import InputField from "./InputField";

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateQuizRequest) => void;
  isLoading?: boolean;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
}

const CreateQuizModal = ({ isOpen, onClose, onSubmit, isLoading = false }: CreateQuizModalProps) => {
  const [formData, setFormData] = useState<CreateQuizRequest>({
    title: "",
    description: "",
    duration_minutes: 60,
    total_questions: 10,
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<CreateQuizRequest>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<CreateQuizRequest> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên quiz không được để trống";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả không được để trống";
    }

    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 15; // Set minimum value
    }

    if (formData.total_questions <= 0) {
      newErrors.total_questions = 1; // Set minimum value
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CreateQuizRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      duration_minutes: 60,
      total_questions: 10,
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tạo Quiz Mới
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <InputField
            label="Tên Quiz"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
            placeholder="Nhập tên quiz..."
            required
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Nhập mô tả quiz..."
              rows={3}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description 
                  ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Thời gian (phút)"
              type="number"
              value={formData.duration_minutes.toString()}
              onChange={(e) => handleChange("duration_minutes", parseInt(e.target.value) || 60)}
              min="1"
              max="300"
              placeholder="60"
              required
              disabled={isLoading}
            />

            <InputField
              label="Số câu hỏi"
              type="number"
              value={formData.total_questions.toString()}
              onChange={(e) => handleChange("total_questions", parseInt(e.target.value) || 10)}
              min="1"
              max="100"
              placeholder="10"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Kích hoạt quiz ngay
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo..." : "Tạo Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;
