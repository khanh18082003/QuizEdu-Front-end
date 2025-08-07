import React, { useState, useEffect } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import type { NotificationComment } from "../../services/notificationService";

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newContent: string) => Promise<void>;
  comment: NotificationComment | null;
}

const EditCommentModal: React.FC<EditCommentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  comment,
}) => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or comment changes
  useEffect(() => {
    if (isOpen && comment) {
      setContent(comment.content);
      setError(null);
    } else {
      setContent("");
      setError(null);
    }
  }, [isOpen, comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Nội dung nhận xét không được để trống");
      return;
    }

    if (content.trim() === comment?.content) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(content.trim());
      onClose();
    } catch (error) {
      console.error("Error updating comment:", error);
      setError("Không thể cập nhật nhận xét. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaEdit className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chỉnh sửa nhận xét
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Comment info */}
        {comment && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                  {comment.user.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={`${comment.user.first_name} ${comment.user.last_name}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-white">
                      {comment.user.first_name.charAt(0)}{comment.user.last_name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {comment.user.first_name} {comment.user.last_name}
                  </p>
                  {comment.user.role === 'TEACHER' && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Giáo viên
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleString("vi-VN")}
                  {comment.updated_at && comment.updated_at !== comment.created_at && (
                    <span className="ml-1">(đã chỉnh sửa)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung nhận xét..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim() || content.trim() === comment?.content}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommentModal;
