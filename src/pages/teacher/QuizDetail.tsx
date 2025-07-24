import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { 
  getQuizDetail,
  addMultipleChoiceQuestions,
  updateMultipleChoiceQuestions,
  deleteMultipleChoiceQuestions,
  type QuizManagementItem,
  type AddMultipleChoiceQuestion,
  type UpdateMultipleChoiceQuestion
} from "../../services/quizService";
import AddMultipleChoiceModal from "../../components/modals/AddMultipleChoiceModal";
import EditMultipleChoiceModal from "../../components/modals/EditMultipleChoiceModal";
import DeleteMultipleChoiceModal from "../../components/modals/DeleteMultipleChoiceModal";
import { 
  FaArrowLeft,
  FaEdit, 
  FaTrash, 
  FaClock, 
  FaQuestionCircle,
  FaUsers,
  FaCheck,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaPen,
  FaPlusCircle,
  FaMinusCircle
} from "react-icons/fa";

const QuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizManagementItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<{
    multipleChoice: boolean;
    matching: boolean;
    trueFalse: boolean;
    fillInBlank: boolean;
  }>({
    multipleChoice: false,
    matching: false,
    trueFalse: false,
    fillInBlank: false,
  });

  // Modal states
  const [isAddMCModalOpen, setIsAddMCModalOpen] = useState(false);
  const [isEditMCModalOpen, setIsEditMCModalOpen] = useState(false);
  const [isDeleteMCModalOpen, setIsDeleteMCModalOpen] = useState(false);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const [isUpdatingQuestions, setIsUpdatingQuestions] = useState(false);
  const [isDeletingQuestions, setIsDeletingQuestions] = useState(false);
  
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

  // Fetch quiz detail
  const fetchQuizDetail = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await getQuizDetail(id);
      setQuiz(response.data);
    } catch (error) {
      console.error("Error fetching quiz detail:", error);
      showToast("Không thể tải thông tin quiz", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetail();
  }, [id]);

  const handleEditQuiz = () => {
    showToast("Tính năng chỉnh sửa quiz đang được phát triển", "info");
  };

  const handleDeleteQuiz = () => {
    showToast("Tính năng xóa quiz đang được phát triển", "info");
  };

  const toggleSection = (section: 'multipleChoice' | 'matching' | 'trueFalse' | 'fillInBlank') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Multiple Choice Question Management
  const handleAddMultipleChoiceQuestion = () => {
    setIsAddMCModalOpen(true);
  };

  const handleAddMCQuestions = async (questions: AddMultipleChoiceQuestion[]) => {
    if (!quiz) return;
    
    try {
      setIsAddingQuestions(true);
      await addMultipleChoiceQuestions(quiz.quiz.id, questions);
      showToast(`Đã thêm thành công ${questions.length} câu hỏi trắc nghiệm!`, "success");
      setIsAddMCModalOpen(false);
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error adding multiple choice questions:", error);
      showToast("Không thể thêm câu hỏi. Vui lòng thử lại!", "error");
    } finally {
      setIsAddingQuestions(false);
    }
  };

  const handleEditMultipleChoiceQuestion = () => {
    // Instead of editing individual question, open modal to edit all questions
    setIsEditMCModalOpen(true);
  };

  const handleEditAllMCQuestions = async (questions: UpdateMultipleChoiceQuestion[]) => {
    if (!quiz) return;
    
    try {
      setIsUpdatingQuestions(true);
      await updateMultipleChoiceQuestions(quiz.quiz.id, questions);
      showToast(`Đã cập nhật thành công ${questions.length} câu hỏi trắc nghiệm!`, "success");
      setIsEditMCModalOpen(false);
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error updating multiple choice questions:", error);
      showToast("Không thể cập nhật câu hỏi. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdatingQuestions(false);
    }
  };

  const handleDeleteMultipleChoiceQuestion = async (questionIds: string[]) => {
    if (!quiz) return;
    
    try {
      setIsDeletingQuestions(true);
      await deleteMultipleChoiceQuestions(quiz.quiz.id, questionIds);
      showToast(`Đã xóa thành công ${questionIds.length} câu hỏi!`, "success");
      setIsDeleteMCModalOpen(false);
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error deleting multiple choice questions:", error);
      showToast("Không thể xóa câu hỏi. Vui lòng thử lại!", "error");
    } finally {
      setIsDeletingQuestions(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteMCModalOpen(true);
  };

  // Matching Question Management
  const handleAddMatchingQuestion = () => {
    if (!quiz) return;
    showToast(`Tính năng thêm câu hỏi ghép đôi cho quiz ${quiz.quiz.name} đang được phát triển`, "info");
  };

  const handleEditMatchingQuestion = (questionId: string) => {
    showToast(`Tính năng sửa câu hỏi ghép đôi ${questionId} đang được phát triển`, "info");
  };

  const handleDeleteMatchingQuestion = (questionId: string) => {
    showToast(`Tính năng xóa câu hỏi ghép đôi ${questionId} đang được phát triển`, "info");
  };

  const calculateQuestionCount = () => {
    if (!quiz) return 0;
    const multipleChoiceCount = quiz.multiple_choice_quiz?.questions?.length || 0;
    const matchingCount = quiz.matching_quiz?.questions?.length || 0;
    return multipleChoiceCount + matchingCount;
  };

  const calculateTotalPoints = () => {
    if (!quiz) return 0;
    let totalPoints = 0;
    
    // Multiple choice points
    if (quiz.multiple_choice_quiz?.questions) {
      totalPoints += quiz.multiple_choice_quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    // Matching quiz points
    if (quiz.matching_quiz?.questions) {
      totalPoints += quiz.matching_quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    return totalPoints;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LoadingOverlay show={true} />;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không tìm thấy quiz
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Quiz bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
          <Button onClick={() => navigate("/teacher/quizzes")}>
            <FaArrowLeft className="mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/teacher/quizzes")}
              className="flex items-center gap-2"
            >
              <FaArrowLeft />
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              {quiz.quiz.active ? (
                <FaToggleOn className="text-2xl text-green-500" />
              ) : (
                <FaToggleOff className="text-2xl text-gray-400" />
              )}
              <span className={`text-sm font-medium ${
                quiz.quiz.active ? 'text-green-600' : 'text-gray-500'
              }`}>
                {quiz.quiz.active ? 'Đang hoạt động' : 'Tạm dừng'}
              </span>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {quiz.quiz.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-3xl">
                {quiz.quiz.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaQuestionCircle />
                  <span>{calculateQuestionCount()} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span>{calculateTotalPoints()} điểm</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>{quiz.quiz.class_ids.length} lớp học</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>Tạo: {formatDate(quiz.quiz.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-6">
              <Button
                variant="outline"
                onClick={handleEditQuiz}
                className="flex items-center gap-2"
              >
                <FaEdit />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteQuiz}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <FaTrash />
                Xóa
              </Button>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="space-y-6">
          {/* Multiple Choice Questions Section */}
          {quiz.multiple_choice_quiz?.questions && quiz.multiple_choice_quiz.questions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('multipleChoice')}
                className="w-full px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheck className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Câu hỏi trắc nghiệm ({quiz.multiple_choice_quiz.questions.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditMCModalOpen(true);
                      }}
                      className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 px-3 py-1"
                      title="Chỉnh sửa tất cả câu hỏi trắc nghiệm"
                    >
                      <FaEdit className="text-sm" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteMCModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 px-3 py-1"
                      title="Xóa câu hỏi trắc nghiệm"
                    >
                      <FaTrash className="text-sm" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMultipleChoiceQuestion();
                      }}
                      className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400 px-3 py-1"
                      title="Thêm câu hỏi trắc nghiệm"
                    >
                      <FaPlusCircle className="text-sm" />
                    </Button>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {quiz.multiple_choice_quiz.questions.reduce((sum, q) => sum + q.points, 0)} điểm
                    </div>
                    {expandedSections.multipleChoice ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                </div>
              </button>
              
              {expandedSections.multipleChoice && (
                <div className="p-6">
                  <div className="space-y-6">
                    {quiz.multiple_choice_quiz.questions.map((question, index) => (
                      <div key={question.question_id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white text-lg flex-1">
                            Câu {index + 1}: {question.question_text}
                          </h4>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full font-medium text-sm">
                              {question.points} điểm
                            </span>
                            <span className="bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                              {question.time_limit}s
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditMultipleChoiceQuestion()}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                title="Sửa câu hỏi"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {question.hint && (
                          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FaQuestionCircle className="text-yellow-600 dark:text-yellow-400" />
                              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Gợi ý:</span>
                            </div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 ml-6">
                              {question.hint}
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.answers.map((answer, answerIndex) => (
                            <div 
                              key={answerIndex}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                answer.correct 
                                  ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800' 
                                  : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                answer.correct 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'bg-gray-300 border-gray-300 dark:bg-gray-500 dark:border-gray-500'
                              }`}>
                                {answer.correct && <FaCheck className="text-white text-xs" />}
                              </div>
                              <span className="font-medium">{String.fromCharCode(65 + answerIndex)}.</span>
                              <span>{answer.answer_text}</span>
                            </div>
                          ))}
                        </div>
                        
                        {question.allow_multiple_answers && (
                          <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
                            ℹ️ Cho phép chọn nhiều đáp án
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Matching Questions Section */}
          {quiz.matching_quiz?.questions && quiz.matching_quiz.questions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleSection('matching')}
                className="w-full px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaQuestionCircle className="text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Câu hỏi ghép đôi ({quiz.matching_quiz.questions.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMatchingQuestion();
                      }}
                      className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400 px-3 py-1"
                      title="Thêm câu hỏi ghép đôi"
                    >
                      <FaPlusCircle className="text-sm" />
                    </Button>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {quiz.matching_quiz.questions.reduce((sum, q) => sum + q.points, 0)} điểm • {quiz.matching_quiz.time_limit}s
                    </div>
                    {expandedSections.matching ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                </div>
              </button>
              
              {expandedSections.matching && (
                <div className="p-6">
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <FaClock className="text-green-600 dark:text-green-400" />
                      <span className="font-medium">Thời gian làm bài: {quiz.matching_quiz.time_limit} giây</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {quiz.matching_quiz.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white text-lg flex-1">
                            Cặp ghép {index + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full font-medium text-sm">
                              {question.points} điểm
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditMatchingQuestion(question.id)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                                title="Sửa cặp ghép"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteMatchingQuestion(question.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                                title="Xóa cặp ghép"
                              >
                                <FaMinusCircle className="text-sm" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                              Nội dung A
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                  {question.item_a.matching_type}
                                </span>
                              </div>
                              <div className="text-gray-900 dark:text-white font-medium">
                                {question.item_a.content}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                              Nội dung B
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                  {question.item_b.matching_type}
                                </span>
                              </div>
                              <div className="text-gray-900 dark:text-white font-medium">
                                {question.item_b.content}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                            <FaCheck />
                            Cặp ghép chính xác
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* True/False Questions Section - Coming Soon */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('trueFalse')}
              className="w-full px-6 py-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaToggleOn className="text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Câu hỏi Đúng/Sai (0)
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                    Đang phát triển
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    0 điểm
                  </div>
                  {expandedSections.trueFalse ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>
            </button>
            
            {expandedSections.trueFalse && (
              <div className="p-6">
                <div className="text-center py-12">
                  <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Tính năng đang được phát triển
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Chức năng tạo và hiển thị câu hỏi Đúng/Sai sẽ được bổ sung trong phiên bản tiếp theo. 
                    Bạn sẽ có thể tạo các câu hỏi với 2 lựa chọn: Đúng hoặc Sai.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Tính năng sắp có:</h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Tạo câu hỏi với đáp án Đúng/Sai</li>
                      <li>• Thiết lập thời gian cho từng câu</li>
                      <li>• Thêm gợi ý cho học sinh</li>
                      <li>• Tùy chỉnh điểm số</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fill in Blank Questions Section - Coming Soon */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('fillInBlank')}
              className="w-full px-6 py-4 bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaPen className="text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Câu hỏi Điền từ (0)
                  </h3>
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                    Đang phát triển
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    0 điểm
                  </div>
                  {expandedSections.fillInBlank ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>
            </button>
            
            {expandedSections.fillInBlank && (
              <div className="p-6">
                <div className="text-center py-12">
                  <FaExclamationTriangle className="text-6xl text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Tính năng đang được phát triển
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Chức năng tạo và hiển thị câu hỏi Điền từ sẽ được bổ sung trong phiên bản tiếp theo. 
                    Bạn sẽ có thể tạo các câu hỏi với chỗ trống để học sinh điền đáp án.
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Tính năng sắp có:</h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• Tạo câu hỏi với chỗ trống ___</li>
                      <li>• Hỗ trợ nhiều đáp án đúng</li>
                      <li>• Tùy chọn phân biệt chữ hoa/thường</li>
                      <li>• Thiết lập thời gian và điểm số</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {(!quiz.multiple_choice_quiz?.questions || quiz.multiple_choice_quiz.questions.length === 0) &&
           (!quiz.matching_quiz?.questions || quiz.matching_quiz.questions.length === 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có câu hỏi
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Quiz này chưa có câu hỏi nào. Bạn có thể thêm câu hỏi để hoàn thiện quiz.
              </p>
              <Button onClick={handleEditQuiz} className="flex items-center gap-2">
                <FaEdit />
                Thêm câu hỏi
              </Button>
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

      {/* Add Multiple Choice Modal */}
      <AddMultipleChoiceModal
        isOpen={isAddMCModalOpen}
        onClose={() => setIsAddMCModalOpen(false)}
        onSubmit={handleAddMCQuestions}
        isLoading={isAddingQuestions}
      />

      {/* Edit Multiple Choice Modal */}
      <EditMultipleChoiceModal
        isOpen={isEditMCModalOpen}
        onClose={() => setIsEditMCModalOpen(false)}
        onSubmit={handleEditAllMCQuestions}
        initialQuestions={quiz?.multiple_choice_quiz?.questions || []}
        isLoading={isUpdatingQuestions}
      />

      {/* Delete Multiple Choice Modal */}
      <DeleteMultipleChoiceModal
        isOpen={isDeleteMCModalOpen}
        onClose={() => setIsDeleteMCModalOpen(false)}
        onSubmit={handleDeleteMultipleChoiceQuestion}
        questions={quiz?.multiple_choice_quiz?.questions || []}
        isLoading={isDeletingQuestions}
      />
    </div>
  );
};

export default QuizDetail;
