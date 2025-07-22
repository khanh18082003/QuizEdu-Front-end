import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import CreateQuizModal, { type CreateQuizRequest } from "../../components/ui/CreateQuizModal";
import CreateSessionModal, { type CreateSessionRequest } from "../../components/ui/CreateSessionModal";
import {
  getClassDetail,
  getClassStudents,
  getQuizzes,
  getQuizSessions,
  createQuiz,
  createQuizSession,
  removeStudentFromClass,
  deleteQuiz,
  deleteQuizSession,
  type ClassDetail as ClassDetailType,
  type Student,
  type Quiz,
  type QuizSession,
} from "../../services/quizService";

// Toggle này để chuyển đổi giữa mock data và real API
const USE_MOCK_DATA = true; // Set true để dùng mock data, false để dùng real API

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  const [classDetail, setClassDetail] = useState<ClassDetailType | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "quizzes" | "sessions">("students");
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Show toast notification
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setIsLoading(true);
        
        if (!classId) {
          showToast("Class ID không hợp lệ", "error");
          return;
        }

        // Toggle between mock data và real API - thay đổi giá trị ở đầu file
        if (USE_MOCK_DATA) {
          // Mock API delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Mock class detail data
          const mockClassDetail: ClassDetailType = {
            id: classId,
            name: "Lập trình Web 2024",
            description: "Môn học lập trình web frontend và backend với React, Node.js",
            class_code: "WEB2024",
            created_at: "2024-09-01T10:00:00Z",
            updated_at: "2024-09-01T10:00:00Z",
            teacher_id: "TEACHER001",
            is_active: true,
            students_count: 25
          };

          // Mock students data
          const mockStudents: Student[] = [
            {
              id: "STU001",
              email: "nguyen.van.a@student.edu.vn",
              first_name: "Nguyễn",
              last_name: "Văn A",
              display_name: "Nguyễn Văn A",
              avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff",
              joined_at: "2024-09-05T08:00:00Z"
            },
            {
              id: "STU002", 
              email: "tran.thi.b@student.edu.vn",
              first_name: "Trần",
              last_name: "Thị B",
              display_name: "Trần Thị B",
              avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=ef4444&color=fff",
              joined_at: "2024-09-05T08:30:00Z"
            },
            {
              id: "STU003",
              email: "le.minh.c@student.edu.vn", 
              first_name: "Lê",
              last_name: "Minh C",
              display_name: "Lê Minh C",
              avatar: "https://ui-avatars.com/api/?name=Le+Minh+C&background=10b981&color=fff",
              joined_at: "2024-09-06T09:00:00Z"
            },
            {
              id: "STU004",
              email: "pham.thi.d@student.edu.vn",
              first_name: "Phạm", 
              last_name: "Thị D",
              display_name: "Phạm Thị D",
              avatar: "https://ui-avatars.com/api/?name=Pham+Thi+D&background=f59e0b&color=fff",
              joined_at: "2024-09-07T10:15:00Z"
            },
            {
              id: "STU005",
              email: "hoang.van.e@student.edu.vn",
              first_name: "Hoàng",
              last_name: "Văn E", 
              display_name: "Hoàng Văn E",
              avatar: "https://ui-avatars.com/api/?name=Hoang+Van+E&background=8b5cf6&color=fff",
              joined_at: "2024-09-08T11:00:00Z"
            }
          ];

          // Mock quizzes data
          const mockQuizzes: Quiz[] = [
            {
              id: "QUIZ001",
              title: "Kiểm tra HTML & CSS",
              description: "Đánh giá kiến thức cơ bản về HTML và CSS, bao gồm semantic HTML, responsive design và flexbox/grid",
              created_at: "2024-09-15T14:00:00Z",
              updated_at: "2024-09-15T14:00:00Z",
              total_questions: 20,
              duration_minutes: 45,
              is_active: true,
              teacher_id: "TEACHER001"
            },
            {
              id: "QUIZ002", 
              title: "JavaScript Fundamentals",
              description: "Kiểm tra kiến thức JavaScript cơ bản: variables, functions, arrays, objects, DOM manipulation",
              created_at: "2024-10-01T10:00:00Z",
              updated_at: "2024-10-01T10:00:00Z",
              total_questions: 25,
              duration_minutes: 60,
              is_active: true,
              teacher_id: "TEACHER001"
            },
            {
              id: "QUIZ003",
              title: "React Components & Hooks",
              description: "Đánh giá hiểu biết về React components, state management, hooks (useState, useEffect)",
              created_at: "2024-10-15T16:00:00Z",
              updated_at: "2024-10-15T16:00:00Z", 
              total_questions: 30,
              duration_minutes: 75,
              is_active: false,
              teacher_id: "TEACHER001"
            }
          ];

          // Mock quiz sessions data
          const mockQuizSessions: QuizSession[] = [
            {
              id: "SESSION001",
              quiz_id: "QUIZ001",
              class_id: classId,
              title: "Session 1 - Kiểm tra HTML & CSS",
              start_time: "2024-09-20T14:00:00Z",
              end_time: "2024-09-20T14:45:00Z",
              is_active: false,
              created_at: "2024-09-18T10:00:00Z",
              updated_at: "2024-09-18T10:00:00Z",
              participants_count: 23
            },
            {
              id: "SESSION002",
              quiz_id: "QUIZ002", 
              class_id: classId,
              title: "Session 2 - JavaScript Fundamentals",
              start_time: "2024-10-05T10:00:00Z",
              end_time: "2024-10-05T11:00:00Z",
              is_active: false,
              created_at: "2024-10-02T09:00:00Z",
              updated_at: "2024-10-02T09:00:00Z",
              participants_count: 25
            },
            {
              id: "SESSION003",
              quiz_id: "QUIZ003",
              class_id: classId,
              title: "Session 3 - React Components & Hooks",
              start_time: "2025-07-25T14:00:00Z", // Future session
              end_time: "2025-07-25T15:15:00Z",
              is_active: true,
              created_at: "2025-07-22T10:00:00Z",
              updated_at: "2025-07-22T10:00:00Z",
              participants_count: 0
            }
          ];

          setClassDetail(mockClassDetail);
          setStudents(mockStudents);
          setQuizzes(mockQuizzes);
          setQuizSessions(mockQuizSessions);

        } else {
          // Use real API
          const [classResponse, studentsResponse, quizzesResponse, sessionsResponse] = await Promise.all([
            getClassDetail(classId),
            getClassStudents(classId, 1, 50),
            getQuizzes(1, 50),
            getQuizSessions(classId, 1, 50),
          ]);

          setClassDetail(classResponse.data);
          setStudents(studentsResponse.data.data);
          setQuizzes(quizzesResponse.data.data);
          setQuizSessions(sessionsResponse.data.data);
        }

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

  const handleCreateQuiz = async (formData: CreateQuizRequest) => {
    try {
      setIsCreatingQuiz(true);
      
      // Toggle between mock data và real API
      if (USE_MOCK_DATA) {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create new quiz with mock data
        const newQuiz: Quiz = {
          id: `QUIZ${Date.now()}`,
          title: formData.title,
          description: formData.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_questions: formData.total_questions,
          duration_minutes: formData.duration_minutes,
          is_active: formData.is_active,
          teacher_id: "TEACHER001"
        };
        
        // Add to current quizzes list
        setQuizzes(prev => [...prev, newQuiz]);
      } else {
        // Use real API
        await createQuiz(formData);
        
        // Refresh quizzes list
        const quizzesResponse = await getQuizzes(1, 50);
        setQuizzes(quizzesResponse.data.data);
      }
      
      showToast("Tạo quiz thành công!", "success");
      setIsQuizModalOpen(false);
    } catch (error) {
      console.error("Error creating quiz:", error);
      showToast("Không thể tạo quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleCreateSession = async (formData: CreateSessionRequest) => {
    try {
      setIsCreatingSession(true);
      
      if (!classId) {
        showToast("Class ID không hợp lệ", "error");
        return;
      }

      // Toggle between mock data và real API
      if (USE_MOCK_DATA) {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create new session with mock data
        const newSession: QuizSession = {
          id: `SESSION${Date.now()}`,
          quiz_id: formData.quiz_id,
          class_id: classId,
          title: formData.title,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          participants_count: 0
        };
        
        // Add to current sessions list
        setQuizSessions(prev => [...prev, newSession]);
      } else {
        // Use real API
        const sessionRequest = {
          ...formData,
          class_id: classId
        };
        await createQuizSession(sessionRequest);
        
        // Refresh sessions list
        const sessionsResponse = await getQuizSessions(classId, 1, 50);
        setQuizSessions(sessionsResponse.data.data);
      }
      
      showToast("Tạo quiz session thành công!", "success");
      setIsSessionModalOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
      showToast("Không thể tạo session. Vui lòng thử lại!", "error");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      if (!classId) {
        showToast("Class ID không hợp lệ", "error");
        return;
      }

      // Toggle between mock data và real API
      if (USE_MOCK_DATA) {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove student from current list
        setStudents(prev => prev.filter(student => student.id !== studentId));
      } else {
        // Use real API
        await removeStudentFromClass(classId, studentId);
        
        // Refresh students list
        const studentsResponse = await getClassStudents(classId, 1, 50);
        setStudents(studentsResponse.data.data);
      }
      
      showToast("Đã xóa học sinh khỏi lớp", "success");
    } catch (error) {
      console.error("Error removing student:", error);
      showToast("Không thể xóa học sinh", "error");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      // Toggle between mock data và real API
      if (USE_MOCK_DATA) {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove quiz from current list
        setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      } else {
        // Use real API
        await deleteQuiz(quizId);
        
        // Refresh quizzes list
        const quizzesResponse = await getQuizzes(1, 50);
        setQuizzes(quizzesResponse.data.data);
      }
      
      showToast("Đã xóa quiz thành công", "success");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      showToast("Không thể xóa quiz", "error");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Toggle between mock data và real API
      if (USE_MOCK_DATA) {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove session from current list
        setQuizSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        // Use real API
        await deleteQuizSession(sessionId);
        
        // Refresh sessions list
        if (classId) {
          const sessionsResponse = await getQuizSessions(classId, 1, 50);
          setQuizSessions(sessionsResponse.data.data);
        }
      }
      
      showToast("Đã xóa session thành công", "success");
    } catch (error) {
      console.error("Error deleting session:", error);
      showToast("Không thể xóa session", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Không tìm thấy lớp học
        </h1>
        <Button onClick={() => navigate("/teacher/classes")} variant="primary">
          Quay lại danh sách lớp
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/teacher/classes")}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Button>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {classDetail.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {classDetail.description}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {classDetail.class_code}
              </span>
              <span className="text-sm text-gray-500">
                Tạo ngày {new Date(classDetail.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Học sinh</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizSessions.length}</p>
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "students"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Học sinh ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "quizzes"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Quiz ({quizzes.length})
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "sessions"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Sessions ({quizSessions.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Students Tab */}
        {activeTab === "students" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Danh sách học sinh
              </h2>
              <Button onClick={handleAddStudent} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm học sinh
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {students.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Chưa có học sinh nào
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Bắt đầu bằng cách thêm học sinh vào lớp học
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student: Student) => (
                    <div key={student.id} className="p-4 flex items-center justify-between">
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
                          Tham gia: {new Date(student.joined_at).toLocaleDateString('vi-VN')}
                        </span>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Xóa học sinh"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Danh sách Quiz
              </h2>
              <Button onClick={() => setIsQuizModalOpen(true)} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo Quiz
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz: Quiz) => (
                <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {quiz.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {quiz.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {quiz.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.total_questions} câu
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.duration_minutes} phút
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Sửa
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1">
                      Tạo Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="px-3 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {quizzes.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Chưa có quiz nào
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Bắt đầu bằng cách tạo quiz đầu tiên
                </p>
                <Button onClick={() => setIsQuizModalOpen(true)} variant="primary" className="mt-4">
                  Tạo Quiz đầu tiên
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiz Sessions
              </h2>
              <Button onClick={() => setIsSessionModalOpen(true)} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo Session
              </Button>
            </div>

            <div className="space-y-4">
              {quizSessions.map((session: QuizSession) => (
                <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.start_time).toLocaleString('vi-VN')} - {new Date(session.end_time).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {session.is_active ? 'Đang diễn ra' : 'Đã kết thúc'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {session.participants_count} người tham gia
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Xem kết quả
                    </Button>
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                    {session.is_active && (
                      <Button variant="secondary" size="sm">
                        Kết thúc Session
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="px-3 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {quizSessions.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Chưa có session nào
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tạo quiz session để bắt đầu kiểm tra
                </p>
                <Button onClick={() => setIsSessionModalOpen(true)} variant="primary" className="mt-4">
                  Tạo Session đầu tiên
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSubmit={handleCreateQuiz}
        isLoading={isCreatingQuiz}
      />

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={handleCreateSession}
        isLoading={isCreatingSession}
        quizzes={quizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          duration_minutes: quiz.duration_minutes
        }))}
      />
    </div>
  );
};

export default ClassDetailPage;
