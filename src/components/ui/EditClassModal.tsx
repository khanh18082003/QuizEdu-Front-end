import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Button from "./Button";
import InputField from "./InputField";
import type { UpdateClassroomRequest, ClassRoomResponse } from "../../services/classroomService";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateClassroomRequest) => void;
  isLoading?: boolean;
  classroom: ClassRoomResponse | null;
}

const EditClassModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  classroom
}: EditClassModalProps) => {
  const [formData, setFormData] = useState<UpdateClassroomRequest>({
    name: "",
    description: "",
    isActive: true,
  });

  // Reset form when classroom changes
  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name,
        description: classroom.description,
        isActive: classroom.active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [classroom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof UpdateClassroomRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chỉnh sửa lớp học
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Class Name */}
          <InputField
            label="Tên lớp học"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nhập tên lớp học..."
            required
            disabled={isLoading}
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Nhập mô tả lớp học..."
              disabled={isLoading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--color-gradient-from)] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none disabled:opacity-50"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
            />
            <label 
              htmlFor="isActive" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái hoạt động
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
              isLoading={isLoading}
            >
              Cập nhật
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClassModal;
