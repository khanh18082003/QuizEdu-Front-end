import { useState } from "react";
import { FaUpload, FaTrash, FaFile } from "react-icons/fa";
import Button from "../ui/Button";
import { createNotification, type CreateNotificationRequest, type NotificationResponse } from "../../services/notificationService";

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onNotificationCreated: (notification: NotificationResponse) => void;
  onShowToast: (message: string, type: "success" | "error" | "info") => void;
}

const CreateNotificationModal = ({
  isOpen,
  onClose,
  classId,
  onNotificationCreated,
  onShowToast,
}: CreateNotificationModalProps) => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      onShowToast("Vui lòng nhập nội dung thông báo", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const request: CreateNotificationRequest = {
        description: description.trim(),
        class_id: classId, // Changed from classId to class_id
        files: files.length > 0 ? files : undefined,
      };

      const response = await createNotification(request);
      
      if (response.code === "M000") {
        onNotificationCreated(response.data);
        onShowToast("Thông báo đã được tạo thành công!", "success");
        handleClose();
      } else {
        throw new Error(response.message || "Failed to create notification");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      onShowToast("Không thể tạo thông báo. Vui lòng thử lại!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription("");
      setFiles([]);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tạo thông báo mới
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nội dung thông báo *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập nội dung thông báo cho lớp học..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={6}
              disabled={isSubmitting}
              required
            />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description.length}/2000 ký tự
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File đính kèm (tùy chọn)
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FaUpload className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Chọn file
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                  accept="*/*"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Có thể chọn nhiều file. Định dạng: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, v.v.
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  File đã chọn ({files.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center min-w-0 flex-1">
                        <FaFile className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting}
                        className="ml-3 text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                'Tạo thông báo'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
