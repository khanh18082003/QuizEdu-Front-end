import React from "react";
import Button from "../ui/Button";
import type { Notification } from "../../services/notificationService";

interface ConfirmDeleteNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  notification: Notification | null;
  isLoading?: boolean;
}

const ConfirmDeleteNotificationModal: React.FC<ConfirmDeleteNotificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  notification,
  isLoading = false,
}) => {
  if (!isOpen || !notification) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Xác nhận xóa thông báo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Bạn có chắc chắn muốn xóa thông báo này?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hành động này không thể hoàn tác. Thông báo và tất cả các nhận xét sẽ bị xóa vĩnh viễn.
              </p>
            </div>
          </div>

          {/* Notification Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {notification.teacher.avatar ? (
                    <img
                      src={notification.teacher.avatar}
                      alt={`${notification.teacher.first_name} ${notification.teacher.last_name}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-medium">
                      {notification.teacher.first_name.charAt(0)}{notification.teacher.last_name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {notification.teacher.display_name || `${notification.teacher.first_name} ${notification.teacher.last_name}`.trim()}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {notification.description}
                </p>
                {notification.comments && notification.comments.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {notification.comments.length} nhận xét
                  </p>
                )}
                {notification.xpath_files && notification.xpath_files.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {notification.xpath_files.length} file đính kèm
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Đang xóa...
              </>
            ) : (
              'Xác nhận xóa'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteNotificationModal;
