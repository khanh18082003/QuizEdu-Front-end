import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaClock,
  FaChevronLeft,
  FaPlay,
  FaExclamationTriangle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { getQuizSessionDetail } from "../../services/quizSessionService";
import { usePageTitle, PAGE_TITLES } from "../../utils/title";

// Interface for waiting room state
interface WaitingRoomState {
  accessCode: string;
  quizSessionId: string;
  quizSessionName: string;
}

// Interface for waiting room info
interface WaitingRoomInfo {
  quizSessionName: string;
  status: "LOBBY" | "ACTIVE" | "COMPLETED" | "PAUSED";
  totalQuestions?: number;
  teacherName?: string;
  estimatedStartTime?: string;
}

const QuizWaitingRoom = () => {
  const { t } = useTranslation();
  usePageTitle(PAGE_TITLES.QUIZ_WAITING_ROOM);

  const { quizSessionId } = useParams<{ quizSessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get waiting room data from navigation state
  const waitingRoomState = location.state as WaitingRoomState | null;

  const [waitingRoomInfo, setWaitingRoomInfo] = useState<WaitingRoomInfo>({
    quizSessionName: waitingRoomState?.quizSessionName || "Quiz Session",
    status: "LOBBY",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load quiz session details on component mount
  useEffect(() => {
    if (!waitingRoomState || !quizSessionId) {
      navigate("/student/classrooms");
      return;
    }

    const loadQuizSessionDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getQuizSessionDetail(quizSessionId);

        if (response.code === "M000" && response.data) {
          // Update waiting room info with the API response
          setWaitingRoomInfo((prev) => ({
            ...prev,
            status: response.data.status as
              | "LOBBY"
              | "ACTIVE"
              | "COMPLETED"
              | "PAUSED",
            totalQuestions: response.data.total_questions,
            teacherName: response.data.teacher.display_name,
          }));

          // If status is already "ACTIVE", redirect to quiz taking immediately
          if (response.data.status === "ACTIVE") {
            navigate(`/student/quiz-session/${quizSessionId}/take`, {
              state: {
                accessCode: waitingRoomState.accessCode,
                quizSessionId: quizSessionId,
                quizSessionName: waitingRoomState.quizSessionName,
                sessionData: response.data,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error loading quiz session details:", error);
        setError(t("quizWaitingRoom.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizSessionDetail();
  }, [quizSessionId, waitingRoomState, navigate, t]);

  // Handle leaving waiting room
  const handleLeaveWaitingRoom = () => {
    if (window.confirm(t("quizWaitingRoom.confirmLeave"))) {
      // TODO: Call API to leave session
      navigate("/student/classrooms");
    }
  };

  // Format time display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!waitingRoomState) {
    return (
      <LoadingOverlay
        show={true}
        message={t("quizWaitingRoom.loadingWaitingRoom")}
        variant="fullscreen"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonLoader height="20px" width="60px" animation="pulse" />
                <SkeletonLoader height="24px" width="200px" animation="pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            {/* Status icon skeleton */}
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center">
              <SkeletonLoader
                height="96px"
                width="96px"
                className="rounded-full"
                animation="pulse"
              />
            </div>

            {/* Main message skeleton */}
            <SkeletonLoader
              height="36px"
              width="300px"
              className="mx-auto mb-4"
              animation="pulse"
            />
            <SkeletonLoader
              height="24px"
              width="400px"
              className="mx-auto mb-8"
              animation="pulse"
            />

            {/* Session info skeleton */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {/* Session Information Skeleton */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <SkeletonLoader
                  height="24px"
                  width="150px"
                  className="mb-4"
                  animation="pulse"
                />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <SkeletonLoader
                      height="16px"
                      width="80px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="100px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex justify-between">
                    <SkeletonLoader
                      height="16px"
                      width="60px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="120px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex justify-between">
                    <SkeletonLoader
                      height="16px"
                      width="100px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="30px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex justify-between">
                    <SkeletonLoader
                      height="16px"
                      width="50px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="24px"
                      width="120px"
                      className="rounded-full"
                      animation="pulse"
                    />
                  </div>
                </div>
              </div>

              {/* Quiz Rules Skeleton */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <SkeletonLoader
                  height="24px"
                  width="180px"
                  className="mb-4"
                  animation="pulse"
                />
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <SkeletonLoader
                      height="6px"
                      width="6px"
                      className="mt-2 rounded-full"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="220px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <SkeletonLoader
                      height="6px"
                      width="6px"
                      className="mt-2 rounded-full"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="250px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <SkeletonLoader
                      height="6px"
                      width="6px"
                      className="mt-2 rounded-full"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="230px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <SkeletonLoader
                      height="6px"
                      width="6px"
                      className="mt-2 rounded-full"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="200px"
                      animation="pulse"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <SkeletonLoader
                      height="6px"
                      width="6px"
                      className="mt-2 rounded-full"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="180px"
                      animation="pulse"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions skeleton */}
            <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
              <div className="flex items-start gap-3">
                <SkeletonLoader height="20px" width="20px" animation="pulse" />
                <div className="flex-1 text-left">
                  <SkeletonLoader
                    height="20px"
                    width="160px"
                    className="mb-2"
                    animation="pulse"
                  />
                  <div className="space-y-1">
                    <SkeletonLoader
                      height="16px"
                      width="250px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="280px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="240px"
                      animation="pulse"
                    />
                    <SkeletonLoader
                      height="16px"
                      width="220px"
                      animation="pulse"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex justify-center gap-4">
              <SkeletonLoader
                height="40px"
                width="120px"
                className="rounded-lg"
                animation="pulse"
              />
              <SkeletonLoader
                height="40px"
                width="140px"
                className="rounded-lg"
                animation="pulse"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLeaveWaitingRoom}
                className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FaChevronLeft className="h-4 w-4" />
                <span>{t("quizWaitingRoom.leave")}</span>
              </button>
              <h1 className="text-lg font-bold text-gray-900 lg:text-xl dark:text-white">
                {waitingRoomInfo.quizSessionName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          {/* Status icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FaClock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Quiz Title */}
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {waitingRoomInfo.quizSessionName}
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            {t("quizWaitingRoom.reviewInfo")}
          </p>

          {/* Quiz Information Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Session Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t("quizWaitingRoom.sessionInfo")}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("quizWaitingRoom.accessCode")}:
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {waitingRoomState.accessCode}
                  </span>
                </div>
                {waitingRoomInfo.teacherName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("quizWaitingRoom.teacher")}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {waitingRoomInfo.teacherName}
                    </span>
                  </div>
                )}
                {waitingRoomInfo.totalQuestions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("quizWaitingRoom.totalQuestions")}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {waitingRoomInfo.totalQuestions}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("quizWaitingRoom.status")}:
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <FaClock className="h-3 w-3" />
                    {waitingRoomInfo.status === "LOBBY"
                      ? t("quizWaitingRoom.readyToStart")
                      : waitingRoomInfo.status}
                  </span>
                </div>
                {waitingRoomInfo.estimatedStartTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("quizWaitingRoom.estimatedStart")}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatTime(waitingRoomInfo.estimatedStartTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Rules */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t("quizWaitingRoom.quizRules")}
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.timeLimit")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.completionTime")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.noGoBack")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.integrity")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{t("quizWaitingRoom.rules.connection")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="mt-1 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="text-left">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  {t("quizWaitingRoom.importantInstructions")}
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                  <li>• {t("quizWaitingRoom.instructions.readRules")}</li>
                  <li>• {t("quizWaitingRoom.instructions.waitForTeacher")}</li>
                  <li>
                    • {t("quizWaitingRoom.instructions.stableConnection")}
                  </li>
                  <li>• {t("quizWaitingRoom.instructions.noPause")}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={handleLeaveWaitingRoom}>
              {t("quizWaitingRoom.leaveSession")}
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                navigate(`/student/quiz-session/${quizSessionId}/take`, {
                  state: {
                    accessCode: waitingRoomState.accessCode,
                    quizSessionId: quizSessionId,
                    quizSessionName: waitingRoomState.quizSessionName,
                    isWaitingForTeacher: true,
                  },
                });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FaPlay className="mr-2 h-4 w-4" />
              {t("quizWaitingRoom.enterQuizRoom")}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <LoadingOverlay
          show={true}
          message={t("quizWaitingRoom.checkingSessionStatus")}
          variant="fullscreen"
        />
      )}

      {/* Error display */}
      {error && (
        <div className="fixed right-4 bottom-4 max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-800 dark:text-red-200">
              {error}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizWaitingRoom;
