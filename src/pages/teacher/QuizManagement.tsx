import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { 
  getQuizzesForManagement,
  deleteQuiz,
  updateQuiz,
  type QuizManagementItem,
  type UpdateQuizRequest
} from "../../services/quizService";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaClock, 
  FaQuestionCircle,
  FaUsers
} from "react-icons/fa";

const QuizManagement = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizManagementItem | null>(null);
  
  // Edit quiz modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<QuizManagementItem | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateQuizRequest>({
    name: "",
    description: "",
    is_active: true,
    is_public: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  
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

  // Fetch quizzes data
  const fetchQuizzes = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await getQuizzesForManagement(page, 9);
      const data = response.data;
      
      setQuizzes(data.data);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotalQuizzes(data.total);
      
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      showToast("Không thể tải danh sách quiz", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(currentPage);
  }, [currentPage]);

  const handleCreateQuiz = () => {
    navigate("/teacher/quizzes/create");
  };

  const handleEditQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.quiz.id === quizId);
    if (quiz) {
      setQuizToEdit(quiz);
      // Set form data with current quiz values for is_active and is_public, empty for name and description
      setEditFormData({
        name: "",
        description: "",
        is_active: quiz.quiz.active,
        is_public: quiz.quiz.is_public
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!quizToEdit) return;
    
    try {
      setIsUpdating(true);
      
      await updateQuiz(quizToEdit.quiz.id, editFormData);
      
      // Update the quiz in local state
      setQuizzes(prev => prev.map(q => 
        q.quiz.id === quizToEdit.quiz.id 
          ? { 
              ...q, 
              quiz: { 
                ...q.quiz, 
                name: editFormData.name || q.quiz.name,
                description: editFormData.description || q.quiz.description,
                active: editFormData.is_active,
                is_public: editFormData.is_public
              } 
            }
          : q
      ));
      
      showToast(`Đã cập nhật quiz "${editFormData.name || quizToEdit.quiz.name}" thành công`, "success");
      setShowEditModal(false);
      setQuizToEdit(null);
      
    } catch (error) {
      console.error("Error updating quiz:", error);
      showToast("Không thể cập nhật quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.quiz.id === quizId);
    if (quiz) {
      setQuizToDelete(quiz);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    try {
      const quizName = quizToDelete.quiz.name;

      await deleteQuiz(quizToDelete.quiz.id);
      
      // If successful (status 200), quiz was completely deleted
      setQuizzes(prev => prev.filter(q => q.quiz.id !== quizToDelete.quiz.id));
      showToast(`Đã xóa quiz "${quizName}" thành công`, "success");
      
      // Refresh the current page if no quizzes left
      if (quizzes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchQuizzes(currentPage);
      }
      
    } catch (error: any) {
      const quizName = quizToDelete.quiz.name;
      
      // Check if the error is M113 (quiz assigned to classes)
      if (error.response?.data?.code === "M113") {
        // Quiz was deactivated instead of deleted
        showToast(`Quiz "${quizName}" đã được đặt thành không hoạt động vì đã được giao cho lớp học`, "info");
        
        // Update the quiz status in local state
        setQuizzes(prev => prev.map(q => 
          q.quiz.id === quizToDelete.quiz.id 
            ? { ...q, quiz: { ...q.quiz, active: false } }
            : q
        ));
      } else {
        console.error("Error deleting quiz:", error);
        showToast(`Không thể xóa quiz "${quizName}". Vui lòng thử lại!`, "error");
      }
    } finally {
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    }
  };

  const handleViewQuiz = (quizId: string) => {
    navigate(`/teacher/quizzes/${quizId}`);
  };

  const calculateQuestionCount = (item: QuizManagementItem) => {
    const multipleChoiceCount = item.multiple_choice_quiz?.questions?.length || 0;
    const matchingCount = item.matching_quiz?.questions?.length || 0;
    return multipleChoiceCount + matchingCount;
  };

  const calculateTotalPoints = (item: QuizManagementItem) => {
    let totalPoints = 0;
    
    // Multiple choice points
    if (item.multiple_choice_quiz?.questions) {
      totalPoints += item.multiple_choice_quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    // Matching quiz points
    if (item.matching_quiz?.questions) {
      totalPoints += item.matching_quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    return totalPoints;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getQuizTypesBadges = (item: QuizManagementItem) => {
    const badges = [];
    
    if (item.multiple_choice_quiz?.questions?.length > 0) {
      badges.push(
        <span key="mc" className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          Trắc nghiệm ({item.multiple_choice_quiz.questions.length})
        </span>
      );
    }
    
    if (item.matching_quiz?.questions?.length > 0) {
      badges.push(
        <span key="match" className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          Ghép đôi ({item.matching_quiz.questions.length})
        </span>
      );
    }
    
    return badges;
  };

  if (isLoading) {
    return <LoadingOverlay show={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quản lý Quiz
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Tổng cộng {totalQuizzes} quiz
              </p>
            </div>
            <Button 
              onClick={handleCreateQuiz}
              className="flex items-center gap-2"
            >
              <FaPlus />
              Tạo Quiz Mới
            </Button>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((item) => (
            <div 
              key={item.quiz.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full"
            >
              {/* Quiz Header */}
              <div className="p-6 flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[56px]">
                    {item.quiz.name}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 h-[40px] overflow-hidden">
                  {item.quiz.description && item.quiz.description.length > 80 
                    ? `${item.quiz.description.substring(0, 80)}...` 
                    : item.quiz.description || "Không có mô tả"}
                </p>

                {/* Quiz Type Badges */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
                  {getQuizTypesBadges(item)}
                </div>

                {/* Quiz Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-center">
                    <div className="flex items-center justify-center text-blue-500 mb-1">
                      <FaQuestionCircle className="text-lg" />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Câu hỏi</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {calculateQuestionCount(item)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-center">
                    <div className="flex items-center justify-center text-green-500 mb-1">
                      <FaClock className="text-lg" />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Điểm</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {calculateTotalPoints(item)}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-center">
                    <div className="flex items-center justify-center text-purple-500 mb-1">
                      <FaUsers className="text-lg" />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lớp</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.quiz.class_ids.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {formatDate(item.quiz.created_at)}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      item.quiz.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {item.quiz.active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      item.quiz.is_public 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {item.quiz.is_public ? 'Công khai' : 'Riêng tư'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewQuiz(item.quiz.id)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <FaEye className="text-xs" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuiz(item.quiz.id)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <FaEdit className="text-xs" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(item.quiz.id)}
                    className="flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <FaTrash className="text-xs" />
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-gray-400 text-7xl mb-6">
                <FaQuestionCircle className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Chưa có quiz nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Bắt đầu tạo quiz đầu tiên của bạn để quản lý bài kiểm tra cho học sinh. 
                Bạn có thể tạo quiz với nhiều dạng câu hỏi khác nhau như trắc nghiệm, ghép đôi và nhiều hơn nữa.
              </p>
              <Button onClick={handleCreateQuiz} className="px-6 py-3">
                <FaPlus className="mr-2" />
                Tạo Quiz Mới
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị trang {currentPage} trong tổng số {totalPages} trang
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2"
              >
                Trước
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[40px] px-3 py-2"
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && quizToDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-auto">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <FaTrash className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Xóa Quiz
              </h3>

              {/* Quiz Info */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {quizToDelete.quiz.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {calculateQuestionCount(quizToDelete)} câu hỏi • {calculateTotalPoints(quizToDelete)} điểm
                </p>
              </div>

              {/* Warning Message */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Bạn có chắc chắn muốn xóa quiz này?
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Nếu quiz đã được giao cho lớp học, nó sẽ được đặt thành không hoạt động thay vì xóa hoàn toàn.
                </span>
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setQuizToDelete(null);
                  }}
                  className="px-6"
                >
                  Hủy
                </Button>
                <Button
                  onClick={confirmDeleteQuiz}
                  className="px-6 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Xóa Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && quizToEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-auto">
            <div className="mb-6">
              {/* Edit Icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FaEdit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                Chỉnh sửa Quiz
              </h3>
              
              {/* Current Quiz Info */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                Đang chỉnh sửa: <span className="font-medium">{quizToEdit.quiz.name}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Quiz
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên quiz mới..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả quiz mới..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-2 gap-4">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Trạng thái</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {editFormData.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editFormData.is_active ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editFormData.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Public Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Quyền truy cập</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {editFormData.is_public ? 'Công khai' : 'Riêng tư'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editFormData.is_public ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editFormData.is_public ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setQuizToEdit(null);
                }}
                disabled={isUpdating}
                className="px-6"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdateQuiz}
                disabled={isUpdating}
                className="px-6"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang cập nhật...
                  </div>
                ) : (
                  "Cập nhật Quiz"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
