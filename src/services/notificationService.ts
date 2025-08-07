import axiosCustom from "../utils/axiosCustom";
import type { SuccessApiResponse } from "../types/response";

// Notification interfaces
export interface NotificationUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: "TEACHER" | "STUDENT";
  created_at: string;
  updated_at: string;
  active: boolean;
  avatar?: string; // Optional avatar field
}

export interface NotificationComment {
  id: string;
  user: NotificationUser;
  content: string;
  created_at: string;
  updated_at?: string; // Optional field for when comment was last updated
}

export interface Notification {
  id: string;
  description: string;
  teacher: NotificationUser;
  created_at: string;
  updated_at: string;
  comments: NotificationComment[];
  xpath_files: string[]; // Array of file URLs
}

export interface GetNotificationsResponse {
  data: Notification[];
}

// API function to get all notifications for a class
export const getAllNotifications = async (
  classId: string,
): Promise<SuccessApiResponse<Notification[]>> => {
  const response = await axiosCustom.get(`/notifications/getAll`, {
    params: {
      class_id: classId
    }
  });
  return response.data;
};

// API function to create a new notification (for future use)
export interface CreateNotificationRequest {
  description: string;
  class_id: string;
  files?: File[]; // Optional files to attach
}

// API function to add a comment to a notification
export interface AddCommentRequest {
  content: string;
  notification_id: string;
}

// Comment response interface
export interface CommentResponse {
  id: string;
  content: string;
  user: NotificationUser;
  created_at: string;
  updated_at?: string; // Optional field for when comment was last updated
}

// Submit a comment to a notification using the new API endpoint
export const submitNotificationComment = async (
  notificationId: string,
  content: string,
): Promise<SuccessApiResponse<CommentResponse>> => {
  const response = await axiosCustom.post(`/notifications/${notificationId}/comment`, {
    content: content
  });
  return response.data;
};

// Create notification request interface
export interface CreateNotificationRequest {
  description: string;
  class_id: string; // Changed from classId to match backend
  files?: File[];
}

// Create notification response interface
export interface NotificationResponse {
  id: string;
  description: string;
  teacher: NotificationUser;
  created_at: string;
  updated_at: string;
  comments: NotificationComment[];
  xpath_files: string[];
}

// Create a new notification
export const createNotification = async (
  request: CreateNotificationRequest,
): Promise<SuccessApiResponse<NotificationResponse>> => {
  const formData = new FormData();
  formData.append('description', request.description);
  formData.append('classId', request.class_id); // Backend expects classId in form data
  
  // Add files if provided
  if (request.files && request.files.length > 0) {
    request.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await axiosCustom.post('/notifications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update notification request interface
export interface UpdateNotificationRequest {
  description: string;
  files?: File[];
}

// Update an existing notification
export const updateNotification = async (
  id: string,
  request: UpdateNotificationRequest,
): Promise<SuccessApiResponse<NotificationResponse>> => {
  const formData = new FormData();
  formData.append('description', request.description);
  
  // Add files if provided
  if (request.files && request.files.length > 0) {
    request.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await axiosCustom.put(`/notifications/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a notification
export const deleteNotification = async (
  id: string,
): Promise<SuccessApiResponse<void>> => {
  const response = await axiosCustom.delete(`/notifications/${id}`);
  return response.data;
};

// Delete a comment from a notification
export const deleteComment = async (
  notificationId: string,
  commentId: string,
): Promise<SuccessApiResponse<void>> => {
  const response = await axiosCustom.delete(`/notifications/${notificationId}/comment/${commentId}`);
  return response.data;
};

// Update a comment in a notification
export const updateComment = async (
  notificationId: string,
  commentId: string,
  content: string,
): Promise<SuccessApiResponse<CommentResponse>> => {
  const response = await axiosCustom.put(`/notifications/${notificationId}/comment/${commentId}`, {
    content: content
  });
  return response.data;
};
