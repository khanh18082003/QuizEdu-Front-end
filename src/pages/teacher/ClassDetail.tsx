import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import SelectQuizModal from "../../components/modals/SelectQuizModal";
import QuizPracticeModal from "../../components/modals/QuizPracticeModal";
import AddQuizToClassModal from "../../components/modals/AddQuizToClassModal";
import InviteStudentsModal from "../../components/modals/InviteStudentsModal";
import SpinWheelModal from "../../components/modals/SpinWheelModal";
import ConfirmCreateSessionModal from "../../components/modals/ConfirmCreateSessionModal";
import CreateNotificationModal from "../../components/modals/CreateNotificationModal";
import EditNotificationModal from "../../components/modals/EditNotificationModal";
import ConfirmDeleteNotificationModal from "../../components/modals/ConfirmDeleteNotificationModal";
import ConfirmDeleteCommentModal from "../../components/modals/ConfirmDeleteCommentModal";
import EditCommentModal from "../../components/modals/EditCommentModal";
import {
  getClassroomDetail,
  type ClassroomDetailData,
  type ClassroomQuiz,
  removeStudentFromClassroom
} from "../../services/classroomService";

import {
  getQuizForPractice,
  type QuizManagementItem,
  createQuizSession,
  type QuizSessionRequest,
  type QuizSessionResponse
} from "../../services/quizService";

import {
  getAllNotifications,
  deleteNotification,
  submitNotificationComment,
  deleteComment,
  updateComment,
  type Notification,
  type NotificationResponse,
  type NotificationComment
} from "../../services/notificationService";

import { type RegisterResponse } from "../../services/userService";
import ConfirmRemoveStudentModal from "../../components/modals/ConfirmRemoveStudentModal";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classDetail, setClassDetail] = useState<ClassroomDetailData | null>(null);
  const [students, setStudents] = useState<RegisterResponse[]>([]);
  const [quizzes, setQuizzes] = useState<ClassroomQuiz[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSessionResponse[]>([]);

  // Get user from Redux store
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "quizzes" | "sessions" | "notifications">("students");

  // Practice mode states
  const [isSelectQuizModalOpen, setIsSelectQuizModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [selectedQuizForPractice, setSelectedQuizForPractice] = useState<QuizManagementItem | null>(null);
  const [isLoadingQuizDetails, setIsLoadingQuizDetails] = useState(false);

  // Add quiz modal state
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);

  // Student removal modal state
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
  const [selectedStudentToRemove, setSelectedStudentToRemove] = useState<RegisterResponse | null>(null);

  // Invite students modal state
  const [isInviteStudentsModalOpen, setIsInviteStudentsModalOpen] = useState(false);

  // Spin wheel modal state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [selectedStudentForPractice, setSelectedStudentForPractice] = useState<RegisterResponse | null>(null);

  // Quiz Session states
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showConfirmCreateSession, setShowConfirmCreateSession] = useState(false);
  const [selectedQuizForSession, setSelectedQuizForSession] = useState<ClassroomQuiz | null>(null);

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] = useState(false);
  const [isEditNotificationModalOpen, setIsEditNotificationModalOpen] = useState(false);
  const [selectedNotificationForEdit, setSelectedNotificationForEdit] = useState<NotificationResponse | null>(null);
  const [isDeleteNotificationModalOpen, setIsDeleteNotificationModalOpen] = useState(false);
  const [selectedNotificationForDelete, setSelectedNotificationForDelete] = useState<Notification | null>(null);
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
  const [selectedCommentForDelete, setSelectedCommentForDelete] = useState<{comment: NotificationComment, notificationId: string} | null>(null);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [selectedCommentForEdit, setSelectedCommentForEdit] = useState<{comment: NotificationComment, notificationId: string} | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [isDeletingComment, setIsDeletingComment] = useState<Record<string, boolean>>({});

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) {
        navigate("/teacher/classes");
        return;
      }

      try {
        setIsLoading(true);

        // Use real API
        const response = await getClassroomDetail(classId);
        const data = response.data;

        setClassDetail(data);
        setStudents(data.students);
        setQuizzes(data.quiz);

        // Fetch notifications for this class
        try {
          const notificationResponse = await getAllNotifications(classId);
          // Sort notifications by created_at descending (newest first)
          const sortedNotifications = notificationResponse.data.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setNotifications(sortedNotifications);
        } catch (notificationError) {
          console.error("Error fetching notifications:", notificationError);
          // Don't show error toast for notifications as it's not critical
        }

      } catch (error) {
        console.error("Error fetching class data:", error);
        showToast("Không thể tải thông tin lớp học", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const handleAddStudent = () => {
    setIsInviteStudentsModalOpen(true);
  };

  const handleStudentsInvited = async () => {
    // Refresh class data after inviting students
    if (classId) {
      try {
        const response = await getClassroomDetail(classId);
        const data = response.data;
        setClassDetail(data);
        setStudents(data.students);
      } catch (error) {
        console.error("Error refreshing class data:", error);
        showToast("Không thể tải lại dữ liệu lớp học", "error");
      }
    }
  };

  const handleAddQuiz = () => {
    setIsAddQuizModalOpen(true);
  };

  const handleQuizAdded = async () => {
    // Refresh class data after adding a quiz
    if (classId) {
      try {
        const response = await getClassroomDetail(classId);
        const data = response.data;
        setClassDetail(data);
        setQuizzes(data.quiz);
        showToast("Đã thêm quiz vào lớp học thành công!", "success");
      } catch (error) {
        console.error("Error refreshing class data:", error);
        showToast("Không thể tải lại dữ liệu lớp học", "error");
      }
    }
  };

  const handleCreateSession = (quiz: ClassroomQuiz) => {
    setSelectedQuizForSession(quiz);
    setShowConfirmCreateSession(true);
  };

  const confirmCreateSession = async () => {
    if (!user?.id || !classId || !selectedQuizForSession) return;

    try {
      setIsCreatingSession(true);

      const sessionData: QuizSessionRequest = {
        quiz_id: selectedQuizForSession.id,
        class_id: classId,
        teacher_id: user.id
      };

      const response = await createQuizSession(sessionData);
      setQuizSessions(prev => [...prev, response.data]);
      showToast("Phiên quiz đã được tạo thành công!", "success");

      // Close modal and reset state
      setShowConfirmCreateSession(false);
      setSelectedQuizForSession(null);

      // Navigate to waiting room page
      navigate(`/teacher/quiz-waiting-room`, {
        state: {
          session: response.data,
          quiz: selectedQuizForSession,
          students: students,
          classId: classId
        }
      });

    } catch (error) {
      console.error("Error creating quiz session:", error);
      showToast("Không thể tạo phiên quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleStartPractice = () => {
    setIsSelectQuizModalOpen(true);
  };

  const handleSelectQuizForPractice = async (quiz: ClassroomQuiz) => {
    try {
      setIsLoadingQuizDetails(true);
      const response = await getQuizForPractice(quiz.id);
      setSelectedQuizForPractice(response.data);
      setIsSelectQuizModalOpen(false);
      setShowSpinWheel(true);
    } catch (error) {
      console.error("Error loading quiz details:", error);
      showToast("Không thể tải chi tiết quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsLoadingQuizDetails(false);
    }
  };

  const handleStudentSelected = (student: RegisterResponse) => {
    setSelectedStudentForPractice(student);
    setShowSpinWheel(false);
    setIsPracticeModalOpen(true);
  };

  const handleClosePracticeModal = () => {
    setIsPracticeModalOpen(false);
    setSelectedQuizForPractice(null);
    setSelectedStudentForPractice(null);
  };

  const handleRemoveStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentToRemove(student);
      setIsRemoveStudentModalOpen(true);
    }
  };

  const confirmRemoveStudent = async () => {
    try {
      if (!classId || !selectedStudentToRemove) return;

      await removeStudentFromClassroom(classId, selectedStudentToRemove.id);

      // Remove student from local state
      setStudents(prev => prev.filter(s => s.id !== selectedStudentToRemove.id));

      showToast("Đã xóa học sinh khỏi lớp học thành công", "success");
      setIsRemoveStudentModalOpen(false);
      setSelectedStudentToRemove(null);
    } catch (error) {
      console.error("Error removing student:", error);
      showToast("Không thể xóa học sinh. Vui lòng thử lại!", "error");
    }
  };

  const handleDeleteSession = async (_sessionId: string) => {
    try {
      showToast("Tính năng xóa session đang được phát triển", "info");
    } catch (error) {
      console.error("Error deleting session:", error);
      showToast("Không thể xóa session. Vui lòng thử lại!", "error");
    }
  };

  // Notification handlers
  const handleCreateNotification = () => {
    setIsCreateNotificationModalOpen(true);
  };

  const handleEditNotification = (notification: Notification) => {
    // Convert Notification to NotificationResponse format
    const notificationResponse: NotificationResponse = {
      id: notification.id,
      description: notification.description,
      teacher: notification.teacher,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      comments: notification.comments,
      xpath_files: notification.xpath_files
    };
    
    setSelectedNotificationForEdit(notificationResponse);
    setIsEditNotificationModalOpen(true);
  };

  const handleDeleteNotification = (notification: Notification) => {
    setSelectedNotificationForDelete(notification);
    setIsDeleteNotificationModalOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (!selectedNotificationForDelete) return;

    try {
      setIsDeletingNotification(true);
      await deleteNotification(selectedNotificationForDelete.id);
      
      // Remove notification from local state
      setNotifications(prev => 
        prev.filter(n => n.id !== selectedNotificationForDelete.id)
      );
      
      setIsDeleteNotificationModalOpen(false);
      setSelectedNotificationForDelete(null);
      showToast("Thông báo đã được xóa thành công!", "success");
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("Không thể xóa thông báo. Vui lòng thử lại!", "error");
    } finally {
      setIsDeletingNotification(false);
    }
  };

  const handleNotificationCreated = (notification: NotificationResponse) => {
    // Convert NotificationResponse to Notification format for the state
    const newNotification: Notification = {
      id: notification.id,
      description: notification.description,
      teacher: notification.teacher,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      comments: notification.comments,
      xpath_files: notification.xpath_files
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Sort by created_at descending (newest first) to ensure proper ordering
      return updated.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    showToast("Thông báo đã được tạo thành công!", "success");
    setIsCreateNotificationModalOpen(false);
  };

  const handleNotificationUpdated = (notification: NotificationResponse) => {
    // Convert NotificationResponse to Notification format and update in state
    const updatedNotification: Notification = {
      id: notification.id,
      description: notification.description,
      teacher: notification.teacher,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      comments: notification.comments,
      xpath_files: notification.xpath_files
    };
    
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notification.id ? updatedNotification : n);
      // Sort by created_at descending (newest first) after update
      return updated.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    setIsEditNotificationModalOpen(false);
    setSelectedNotificationForEdit(null);
    showToast("Thông báo đã được cập nhật thành công!", "success");
  };

  const toggleNotificationExpanded = (notificationId: string) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const handleCommentSubmit = async (notificationId: string) => {
    const comment = newComments[notificationId];
    if (!comment.trim()) return;

    try {
      // Set loading state for this specific comment
      setIsSubmittingComment(prev => ({
        ...prev,
        [notificationId]: true
      }));

      // Call API to submit comment
      const response = await submitNotificationComment(notificationId, comment.trim());
      
      // Update the notification with the new comment
      setNotifications(prev => 
        prev.map(notification => {
          if (notification.id === notificationId) {
            // Convert CommentResponse to NotificationComment format
            const newComment = {
              id: response.data.id,
              user: response.data.user,
              content: response.data.content,
              created_at: response.data.created_at
            };
            
            return {
              ...notification,
              comments: [...(notification.comments || []), newComment]
            };
          }
          return notification;
        })
      );
      
      // Clear the comment input
      setNewComments(prev => ({
        ...prev,
        [notificationId]: ""
      }));

      showToast("Nhận xét đã được thêm thành công!", "success");
    } catch (error) {
      console.error("Error submitting comment:", error);
      showToast("Không thể thêm nhận xét. Vui lòng thử lại!", "error");
    } finally {
      setIsSubmittingComment(prev => ({
        ...prev,
        [notificationId]: false
      }));
    }
  };

  const handleCommentChange = (notificationId: string, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [notificationId]: value
    }));
  };

  const handleDeleteComment = async (notificationId: string, commentId: string) => {
    // Find the comment to delete
    const notification = notifications.find(n => n.id === notificationId);
    const comment = notification?.comments?.find(c => c.id === commentId);
    
    if (!comment) return;
    
    // Set selected comment and show confirmation modal
    setSelectedCommentForDelete({ comment, notificationId });
    setIsDeleteCommentModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!selectedCommentForDelete) return;
    
    const { comment, notificationId } = selectedCommentForDelete;
    
    try {
      // Set loading state for this specific comment
      setIsDeletingComment(prev => ({
        ...prev,
        [comment.id]: true
      }));

      // Call API to delete comment
      await deleteComment(notificationId, comment.id);
      
      // Update the notification by removing the deleted comment
      setNotifications(prev => 
        prev.map(notification => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              comments: notification.comments?.filter(c => c.id !== comment.id) || []
            };
          }
          return notification;
        })
      );

      // Close modal and reset state
      setIsDeleteCommentModalOpen(false);
      setSelectedCommentForDelete(null);
      showToast("Nhận xét đã được xóa thành công!", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Không thể xóa nhận xét. Vui lòng thử lại!", "error");
    } finally {
      setIsDeletingComment(prev => ({
        ...prev,
        [comment.id]: false
      }));
    }
  };

  const handleEditComment = (notificationId: string, commentId: string) => {
    // Find the comment to edit
    const notification = notifications.find(n => n.id === notificationId);
    const comment = notification?.comments?.find(c => c.id === commentId);
    
    if (!comment) return;
    
    // Set selected comment and show edit modal
    setSelectedCommentForEdit({ comment, notificationId });
    setIsEditCommentModalOpen(true);
  };

  const confirmEditComment = async (newContent: string) => {
    if (!selectedCommentForEdit) return;
    
    const { comment, notificationId } = selectedCommentForEdit;
    
    try {
      // Call API to update comment
      const response = await updateComment(notificationId, comment.id, newContent);
      
      // Update the notification with the updated comment
      setNotifications(prev => 
        prev.map(notification => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              comments: notification.comments?.map(c => 
                c.id === comment.id ? {
                  ...c,
                  content: response.data.content,
                  updated_at: response.data.updated_at
                } : c
              ) || []
            };
          }
          return notification;
        })
      );

      // Close modal and reset state
      setIsEditCommentModalOpen(false);
      setSelectedCommentForEdit(null);
      showToast("Nhận xét đã được cập nhật thành công!", "success");
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast("Không thể cập nhật nhận xét. Vui lòng thử lại!", "error");
      throw error; // Re-throw to let the modal handle it
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Không tìm thấy thông tin lớp học</p>
          <Button onClick={() => navigate("/teacher/classes")} className="mt-4">
            Quay lại danh sách lớp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/teacher/classes")}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại danh sách lớp
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {classDetail.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {classDetail.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Mã lớp: {classDetail.class_code}
                </span>
                <span className="text-sm text-gray-500">
                  Tạo lúc: {new Date(classDetail.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("students")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "students"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Học sinh ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "quizzes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Quiz ({quizzes.length})
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "sessions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Sessions ({quizSessions.length})
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "notifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Thông báo ({notifications.length})
              </button>
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách học sinh
                </h2>
                <Button onClick={handleAddStudent}>
                  Thêm học sinh
                </Button>
              </div>

              <div className="space-y-4">
                {students.map((student: RegisterResponse) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={student.avatar}
                            alt={student.display_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.display_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}

                {students.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có học sinh nào trong lớp</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách Quiz
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleStartPractice}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    🎯 Quay chọn học sinh kiểm tra
                  </Button>
                  <Button onClick={handleAddQuiz}>
                    Thêm Quiz
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {quizzes.map((quiz: ClassroomQuiz) => (
                  <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white pr-3 flex-1 leading-relaxed">
                        {quiz.name}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${quiz.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {quiz.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>

                    <p className="text-base text-gray-600 dark:text-gray-400 mb-8 line-clamp-3 leading-relaxed flex-grow">
                      {quiz.description && quiz.description.length > 120
                        ? `${quiz.description.substring(0, 120)}...`
                        : quiz.description || "Không có mô tả"}
                    </p>

                    <div className="flex gap-3 mt-auto">
                      <Button variant="outline" size="md" className="flex-1 py-3">
                        Sửa
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        className="flex-1 py-3"
                        onClick={() => handleCreateSession(quiz)}
                        disabled={isCreatingSession}
                      >
                        {isCreatingSession ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Đang tạo...
                          </>
                        ) : (
                          'Tạo Session'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {quizzes.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="text-gray-400 text-7xl mb-6">
                      <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Chưa có quiz nào được thêm
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Bắt đầu thêm quiz vào lớp học để tạo bài kiểm tra cho học sinh.
                      Bạn có thể thêm quiz từ danh sách quiz đã tạo.
                    </p>
                    <Button onClick={handleAddQuiz} className="px-6 py-3">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Thêm Quiz Đầu Tiên
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quiz Sessions
                </h2>
              </div>

              <div className="space-y-4">
                {quizSessions.map((session: QuizSessionResponse) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Session {session.id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.start_time).toLocaleString("vi-VN")} - {new Date(session.end_time).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {session.status === 'ACTIVE' ? 'Đang diễn ra' : 'Đã kết thúc'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
                {quizSessions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có session nào được tạo</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Thông báo lớp học
                </h2>
                <Button onClick={handleCreateNotification} className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tạo thông báo
                </Button>
              </div>

              <div className="space-y-6">
                {notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-7xl mb-6">
                      <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zm-5-17h8l5 5v13a2 2 0 01-2 2H10a2 2 0 01-2-2V2a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Chưa có thông báo nào
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Tạo thông báo đầu tiên để chia sẻ thông tin quan trọng với học sinh trong lớp.
                      Bạn có thể thêm nội dung, file đính kèm và nhận phản hồi từ học sinh.
                    </p>
                    <Button onClick={handleCreateNotification} className="px-6 py-3">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Tạo thông báo đầu tiên
                    </Button>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      {/* Notification Header */}
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                {notification.teacher.avatar ? (
                                  <img
                                    src={notification.teacher.avatar}
                                    alt={`${notification.teacher.first_name} ${notification.teacher.last_name}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-sm font-medium">
                                    {notification.teacher.first_name.charAt(0)}{notification.teacher.last_name.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.teacher.display_name || `${notification.teacher.first_name} ${notification.teacher.last_name}`.trim()}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(notification.created_at).toLocaleString("vi-VN")}
                                </span>
                              </div>
                              <div 
                                className={`text-gray-700 dark:text-gray-300 ${
                                  !expandedNotifications[notification.id] && notification.description.length > 200 
                                    ? 'line-clamp-3' 
                                    : ''
                                }`}
                              >
                                {expandedNotifications[notification.id] || notification.description.length <= 200
                                  ? notification.description
                                  : `${notification.description.substring(0, 200)}...`
                                }
                              </div>
                              
                              {notification.description.length > 200 && (
                                <button
                                  onClick={() => toggleNotificationExpanded(notification.id)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                                >
                                  {expandedNotifications[notification.id] ? 'Thu gọn' : 'Xem thêm'}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditNotification(notification)}
                            >
                              Sửa
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDeleteNotification(notification)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>

                        {/* File attachments */}
                        {notification.xpath_files && notification.xpath_files.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                File đính kèm ({notification.xpath_files.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {notification.xpath_files.map((fileUrl: string, index: number) => {
                                // Extract filename from URL
                                const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                                const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
                                
                                return (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex-shrink-0">
                                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {fileName}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {fileExtension}
                                      </p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => window.open(fileUrl, '_blank')}
                                    >
                                      Tải xuống
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comments Section */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nhận xét từ lớp học ({notification.comments?.length || 0})
                          </span>
                        </div>

                        {/* Existing Comments */}
                        {notification.comments && notification.comments.length > 0 && (
                          <div className="space-y-4 mb-4">
                            {notification.comments.map((comment, index: number) => (
                              <div key={comment.id || index} className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                    {comment.user.avatar ? (
                                      <img
                                        src={comment.user.avatar}
                                        alt={`${comment.user.first_name} ${comment.user.last_name}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white text-xs font-medium">
                                        {comment.user.first_name.charAt(0)}{comment.user.last_name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {comment.user.display_name || `${comment.user.first_name} ${comment.user.last_name}`.trim()}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(comment.created_at).toLocaleString("vi-VN")}
                                        {comment.updated_at && comment.updated_at !== comment.created_at && (
                                          <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(đã chỉnh sửa)</span>
                                        )}
                                      </span>
                                      {comment.user.role === 'TEACHER' && (
                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                          Giáo viên
                                        </span>
                                      )}
                                    </div>
                                    {/* Edit and Delete buttons - only show for comment owner */}
                                    {user?.id === comment.user.id && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleEditComment(notification.id, comment.id)}
                                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                          title="Chỉnh sửa nhận xét"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(notification.id, comment.id)}
                                          disabled={isDeletingComment[comment.id]}
                                          className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                                          title="Xóa nhận xét"
                                        >
                                          {isDeletingComment[comment.id] ? (
                                            <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                                          ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment */}
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white text-xs font-medium">
                                  {user?.first_name?.charAt(0) || ''}{user?.last_name?.charAt(0) || 'T'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={newComments[notification.id] || ""}
                              onChange={(e) => handleCommentChange(notification.id, e.target.value)}
                              placeholder="Thêm nhận xét..."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                              rows={3}
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleCommentSubmit(notification.id)}
                                disabled={!newComments[notification.id]?.trim() || isSubmittingComment[notification.id]}
                              >
                                {isSubmittingComment[notification.id] ? (
                                  <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                    Đang gửi...
                                  </>
                                ) : (
                                  'Gửi nhận xét'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Select Quiz Modal */}
      <SelectQuizModal
        isOpen={isSelectQuizModalOpen}
        onClose={() => setIsSelectQuizModalOpen(false)}
        onSelectQuiz={handleSelectQuizForPractice}
        quizzes={quizzes}
      />

      {/* Quiz Practice Modal */}
      <QuizPracticeModal
        isOpen={isPracticeModalOpen}
        onClose={handleClosePracticeModal}
        quiz={selectedQuizForPractice}
        selectedStudent={selectedStudentForPractice}
      />

      {/* Add Quiz to Class Modal */}
      <AddQuizToClassModal
        isOpen={isAddQuizModalOpen}
        onClose={() => setIsAddQuizModalOpen(false)}
        classRoomId={classId || ""}
        assignedQuizIds={quizzes.map(quiz => quiz.id)}
        onQuizAdded={handleQuizAdded}
        onShowToast={showToast}
      />

      {/* Invite Students Modal */}
      <InviteStudentsModal
        isOpen={isInviteStudentsModalOpen}
        onClose={() => setIsInviteStudentsModalOpen(false)}
        classRoomId={classId || ""}
        onStudentsInvited={handleStudentsInvited}
        onShowToast={showToast}
      />

      {/* Confirm Remove Student Modal */}
      <ConfirmRemoveStudentModal
        isOpen={isRemoveStudentModalOpen}
        onClose={() => {
          setIsRemoveStudentModalOpen(false);
          setSelectedStudentToRemove(null);
        }}
        student={selectedStudentToRemove}
        onConfirm={confirmRemoveStudent}
      />

      {/* Loading Overlay for Quiz Details */}
      {isLoadingQuizDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải chi tiết quiz...</p>
          </div>
        </div>
      )}

      {/* Spin Wheel Modal */}
      {showSpinWheel && selectedQuizForPractice && (
        <SpinWheelModal
          isOpen={showSpinWheel}
          onClose={() => setShowSpinWheel(false)}
          students={students}
          onStudentSelected={handleStudentSelected}
        />
      )}

      {/* Confirm Create Session Modal */}
      <ConfirmCreateSessionModal
        isOpen={showConfirmCreateSession}
        onClose={() => {
          setShowConfirmCreateSession(false);
          setSelectedQuizForSession(null);
        }}
        onConfirm={confirmCreateSession}
        quiz={selectedQuizForSession}
        isLoading={isCreatingSession}
      />

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateNotificationModalOpen}
        onClose={() => setIsCreateNotificationModalOpen(false)}
        classId={classId || ""}
        onNotificationCreated={handleNotificationCreated}
        onShowToast={showToast}
      />

      {/* Edit Notification Modal */}
      <EditNotificationModal
        isOpen={isEditNotificationModalOpen}
        onClose={() => {
          setIsEditNotificationModalOpen(false);
          setSelectedNotificationForEdit(null);
        }}
        notification={selectedNotificationForEdit}
        onNotificationUpdated={handleNotificationUpdated}
        onShowToast={showToast}
      />

      {/* Confirm Delete Notification Modal */}
      <ConfirmDeleteNotificationModal
        isOpen={isDeleteNotificationModalOpen}
        onClose={() => {
          setIsDeleteNotificationModalOpen(false);
          setSelectedNotificationForDelete(null);
        }}
        onConfirm={confirmDeleteNotification}
        notification={selectedNotificationForDelete}
        isLoading={isDeletingNotification}
      />

      {/* Confirm Delete Comment Modal */}
      <ConfirmDeleteCommentModal
        isOpen={isDeleteCommentModalOpen}
        onClose={() => {
          setIsDeleteCommentModalOpen(false);
          setSelectedCommentForDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        comment={selectedCommentForDelete?.comment || null}
        isLoading={selectedCommentForDelete ? isDeletingComment[selectedCommentForDelete.comment.id] : false}
      />

      {/* Edit Comment Modal */}
      <EditCommentModal
        isOpen={isEditCommentModalOpen}
        onClose={() => {
          setIsEditCommentModalOpen(false);
          setSelectedCommentForEdit(null);
        }}
        onConfirm={confirmEditComment}
        comment={selectedCommentForEdit?.comment || null}
      />
    </div>
  );
};

export default ClassDetailPage;
