import { useState, useEffect } from "react";
import Button from "./Button";
import InputField from "./InputField";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateSessionRequest) => void;
  isLoading?: boolean;
  quizzes: QuizOption[];
}

interface QuizOption {
  id: string;
  title: string;
  duration_minutes: number;
}

export interface CreateSessionRequest {
  quiz_id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const CreateSessionModal = ({ isOpen, onClose, onSubmit, isLoading = false, quizzes }: CreateSessionModalProps) => {
  const [formData, setFormData] = useState<CreateSessionRequest>({
    quiz_id: "",
    title: "",
    start_time: "",
    end_time: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<CreateSessionRequest>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const startTime = new Date(now.getTime() + 10 * 60000); // 10 minutes from now
      const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour after start

      setFormData({
        quiz_id: quizzes.length > 0 ? quizzes[0].id : "",
        title: "",
        start_time: startTime.toISOString().slice(0, 16),
        end_time: endTime.toISOString().slice(0, 16),
        is_active: true,
      });
      setErrors({});
    }
  }, [isOpen, quizzes]);

  // Auto-update title when quiz is selected
  useEffect(() => {
    if (formData.quiz_id && !formData.title) {
      const selectedQuiz = quizzes.find(q => q.id === formData.quiz_id);
      if (selectedQuiz) {
        setFormData(prev => ({
          ...prev,
          title: `Session - ${selectedQuiz.title}`
        }));
      }
    }
  }, [formData.quiz_id, quizzes, formData.title]);

  // Auto-update end time when start time or quiz changes
  useEffect(() => {
    if (formData.start_time && formData.quiz_id) {
      const selectedQuiz = quizzes.find(q => q.id === formData.quiz_id);
      if (selectedQuiz) {
        const startTime = new Date(formData.start_time);
        const endTime = new Date(startTime.getTime() + selectedQuiz.duration_minutes * 60000);
        setFormData(prev => ({
          ...prev,
          end_time: endTime.toISOString().slice(0, 16)
        }));
      }
    }
  }, [formData.start_time, formData.quiz_id, quizzes]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<CreateSessionRequest> = {};

    if (!formData.quiz_id) {
      newErrors.quiz_id = "Vui lòng chọn quiz";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Tên session không được để trống";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Vui lòng chọn thời gian bắt đầu";
    }

    if (!formData.end_time) {
      newErrors.end_time = "Vui lòng chọn thời gian kết thúc";
    }

    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      const now = new Date();

      if (startTime <= now) {
        newErrors.start_time = "Thời gian bắt đầu phải sau thời điểm hiện tại";
      }

      if (endTime <= startTime) {
        newErrors.end_time = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
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

  const handleChange = (field: keyof CreateSessionRequest, value: string | boolean) => {
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
      quiz_id: "",
      title: "",
      start_time: "",
      end_time: "",
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
            Tạo Quiz Session
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
          {/* Quiz Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn Quiz <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.quiz_id}
              onChange={(e) => handleChange("quiz_id", e.target.value)}
              disabled={isLoading || quizzes.length === 0}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.quiz_id 
                  ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            >
              <option value="">-- Chọn Quiz --</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title} ({quiz.duration_minutes} phút)
                </option>
              ))}
            </select>
            {errors.quiz_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.quiz_id}
              </p>
            )}
            {quizzes.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                Chưa có quiz nào. Vui lòng tạo quiz trước.
              </p>
            )}
          </div>

          <InputField
            label="Tên Session"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
            placeholder="Nhập tên session..."
            required
            disabled={isLoading}
          />

          <InputField
            label="Thời gian bắt đầu"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => handleChange("start_time", e.target.value)}
            error={errors.start_time}
            required
            disabled={isLoading}
          />

          <InputField
            label="Thời gian kết thúc"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => handleChange("end_time", e.target.value)}
            error={errors.end_time}
            required
            disabled={isLoading}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_session"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="is_active_session" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Kích hoạt session ngay
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
              disabled={isLoading || quizzes.length === 0}
            >
              {isLoading ? "Đang tạo..." : "Tạo Session"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;
