import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { 
  getClassroomDetail,
  type ClassroomDetailData,
  type ClassroomStudent,
  type ClassroomQuiz 
} from "../../services/classroomService";

import {
  type QuizSession,
} from "../../services/quizService";

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  const [classDetail, setClassDetail] = useState<ClassroomDetailData | null>(null);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [quizzes, setQuizzes] = useState<ClassroomQuiz[]>([]);
  const [quizSessions] = useState<QuizSession[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "quizzes" | "sessions">("students");
  
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

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) {
        navigate("/teacher/classes");
        return;
      }

      try {
        setIsLoading(true);
        
        // Use real API
        const response = await getClassroomDetail(classId);
        const data = response.data;
        
        setClassDetail(data);
        setStudents(data.students);
        setQuizzes(data.quiz);

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
  }, [classId]);

  const handleAddStudent = () => {
    showToast("Tính năng thêm học sinh đang được phát triển", "info");
  };

  const handleAddQuiz = () => {
    showToast("Tính năng thêm quiz đang được phát triển", "info");
  };

  const handleCreateSession = () => {
    showToast("Tính năng tạo session đang được phát triển", "info");
  };

  const handleRemoveStudent = async (_studentId: string) => {
    try {
      if (!classId) return;

      showToast("Tính năng xóa học sinh đang được phát triển", "info");
    } catch (error) {
      console.error("Error removing student:", error);
      showToast("Không thể xóa học sinh. Vui lòng thử lại!", "error");
    }
  };

  const handleDeleteSession = async (_sessionId: string) => {
    try {
      showToast("Tính năng xóa session đang được phát triển", "info");
    } catch (error) {
      console.error("Error deleting session:", error);
      showToast("Không thể xóa session. Vui lòng thử lại!", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Không tìm thấy thông tin lớp học</p>
          <Button onClick={() => navigate("/teacher/classes")} className="mt-4">
            Quay lại danh sách lớp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/teacher/classes")}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại danh sách lớp
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {classDetail.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {classDetail.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Mã lớp: {classDetail.class_code}
                </span>
                <span className="text-sm text-gray-500">
                  Tạo lúc: {new Date(classDetail.created_at).toLocaleDateString("vi-VN")}
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
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "students"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Học sinh ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "quizzes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Quiz ({quizzes.length})
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sessions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Sessions ({quizSessions.length})
              </button>
            </nav>
          </div>
        </div>
        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách học sinh
                </h2>
                <Button onClick={handleAddStudent}>
                  Thêm học sinh
                </Button>
              </div>

              <div className="space-y-4">
                {students.map((student: ClassroomStudent) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={student.avatar}
                            alt={student.display_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
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
                        {student.active ? 'Đang hoạt động' : 'Không hoạt động'}
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
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có học sinh nào trong lớp</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Danh sách Quiz
                </h2>
                <Button onClick={handleAddQuiz}>
                  Thêm Quiz
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz: ClassroomQuiz) => (
                  <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {quiz.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {quiz.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {quiz.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Sửa
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1"
                        onClick={handleCreateSession}
                      >
                        Tạo Session
                      </Button>
                    </div>
                  </div>
                ))}

                {quizzes.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có quiz nào được tạo</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quiz Sessions
                </h2>
              </div>

              <div className="space-y-4">
                {quizSessions.map((session: QuizSession) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.start_time).toLocaleString("vi-VN")} - {new Date(session.end_time).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.is_active ? 'Đang diễn ra' : 'Đã kết thúc'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
                {quizSessions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có session nào được tạo</p>
                  </div>
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
    </div>
  );
};

export default ClassDetailPage;
