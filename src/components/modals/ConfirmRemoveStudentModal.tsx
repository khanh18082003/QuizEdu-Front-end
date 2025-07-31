import React, { useState } from "react";
import Button from "../ui/Button";
import type { RegisterResponse } from "../../services/userService";

interface ConfirmRemoveStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: RegisterResponse | null;
  onConfirm: () => Promise<void>;
}

const ConfirmRemoveStudentModal: React.FC<ConfirmRemoveStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onConfirm,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  if (!isOpen || !student) return null;

  const handleConfirm = async () => {
    setIsRemoving(true);
    try {
      await onConfirm();
    } finally {
      setIsRemoving(false);
    }
  };

  const getStudentInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-auto">
        <div className="text-center">
          {/* Student Avatar */}
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={`${student.first_name} ${student.last_name}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-red-600 dark:text-red-400 text-xl font-semibold">
                {getStudentInitials(student.first_name, student.last_name)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Xóa học sinh khỏi lớp
          </h3>

          {/* Student Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-medium text-gray-900 dark:text-white">
              {student.first_name} {student.last_name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {student.email}
            </p>
          </div>

          {/* Warning Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Bạn có chắc chắn muốn xóa học sinh này khỏi lớp học? 
            <br />
            <span className="text-red-600 dark:text-red-400 font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isRemoving}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isRemoving}
              className="px-6 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isRemoving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xóa...
                </div>
              ) : (
                "Xóa học sinh"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRemoveStudentModal;
