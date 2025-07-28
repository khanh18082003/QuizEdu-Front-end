import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUsers,
  FaChevronLeft,
  FaBullhorn,
  FaClipboardList,
  FaClock,
  FaPlay,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import AccessCodeModal from "../../components/ui/AccessCodeModal";
import {
  getClassroomInfo,
  getClassroomStudents,
  getQuizSessionsInClassroom,
  type ClassRoomResponse,
} from "../../services/classroomService";
import type { RegisterResponse } from "../../services/userService";
import type { PaginationResponse } from "../../types/response";
import {
  joinQuizSession,
  getQuizSessionDetails,
  type QuizSessionResponse,
} from "../../services/quizSessionService";

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
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        textColor: "text-gray-700 dark:text-gray-300",
        iconColor: "text-gray-600 dark:text-gray-400",
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

  // Get activeTab from location.state or default to "stream"
  const initialTab =
    (location.state as { activeTab?: TabType })?.activeTab || "stream";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [classroom, setClassroom] = useState<ProcessedClassroomData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Access code modal state
  const [isAccessCodeModalOpen, setIsAccessCodeModalOpen] = useState(false);
  const [selectedQuizSession, setSelectedQuizSession] = useState<
    ProcessedClassroomData["assignments"][0] | null
  >(null);
  const [isJoiningSession, setIsJoiningSession] = useState(false);

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
    setSelectedQuizSession(assignment);
    setIsAccessCodeModalOpen(true);
  };

  // Handle access code submission
  const handleAccessCodeSubmit = async (accessCode: string) => {
    if (!selectedQuizSession) return;

    try {
      setIsJoiningSession(true);

      // Call API to verify access code and join session
      const response = await joinQuizSession(accessCode);

      if (response.code === "M000") {
        // Navigate based on session status
        if (selectedQuizSession.status === "LOBBY") {
          // Navigate to waiting room for LOBBY status
          navigate(
            `/student/quiz-session/${selectedQuizSession.quiz_session_id}/waiting`,
            {
              state: {
                accessCode,
                quizSessionId: selectedQuizSession.quiz_session_id,
                quizSessionName: selectedQuizSession.title,
              },
            },
          );
        } else {
          // For ACTIVE/PAUSED status, we need to get quiz session details first
          try {
            const detailsResponse = await getQuizSessionDetails(
              selectedQuizSession.quiz_session_id,
            );
            if (detailsResponse.code === "M000" && detailsResponse.data) {
              navigate(
                `/student/quiz-session/${selectedQuizSession.quiz_session_id}/take`,
                {
                  state: {
                    accessCode,
                    quiz: detailsResponse.data.quiz,
                    sessionData: detailsResponse.data,
                  },
                },
              );
            } else {
              throw new Error("Failed to get quiz session details");
            }
          } catch (detailError) {
            console.error("Error getting quiz session details:", detailError);
            throw new Error("Failed to load quiz details");
          }
        }
      } else {
        throw new Error(response.message || "Failed to join quiz session");
      }
    } catch (error: unknown) {
      console.error("Error joining quiz session:", error);
      // Let the modal handle the error display
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Invalid access code. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setIsJoiningSession(false);
      setIsAccessCodeModalOpen(false);
      setSelectedQuizSession(null);
    }
  };

  // Handle closing access code modal
  const handleCloseAccessCodeModal = () => {
    setIsAccessCodeModalOpen(false);
    setSelectedQuizSession(null);
    setIsJoiningSession(false);
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

          // Debug: Log transformed data
          console.log("Transformed classroom data:", transformedData);
        } else {
          setError(
            classroomInfoResponse.message ||
              studentsResponse.message ||
              quizSessionsResponse.message ||
              "Failed to fetch classroom details",
          );
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

  const handleGoBack = () => {
    navigate("/student/classrooms");
  };

  // Render the stream tab (announcements/feed)
  const renderStreamTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6 space-y-6">
        {classroom.announcements.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <FaBullhorn className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t("classroom.noAnnouncements")}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t("classroom.noAnnouncementsDesc")}
            </p>
          </div>
        ) : (
          classroom.announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {/* ...existing announcement content... */}
            </div>
          ))
        )}
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

              return (
                <div
                  key={assignment.id}
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
                            <FaClock className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">
                              {assignment.status === "LOBBY"
                                ? "Session opens"
                                : assignment.status === "ACTIVE"
                                  ? "Started"
                                  : assignment.status === "PAUSED"
                                    ? "Paused since"
                                    : "Completed"}
                              : {formatDate(startTime)} at{" "}
                              {formatTime(startTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 sm:flex-col sm:self-start">
                      {assignment.status === "LOBBY" && (
                        <div className="flex flex-col gap-2 sm:gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/student/classroom/${id}/quiz/${assignment.id}`,
                                { state: { activeTab: "classwork" } },
                              )
                            }
                            className="flex-1 sm:flex-none"
                          >
                            <FaClock className="mr-1 h-3 w-3 sm:mr-2" />
                            <span className="hidden sm:inline">Prepare</span>
                            <span className="sm:hidden">Prep</span>
                          </Button>
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
                      {(assignment.status === "ACTIVE" ||
                        assignment.status === "PAUSED") && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleJoinQuizSession(assignment)}
                          className="flex-1 sm:flex-none"
                        >
                          <FaPlay className="mr-1 h-3 w-3 sm:mr-2" />
                          <span className="hidden sm:inline">Join Quiz</span>
                          <span className="sm:hidden">Join</span>
                        </Button>
                      )}
                      {assignment.status === "COMPLETED" && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-center text-xs font-medium text-gray-700 sm:px-3 sm:text-sm dark:bg-gray-900/30 dark:text-gray-300">
                          <FaCheckCircle className="mr-1 inline h-3 w-3" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Access Code Modal */}
      <AccessCodeModal
        isOpen={isAccessCodeModalOpen}
        onClose={handleCloseAccessCodeModal}
        onSubmit={handleAccessCodeSubmit}
        quizSessionName={selectedQuizSession?.title || ""}
        quizSessionStatus={selectedQuizSession?.status}
        isLoading={isJoiningSession}
      />
    </div>
  );
};

export default ClassRoomDetail;
