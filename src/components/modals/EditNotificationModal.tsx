import React, { useState, useEffect } from "react";
import { FaTimes, FaPaperclip, FaTrash } from "react-icons/fa";
import Button from "../ui/Button";
import { 
  updateNotification,
  type UpdateNotificationRequest,
  type NotificationResponse 
} from "../../services/notificationService";

interface EditNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationResponse | null;
  onNotificationUpdated: (notification: NotificationResponse) => void;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}

const EditNotificationModal: React.FC<EditNotificationModalProps> = ({
  isOpen,
  onClose,
  notification,
  onNotificationUpdated,
  onShowToast,
}) => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens with new notification
  useEffect(() => {
    if (notification) {
      setDescription(notification.description);
      setFiles([]);
    }
  }, [notification]);

  // Close modal handler
  const handleClose = () => {
    setDescription("");
    setFiles([]);
    onClose();
  };

  // Handle file selection - allow multiple files
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      // Reset input để có thể chọn lại cùng file nếu cần
      event.target.value = '';
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notification) return;
    
    if (!description.trim()) {
      onShowToast("Vui lòng nhập nội dung thông báo", "error");
      return;
    }

    try {
      setIsLoading(true);

      const updateRequest: UpdateNotificationRequest = {
        description: description.trim(),
        files: files, // Luôn gửi files array, rỗng nếu không có file
      };

      const response = await updateNotification(notification.id, updateRequest);

      if (response.code === "M000") {
        onNotificationUpdated(response.data);
        onShowToast("Thông báo đã được cập nhật thành công!", "success");
        handleClose();
      } else {
        throw new Error(response.message || "Không thể cập nhật thông báo");
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      onShowToast(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông báo",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chỉnh sửa thông báo
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description Field */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nội dung thông báo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={6}
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Mô tả chi tiết về thông báo, thông tin quan trọng cần chia sẻ với học sinh.
              </p>
            </div>

            {/* Current Files Display */}
            {notification.xpath_files && notification.xpath_files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File hiện tại
                </label>
                <div className="space-y-2">
                  {notification.xpath_files.map((fileUrl: string, index: number) => {
                    const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <FaPaperclip className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                            {fileName}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => window.open(fileUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Xem
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  ⚠️ Lưu ý: Nếu bạn chọn file mới, tất cả file hiện tại sẽ bị thay thế.
                </p>
              </div>
            )}

            {/* New File Upload Field */}
            <div>
              <label 
                htmlFor="files" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Thêm file mới (tùy chọn)
              </label>
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="files"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaPaperclip className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Nhấp để chọn file</span> hoặc kéo thả
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      📁 Chọn file mới sẽ thay thế toàn bộ file cũ. Không bắt buộc.
                    </p>
                  </div>
                  <input 
                    id="files"
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* New Selected Files Display */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      File mới được chọn ({files.length}):
                    </p>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <FaPaperclip className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !description.trim()}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Đang cập nhật...
              </div>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditNotificationModal;
