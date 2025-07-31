import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { type RegisterResponse } from "../../services/userService";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";
import type { QuizSessionResponse, ClassroomQuiz } from "../../services/quizService";
import {
  FaPlay,
  FaTimes,
  FaCopy,
  FaUsers,
  FaCode,
  FaClock,
  FaArrowLeft
} from "react-icons/fa";

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

  const [studentsInLobby, setStudentsInLobby] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

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
      navigate(`/teacher/classes/${state?.classId || ''}`);
    }
  }, [state, navigate]);

  const handleStartQuiz = async () => {
    try {
      // TODO: Implement start quiz API call
      showToast("Tính năng bắt đầu quiz đang được phát triển", "info");
      
      // For now, just show message
      // navigate to quiz session page when implemented
      
    } catch (error) {
      console.error("Error starting quiz:", error);
      showToast("Không thể bắt đầu quiz. Vui lòng thử lại!", "error");
    }
  };

  const handleEndSession = () => {
    navigate(`/teacher/classes/${state.classId}`);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const { session, quiz, students } = state;
  const progressPercentage = students.length > 0 ? (studentsInLobby.length / students.length) * 100 : 0;
  const allStudentsReady = studentsInLobby.length === students.length && students.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleEndSession}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-6 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Thời gian</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Session Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <FaPlay className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Session Đã Sẵn Sàng!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Chia sẻ mã truy cập với học sinh để họ có thể tham gia
                </p>
              </div>

              {/* Access Code */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <FaCode className="text-blue-600 dark:text-blue-400 mr-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mã Truy Cập
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-5xl font-mono font-bold text-gray-900 dark:text-white tracking-wider mb-3">
                      {session.access_code}
                    </p>
                    <button
                      onClick={() => copyToClipboard(session.access_code)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {quiz.name}
                  </div>

                </div>
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {studentsInLobby.length}/{students.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FaUsers className="mr-2 text-blue-600" />
                  Học sinh trong lobby
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  allStudentsReady
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {studentsInLobby.length}/{students.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Tiến độ tham gia</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Status */}
              {allStudentsReady ? (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
                    Tất cả học sinh đã sẵn sàng!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Có thể bắt đầu quiz bất cứ lúc nào
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                  </div>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    Đang chờ học sinh tham gia...
                  </p>
                  {students.length === 0 ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Lớp học chưa có học sinh nào
                    </p>
                  ) : (
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {students.length - studentsInLobby.length} học sinh chưa tham gia
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Session Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaClock className="mr-2 text-blue-600" />
                Thông tin Session
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                    Đang hoạt động
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Giáo viên:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user?.display_name || user?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lớp học:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {students.length} học sinh
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz Description */}
            {quiz.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Mô tả Quiz
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
