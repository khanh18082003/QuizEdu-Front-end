import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import SelectQuizModal from "../../components/modals/SelectQuizModal";
import QuizPracticeModal from "../../components/modals/QuizPracticeModal";
import AddQuizToClassModal from "../../components/modals/AddQuizToClassModal";
import InviteStudentsModal from "../../components/modals/InviteStudentsModal";
import SpinWheelModal from "../../components/modals/SpinWheelModal";
import ConfirmCreateSessionModal from "../../components/modals/ConfirmCreateSessionModal";
import {
  getClassroomDetail,
  type ClassroomDetailData,
  type ClassroomQuiz,
  removeStudentFromClassroom
} from "../../services/classroomService";

import {
  getQuizForPractice,
  type QuizManagementItem,
  createQuizSession,
  type QuizSessionRequest,
  type QuizSessionResponse
} from "../../services/quizService";

import { type RegisterResponse } from "../../services/userService";
import ConfirmRemoveStudentModal from "../../components/modals/ConfirmRemoveStudentModal";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classDetail, setClassDetail] = useState<ClassroomDetailData | null>(null);
  const [students, setStudents] = useState<RegisterResponse[]>([]);
  const [quizzes, setQuizzes] = useState<ClassroomQuiz[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSessionResponse[]>([]);

  // Get user from Redux store
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "quizzes" | "sessions">("students");

  // Practice mode states
  const [isSelectQuizModalOpen, setIsSelectQuizModalOpen] = useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [selectedQuizForPractice, setSelectedQuizForPractice] = useState<QuizManagementItem | null>(null);
  const [isLoadingQuizDetails, setIsLoadingQuizDetails] = useState(false);

  // Add quiz modal state
  const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);

  // Student removal modal state
  const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
  const [selectedStudentToRemove, setSelectedStudentToRemove] = useState<RegisterResponse | null>(null);

  // Invite students modal state
  const [isInviteStudentsModalOpen, setIsInviteStudentsModalOpen] = useState(false);

  // Spin wheel modal state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [selectedStudentForPractice, setSelectedStudentForPractice] = useState<RegisterResponse | null>(null);

  // Quiz Session states
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showConfirmCreateSession, setShowConfirmCreateSession] = useState(false);
  const [selectedQuizForSession, setSelectedQuizForSession] = useState<ClassroomQuiz | null>(null);

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
    setIsInviteStudentsModalOpen(true);
  };

  const handleStudentsInvited = async () => {
    // Refresh class data after inviting students
    if (classId) {
      try {
        const response = await getClassroomDetail(classId);
        const data = response.data;
        setClassDetail(data);
        setStudents(data.students);
      } catch (error) {
        console.error("Error refreshing class data:", error);
        showToast("Không thể tải lại dữ liệu lớp học", "error");
      }
    }
  };

  const handleAddQuiz = () => {
    setIsAddQuizModalOpen(true);
  };

  const handleQuizAdded = async () => {
    // Refresh class data after adding a quiz
    if (classId) {
      try {
        const response = await getClassroomDetail(classId);
        const data = response.data;
        setClassDetail(data);
        setQuizzes(data.quiz);
        showToast("Đã thêm quiz vào lớp học thành công!", "success");
      } catch (error) {
        console.error("Error refreshing class data:", error);
        showToast("Không thể tải lại dữ liệu lớp học", "error");
      }
    }
  };

  const handleCreateSession = (quiz: ClassroomQuiz) => {
    setSelectedQuizForSession(quiz);
    setShowConfirmCreateSession(true);
  };

  const confirmCreateSession = async () => {
    if (!user?.id || !classId || !selectedQuizForSession) return;

    try {
      setIsCreatingSession(true);

      const sessionData: QuizSessionRequest = {
        quiz_id: selectedQuizForSession.id,
        class_id: classId,
        teacher_id: user.id
      };

      const response = await createQuizSession(sessionData);
      setQuizSessions(prev => [...prev, response.data]);
      showToast("Phiên quiz đã được tạo thành công!", "success");

      // Close modal and reset state
      setShowConfirmCreateSession(false);
      setSelectedQuizForSession(null);

      // Navigate to waiting room page
      navigate(`/teacher/quiz-waiting-room`, {
        state: {
          session: response.data,
          quiz: selectedQuizForSession,
          students: students,
          classId: classId
        }
      });

    } catch (error) {
      console.error("Error creating quiz session:", error);
      showToast("Không thể tạo phiên quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleStartPractice = () => {
    setIsSelectQuizModalOpen(true);
  };

  const handleSelectQuizForPractice = async (quiz: ClassroomQuiz) => {
    try {
      setIsLoadingQuizDetails(true);
      const response = await getQuizForPractice(quiz.id);
      setSelectedQuizForPractice(response.data);
      setIsSelectQuizModalOpen(false);
      setShowSpinWheel(true);
    } catch (error) {
      console.error("Error loading quiz details:", error);
      showToast("Không thể tải chi tiết quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsLoadingQuizDetails(false);
    }
  };

  const handleStudentSelected = (student: RegisterResponse) => {
    setSelectedStudentForPractice(student);
    setShowSpinWheel(false);
    setIsPracticeModalOpen(true);
  };

  const handleClosePracticeModal = () => {
    setIsPracticeModalOpen(false);
    setSelectedQuizForPractice(null);
    setSelectedStudentForPractice(null);
  };

  const handleRemoveStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentToRemove(student);
      setIsRemoveStudentModalOpen(true);
    }
  };

  const confirmRemoveStudent = async () => {
    try {
      if (!classId || !selectedStudentToRemove) return;

      await removeStudentFromClassroom(classId, selectedStudentToRemove.id);

      // Remove student from local state
      setStudents(prev => prev.filter(s => s.id !== selectedStudentToRemove.id));

      showToast("Đã xóa học sinh khỏi lớp học thành công", "success");
      setIsRemoveStudentModalOpen(false);
      setSelectedStudentToRemove(null);
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
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "students"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Học sinh ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "quizzes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Quiz ({quizzes.length})
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "sessions"
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
                {students.map((student: RegisterResponse) => (
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleStartPractice}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    🎯 Quay chọn học sinh kiểm tra
                  </Button>
                  <Button onClick={handleAddQuiz}>
                    Thêm Quiz
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {quizzes.map((quiz: ClassroomQuiz) => (
                  <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white pr-3 flex-1 leading-relaxed">
                        {quiz.name}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${quiz.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {quiz.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>

                    <p className="text-base text-gray-600 dark:text-gray-400 mb-8 line-clamp-3 leading-relaxed flex-grow">
                      {quiz.description && quiz.description.length > 120
                        ? `${quiz.description.substring(0, 120)}...`
                        : quiz.description || "Không có mô tả"}
                    </p>

                    <div className="flex gap-3 mt-auto">
                      <Button variant="outline" size="md" className="flex-1 py-3">
                        Sửa
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        className="flex-1 py-3"
                        onClick={() => handleCreateSession(quiz)}
                        disabled={isCreatingSession}
                      >
                        {isCreatingSession ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Đang tạo...
                          </>
                        ) : (
                          'Tạo Session'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {quizzes.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="text-gray-400 text-7xl mb-6">
                      <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Chưa có quiz nào được thêm
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Bắt đầu thêm quiz vào lớp học để tạo bài kiểm tra cho học sinh.
                      Bạn có thể thêm quiz từ danh sách quiz đã tạo.
                    </p>
                    <Button onClick={handleAddQuiz} className="px-6 py-3">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Thêm Quiz Đầu Tiên
                    </Button>
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
                {quizSessions.map((session: QuizSessionResponse) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Session {session.id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.start_time).toLocaleString("vi-VN")} - {new Date(session.end_time).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {session.status === 'ACTIVE' ? 'Đang diễn ra' : 'Đã kết thúc'}
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

      {/* Select Quiz Modal */}
      <SelectQuizModal
        isOpen={isSelectQuizModalOpen}
        onClose={() => setIsSelectQuizModalOpen(false)}
        onSelectQuiz={handleSelectQuizForPractice}
        quizzes={quizzes}
      />

      {/* Quiz Practice Modal */}
      <QuizPracticeModal
        isOpen={isPracticeModalOpen}
        onClose={handleClosePracticeModal}
        quiz={selectedQuizForPractice}
        selectedStudent={selectedStudentForPractice}
      />

      {/* Add Quiz to Class Modal */}
      <AddQuizToClassModal
        isOpen={isAddQuizModalOpen}
        onClose={() => setIsAddQuizModalOpen(false)}
        classRoomId={classId || ""}
        assignedQuizIds={quizzes.map(quiz => quiz.id)}
        onQuizAdded={handleQuizAdded}
        onShowToast={showToast}
      />

      {/* Invite Students Modal */}
      <InviteStudentsModal
        isOpen={isInviteStudentsModalOpen}
        onClose={() => setIsInviteStudentsModalOpen(false)}
        classRoomId={classId || ""}
        onStudentsInvited={handleStudentsInvited}
        onShowToast={showToast}
      />

      {/* Confirm Remove Student Modal */}
      <ConfirmRemoveStudentModal
        isOpen={isRemoveStudentModalOpen}
        onClose={() => {
          setIsRemoveStudentModalOpen(false);
          setSelectedStudentToRemove(null);
        }}
        student={selectedStudentToRemove}
        onConfirm={confirmRemoveStudent}
      />

      {/* Loading Overlay for Quiz Details */}
      {isLoadingQuizDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải chi tiết quiz...</p>
          </div>
        </div>
      )}

      {/* Spin Wheel Modal */}
      {showSpinWheel && selectedQuizForPractice && (
        <SpinWheelModal
          isOpen={showSpinWheel}
          onClose={() => setShowSpinWheel(false)}
          students={students}
          onStudentSelected={handleStudentSelected}
        />
      )}

      {/* Confirm Create Session Modal */}
      <ConfirmCreateSessionModal
        isOpen={showConfirmCreateSession}
        onClose={() => {
          setShowConfirmCreateSession(false);
          setSelectedQuizForSession(null);
        }}
        onConfirm={confirmCreateSession}
        quiz={selectedQuizForSession}
        isLoading={isCreatingSession}
      />
    </div>
  );
};

export default ClassDetailPage;
