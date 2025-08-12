import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaUsers,
  FaBookOpen,
  FaChalkboard,
  FaClipboardList,
  FaTrophy,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import CreateClassModal from "../../components/modals/CreateClassModal";
import { PAGE_TITLES, usePageTitle } from "../../utils/title";
import { useTranslation } from "react-i18next";
import {
  getClassrooms,
  type ClassRoomResponse,
  createClassroom,
  type CreateClassroomRequest,
  getClassroomDetail,
} from "../../services/classroomService";
import { getQuizzesForManagement } from "../../services/quizService";

interface DashboardStats {
  activeClasses: number;
  totalQuizzes: number;
  avgScore: string;
}

interface RecentActivity {
  id: string;
  type: "quiz" | "student" | "session";
  title: string;
  status?: string;
  date: string;
  className?: string;
}

interface ClassroomWithStudentCount extends ClassRoomResponse {
  studentCount?: number;
}

const TeacherHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle(PAGE_TITLES.TEACHER_HOME);

  // States
  const [classrooms, setClassrooms] = useState<ClassroomWithStudentCount[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeClasses: 0,
    totalQuizzes: 0,
    avgScore: "0%",
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      setToast({ message, type, isVisible: true });
    },
    [],
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load classrooms
      const classroomsResponse = await getClassrooms(1, 20);
      const classroomsData = classroomsResponse.data.data;

      // Load student count for each classroom
      const classroomsWithStudentCount = await Promise.all(
        classroomsData.map(async (classroom) => {
          try {
            const detailResponse = await getClassroomDetail(classroom.id);
            const studentCount = detailResponse.data.students?.length || 0;
            return {
              ...classroom,
              studentCount,
            };
          } catch (error) {
            console.error(
              `Error loading students for classroom ${classroom.id}:`,
              error,
            );
            return {
              ...classroom,
              studentCount: 0,
            };
          }
        }),
      );

      setClassrooms(classroomsWithStudentCount);

      // Load quizzes
      const quizzesResponse = await getQuizzesForManagement(1, 20);
      const quizzesData = quizzesResponse.data.data;

      // Calculate stats
      const activeClasses = classroomsWithStudentCount.filter(
        (c) => c.active,
      ).length;
      const totalQuizzes = quizzesData.length;

      setStats({
        activeClasses,
        totalQuizzes,
        avgScore: "75%", // This would come from actual analytics
      });

      // Generate recent activity from both quizzes and classrooms
      const activities: RecentActivity[] = [
        ...quizzesData.slice(0, 3).map((quiz) => ({
          id: quiz.quiz.id,
          type: "quiz" as const,
          title: `Quiz: ${quiz.quiz.name || "Untitled Quiz"}`,
          status: quiz.quiz.active ? "Active" : "Draft",
          date: new Date(quiz.quiz.created_at).toLocaleDateString(),
        })),
        ...classroomsWithStudentCount.slice(0, 2).map((classroom) => ({
          id: classroom.id,
          type: "student" as const,
          title: `Class: ${classroom.name}`,
          status: classroom.active ? "Active" : "Inactive",
          date: new Date(classroom.created_at).toLocaleDateString(),
          className: classroom.name,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showToast("Không thể tải dữ liệu dashboard", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateClass = async (classData: CreateClassroomRequest) => {
    try {
      setIsCreatingClass(true);

      await createClassroom(classData);
      showToast("Tạo lớp học thành công!", "success");
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error("Error creating classroom:", error);
      showToast("Không thể tạo lớp học", "error");
      throw error; // Re-throw to let modal handle it
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const navigateToClass = (classId: string) => {
    navigate(`/teacher/classes/${classId}`);
  };

  const navigateToQuizzes = () => {
    navigate("/teacher/quizzes");
  };

  const navigateToCreateQuiz = () => {
    navigate("/teacher/quizzes/create");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header with user info */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("Manage your classes, quizzes, and students")}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="mr-4">
            <FaChalkboard
              className="text-blue-500 dark:text-blue-400"
              size={24}
            />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.activeClasses}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Classes
            </p>
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="mr-4">
            <FaClipboardList
              className="text-green-500 dark:text-green-400"
              size={24}
            />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Quizzes
            </p>
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="mr-4">
            <FaTrophy
              className="text-amber-500 dark:text-amber-400"
              size={24}
            />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.avgScore}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Score
            </p>
          </div>
        </div>
      </div>

      {/* Classes and Activity */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Classes */}
        <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t("Active Classes")}
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={handleShowCreateModal}
              disabled={isCreatingClass}
              className="flex items-center gap-2"
            >
              <FaPlus className="mr-1" />
              {t("Create Class")}
            </Button>
          </div>

          {classrooms.length === 0 ? (
            <div className="py-8 text-center">
              <FaChalkboard className="mx-auto mb-4 text-4xl text-gray-400 dark:text-gray-500" />
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có lớp học nào. Tạo lớp học đầu tiên!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-900/30">
                    <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                      Class Name
                    </th>
                    <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                      Status
                    </th>
                    <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                      Students
                    </th>
                    <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                      Created
                    </th>
                    <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classrooms.map((classroom) => (
                    <tr
                      key={classroom.id}
                      className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60"
                    >
                      <td className="py-4 font-medium text-gray-800 dark:text-white">
                        <div>
                          <div className="font-medium">{classroom.name}</div>
                          {classroom.description && (
                            <div className="max-w-[200px] truncate text-xs text-gray-500 dark:text-gray-400">
                              {classroom.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            classroom.active
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {classroom.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <FaUsers size={12} />
                          {classroom.studentCount !== undefined
                            ? classroom.studentCount
                            : "..."}
                        </div>
                      </td>
                      <td className="py-4 text-xs text-gray-600 dark:text-gray-300">
                        {new Date(classroom.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateToClass(classroom.id)}
                          className="flex items-center gap-2"
                        >
                          <FaEye className="mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {activity.title}
                  </h3>
                  {activity.status && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        activity.status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activity.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          {t("Quick Actions")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="primary"
            onClick={navigateToCreateQuiz}
            className="flex h-auto items-center justify-start p-4"
          >
            <FaPlus className="mr-3 text-xl" />
            <div className="text-left">
              <div className="font-medium">{t("Create Quiz")}</div>
              <div className="text-xs opacity-80">Design a new assessment</div>
            </div>
          </Button>
          <Button
            variant="secondary"
            onClick={navigateToQuizzes}
            className="flex h-auto items-center justify-start p-4"
          >
            <FaClipboardList className="mr-3 text-xl" />
            <div className="text-left">
              <div className="font-medium">{t("Manage Quizzes")}</div>
              <div className="text-xs opacity-80">
                Edit or delete existing quizzes
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log("Student reports")}
            className="flex h-auto items-center justify-start p-4"
          >
            <FaUsers className="mr-3 text-xl" />
            <div className="text-left">
              <div className="font-medium">{t("Student Reports")}</div>
              <div className="text-xs opacity-80">
                View performance analytics
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => console.log("Learning resources")}
            className="flex h-auto items-center justify-start p-4"
          >
            <FaBookOpen className="mr-3 text-xl" />
            <div className="text-left">
              <div className="font-medium">{t("Learning Resources")}</div>
              <div className="text-xs opacity-80">
                Browse teaching materials
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateClass}
        isLoading={isCreatingClass}
      />
    </div>
  );
};

export default TeacherHome;
