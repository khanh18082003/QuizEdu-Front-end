import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import {
  connectJoinSessionSocket,
  disconnectJoinSessionSocket,
} from "../../services/simpleJoinSocket";
import { type RegisterResponse } from "../../services/userService";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";
import type { QuizSessionResponse } from "../../services/quizService";
import type { ClassroomQuiz } from "../../services/classroomService";
import {
  FaPlay,
  FaTimes,
  FaCopy,
  FaUsers,
  FaCode,
  FaClock,
  FaArrowLeft,
  FaUserPlus,
} from "react-icons/fa";
import {
  startQuizSession,
  endQuizSession,
} from "../../services/quizSessionService";

interface WaitingRoomState {
  session: QuizSessionResponse;
  quiz: ClassroomQuiz;
  students: RegisterResponse[];
  classId: string;
}

const QuizWaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as WaitingRoomState;

  // Get user from Redux store
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  const [studentsInLobby, setStudentsInLobby] = useState<
    (RegisterResponse | StudentProfileResponse)[]
  >([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

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

    // Play notification sound for student join
    if (type === "success") {
      try {
        const audio = new Audio("/audio/correct.mp3");
        audio.volume = 0.3;
        audio.play().catch((e) => console.log("Audio play failed:", e));
      } catch (error) {
        console.log("Audio not available:", error);
      }
    }

    // Auto hide toast after 4 seconds for better UX
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 4000);
  };

  // Handle WebSocket message
  const handleWebSocketMessage = useCallback(
    (studentData: RegisterResponse | StudentProfileResponse) => {
      console.log("🔔 Received student join event:", studentData);

      // Add student to lobby list
      setStudentsInLobby((prev) => {
        const existingStudent = prev.find((s) => s.id === studentData.id);
        if (existingStudent) {
          console.log("⚠️ Student already in lobby:", existingStudent);
          return prev;
        }

        const newList = [...prev, studentData];
        console.log("✅ Updated students in lobby:", newList);
        return newList;
      });

      // Show notification
      const studentName =
        studentData.display_name ||
        `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim() ||
        studentData.email;

      showToast(`🎉 ${studentName} đã tham gia phòng chờ!`, "success");
    },
    [],
  );

  // Setup WebSocket connection
  useEffect(() => {
    if (state?.session?.id) {
      console.log("📡 Setting up WebSocket for session:", state.session.id);

      connectJoinSessionSocket(
        state.session.id,
        handleWebSocketMessage,
        setIsWebSocketConnected,
      );

      return () => {
        console.log("🔌 Cleaning up WebSocket connection");
        setIsWebSocketConnected(false);
        disconnectJoinSessionSocket();
      };
    }
  }, [state?.session?.id, handleWebSocketMessage]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect if no state provided
  useEffect(() => {
    if (!state || !state.session || !state.quiz) {
      navigate(`/teacher/classes/${state?.classId || ""}`);
    }
  }, [state, navigate]);

  const handleStartQuiz = async () => {
    try {
      await startQuizSession(state.session.id);
    } catch (error) {
      console.error("Error starting quiz:", error);
      showToast("Không thể bắt đầu quiz. Vui lòng thử lại!", "error");
    }
  };

  const handleEndSession = async () => {
    try {
      await endQuizSession(state.session.id);
      showToast("Phiên thi đã được kết thúc!", "success");
      navigate(`/teacher/classes/${state.classId}`);
    } catch (error) {
      console.error("Error ending quiz session:", error);
      showToast("Không thể kết thúc phiên thi. Vui lòng thử lại!", "error");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Đã sao chép vào clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      showToast("Không thể sao chép. Vui lòng thử lại!", "error");
    }
  };

  if (!state || !state.session || !state.quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const { session, quiz, students } = state;
  const progressPercentage =
    students.length > 0 ? (studentsInLobby.length / students.length) * 100 : 0;
  const allStudentsReady =
    studentsInLobby.length === students.length && students.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleEndSession}
                className="mr-6 flex items-center text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Quay lại</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sảnh Chờ Quiz
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {quiz.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1 flex items-center justify-end gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isWebSocketConnected
                      ? "animate-pulse bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isWebSocketConnected ? "Kết nối" : "Mất kết nối"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Thời gian
              </p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Session Info Card */}
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <FaPlay className="text-xl text-green-600 dark:text-green-400" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Session Đã Sẵn Sàng!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Chia sẻ mã truy cập với học sinh để họ có thể tham gia
                </p>
              </div>

              {/* Access Code */}
              <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-gray-700 dark:to-gray-600">
                <div className="text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <FaCode className="mr-2 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mã Truy Cập
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="mb-3 font-mono text-5xl font-bold tracking-wider text-gray-900 dark:text-white">
                      {session.access_code}
                    </p>
                    <button
                      onClick={() => copyToClipboard(session.access_code)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <FaCopy className="text-sm" />
                      <span>Sao chép mã</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Chia sẻ mã này với học sinh để họ tham gia quiz
                  </p>
                </div>
              </div>

              {/* Quiz Info Grid */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-6 text-center dark:bg-gray-700">
                  <div className="text-xl leading-tight font-bold text-gray-900 dark:text-white">
                    {quiz.name}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-6 text-center dark:bg-gray-700">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {studentsInLobby.length}/{students.length}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Học sinh tham gia
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleEndSession}
                  className="flex-1 py-2.5 text-base"
                >
                  <FaTimes className="mr-2 text-sm" />
                  Kết thúc
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStartQuiz}
                  className="flex-1 py-2.5 text-base"
                  disabled={studentsInLobby.length === 0 && students.length > 0}
                >
                  <FaPlay className="mr-2 text-sm" />
                  Bắt đầu Quiz
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Students Progress */}
            <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
                  <FaUsers className="mr-2 text-blue-600" />
                  Học sinh trong lobby
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    allStudentsReady
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {studentsInLobby.length}/{students.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Tiến độ tham gia</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Students List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Học sinh đã tham gia
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {studentsInLobby.length}
                    </span>
                  </div>
                </div>

                {studentsInLobby.length > 0 ? (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {studentsInLobby.map((student, index) => {
                      const studentName =
                        student.display_name ||
                        `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                        student.email;

                      return (
                        <div
                          key={student.id}
                          className="animate-fade-in-up flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 shadow-sm transition-all duration-300 hover:shadow-md dark:from-green-900/20 dark:to-emerald-900/20"
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white shadow-lg">
                              {student.avatar ? (
                                <img
                                  src={student.avatar}
                                  alt={studentName}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : student.first_name ? (
                                student.first_name.charAt(0).toUpperCase()
                              ) : (
                                student.email?.charAt(0).toUpperCase() || "S"
                              )}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-800">
                              <div className="h-full w-full animate-ping rounded-full bg-green-400"></div>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {studentName}
                              </p>
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                <FaUserPlus className="mr-1 h-2.5 w-2.5" />
                                Online
                              </span>
                            </div>
                            <p className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                              Đã tham gia lúc{" "}
                              {new Date().toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="relative">
                        <FaUsers className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <div className="absolute -top-1 -right-1 h-4 w-4 animate-bounce rounded-full bg-blue-500">
                          <div className="h-full w-full animate-ping rounded-full bg-blue-400"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Đang chờ học sinh tham gia...
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Học sinh sẽ xuất hiện ở đây khi họ nhập mã truy cập
                    </p>
                  </div>
                )}

                {/* Expected Students List */}
                {students.length > studentsInLobby.length && (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-200 pt-4 pb-2 dark:border-gray-600">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Đang chờ tham gia
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {students.length - studentsInLobby.length}
                        </span>
                      </div>
                    </div>
                    <div className="max-h-32 space-y-2 overflow-y-auto">
                      {students
                        .filter(
                          (student) =>
                            !studentsInLobby.find(
                              (joinedStudent) =>
                                joinedStudent.id === student.id,
                            ),
                        )
                        .map((student) => {
                          const studentName =
                            student.display_name ||
                            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                            student.email;
                          const studentAvatar = student.first_name
                            ? student.first_name.charAt(0).toUpperCase()
                            : student.email?.charAt(0).toUpperCase() || "S";

                          return (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 p-3 opacity-70 transition-all duration-300 hover:opacity-90 dark:from-gray-700 dark:to-slate-700"
                            >
                              <div className="relative">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-slate-500 text-sm font-bold text-white">
                                  {studentAvatar}
                                </div>
                                {/* Offline indicator */}
                                <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-gray-400 dark:border-gray-800"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {studentName}
                                  </p>
                                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                                    <FaClock className="mr-1 h-2.5 w-2.5" />
                                    Chờ
                                  </span>
                                </div>
                                <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <div className="mr-1 h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                                  Chưa nhập mã truy cập
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>

              {/* Status */}
              {allStudentsReady ? (
                <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <svg
                      className="h-6 w-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="mb-1 text-lg font-semibold text-green-600 dark:text-green-400">
                    Tất cả học sinh đã sẵn sàng!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Có thể bắt đầu quiz bất cứ lúc nào
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                  <div className="mb-4 flex justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
                  </div>
                  <p className="mb-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Đang chờ học sinh tham gia...
                  </p>
                  {students.length === 0 ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Lớp học chưa có học sinh nào
                    </p>
                  ) : (
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {students.length - studentsInLobby.length} học sinh chưa
                      tham gia
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Session Details */}
            <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
              <h3 className="mb-4 flex items-center text-xl font-bold text-gray-900 dark:text-white">
                <FaClock className="mr-2 text-blue-600" />
                Thông tin Session
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Trạng thái:
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Đang hoạt động
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Giáo viên:
                  </span>
                  <span className="text-right font-medium text-gray-900 dark:text-white">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.display_name || user?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Lớp học:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {students.length} học sinh
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz Description */}
            {quiz.description && (
              <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Mô tả Quiz
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                  {quiz.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default QuizWaitingRoom;
