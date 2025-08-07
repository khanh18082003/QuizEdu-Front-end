import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaSearch, FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import Button from "../ui/Button";
import { getQuizzesForManagement, type QuizManagementItem } from "../../services/quizService";
import { assignQuizToClassroom, type AssignQuizToClassroomRequest } from "../../services/classroomService";

interface AddQuizToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classRoomId: string;
  assignedQuizIds: string[]; // Quiz IDs already assigned to this class
  onQuizAdded: () => void; // Callback to refresh the class data
  onShowToast: (message: string, type: "success" | "error" | "info") => void; // Toast callback
}

const AddQuizToClassModal = ({ isOpen, onClose, classRoomId, assignedQuizIds, onQuizAdded, onShowToast }: AddQuizToClassModalProps) => {
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizManagementItem[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizManagementItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch available quizzes (not assigned to this class and active only)
  const fetchAvailableQuizzes = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await getQuizzesForManagement(page, 20); // Get more quizzes per page
      const allQuizzes = response.data.data;
      
      // Filter out quizzes that are already assigned to this class and only get active quizzes
      const unassignedActiveQuizzes = allQuizzes.filter(quiz => 
        !assignedQuizIds.includes(quiz.quiz.id) && quiz.quiz.active
      );
      
      setAvailableQuizzes(unassignedActiveQuizzes);
      setFilteredQuizzes(unassignedActiveQuizzes);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching available quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter quizzes based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQuizzes(availableQuizzes);
    } else {
      const filtered = availableQuizzes.filter(quiz =>
        quiz.quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, availableQuizzes]);

  // Fetch quizzes when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setCurrentPage(1);
      fetchAvailableQuizzes(1);
    }
  }, [isOpen, assignedQuizIds]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAvailableQuizzes(page);
  };

  // Handle assign quiz to class
  const handleAssignQuiz = async (quizId: string) => {
    try {
      setIsAssigning(true);
      
      const requestData: AssignQuizToClassroomRequest = {
        class_room_id: classRoomId,
        quiz_id: quizId
      };

      await assignQuizToClassroom(requestData);
      
      // Show success toast
      onShowToast(`Đã thêm quiz "${availableQuizzes.find(q => q.quiz.id === quizId)?.quiz.name}" vào lớp thành công!`, "success");
      
      // Remove the assigned quiz from available list
      setAvailableQuizzes(prev => prev.filter(quiz => quiz.quiz.id !== quizId));
      setFilteredQuizzes(prev => prev.filter(quiz => quiz.quiz.id !== quizId));
      
      // Call callback to refresh class data
      onQuizAdded();
      
    } catch (error) {
      console.error("Error assigning quiz to classroom:", error);
      onShowToast("Không thể thêm quiz vào lớp. Vui lòng thử lại!", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  // Calculate question count for a quiz
  const calculateQuestionCount = (quiz: QuizManagementItem) => {
    const multipleChoiceCount = quiz.multiple_choice_quiz?.questions?.length || 0;
    const matchingCount = quiz.matching_quiz?.questions?.length || 0;
    return multipleChoiceCount + matchingCount;
  };

  // Calculate total points for a quiz
  const calculateTotalPoints = (quiz: QuizManagementItem) => {
    let totalPoints = 0;
    
    if (quiz.multiple_choice_quiz?.questions) {
      totalPoints += quiz.multiple_choice_quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    if (quiz.matching_quiz?.questions) {
      totalPoints += quiz.matching_quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    return totalPoints;
  };

  // Handle navigation to quiz management
  const handleGoToQuizManagement = () => {
    onClose();
    navigate("/teacher/quizzes");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thêm Quiz vào Lớp học
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm quiz theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách quiz...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <FaSearch className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {searchTerm ? "Không tìm thấy quiz nào phù hợp" : "Chưa có quiz nào khả dụng"}
                </h3>
                {searchTerm ? (
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Hãy thử tìm kiếm với từ khóa khác hoặc tạo quiz mới để thêm vào lớp học của bạn.
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Tất cả quiz đã được thêm vào lớp hoặc bạn chưa tạo quiz nào. 
                    Hãy tạo quiz mới để có thể thêm vào lớp học.
                  </p>
                )}
              </div>
              <Button
                onClick={handleGoToQuizManagement}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
                Đi đến Quản lý Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-1 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Tìm thấy <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredQuizzes.length}</span> quiz có thể thêm vào lớp
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.quiz.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[56px] pr-2">
                        {quiz.quiz.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        quiz.quiz.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {quiz.quiz.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 h-[40px] overflow-hidden flex-grow">
                      {quiz.quiz.description && quiz.quiz.description.length > 100 
                        ? `${quiz.quiz.description.substring(0, 100)}...` 
                        : quiz.quiz.description || "Không có mô tả"}
                    </p>

                    <div className="flex items-center justify-between mb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{calculateQuestionCount(quiz)} câu hỏi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{calculateTotalPoints(quiz)} điểm</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAssignQuiz(quiz.quiz.id)}
                      disabled={isAssigning}
                      className="w-full flex items-center justify-center gap-2 mt-auto"
                    >
                      <FaPlus className="w-4 h-4" />
                      {isAssigning ? "Đang thêm..." : "Thêm vào lớp"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                Trước
              </Button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuizToClassModal;
