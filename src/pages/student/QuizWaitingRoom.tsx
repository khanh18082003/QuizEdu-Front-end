import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaClock,
  FaUsers,
  FaChevronLeft,
  FaPlay,
  FaExclamationTriangle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { getQuizSessionDetails } from "../../services/quizSessionService";

// Interface for waiting room state
interface WaitingRoomState {
  accessCode: string;
  quizSessionId: string;
  quizSessionName: string;
}

// Interface for waiting room info
interface WaitingRoomInfo {
  quizSessionName: string;
  participantCount: number;
  status: "LOBBY" | "ACTIVE" | "COMPLETED" | "PAUSED";
  estimatedStartTime?: string;
}

const QuizWaitingRoom = () => {
  const { quizSessionId } = useParams<{ quizSessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get waiting room data from navigation state
  const waitingRoomState = location.state as WaitingRoomState | null;

  const [waitingRoomInfo, setWaitingRoomInfo] = useState<WaitingRoomInfo>({
    quizSessionName: waitingRoomState?.quizSessionName || "Quiz Session",
    participantCount: 1,
    status: "LOBBY",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for session status updates
  useEffect(() => {
    if (!waitingRoomState || !quizSessionId) {
      navigate("/student/classrooms");
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors

        // Get quiz session details to check status
        const response = await getQuizSessionDetails(quizSessionId);

        if (response.code === "M000" && response.data) {
          // Update waiting room info
          setWaitingRoomInfo((prev) => ({
            ...prev,
            status: response.data.status as
              | "LOBBY"
              | "ACTIVE"
              | "COMPLETED"
              | "PAUSED",
            participantCount: Math.floor(Math.random() * 10) + 1, // Simulate participant count - replace with real data when available
          }));

          // When status becomes "ACTIVE", redirect to quiz taking
          if (response.data.status === "ACTIVE") {
            navigate(`/student/quiz-session/${quizSessionId}/take`, {
              state: {
                accessCode: waitingRoomState.accessCode,
                quiz: response.data.quiz,
                sessionData: response.data,
              },
            });
          }
        }
      } catch (pollError) {
        console.error("Error polling session status:", pollError);
        setError("Connection error. Please check your internet connection.");
      } finally {
        setIsLoading(false);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [
    quizSessionId,
    waitingRoomState,
    navigate,
    setError,
    setIsLoading,
    setWaitingRoomInfo,
  ]);

  // Handle leaving waiting room
  const handleLeaveWaitingRoom = () => {
    if (window.confirm("Are you sure you want to leave the waiting room?")) {
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
        message="Loading waiting room..."
        variant="fullscreen"
      />
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
                <span>Leave</span>
              </button>
              <h1 className="text-lg font-bold text-gray-900 lg:text-xl dark:text-white">
                {waitingRoomInfo.quizSessionName}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaUsers className="h-4 w-4" />
                <span>{waitingRoomInfo.participantCount} participants</span>
              </div>
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

          {/* Main message */}
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Waiting for Teacher
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            You've successfully joined the quiz session. Please wait while your
            teacher prepares to start the quiz.
          </p>

          {/* Session info */}
          <div className="mx-auto mb-8 max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Session Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Access Code:
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {waitingRoomState.accessCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Participants:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {waitingRoomInfo.participantCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <FaClock className="h-3 w-3" />
                  Waiting Room
                </span>
              </div>
              {waitingRoomInfo.estimatedStartTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Estimated Start:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatTime(waitingRoomInfo.estimatedStartTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="mt-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                  While you wait:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                  <li>• Keep this tab open and active</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>
                    • The quiz will start automatically when your teacher begins
                    the session
                  </li>
                  <li>
                    • You'll be redirected to the quiz page once it starts
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={handleLeaveWaitingRoom}>
              Leave Waiting Room
            </Button>

            {/* Test button - remove in production */}
            <Button
              variant="primary"
              onClick={() => {
                // Simulate teacher starting the quiz
                navigate(`/student/quiz-session/${quizSessionId}/take`, {
                  state: {
                    accessCode: waitingRoomState.accessCode,
                    quiz: {
                      id: "test-quiz",
                      name: waitingRoomInfo.quizSessionName,
                      description: "Test quiz description",
                      questions: [
                        {
                          id: "q1",
                          question: "What is 2 + 2?",
                          type: "multiple_choice",
                          options: ["3", "4", "5", "6"],
                          points: 1,
                        },
                        {
                          id: "q2",
                          question: "Is React a JavaScript library?",
                          type: "true_false",
                          points: 1,
                        },
                      ],
                      total_points: 2,
                      time_limit: 10,
                    },
                  },
                });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FaPlay className="mr-2 h-4 w-4" />
              Start Quiz (Test)
            </Button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <LoadingOverlay
          show={true}
          message="Checking session status..."
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
