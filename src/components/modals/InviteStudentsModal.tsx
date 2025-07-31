import React, { useState } from "react";
import Button from "../ui/Button";
import { FaTimes, FaPlus, FaTrash, FaEnvelope } from "react-icons/fa";
import { inviteStudents } from "../../services/classroomService";

interface InviteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classRoomId: string;
  onStudentsInvited: () => void;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}

const InviteStudentsModal: React.FC<InviteStudentsModalProps> = ({
  isOpen,
  onClose,
  classRoomId,
  onStudentsInvited,
  onShowToast,
}) => {
  const [emails, setEmails] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length > 0 ? newEmails : ['']);
    
    // Remove error for this field
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);

    // Clear error for this field if it becomes valid
    if (value && validateEmail(value)) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: number]: string } = {};
    const validEmails = emails.filter(email => email.trim() !== '');

    if (validEmails.length === 0) {
      onShowToast("Vui lòng nhập ít nhất một email", "error");
      return false;
    }

    // Check for duplicates
    const emailSet = new Set();
    const duplicates = new Set();

    validEmails.forEach((email, index) => {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!validateEmail(trimmedEmail)) {
        newErrors[index] = "Email không hợp lệ";
      } else if (emailSet.has(trimmedEmail)) {
        duplicates.add(trimmedEmail);
        newErrors[index] = "Email này đã được nhập";
      } else {
        emailSet.add(trimmedEmail);
      }
    });

    // Mark all instances of duplicate emails
    if (duplicates.size > 0) {
      emails.forEach((email, index) => {
        if (duplicates.has(email.trim().toLowerCase())) {
          newErrors[index] = "Email này đã được nhập";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Filter out empty emails
      const validEmails = emails
        .map(email => email.trim())
        .filter(email => email !== '');

      await inviteStudents(classRoomId, validEmails);
      
      onShowToast(`Đã gửi lời mời thành công tới ${validEmails.length} email`, "success");
      onStudentsInvited();
      handleClose();
    } catch (error: any) {
      console.error("Error inviting students:", error);
      const errorMessage = error.response?.data?.message || "Không thể gửi lời mời. Vui lòng thử lại!";
      onShowToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmails(['']);
    setErrors({});
    onClose();
  };

  const pasteEmails = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const emailList = text
        .split(/[,;\n\r\t]+/)
        .map(email => email.trim())
        .filter(email => email !== '');
      
      if (emailList.length > 0) {
        setEmails(emailList);
        onShowToast(`Đã dán ${emailList.length} email`, "info");
      }
    } catch (error) {
      onShowToast("Không thể đọc từ clipboard", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <FaEnvelope className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mời học sinh tham gia lớp
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nhập email của học sinh để gửi lời mời tham gia lớp học
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email học sinh
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pasteEmails}
                  className="text-xs"
                >
                  Dán từ clipboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEmailField}
                  className="text-xs"
                >
                  <FaPlus className="mr-1" />
                  Thêm email
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {emails.map((email, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder={`Email học sinh ${index + 1}`}
                        className={`w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors[index] ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        disabled={isLoading}
                      />
                      <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors[index] && (
                      <p className="text-red-600 text-sm mt-1">{errors[index]}</p>
                    )}
                  </div>
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmailField(index)}
                      className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💡 Lưu ý:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Học sinh sẽ nhận được email mời với thông tin lớp học</li>
                <li>• Mỗi email chỉ có thể được mời một lần</li>
                <li>• Bạn có thể dán nhiều email cùng lúc từ clipboard</li>
                <li>• Hệ thống sẽ tự động loại bỏ email trùng lặp</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {emails.filter(email => email.trim() !== '').length} email sẽ được gửi lời mời
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || emails.filter(email => email.trim() !== '').length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isLoading ? "Đang gửi..." : "Gửi lời mời"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteStudentsModal;
