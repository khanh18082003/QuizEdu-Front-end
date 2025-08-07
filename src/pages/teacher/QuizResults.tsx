import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaTrophy, FaChartBar, FaUsers } from "react-icons/fa";
import Button from "../../components/ui/Button";
import {
  getQuizSessionScoreboard,
  type ScoreboardEntry,
} from "../../services/quizSessionService";

// Interface for student result display
interface StudentResult {
  id: string;
  name: string;
  email: string;
  score: number;
  rank: number;
}

interface QuizResultsSummary {
  quizName: string;
  sessionId: string;
  totalStudents: number;
  submittedCount: number;
  averageScore: number;
  topScore: number;
}

// Skeleton loading component
const ScoreboardSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="ml-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-1 h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuizResultsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoreboardData, setScoreboardData] = useState<StudentResult[]>([]);
  const [summary, setSummary] = useState<QuizResultsSummary | null>(null);

  useEffect(() => {
    const loadScoreboard = async () => {
      if (!sessionId) {
        setError("Session ID không hợp lệ");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getQuizSessionScoreboard(sessionId);

        if (response.code === "M000" && response.data) {
          // Transform API data to display format
          const transformedData: StudentResult[] = response.data.map(
            (entry: ScoreboardEntry) => ({
              id: entry.id,
              name: `${entry.first_name} ${entry.last_name}`,
              email: entry.email,
              score: entry.score,
              rank: entry.rank,
            }),
          );

          setScoreboardData(transformedData);

          // Calculate summary from scoreboard data
          const totalStudents = transformedData.length;
          const totalScore = transformedData.reduce(
            (sum, student) => sum + student.score,
            0,
          );
          const averageScore =
            totalStudents > 0 ? totalScore / totalStudents : 0;
          const topScore = Math.max(...transformedData.map((s) => s.score), 0);

          setSummary({
            quizName: "Quiz Session Results",
            sessionId: sessionId,
            totalStudents: totalStudents,
            submittedCount: totalStudents,
            averageScore: Math.round(averageScore * 100) / 100,
            topScore: topScore,
          });
        } else {
          setError("Không thể tải dữ liệu scoreboard");
        }
      } catch (error) {
        console.error("Error loading scoreboard:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    loadScoreboard();
  }, [sessionId]);

  const handleGoBack = () => {
    const state = location.state as { classId?: string };
    if (state?.classId) {
      navigate(`/teacher/classes/${state.classId}`, {
        state: { activeTab: "sessions" },
      });
    } else {
      navigate(-1);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🏆";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600";
      case 2:
        return "from-gray-300 to-gray-500";
      case 3:
        return "from-orange-400 to-orange-600";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 text-lg text-red-600 dark:text-red-400">
              {error}
            </div>
            <Button onClick={handleGoBack} variant="primary">
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
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FaArrowLeft className="mr-2 h-5 w-5" />
            Quay lại Sessions
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bảng Xếp Hạng Quiz
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {summary?.quizName || "Quiz Session"}
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Phiên: #{sessionId?.slice(-6)}
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
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
                    {summary.submittedCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <FaChartBar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Điểm TB
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.averageScore}
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
                    {summary.topScore}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <FaTrophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tổng học sinh
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.totalStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoreboard */}
        <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
              <FaTrophy className="mr-2 h-5 w-5 text-yellow-500" />
              Bảng Xếp Hạng
            </h2>
          </div>

          <div className="p-6">
            {isLoading ? (
              <ScoreboardSkeleton />
            ) : scoreboardData.length > 0 ? (
              <div className="space-y-4">
                {scoreboardData.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between rounded-lg p-4 transition-all hover:shadow-md ${
                      student.rank <= 3
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                        : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${getRankColor(student.rank)} font-bold text-white`}
                      >
                        {getRankIcon(student.rank)}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {student.score} điểm
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          student.rank <= 3
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Hạng {student.rank}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                  <FaTrophy className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Chưa có dữ liệu
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Chưa có học sinh nào hoàn thành quiz này.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
