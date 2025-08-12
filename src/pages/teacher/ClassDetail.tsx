import { useState, useEffect, useCallback } from "react";
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
  getQuizSessionsInClassroom,
  type ClassroomDetailData,
  type ClassroomQuiz,
  removeStudentFromClassroom,
} from "../../services/classroomService";

import {
  getQuizForPractice,
  type QuizManagementItem,
  createQuizSession,
  type QuizSessionRequest,
} from "../../services/quizService";

import { type QuizSessionDetailResponse } from "../../services/quizSessionService";
// import { type QuizSessionResponse } from "../../services/quizService";
import {
  getAllNotifications,
  deleteNotification,
  submitNotificationComment,
  deleteComment,
  updateComment,
  type Notification,
  type NotificationResponse,
  type NotificationComment,
} from "../../services/notificationService";

import { type RegisterResponse } from "../../services/userService";
import ConfirmRemoveStudentModal from "../../components/modals/ConfirmRemoveStudentModal";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";
import { deleteQuizInClassroom } from "../../services/classroomService";

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classDetail, setClassDetail] = useState<ClassroomDetailData | null>(
    null,
  );
  const [students, setStudents] = useState<RegisterResponse[]>([]);
  const [quizzes, setQuizzes] = useState<ClassroomQuiz[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSessionDetailResponse[]>(
    [],
  );

  // Get user from Redux store
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "students" | "quizzes" | "sessions" | "notifications"
  >("students");

  // Practice mode states
  const [isSelectQuizModalOpen, setIsSelectQuizModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [selectedQuizForPractice, setSelectedQuizForPractice] =
    useState<QuizManagementItem | null>(null);
  const [isLoadingQuizDetails, setIsLoadingQuizDetails] = useState(false);

  // Add quiz modal state
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);

  // Student removal modal state
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] =
    useState(false);
  const [selectedStudentToRemove, setSelectedStudentToRemove] =
    useState<RegisterResponse | null>(null);

  // Invite students modal state
  const [isInviteStudentsModalOpen, setIsInviteStudentsModalOpen] =
    useState(false);

  // Spin wheel modal state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [selectedStudentForPractice, setSelectedStudentForPractice] =
    useState<RegisterResponse | null>(null);

  // Quiz Session states
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Quiz sessions pagination state (matching student implementation)
  const [quizSessionsPage, setQuizSessionsPage] = useState(1);
  const [quizSessionsHasMore, setQuizSessionsHasMore] = useState(true);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);

  const [showConfirmCreateSession, setShowConfirmCreateSession] =
    useState(false);
  const [selectedQuizForSession, setSelectedQuizForSession] =
    useState<ClassroomQuiz | null>(null);

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] =
    useState(false);
  const [isEditNotificationModalOpen, setIsEditNotificationModalOpen] =
    useState(false);
  const [selectedNotificationForEdit, setSelectedNotificationForEdit] =
    useState<NotificationResponse | null>(null);
  const [isDeleteNotificationModalOpen, setIsDeleteNotificationModalOpen] =
    useState(false);
  const [selectedNotificationForDelete, setSelectedNotificationForDelete] =
    useState<Notification | null>(null);
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false);
  const [selectedCommentForDelete, setSelectedCommentForDelete] = useState<{
    comment: NotificationComment;
    notificationId: string;
  } | null>(null);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [selectedCommentForEdit, setSelectedCommentForEdit] = useState<{
    comment: NotificationComment;
    notificationId: string;
  } | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<
    Record<string, boolean>
  >({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<
    Record<string, boolean>
  >({});
  const [isDeletingComment, setIsDeletingComment] = useState<
    Record<string, boolean>
  >({});
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

  // Delete quiz from classroom states
  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);
  const [selectedQuizForDelete, setSelectedQuizForDelete] =
    useState<ClassroomQuiz | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  // Load more quiz sessions function (matching student implementation)
  const loadMoreQuizSessions = useCallback(async () => {
    if (!classId || isLoadingMoreSessions || !quizSessionsHasMore) return;

    try {
      setIsLoadingMoreSessions(true);
      const nextPage = quizSessionsPage + 1;

      // Add delay to simulate slow loading and show skeleton
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const quizSessionsResponse = await getQuizSessionsInClassroom(
        classId,
        nextPage,
        3,
      );

      if (quizSessionsResponse.code === "M000" && quizSessionsResponse.data) {
        const newSessions = quizSessionsResponse.data.data;

        // Update quiz sessions data
        setQuizSessionsPage(nextPage);

        // Check if there are more pages
        setQuizSessionsHasMore(nextPage < quizSessionsResponse.data.pages);

        // Update main quiz sessions list
        setQuizSessions((prev) => [...prev, ...newSessions]);
      }
    } catch (error) {
      console.error("Error loading more quiz sessions:", error);
      showToast("Không thể tải thêm quiz sessions", "error");
    } finally {
      setIsLoadingMoreSessions(false);
    }
  }, [classId, isLoadingMoreSessions, quizSessionsHasMore, quizSessionsPage]);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) {
        navigate("/teacher/classes");
        return;
      }

      try {
        setIsLoading(true);

        // Use real API
        const [classResponse, sessionsResponse] = await Promise.all([
          getClassroomDetail(classId),
          (async () => {
            setIsLoadingSessions(true);
            try {
              return await getQuizSessionsInClassroom(classId, 1, 3); // Start with page 1, pageSize 3
            } finally {
              setIsLoadingSessions(false);
            }
          })(),
        ]);

        const data = classResponse.data;
        setClassDetail(data);
        setStudents(data.students);
        setQuizzes(data.quiz);

        // Set quiz sessions if available
        if (sessionsResponse.code === "M000" && sessionsResponse.data) {
          const sessionsData = sessionsResponse.data.data;
          setQuizSessions(sessionsData);

          // Initialize pagination state
          setQuizSessionsPage(1);
          setQuizSessionsHasMore(1 < sessionsResponse.data.pages);
        }
        // Fetch notifications for this class
        try {
          const notificationResponse = await getAllNotifications(classId);
          // Sort notifications by created_at descending (newest first)
          const sortedNotifications = notificationResponse.data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
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
  }, [classId, navigate]);

  // Infinite scroll effect for quiz sessions (matching student implementation)
  useEffect(() => {
    const handleScroll = (event: Event) => {
      // Only apply to sessions tab
      if (activeTab !== "sessions") return;

      const target = event.target;

      // Check if the scroll event is from the main content area or window
      let scrollTop: number;
      let scrollHeight: number;
      let clientHeight: number;

      if (
        target === document ||
        target === window ||
        !target ||
        !(target as HTMLElement).scrollTop
      ) {
        // Page-level scroll (fallback for older layout)
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        // Container-level scroll (new fixed sidebar layout)
        const element = target as HTMLElement;
        scrollTop = element.scrollTop;
        scrollHeight = element.scrollHeight;
        clientHeight = element.clientHeight;
      }

      // Load more when user is at bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreQuizSessions();
      }
    };

    // Try to find the scrollable container (main content area)
    const mainContent = document.querySelector("main > div:last-child");

    if (mainContent) {
      // New layout with fixed sidebar - listen to container scroll
      mainContent.addEventListener("scroll", handleScroll);
    } else {
      // Fallback to window scroll for older layout
      window.addEventListener("scroll", handleScroll);
    }

    // Cleanup
    return () => {
      if (mainContent) {
        mainContent.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeTab, loadMoreQuizSessions]);

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

  // Open confirm delete quiz modal
  const handleDeleteQuizClick = (quiz: ClassroomQuiz) => {
    setSelectedQuizForDelete(quiz);
    setIsDeleteQuizModalOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!classId || !selectedQuizForDelete) return;
    try {
      setIsDeletingQuiz(true);
      await deleteQuizInClassroom(classId, selectedQuizForDelete.id);

      // Remove quiz from local state
      setQuizzes((prev) =>
        prev.filter((q) => q.id !== selectedQuizForDelete.id),
      );

      showToast("Đã xóa quiz khỏi lớp học", "success");
      setIsDeleteQuizModalOpen(false);
      setSelectedQuizForDelete(null);
    } catch (error) {
      console.error("Error deleting quiz in classroom:", error);
      // Show specific toast per requirement
      showToast("Quiz đã được tạo session", "error");
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  const confirmCreateSession = async () => {
    if (!user?.id || !classId || !selectedQuizForSession) return;

    try {
      const sessionData: QuizSessionRequest = {
        quiz_id: selectedQuizForSession.id,
        class_id: classId,
        teacher_id: user.id,
      };

      const response = await createQuizSession(sessionData);
      showToast("Phiên quiz đã được tạo thành công!", "success");

      // Refresh quiz sessions list
      try {
        const sessionsResponse = await getQuizSessionsInClassroom(
          classId,
          1,
          3,
        );
        if (sessionsResponse.code === "M000" && sessionsResponse.data) {
          const sessionsData = sessionsResponse.data.data;
          setQuizSessions(sessionsData);

          // Reset pagination state
          setQuizSessionsPage(1);
          setQuizSessionsHasMore(1 < sessionsResponse.data.pages);
        }
      } catch (refreshError) {
        console.error("Error refreshing sessions:", refreshError);
      }
      // Close modal and reset state
      setShowConfirmCreateSession(false);
      setSelectedQuizForSession(null);

      // Navigate to waiting room page
      navigate(`/teacher/quiz-waiting-room`, {
        state: {
          session: {
            id: response.data.id,
            access_code: response.data.access_code,
            status: response.data.status,
          },
          quiz: selectedQuizForSession,
          students: students,
          classId: classId,
        },
      });
    } catch (error) {
      console.error("Error creating quiz session:", error);
      showToast("Không thể tạo phiên quiz. Vui lòng thử lại!", "error");
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
    const student = students.find((s) => s.id === studentId);
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
      setStudents((prev) =>
        prev.filter((s) => s.id !== selectedStudentToRemove.id),
      );

      showToast("Đã xóa học sinh khỏi lớp học thành công", "success");
      setIsRemoveStudentModalOpen(false);
      setSelectedStudentToRemove(null);
    } catch (error) {
      console.error("Error removing student:", error);
      showToast("Không thể xóa học sinh. Vui lòng thử lại!", "error");
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
      xpath_files: notification.xpath_files,
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
      setNotifications((prev) =>
        prev.filter((n) => n.id !== selectedNotificationForDelete.id),
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
      xpath_files: notification.xpath_files,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      // Sort by created_at descending (newest first) to ensure proper ordering
      return updated.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
      xpath_files: notification.xpath_files,
    };

    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notification.id ? updatedNotification : n,
      );
      // Sort by created_at descending (newest first) after update
      return updated.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    });
    setIsEditNotificationModalOpen(false);
    setSelectedNotificationForEdit(null);
    showToast("Thông báo đã được cập nhật thành công!", "success");
  };

  const toggleNotificationExpanded = (notificationId: string) => {
    setExpandedNotifications((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }));
  };

  const handleCommentSubmit = async (notificationId: string) => {
    const comment = newComments[notificationId];
    if (!comment.trim()) return;

    try {
      // Set loading state for this specific comment
      setIsSubmittingComment((prev) => ({
        ...prev,
        [notificationId]: true,
      }));

      // Call API to submit comment
      const response = await submitNotificationComment(
        notificationId,
        comment.trim(),
      );

      // Update the notification with the new comment
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id === notificationId) {
            // Convert CommentResponse to NotificationComment format
            const newComment = {
              id: response.data.id,
              user: response.data.user,
              content: response.data.content,
              created_at: response.data.created_at,
            };

            return {
              ...notification,
              comments: [...(notification.comments || []), newComment],
            };
          }
          return notification;
        }),
      );

      // Clear the comment input
      setNewComments((prev) => ({
        ...prev,
        [notificationId]: "",
      }));

      showToast("Nhận xét đã được thêm thành công!", "success");
    } catch (error) {
      console.error("Error submitting comment:", error);
      showToast("Không thể thêm nhận xét. Vui lòng thử lại!", "error");
    } finally {
      setIsSubmittingComment((prev) => ({
        ...prev,
        [notificationId]: false,
      }));
    }
  };

  const handleCommentChange = (notificationId: string, value: string) => {
    setNewComments((prev) => ({
      ...prev,
      [notificationId]: value,
    }));
  };

  const handleDeleteComment = async (
    notificationId: string,
    commentId: string,
  ) => {
    // Find the comment to delete
    const notification = notifications.find((n) => n.id === notificationId);
    const comment = notification?.comments?.find((c) => c.id === commentId);

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
      setIsDeletingComment((prev) => ({
        ...prev,
        [comment.id]: true,
      }));

      // Call API to delete comment
      await deleteComment(notificationId, comment.id);

      // Update the notification by removing the deleted comment
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              comments:
                notification.comments?.filter((c) => c.id !== comment.id) || [],
            };
          }
          return notification;
        }),
      );

      // Close modal and reset state
      setIsDeleteCommentModalOpen(false);
      setSelectedCommentForDelete(null);
      showToast("Nhận xét đã được xóa thành công!", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Không thể xóa nhận xét. Vui lòng thử lại!", "error");
    } finally {
      setIsDeletingComment((prev) => ({
        ...prev,
        [comment.id]: false,
      }));
    }
  };

  const handleEditComment = (notificationId: string, commentId: string) => {
    // Find the comment to edit
    const notification = notifications.find((n) => n.id === notificationId);
    const comment = notification?.comments?.find((c) => c.id === commentId);

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
      const response = await updateComment(
        notificationId,
        comment.id,
        newContent,
      );

      // Update the notification with the updated comment
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              comments:
                notification.comments?.map((c) =>
                  c.id === comment.id
                    ? {
                        ...c,
                        content: response.data.content,
                        updated_at: response.data.updated_at,
                      }
                    : c,
                ) || [],
            };
          }
          return notification;
        }),
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải thông tin lớp học...
          </p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy thông tin lớp học
          </p>
          <Button onClick={() => navigate("/teacher/classes")} className="mt-4">
            Quay lại danh sách lớp
          </Button>
        </div>
      </div>
    );
  }

  return (
    // Main component wrapper
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/teacher/classes")}
                className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại danh sách lớp
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {classDetail.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {classDetail.description}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  Mã lớp: {classDetail.class_code}
                </span>
                <span className="text-sm text-gray-500">
                  Tạo lúc:{" "}
                  {new Date(classDetail.created_at).toLocaleDateString("vi-VN")}
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
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "students"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Học sinh ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "quizzes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Quiz ({quizzes.length})
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "sessions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Sessions ({quizSessions.length})
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "notifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Thông báo ({notifications.length})
              </button>
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className="py-6">
          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách học sinh
                </h2>
                <Button onClick={handleAddStudent}>Thêm học sinh</Button>
              </div>

              <div className="space-y-4">
                {students.map((student: RegisterResponse) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {student.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={student.avatar}
                            alt={student.display_name}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                            <span className="text-sm font-medium text-gray-700">
                              {student.first_name.charAt(0)}
                              {student.last_name.charAt(0)}
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
                      <span className="text-xs text-gray-500">
                        {student.is_active
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                      </span>
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
                  <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Chưa có học sinh nào trong lớp
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="py-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách Quiz
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleStartPractice}
                    className="flex items-center gap-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    🎯 Quay chọn học sinh kiểm tra
                  </Button>
                  <Button onClick={handleAddQuiz}>Thêm Quiz</Button>
                </div>
              </div>

              <div className="space-y-4">
                {quizzes.map((quiz: ClassroomQuiz) => (
                  <div
                    key={quiz.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-12 sm:w-12 dark:bg-blue-900/30 dark:text-blue-300">
                          <svg
                            className="h-5 w-5 sm:h-6 sm:w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <h4 className="text-base font-semibold break-words text-gray-800 sm:text-lg dark:text-white">
                              {quiz.name}
                            </h4>
                            <span
                              className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-1 text-xs font-medium ${
                                quiz.active
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                              }`}
                            >
                              <svg
                                className={`h-3 w-3 ${
                                  quiz.active
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {quiz.active ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                )}
                              </svg>
                              {quiz.active ? "Hoạt động" : "Không hoạt động"}
                            </span>
                          </div>
                          {quiz.description && (
                            <p className="mt-2 text-sm break-words text-gray-600 dark:text-gray-400">
                              {quiz.description}
                            </p>
                          )}
                          <div className="mt-3 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <svg
                                className="h-3 w-3 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="break-words">
                                Quiz added to classroom
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 sm:flex-col sm:self-start">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreateSession(quiz)}
                          className="flex-1 sm:flex-none"
                        >
                          <svg
                            className="mr-1 h-3 w-3 sm:mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span className="hidden sm:inline">Tạo Session</span>
                          <span className="sm:hidden">Session</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuizClick(quiz)}
                          className="flex-1 border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 sm:flex-none"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {quizzes.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <div className="mb-6 text-7xl text-gray-400">
                      <svg
                        className="mx-auto h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-300">
                      Chưa có quiz nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Thêm quiz vào lớp để bắt đầu tạo sessions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="py-6">
              <div className="mb-6">
                <select
                  className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[var(--color-gradient-to)] focus:ring-1 focus:ring-[var(--color-gradient-from)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  defaultValue="all"
                >
                  <option value="all">Tất cả Sessions</option>
                  <option value="lobby">Waiting Room</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>

              <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
                Quiz Sessions
              </h3>

              {isLoadingSessions ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-1 items-start gap-3 sm:gap-4">
                          {/* Icon skeleton */}
                          <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-12 sm:w-12 dark:bg-gray-700" />

                          <div className="min-w-0 flex-1 space-y-3">
                            {/* Title and status skeleton */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                              <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>

                            {/* Description skeleton */}
                            <div className="space-y-2">
                              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            </div>

                            {/* Time info skeleton */}
                            <div className="h-4 w-60 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>

                        {/* Button skeleton */}
                        <div className="flex flex-row gap-2 sm:flex-col sm:self-start">
                          <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : quizSessions.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Chưa có session nào được tạo
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Tạo quiz sessions từ tab Quiz để bắt đầu tổ chức kiểm tra
                    cho học sinh.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizSessions.map((session: QuizSessionDetailResponse) => {
                    const getStatusInfo = (status: string) => {
                      switch (status) {
                        case "LOBBY":
                          return {
                            label: "Waiting Room",
                            bgColor: "bg-blue-100 dark:bg-blue-900/30",
                            textColor: "text-blue-700 dark:text-blue-300",
                            iconColor: "text-blue-600 dark:text-blue-400",
                          };
                        case "ACTIVE":
                          return {
                            label: "Quiz Active",
                            bgColor: "bg-green-100 dark:bg-green-900/30",
                            textColor: "text-green-700 dark:text-green-300",
                            iconColor: "text-green-600 dark:text-green-400",
                          };
                        case "PAUSED":
                          return {
                            label: "Paused",
                            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                            textColor: "text-yellow-700 dark:text-yellow-300",
                            iconColor: "text-yellow-600 dark:text-yellow-400",
                          };
                        case "COMPLETED":
                          return {
                            label: "Completed",
                            bgColor: "bg-gray-100 dark:bg-gray-900/30",
                            textColor: "text-gray-700 dark:text-gray-300",
                            iconColor: "text-gray-600 dark:text-gray-400",
                          };
                        default:
                          return {
                            label: "Unknown",
                            bgColor: "bg-gray-100 dark:bg-gray-900/30",
                            textColor: "text-gray-700 dark:text-gray-300",
                            iconColor: "text-gray-600 dark:text-gray-400",
                          };
                      }
                    };

                    const statusInfo = getStatusInfo(session.status);
                    const startTime = new Date(session.start_time);
                    const endTime = new Date(session.end_time);

                    // Helper function to format date and time
                    const formatDate = (date: Date) => {
                      return date.toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    };

                    const formatTime = (date: Date) => {
                      return date.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    };

                    return (
                      <div
                        key={session.quiz_session_id}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex flex-1 items-start gap-3 sm:gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-12 sm:w-12 dark:bg-blue-900/30 dark:text-blue-300">
                              <svg
                                className="h-5 w-5 sm:h-6 sm:w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <h4 className="text-base font-semibold break-words text-gray-800 sm:text-lg dark:text-white">
                                  Quiz Session #
                                  {session.quiz_session_id.slice(-6)}
                                </h4>
                                <span
                                  className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                                >
                                  <svg
                                    className={`h-3 w-3 ${statusInfo.iconColor}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    {session.status === "LOBBY" && (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    )}
                                    {session.status === "ACTIVE" && (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                                      />
                                    )}
                                    {(session.status === "COMPLETED" ||
                                      session.status === "PAUSED") && (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    )}
                                  </svg>
                                  {statusInfo.label}
                                </span>
                              </div>
                              {session.description && (
                                <p className="mt-2 text-sm break-words text-gray-600 dark:text-gray-400">
                                  {session.description}
                                </p>
                              )}
                              <div className="mt-3 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  {session.status !== "LOBBY" && (
                                    <svg
                                      className="h-3 w-3 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                  <span className="break-words">
                                    {session.status === "ACTIVE"
                                      ? "Started"
                                      : session.status === "COMPLETED" &&
                                        "Completed"}
                                    {session.status !== "LOBBY" &&
                                      `: ${formatDate(session.status === "ACTIVE" ? startTime : endTime)} at ${formatTime(session.status === "ACTIVE" ? startTime : endTime)}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row gap-2 sm:flex-col sm:self-start">
                            {(session.status === "LOBBY" ||
                              session.status === "ACTIVE") && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Find the corresponding quiz for this session by matching name
                                  const correspondingQuiz = quizzes.find(
                                    (quiz) => quiz.name === session.name,
                                  );

                                  if (!correspondingQuiz) {
                                    showToast(
                                      "Không thể tìm thấy quiz tương ứng với session này! Vui lòng thử tạo session mới.",
                                      "error",
                                    );
                                    return;
                                  }

                                  navigate(`/teacher/quiz-waiting-room`, {
                                    state: {
                                      session: {
                                        id: session.quiz_session_id,
                                        access_code: session.access_code,
                                        status: session.status,
                                      },
                                      quiz: correspondingQuiz,
                                      students: students,
                                      classId: classId,
                                    },
                                  });
                                }}
                                className="flex-1 sm:flex-none"
                              >
                                <svg
                                  className="mr-1 h-3 w-3 sm:mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                                  />
                                </svg>
                                <span className="hidden sm:inline">
                                  {session.status === "LOBBY"
                                    ? "Join Waiting Room"
                                    : "Join Session"}
                                </span>
                                <span className="sm:hidden">Join</span>
                              </Button>
                            )}
                            {session.status === "COMPLETED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/teacher/quiz-results/${session.quiz_session_id}`,
                                    {
                                      state: {
                                        classId: classId,
                                      },
                                    },
                                  )
                                }
                                className="flex-1 border-green-300 text-green-600 hover:border-green-400 hover:text-green-700 sm:flex-none"
                              >
                                <svg
                                  className="mr-1 h-3 w-3 sm:mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                                <span className="hidden sm:inline">
                                  Xem kết quả
                                </span>
                                <span className="sm:hidden">Results</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Skeleton loading for additional quiz sessions */}
              {isLoadingMoreSessions && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={`skeleton-more-${index}`}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-1 items-start gap-3 sm:gap-4">
                          {/* Icon skeleton */}
                          <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-200 sm:h-12 sm:w-12 dark:bg-gray-700" />

                          <div className="min-w-0 flex-1 space-y-3">
                            {/* Title and status skeleton */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                              <div className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                            </div>

                            {/* Description skeleton */}
                            <div className="space-y-2">
                              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                            </div>

                            {/* Time info skeleton */}
                            <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>

                        {/* Button skeleton */}
                        <div className="flex flex-row gap-2 sm:flex-col sm:self-start">
                          <div className="h-8 w-24 animate-pulse rounded bg-gray-200 sm:w-32 dark:bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading indicator for infinite scroll */}
              {isLoadingMoreSessions && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    <span>Đang tải thêm quiz sessions...</span>
                  </div>
                </div>
              )}

              {/* End of data indicator */}
              {!quizSessionsHasMore && quizSessions.length > 3 && (
                <div className="flex justify-center py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Đã hiển thị tất cả quiz sessions
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Thông báo lớp học
                </h2>
                <Button
                  onClick={handleCreateNotification}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Tạo thông báo
                </Button>
              </div>

              <div className="space-y-6">
                {notifications.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mb-6 text-7xl text-gray-400">
                      <svg
                        className="mx-auto h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M15 17h5l-5 5v-5zm-5-17h8l5 5v13a2 2 0 01-2 2H10a2 2 0 01-2-2V2a2 2 0 012-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                      Chưa có thông báo nào
                    </h3>
                    <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">
                      Tạo thông báo đầu tiên để chia sẻ thông tin quan trọng với
                      học sinh trong lớp. Bạn có thể thêm nội dung, file đính
                      kèm và nhận phản hồi từ học sinh.
                    </p>
                    <Button
                      onClick={handleCreateNotification}
                      className="px-6 py-3"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Tạo thông báo đầu tiên
                    </Button>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      {/* Notification Header */}
                      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                                {notification.teacher.avatar ? (
                                  <img
                                    src={notification.teacher.avatar}
                                    alt={`${notification.teacher.first_name} ${notification.teacher.last_name}`}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-white">
                                    {notification.teacher.first_name.charAt(0)}
                                    {notification.teacher.last_name.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.teacher.display_name ||
                                    `${notification.teacher.first_name} ${notification.teacher.last_name}`.trim()}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    notification.created_at,
                                  ).toLocaleString("vi-VN")}
                                </span>
                              </div>
                              <div
                                className={`text-gray-700 dark:text-gray-300 ${
                                  !expandedNotifications[notification.id] &&
                                  notification.description.length > 200
                                    ? "line-clamp-3"
                                    : ""
                                }`}
                              >
                                {expandedNotifications[notification.id] ||
                                notification.description.length <= 200
                                  ? notification.description
                                  : `${notification.description.substring(0, 200)}...`}
                              </div>

                              {notification.description.length > 200 && (
                                <button
                                  onClick={() =>
                                    toggleNotificationExpanded(notification.id)
                                  }
                                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                  {expandedNotifications[notification.id]
                                    ? "Thu gọn"
                                    : "Xem thêm"}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditNotification(notification)
                              }
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:border-red-300 hover:text-red-700"
                              onClick={() =>
                                handleDeleteNotification(notification)
                              }
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>

                        {/* File attachments */}
                        {notification.xpath_files &&
                          notification.xpath_files.length > 0 && (
                            <div className="mt-4">
                              <div className="mb-3 flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  File đính kèm (
                                  {notification.xpath_files.length})
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {notification.xpath_files.map(
                                  (fileUrl: string, index: number) => {
                                    // Extract filename from URL
                                    const fileName =
                                      fileUrl.split("/").pop() ||
                                      `File ${index + 1}`;
                                    const fileExtension =
                                      fileName
                                        .split(".")
                                        .pop()
                                        ?.toUpperCase() || "FILE";

                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                                      >
                                        <div className="flex-shrink-0">
                                          <svg
                                            className="h-8 w-8 text-blue-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                            {fileName}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {fileExtension}
                                          </p>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            window.open(fileUrl, "_blank")
                                          }
                                        >
                                          Tải xuống
                                        </Button>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Comments Section */}
                      <div className="p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nhận xét từ lớp học (
                            {notification.comments?.length || 0})
                          </span>
                        </div>

                        {/* Existing Comments */}
                        {notification.comments &&
                          notification.comments.length > 0 && (
                            <div className="mb-4 space-y-4">
                              {notification.comments.map(
                                (comment, index: number) => (
                                  <div
                                    key={comment.id || index}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="flex-shrink-0">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400">
                                        {comment.user.avatar ? (
                                          <img
                                            src={comment.user.avatar}
                                            alt={`${comment.user.first_name} ${comment.user.last_name}`}
                                            className="h-8 w-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-xs font-medium text-white">
                                            {comment.user.first_name.charAt(0)}
                                            {comment.user.last_name.charAt(0)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                      <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {comment.user.display_name ||
                                              `${comment.user.first_name} ${comment.user.last_name}`.trim()}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(
                                              comment.created_at,
                                            ).toLocaleString("vi-VN")}
                                            {comment.updated_at &&
                                              comment.updated_at !==
                                                comment.created_at && (
                                                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                                                  (đã chỉnh sửa)
                                                </span>
                                              )}
                                          </span>
                                          {comment.user.role === "TEACHER" && (
                                            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                              Giáo viên
                                            </span>
                                          )}
                                        </div>
                                        {/* Edit and Delete buttons - only show for comment owner */}
                                        {user?.id === comment.user.id && (
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() =>
                                                handleEditComment(
                                                  notification.id,
                                                  comment.id,
                                                )
                                              }
                                              className="rounded-md p-1.5 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                                              title="Chỉnh sửa nhận xét"
                                            >
                                              <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteComment(
                                                  notification.id,
                                                  comment.id,
                                                )
                                              }
                                              disabled={
                                                isDeletingComment[comment.id]
                                              }
                                              className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-900/20"
                                              title="Xóa nhận xét"
                                            >
                                              {isDeletingComment[comment.id] ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                                              ) : (
                                                <svg
                                                  className="h-4 w-4"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                  />
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
                                ),
                              )}
                            </div>
                          )}

                        {/* Add Comment */}
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-white">
                                  {user?.first_name?.charAt(0) || ""}
                                  {user?.last_name?.charAt(0) || "T"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={newComments[notification.id] || ""}
                              onChange={(e) =>
                                handleCommentChange(
                                  notification.id,
                                  e.target.value,
                                )
                              }
                              placeholder="Thêm nhận xét..."
                              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              rows={3}
                            />
                            <div className="mt-2 flex justify-end">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCommentSubmit(notification.id)
                                }
                                disabled={
                                  !newComments[notification.id]?.trim() ||
                                  isSubmittingComment[notification.id]
                                }
                              >
                                {isSubmittingComment[notification.id] ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Đang gửi...
                                  </>
                                ) : (
                                  "Gửi nhận xét"
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
        assignedQuizIds={quizzes.map((quiz) => quiz.id)}
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="rounded-lg bg-white p-6 text-center dark:bg-gray-800">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải chi tiết quiz...
            </p>
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
        isLoading={false}
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
        isLoading={
          selectedCommentForDelete
            ? isDeletingComment[selectedCommentForDelete.comment.id]
            : false
        }
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

      {/* Delete Quiz Confirm Modal */}
      {isDeleteQuizModalOpen && selectedQuizForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Xóa quiz khỏi lớp?
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Bạn có chắc muốn xóa "{selectedQuizForDelete.name}" khỏi lớp này?
              Hành động này không xóa quiz khỏi hệ thống và có thể thêm lại sau.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteQuizModalOpen(false);
                  setSelectedQuizForDelete(null);
                }}
                disabled={isDeletingQuiz}
              >
                Hủy
              </Button>
              <Button
                onClick={confirmDeleteQuiz}
                disabled={isDeletingQuiz}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingQuiz ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPage;
