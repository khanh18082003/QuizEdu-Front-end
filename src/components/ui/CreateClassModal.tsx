import React, { useState } from "react";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import type { CreateClassroomRequest } from "../../services/classroomService";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassroomRequest) => Promise<void>;
  isLoading?: boolean;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateClassroomRequest>({
    name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateClassroomRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên lớp học là bắt buộc";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        is_active: true,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating classroom:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tạo lớp học mới
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Tên lớp học"
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
            placeholder="Nhập tên lớp học"
            error={errors.name}
            disabled={isLoading}
            required
          />

          <InputField
            label="Mô tả"
            type="text"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("description", e.target.value)}
            placeholder="Nhập mô tả lớp học"
            error={errors.description}
            disabled={isLoading}
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Kích hoạt lớp học
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              fullWidth
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Đang tạo..."
              disabled={isLoading}
              fullWidth
            >
              Tạo lớp học
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
