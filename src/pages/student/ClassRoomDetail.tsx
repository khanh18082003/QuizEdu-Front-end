import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  FaUsers,
  FaChevronLeft,
  FaBullhorn,
  FaClipboardList,
  FaClock,
  FaPlay,
  FaLock,
  FaCheckCircle,
  FaEye,
  FaBell,
  FaDownload,
  FaCommentDots,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import AccessCodeModal from "../../components/ui/AccessCodeModal";
import Toast from "../../components/ui/Toast";
import QuizReviewModal from "../../components/modals/QuizReviewModal";
import {
  getClassroomInfo,
  getClassroomStudents,
  getQuizSessionsInClassroom,
  type ClassRoomResponse,
} from "../../services/classroomService";
import type { RegisterResponse } from "../../services/userService";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";
import type { PaginationResponse } from "../../types/response";
import {
  joinQuizSession,
  getQuizSessionHistory,
  type QuizSessionResponse,
  type QuizSessionHistoryResponse,
} from "../../services/quizSessionService";

import {
  getAllNotifications,
  submitNotificationComment,
  deleteComment,
  updateComment,
  type Notification,
  type NotificationComment
} from "../../services/notificationService";
import ConfirmDeleteCommentModal from "../../components/modals/ConfirmDeleteCommentModal";
import EditCommentModal from "../../components/modals/EditCommentModal";

// Default classroom image
const defaultClassroomImage =
  "https://gstatic.com/classroom/themes/img_graduation.jpg";

// Quiz session status enum matching backend
type QuizSessionStatus = "LOBBY" | "ACTIVE" | "COMPLETED" | "PAUSED";

// Helper function to determine quiz session status
const getQuizSessionStatus = (
  session: QuizSessionResponse,
): QuizSessionStatus => {
  // Use the status from the session directly since it's now provided by backend
  return session.status as QuizSessionStatus;
};

// Helper function to get status display info
const getStatusDisplayInfo = (status: QuizSessionStatus) => {
  switch (status) {
    case "LOBBY":
      return {
        label: "Waiting Room",
        icon: FaClock,
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-700 dark:text-blue-300",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    case "ACTIVE":
      return {
        label: "Quiz Active",
        icon: FaPlay,
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-300",
        iconColor: "text-green-600 dark:text-green-400",
      };
    case "PAUSED":
      return {
        label: "Paused",
        icon: FaClock,
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-700 dark:text-yellow-300",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      };
    case "COMPLETED":
      return {
        label: "Completed",
        icon: FaCheckCircle,
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-300",
        iconColor: "text-green-600 dark:text-green-400",
      };
  }
};

// Type for the processed classroom data used in the component
interface ProcessedClassroomData {
  id: string;
  name: string;
  description: string;
  class_code: string;
  created_at: string;
  imageUrl: string;
  announcements: Array<{
    id: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    date: Date;
    dueDate?: Date;
    attachments: Array<{ name: string; url: string }>;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    description: string;
    quiz_session_id: string;
    start_time: string;
    end_time: string;
    dueDate: Date;
    assignedDate: Date;
    status: QuizSessionStatus;
  }>;
  people: {
    teachers: Array<{
      id: string;
      name: string;
      avatar: string;
    }>;
    students: Array<{
      id: string;
      name: string;
      avatar: string;
    }>;
  };
}

// Helper function to transform API response to component data structure
const transformClassroomData = (
  classroomInfo: ClassRoomResponse,
  students: PaginationResponse<RegisterResponse>,
  quizSessions?: PaginationResponse<QuizSessionResponse>,
): ProcessedClassroomData => {
  // Debug: Log API data
  console.log("Classroom info:", classroomInfo);
  console.log("Students data:", students);
  console.log("Quiz sessions data:", quizSessions);

  return {
    id: classroomInfo.id,
    name: classroomInfo.name,
    description: classroomInfo.description,
    class_code: classroomInfo.class_code,
    created_at: classroomInfo.created_at,
    imageUrl: defaultClassroomImage,
    announcements: [], // Will be populated later when we have announcements endpoint
    assignments:
      quizSessions?.data.map((session) => ({
        id: session.id,
        title: session.name,
        description: session.description,
        quiz_session_id: session.quiz_session_id,
        start_time: session.start_time,
        end_time: session.end_time,
        dueDate: new Date(), // Default to current date, should come from API
        assignedDate: new Date(session.start_time),
        status: getQuizSessionStatus(session),
      })) || [],
    people: {
      teachers: classroomInfo.teacher
        ? [
            {
              id: classroomInfo.teacher.id,
              name:
                classroomInfo.teacher.display_name ||
                `${classroomInfo.teacher.first_name} ${classroomInfo.teacher.last_name}`.trim() ||
                "Teacher",
              avatar:
                classroomInfo.teacher.avatar &&
                classroomInfo.teacher.avatar.startsWith("http")
                  ? classroomInfo.teacher.avatar
                  : classroomInfo.teacher.display_name
                    ? classroomInfo.teacher.display_name.charAt(0).toUpperCase()
                    : classroomInfo.teacher.first_name
                      ? classroomInfo.teacher.first_name.charAt(0).toUpperCase()
                      : "T",
            },
          ]
        : [],
      students: students.data.map((student) => ({
        id: student.id,
        name:
          student.display_name || `${student.first_name} ${student.last_name}`,
        avatar:
          student.avatar && student.avatar.startsWith("http")
            ? student.avatar
            : student.first_name.charAt(0).toUpperCase(),
      })),
    },
  };
};

type TabType = "stream" | "classwork" | "people";

const ClassRoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get user from Redux store
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  // Get activeTab from URL query parameter or location.state, default to "stream"
  const searchParams = new URLSearchParams(location.search);
  const tabFromQuery = searchParams.get("tab") as TabType | null;
  const tabFromState = (location.state as { activeTab?: TabType })?.activeTab;
  const initialTab = tabFromQuery || tabFromState || "stream";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [classroom, setClassroom] = useState<ProcessedClassroomData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [isDeletingComment, setIsDeletingComment] = useState<Record<string, boolean>>({});
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
  const [selectedCommentForDelete, setSelectedCommentForDelete] = useState<NotificationComment | null>(null);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [selectedCommentForEdit, setSelectedCommentForEdit] = useState<{comment: NotificationComment, notificationId: string} | null>(null);

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

  // Access code modal state
  const [isAccessCodeModalOpen, setIsAccessCodeModalOpen] = useState(false);
  const [selectedQuizSession, setSelectedQuizSession] = useState<
    ProcessedClassroomData["assignments"][0] | null
  >(null);
  const [isJoiningSession, setIsJoiningSession] = useState(false);

  // Quiz sessions pagination state
  const [quizSessionsData, setQuizSessionsData] = useState<
    QuizSessionResponse[]
  >([]);
  const [quizSessionsPage, setQuizSessionsPage] = useState(1);
  const [quizSessionsHasMore, setQuizSessionsHasMore] = useState(true);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );

  // Quiz result modal state
  const [isQuizReviewModalOpen, setIsQuizReviewModalOpen] = useState(false);
  const [selectedQuizResult, setSelectedQuizResult] =
    useState<QuizSessionHistoryResponse | null>(null);
  const [isLoadingQuizResult, setIsLoadingQuizResult] = useState(false);

  // Get user information from Redux store
  const user = useSelector((state: { user: any }) => state.user);

  // Toast helper function
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Load more quiz sessions function
  const loadMoreQuizSessions = useCallback(async () => {
    if (!id || isLoadingMoreSessions || !quizSessionsHasMore) return;

    try {
      setIsLoadingMoreSessions(true);
      const nextPage = quizSessionsPage + 1;

      // Add delay to simulate slow loading and show skeleton
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const quizSessionsResponse = await getQuizSessionsInClassroom(
        id,
        nextPage,
        3,
      );

      if (quizSessionsResponse.code === "M000" && quizSessionsResponse.data) {
        const newSessions = quizSessionsResponse.data.data;

        // Update quiz sessions data
        setQuizSessionsData((prev) => [...prev, ...newSessions]);
        setQuizSessionsPage(nextPage);

        // Check if there are more pages
        setQuizSessionsHasMore(nextPage < quizSessionsResponse.data.pages);

        // Update classroom data with new combined sessions
        if (classroom) {
          const combinedSessions = [...quizSessionsData, ...newSessions];
          const newAssignments = combinedSessions.map((session) => ({
            id: session.id,
            title: session.name,
            description: session.description,
            quiz_session_id: session.quiz_session_id,
            start_time: session.start_time,
            end_time: session.end_time,
            dueDate: new Date(), // Default to current date, should come from API
            assignedDate: new Date(session.start_time),
            status: getQuizSessionStatus(session),
          }));

          setClassroom((prev) =>
            prev
              ? {
                  ...prev,
                  assignments: newAssignments,
                }
              : null,
          );
        }
      }
    } catch (error) {
      console.error("Error loading more quiz sessions:", error);
      showToast("Không thể tải thêm quiz sessions", "error");
    } finally {
      setIsLoadingMoreSessions(false);
    }
  }, [
    id,
    isLoadingMoreSessions,
    quizSessionsHasMore,
    quizSessionsPage,
    quizSessionsData,
    classroom,
  ]);

  // Update URL when tab changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get("tab");

    if (currentTab !== activeTab) {
      searchParams.set("tab", activeTab);
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [activeTab, location.pathname, location.search, navigate]);

  // Format date to be displayed in user's locale
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time to be displayed in user's locale
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle quiz session access
  const handleJoinQuizSession = (
    assignment: ProcessedClassroomData["assignments"][0],
  ) => {
    // Prevent joining if session is ACTIVE
    if (assignment.status === "ACTIVE") {
      showToast(
        "Không thể tham gia: Quiz đã bắt đầu. Vui lòng chờ quiz tiếp theo.",
        "error",
      );
      return;
    }

    setSelectedQuizSession(assignment);
    setIsAccessCodeModalOpen(true);
  };

  // Handle access code submission
  const handleAccessCodeSubmit = async (accessCode: string) => {
    if (!selectedQuizSession) return;

    // Additional safeguard: prevent joining ACTIVE sessions
    if (selectedQuizSession.status === "ACTIVE") {
      showToast("Không thể tham gia: Quiz đã bắt đầu.", "error");
      return;
    }

    try {
      setIsJoiningSession(true);

      // Call API to verify access code and join session
      const response = await joinQuizSession(accessCode);

      if (response.code === "M000") {
        // Success - navigate to quiz taking page
        setIsJoiningSession(false);
        setIsAccessCodeModalOpen(false);
        setSelectedQuizSession(null);
        navigate(
          `/student/quiz-session/${selectedQuizSession.quiz_session_id}/take`,
          {
            state: {
              accessCode,
              quizSessionId: selectedQuizSession.quiz_session_id,
              quizSessionName: selectedQuizSession.title,
              classroomId: id,
            },
          },
        );
      } else {
        // Handle other response codes as errors
        throw new Error(
          response.message ||
            "Không thể tham gia quiz session. Vui lòng thử lại.",
        );
      }
    } catch (error: unknown) {
      console.error("Error joining quiz session:", error);

      // Handle axios error response
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              code?: string;
              message?: string;
            };
          };
        };

        if (axiosError.response?.data?.code) {
          const code = axiosError.response.data.code;

          if (code === "M102") {
            // Access code is incorrect - let modal handle this error
            throw new Error("Mã truy cập không đúng. Vui lòng thử lại.");
          } else if (code === "M111") {
            // Quiz session is active, cannot join - let modal handle this error
            throw new Error(
              "Quiz đang diễn ra, không thể tham gia. Vui lòng chờ quiz tiếp theo.",
            );
          } else if (code === "M110") {
            // Student already joined - navigate directly
            showToast(
              "Bạn đã tham gia quiz này rồi. Đang chuyển hướng...",
              "info",
            );
            setIsJoiningSession(false);
            setIsAccessCodeModalOpen(false);
            setSelectedQuizSession(null);
            navigate(
              `/student/quiz-session/${selectedQuizSession.quiz_session_id}/take`,
              {
                state: {
                  accessCode,
                  quizSessionId: selectedQuizSession.quiz_session_id,
                  quizSessionName: selectedQuizSession.title,
                  classroomId: id,
                },
              },
            );
            return;
          }
        }
      }

      // Default error handling - let modal handle this error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại.";
      throw new Error(errorMessage);
    } finally {
      setIsJoiningSession(false);
    }
  };

  // Handle closing access code modal
  const handleCloseAccessCodeModal = () => {
    setIsAccessCodeModalOpen(false);
    setSelectedQuizSession(null);
  };

  // Handle viewing quiz results
  const handleViewQuizResult = async (
    assignment: ProcessedClassroomData["assignments"][0],
  ) => {
    if (!user?.id) {
      showToast(
        "Không thể xem kết quả: Thông tin người dùng không hợp lệ",
        "error",
      );
      return;
    }

    try {
      setIsLoadingQuizResult(true);
      const response = await getQuizSessionHistory(
        assignment.quiz_session_id,
        user.id,
      );

      if (response.code === "M000" && response.data) {
        setSelectedQuizResult(response.data);
        setIsQuizReviewModalOpen(true);
      } else {
        showToast("Không thể tải kết quả quiz", "error");
      }
    } catch (error: unknown) {
      console.error("Error fetching quiz result:", error);

      // Handle specific error codes
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              code?: string;
            };
          };
        };

        if (axiosError.response?.data?.code === "M115") {
          showToast("Bạn chưa tham gia session này", "error");
          return;
        }
      }

      showToast("Không thể tải kết quả quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsLoadingQuizResult(false);
    }
  };

  // Handle closing quiz result modal
  const handleCloseQuizResultModal = () => {
    setIsQuizReviewModalOpen(false);
    setSelectedQuizResult(null);
  };

  // Notification handlers
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

      // Call API to submit comment with new endpoint
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

  const handleDeleteComment = (comment: NotificationComment, notificationId: string) => {
    // Create an extended comment object with notificationId for deletion
    const commentWithNotificationId = {
      ...comment,
      notificationId: notificationId
    };
    setSelectedCommentForDelete(commentWithNotificationId as any);
    setIsDeleteCommentModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!selectedCommentForDelete) return;
    
    // Get the notificationId from the extended object
    const notificationId = (selectedCommentForDelete as any).notificationId;
    if (!notificationId) return;
    
    try {
      // Set loading state for this specific comment
      setIsDeletingComment(prev => ({
        ...prev,
        [selectedCommentForDelete.id]: true
      }));

      // Call API to delete comment
      await deleteComment(notificationId, selectedCommentForDelete.id);
      
      // Update the notification by removing the deleted comment
      setNotifications(prev => 
        prev.map(notification => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              comments: notification.comments?.filter(comment => comment.id !== selectedCommentForDelete.id) || []
            };
          }
          return notification;
        })
      );

      showToast("Nhận xét đã được xóa thành công!", "success");
      
      // Close modal
      setIsDeleteCommentModalOpen(false);
      setSelectedCommentForDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Không thể xóa nhận xét. Vui lòng thử lại!", "error");
    } finally {
      setIsDeletingComment(prev => ({
        ...prev,
        [selectedCommentForDelete.id]: false
      }));
    }
  };

  const handleEditComment = (comment: NotificationComment, notificationId: string) => {
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

  // Set page title dynamically based on classroom name
  useEffect(() => {
    if (classroom) {
      document.title = `${classroom.name} | Quiz Edu`;
    } else {
      document.title = "Classroom | Quiz Edu";
    }
  }, [classroom]);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) {
          navigate("/student/classrooms");
          return;
        }

        // Call APIs separately
        const [classroomInfoResponse, studentsResponse, quizSessionsResponse] =
          await Promise.all([
            getClassroomInfo(id),
            getClassroomStudents(id),
            getQuizSessionsInClassroom(id),
          ]);

        // Check if all API calls were successful
        if (
          classroomInfoResponse.code === "M000" &&
          classroomInfoResponse.data &&
          studentsResponse.code === "M000" &&
          studentsResponse.data &&
          quizSessionsResponse.code === "M000" &&
          quizSessionsResponse.data
        ) {
          const transformedData = transformClassroomData(
            classroomInfoResponse.data,
            studentsResponse.data,
            quizSessionsResponse.data,
          );
          setClassroom(transformedData);

          // Initialize quiz sessions pagination state
          setQuizSessionsData(quizSessionsResponse.data.data);
          setQuizSessionsPage(1);
          setQuizSessionsHasMore(1 < quizSessionsResponse.data.pages);

          // Debug: Log transformed data
          console.log("Transformed classroom data:", transformedData);
          console.log("Quiz sessions pagination info:", {
            currentPage: quizSessionsResponse.data.page,
            totalPages: quizSessionsResponse.data.pages,
            hasMore: 1 < quizSessionsResponse.data.pages,
            totalSessions: quizSessionsResponse.data.total,
          });
        } else {
          setError(
            classroomInfoResponse.message ||
              studentsResponse.message ||
              quizSessionsResponse.message ||
              "Failed to fetch classroom details",
          );
        }

        // Fetch notifications for this class
        try {
          const notificationResponse = await getAllNotifications(id);
          // Sort notifications by created_at descending (newest first)
          const sortedNotifications = notificationResponse.data.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setNotifications(sortedNotifications);
        } catch (notificationError) {
          console.error("Error fetching notifications:", notificationError);
          // Don't show error for notifications as it's not critical
        }
      } catch (error) {
        console.error("Error fetching classroom details:", error);
        setError("Failed to fetch classroom details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [id, navigate]);

  // Infinite scroll effect for quiz sessions
  useEffect(() => {
    const handleScroll = (event: Event) => {
      // Only apply to classwork tab
      if (activeTab !== "classwork") return;

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

      if (scrollTop + clientHeight >= scrollHeight - 0) {
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

  const handleGoBack = () => {
    navigate("/student/classrooms");
  };

  // Render the stream tab (announcements/feed and notifications)
  const renderStreamTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6 space-y-8">
        {/* Notifications Section */}
        <div>
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Thông báo từ giáo viên ({notifications.length})
          </h3>
          
          <div className="space-y-6">
            {notifications.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <FaBell className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                <h4 className="mt-3 text-md font-medium text-gray-700 dark:text-gray-300">
                  Chưa có thông báo nào
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Các thông báo từ giáo viên sẽ xuất hiện ở đây khi có.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  {/* Notification Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.teacher.first_name} {notification.teacher.last_name}
                          </h4>
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

                    {/* File attachments */}
                    {notification.xpath_files && notification.xpath_files.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FaDownload className="w-4 h-4 text-gray-500" />
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
                                <button 
                                  onClick={() => window.open(fileUrl, '_blank')}
                                  className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded"
                                >
                                  Tải xuống
                                </button>
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
                      <FaCommentDots className="w-4 h-4 text-gray-500" />
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
                                    {comment.user.first_name} {comment.user.last_name}
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
                                      onClick={() => handleEditComment(comment, notification.id)}
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded transition-colors duration-150"
                                      title="Chỉnh sửa nhận xét"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment, notification.id)}
                                      disabled={isDeletingComment[comment.id]}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded disabled:opacity-50 transition-colors duration-150"
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
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xs font-medium">
                              {user?.first_name?.charAt(0) || 'S'}{user?.last_name?.charAt(0) || ''}
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
                          <button
                            onClick={() => handleCommentSubmit(notification.id)}
                            disabled={!newComments[notification.id]?.trim() || isSubmittingComment[notification.id]}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg flex items-center"
                          >
                            {isSubmittingComment[notification.id] ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Đang gửi...
                              </>
                            ) : (
                              'Gửi nhận xét'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the classwork tab
  const renderClassworkTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6">
        <div className="mb-6">
          <select
            className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[var(--color-gradient-to)] focus:ring-1 focus:ring-[var(--color-gradient-from)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            defaultValue="all"
          >
            <option value="all">{t("classroom.allTopics")}</option>
          </select>
        </div>

        <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          {t("classroom.assignedWork")}
        </h3>

        {classroom.assignments.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
              No assignments yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Assignments and quizzes will appear here when your teacher creates
              them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classroom.assignments.map((assignment) => {
              const statusInfo = getStatusDisplayInfo(assignment.status);
              const StatusIcon = statusInfo.icon;
              const startTime = new Date(assignment.start_time);
              const endTime = new Date(assignment.end_time);
              const time = assignment.status === "ACTIVE" ? startTime : endTime;
              return (
                <div
                  key={assignment.quiz_session_id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-1 items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:h-12 sm:w-12 dark:bg-blue-900/30 dark:text-blue-300">
                        <FaClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <h4 className="text-base font-semibold break-words text-gray-800 sm:text-lg dark:text-white">
                            {assignment.title}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 self-start rounded-full px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                          >
                            <StatusIcon
                              className={`h-3 w-3 ${statusInfo.iconColor}`}
                            />
                            {statusInfo.label}
                          </span>
                        </div>
                        {assignment.description && (
                          <p className="mt-2 text-sm break-words text-gray-600 dark:text-gray-400">
                            {assignment.description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            {assignment.status !== "LOBBY" && (
                              <FaClock className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="break-words">
                              {assignment.status === "ACTIVE"
                                ? "Started"
                                : assignment.status === "COMPLETED" &&
                                  "Completed"}
                              {assignment.status !== "LOBBY" &&
                                `: ${formatDate(time)} at ${formatTime(time)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 sm:flex-col sm:self-start">
                      {assignment.status === "LOBBY" && (
                        <div className="flex flex-col gap-2 sm:gap-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleJoinQuizSession(assignment)}
                            className="flex-1 sm:flex-none"
                          >
                            <FaLock className="mr-1 h-3 w-3 sm:mr-2" />
                            <span className="hidden sm:inline">
                              Join Waiting Room
                            </span>
                            <span className="sm:hidden">Join</span>
                          </Button>
                        </div>
                      )}
                      {assignment.status === "ACTIVE" && (
                        <span className="rounded-full bg-orange-100 px-2 py-1 text-center text-xs font-medium text-orange-700 sm:px-3 sm:text-sm dark:bg-orange-900/30 dark:text-orange-300">
                          <FaPlay className="mr-1 inline h-3 w-3" />
                          Quiz in Progress
                        </span>
                      )}
                      {assignment.status === "COMPLETED" && (
                        <div className="flex flex-col gap-2 sm:gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewQuizResult(assignment)}
                            disabled={isLoadingQuizResult}
                            className="flex-1 border-green-300 text-green-600 hover:border-green-400 hover:text-green-700 sm:flex-none dark:border-green-600 dark:text-green-400 dark:hover:border-green-500 dark:hover:text-green-300"
                          >
                            {isLoadingQuizResult ? (
                              <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent sm:mr-2" />
                            ) : (
                              <FaEye className="mr-1 h-3 w-3 sm:mr-2" />
                            )}
                            <span className="hidden sm:inline">
                              Xem kết quả
                            </span>
                            <span className="sm:hidden">Kết quả</span>
                          </Button>
                          <span className="rounded-full bg-green-100 px-2 py-1 text-center text-xs font-medium text-green-700 sm:px-3 sm:text-sm dark:bg-green-900/30 dark:text-green-300">
                            <FaCheckCircle className="mr-1 inline h-3 w-3" />
                            Completed
                          </span>
                        </div>
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
        {!quizSessionsHasMore && classroom.assignments.length > 3 && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Đã hiển thị tất cả quiz sessions
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the people tab
  const renderPeopleTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6 space-y-8">
        {/* Teachers section */}
        <div>
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            {t("classroom.teachers")}
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {classroom.people.teachers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Teacher information not available
              </div>
            ) : (
              classroom.people.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-4 p-4">
                  {teacher.avatar.startsWith("http") ? (
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                      {teacher.avatar}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {teacher.name}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Students section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {t("classroom.students")}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {classroom.people.students.length} {t("classroom.studentsCount")}
            </span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {classroom.people.students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 border-b border-gray-200 p-4 last:border-0 dark:border-gray-700"
              >
                {student.avatar.startsWith("http") ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white">
                    {student.avatar}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {student.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <SkeletonLoader height="40px" width="300px" animation="pulse" />
        </div>
        <div className="h-40 w-full">
          <SkeletonLoader height="100%" width="100%" animation="pulse" />
        </div>
        <div className="mt-6">
          <SkeletonLoader height="30px" width="500px" animation="pulse" />
        </div>
        <div className="mt-8">
          <SkeletonLoader height="200px" width="100%" animation="pulse" />
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
            {error || t("classroom.classNotFound")}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error
              ? "Please try again later."
              : t("classroom.classNotFoundDesc")}
          </p>
          <Button
            variant="primary"
            className="cursor-pointer"
            onClick={handleGoBack}
          >
            {t("common.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={handleGoBack}
        className="mb-4 flex cursor-pointer items-center gap-2 text-blue-600 duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <FaChevronLeft className="h-3 w-3" />
        <span>{t("common.backToClasses")}</span>
      </button>

      {/* Classroom header */}
      {classroom && (
        <div
          className="relative mb-6 h-48 w-full rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${classroom.imageUrl})` }}
        >
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{classroom.name}</h1>
              <p className="mt-2 text-lg text-gray-200">
                {classroom.description}
              </p>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-300">
                <span>Class Code: {classroom.class_code}</span>
                <span>Created: {formatDate(new Date(classroom.created_at))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("stream")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "stream"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <FaBullhorn className="h-4 w-4" />
            <span>{t("classroom.tabs.stream")}</span>
          </button>
          <button
            onClick={() => setActiveTab("classwork")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "classwork"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <FaClipboardList className="h-4 w-4" />
            <span>{t("classroom.tabs.classwork")}</span>
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "people"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <FaUsers className="h-4 w-4" />
            <span>{t("classroom.tabs.people")}</span>
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "stream" && renderStreamTab()}
        {activeTab === "classwork" && renderClassworkTab()}
        {activeTab === "people" && renderPeopleTab()}
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Access Code Modal */}
      <AccessCodeModal
        isOpen={isAccessCodeModalOpen}
        onClose={handleCloseAccessCodeModal}
        onSubmit={handleAccessCodeSubmit}
        quizSessionName={selectedQuizSession?.title || ""}
        quizSessionStatus={selectedQuizSession?.status}
        isLoading={isJoiningSession}
      />
      {/* Quiz Review Modal */}
      {selectedQuizResult && (
        <QuizReviewModal
          isVisible={isQuizReviewModalOpen}
          historyData={selectedQuizResult}
          onClose={handleCloseQuizResultModal}
          onGoHome={() => {
            handleCloseQuizResultModal();
            navigate("/student/classrooms");
          }}
          quizTitle={selectedQuizResult.quiz.name}
          userId={user?.id || ""}
        />
      )}

      {/* Confirm Delete Comment Modal */}
      <ConfirmDeleteCommentModal
        isOpen={isDeleteCommentModalOpen}
        onClose={() => {
          setIsDeleteCommentModalOpen(false);
          setSelectedCommentForDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        comment={selectedCommentForDelete}
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
      {/* Toast */}
      <Toast
        isVisible={toastVisible}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
};

export default ClassRoomDetail;
