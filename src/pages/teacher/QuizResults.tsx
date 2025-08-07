import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrophy,
  FaUserTimes,
  FaChartBar,
  FaUsers,
  FaPercentage,
} from "react-icons/fa";
import Button from "../../components/ui/Button";

// Mock data interfaces
interface StudentResult {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: string;
  submittedAt: string;
  rank: number;
}

interface QuizResultsSummary {
  quizName: string;
  sessionId: string;
  totalStudents: number;
  submittedCount: number;
  averageScore: number;
  averagePercentage: number;
  topScore: number;
  completionRate: number;
  startTime: string;
  endTime: string;
}

const QuizResultsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [summary, setSummary] = useState<QuizResultsSummary | null>(null);
  const [topPerformers, setTopPerformers] = useState<StudentResult[]>([]);
  const [lowPerformers, setLowPerformers] = useState<StudentResult[]>([]);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [allResults, setAllResults] = useState<StudentResult[]>([]);

  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock quiz results data
        const mockSummary: QuizResultsSummary = {
          quizName: "Mathematics Quiz Chapter 5",
          sessionId: sessionId || "unknown",
          totalStudents: 25,
          submittedCount: 22,
          averageScore: 7.8,
          averagePercentage: 78,
          topScore: 10,
          completionRate: 88,
          startTime: "2024-08-06T10:00:00Z",
          endTime: "2024-08-06T11:30:00Z",
        };

        const mockResults: StudentResult[] = [
          {
            id: "1",
            name: "Nguyễn Văn An",
            avatar: "",
            score: 10,
            totalQuestions: 10,
            percentage: 100,
            timeSpent: "25 phút",
            submittedAt: "2024-08-06T11:15:00Z",
            rank: 1,
          },
          {
            id: "2",
            name: "Trần Thị Bình",
            avatar: "",
            score: 9,
            totalQuestions: 10,
            percentage: 90,
            timeSpent: "28 phút",
            submittedAt: "2024-08-06T11:18:00Z",
            rank: 2,
          },
          {
            id: "3",
            name: "Lê Hoàng Cường",
            avatar: "",
            score: 9,
            totalQuestions: 10,
            percentage: 90,
            timeSpent: "30 phút",
            submittedAt: "2024-08-06T11:20:00Z",
            rank: 3,
          },
          {
            id: "4",
            name: "Phạm Thị Dung",
            avatar: "",
            score: 5,
            totalQuestions: 10,
            percentage: 50,
            timeSpent: "35 phút",
            submittedAt: "2024-08-06T11:25:00Z",
            rank: 20,
          },
          {
            id: "5",
            name: "Võ Minh Euy",
            avatar: "",
            score: 4,
            totalQuestions: 10,
            percentage: 40,
            timeSpent: "32 phút",
            submittedAt: "2024-08-06T11:22:00Z",
            rank: 21,
          },
          {
            id: "6",
            name: "Đặng Thị Phượng",
            avatar: "",
            score: 3,
            totalQuestions: 10,
            percentage: 30,
            timeSpent: "28 phút",
            submittedAt: "2024-08-06T11:18:00Z",
            rank: 22,
          },
        ];

        const mockAbsent = ["Hoàng Văn Gia", "Ngô Thị Hương", "Bùi Minh Khoa"];

        setSummary(mockSummary);
        setAllResults(mockResults);
        setTopPerformers(mockResults.slice(0, 3));
        setLowPerformers(mockResults.slice(-3));
        setAbsentStudents(mockAbsent);
      } catch (error) {
        console.error("Error loading quiz results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      loadQuizResults();
    }
  }, [sessionId]);

  const handleGoBack = () => {
    // Navigate back to class detail with sessions tab
    const state = location.state as { classId?: string };
    if (state?.classId) {
      navigate(`/teacher/classes/${state.classId}`, {
        state: { activeTab: "sessions" },
      });
    } else {
      navigate(-1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Đang tải kết quả quiz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Không tìm thấy kết quả quiz
            </p>
            <Button onClick={handleGoBack} className="mt-4">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
          >
            <FaArrowLeft className="mr-2 h-5 w-5" />
            Quay lại Sessions
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kết quả Quiz
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {summary.quizName}
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Phiên: #{summary.sessionId.slice(-6)} • Từ{" "}
            {formatDate(summary.startTime)} đến {formatDate(summary.endTime)}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FaUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tham gia
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.submittedCount}/{summary.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <FaPercentage className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Điểm TB
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.averagePercentage}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <FaTrophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cao nhất
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.topScore}/10
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FaChartBar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hoàn thành
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.completionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Performers */}
          <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <FaTrophy className="mr-2 h-5 w-5 text-yellow-500" />
                Top 3 Điểm Cao Nhất
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4 dark:from-yellow-900/20 dark:to-orange-900/20"
                  >
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 font-bold text-white">
                        {index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.timeSpent} •{" "}
                          {formatDate(student.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {student.score}/{student.totalQuestions}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {student.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Performers */}
          <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <FaChartBar className="mr-2 h-5 w-5 text-red-500" />
                Cần Hỗ Trợ
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {lowPerformers.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg bg-gradient-to-r from-red-50 to-pink-50 p-4 dark:from-red-900/20 dark:to-pink-900/20"
                  >
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-pink-500 font-bold text-white">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.timeSpent} •{" "}
                          {formatDate(student.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {student.score}/{student.totalQuestions}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {student.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Absent Students */}
        {absentStudents.length > 0 && (
          <div className="mt-8 rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                <FaUserTimes className="mr-2 h-5 w-5 text-gray-500" />
                Học sinh vắng mặt ({absentStudents.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {absentStudents.map((studentName, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                      {studentName.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {studentName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Không tham gia
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPage;
