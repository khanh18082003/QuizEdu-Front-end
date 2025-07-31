import { useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import { useTranslation } from "react-i18next";
import type { CreateClassroomRequest } from "../../services/classroomService";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classData: CreateClassroomRequest) => Promise<void>;
  isLoading?: boolean;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateClassroomRequest>({
    name: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const handleInputChange = (field: keyof CreateClassroomRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên lớp học không được để trống";
    } else if (formData.name.length < 3) {
      newErrors.name = "Tên lớp học phải có ít nhất 3 ký tự";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên lớp học không được quá 100 ký tự";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Mô tả không được quá 500 ký tự";
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
      handleClose();
    } catch (error) {
      console.error("Error creating class:", error);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t("Create New Class")}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Class Name */}
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Class Name")} <span className="text-red-500">*</span>
              </label>
              <InputField
                id="className"
                label="" // Empty label since we use custom label above
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên lớp học..."
                error={errors.name}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="classDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("Description")}
              </label>
              <textarea
                id="classDescription"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Nhập mô tả lớp học (tùy chọn)..."
                rows={3}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none transition-colors ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t("Set class as active")}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("Creating...")}
                </>
              ) : (
                <>
                  <FaPlus size={14} />
                  {t("Create Class")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
