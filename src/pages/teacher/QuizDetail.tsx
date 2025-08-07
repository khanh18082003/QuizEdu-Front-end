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
  addMatchingQuestions,
  updateMatchingQuestions,
  deleteMatchingQuestions,
  updateMatchingQuiz,
  createQuizType,
  updateQuiz,
  type QuizManagementItem,
  type AddMultipleChoiceQuestion,
  type UpdateMultipleChoiceQuestion,
  type AddMatchingQuestion,
  type UpdateMatchingQuestionByType,
  type UpdateMatchingQuizRequest,
  type CreateQuizTypeRequest,
  type UpdateQuizRequest
} from "../../services/quizService";
import AddMultipleChoiceModal from "../../components/modals/AddMultipleChoiceModal";
import EditMultipleChoiceModal from "../../components/modals/EditMultipleChoiceModal";
import DeleteMultipleChoiceModal from "../../components/modals/DeleteMultipleChoiceModal";
import AddMatchingModal from "../../components/modals/AddMatchingModal";
import EditMatchingModal from "../../components/modals/EditMatchingModal";
import EditMatchingQuizModal from "../../components/modals/EditMatchingQuizModal";
import DeleteMatchingModal from "../../components/modals/DeleteMatchingModal";
import CreateQuizTypeModal from "../../components/modals/CreateQuizTypeModal";
import EditQuizModal from "../../components/modals/EditQuizModal";
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
  FaPlusCircle,
  FaPlus
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
  }>({
    multipleChoice: false,
    matching: false,
  });

  // Matching type expanded state
  const [expandedMatchingTypes, setExpandedMatchingTypes] = useState<Record<string, boolean>>({
    'TEXT-TEXT': false,
    'TEXT-IMAGE': false,
    'IMAGE-TEXT': false,
    'IMAGE-IMAGE': false,
  });

  // Modal states
  const [isAddMCModalOpen, setIsAddMCModalOpen] = useState(false);
  const [isEditMCModalOpen, setIsEditMCModalOpen] = useState(false);
  const [isDeleteMCModalOpen, setIsDeleteMCModalOpen] = useState(false);
  const [isAddMatchingModalOpen, setIsAddMatchingModalOpen] = useState(false);
  const [isEditMatchingModalOpen, setIsEditMatchingModalOpen] = useState(false);
  const [isEditMatchingByTypeModalOpen, setIsEditMatchingByTypeModalOpen] = useState(false);
  const [isDeleteMatchingModalOpen, setIsDeleteMatchingModalOpen] = useState(false);
  const [isCreateQuizTypeModalOpen, setIsCreateQuizTypeModalOpen] = useState(false);
  
  // Matching type selection state
  const [selectedMatchingType, setSelectedMatchingType] = useState<{
    typeA: 'TEXT' | 'IMAGE';
    typeB: 'TEXT' | 'IMAGE';
    points: number;
    minRequired: number;
  } | null>(null);
  const [selectedQuestionsForEdit, setSelectedQuestionsForEdit] = useState<any[]>([]);
  const [selectedQuestionsForDelete, setSelectedQuestionsForDelete] = useState<any[]>([]);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const [isUpdatingQuestions, setIsUpdatingQuestions] = useState(false);
  const [isDeletingQuestions, setIsDeletingQuestions] = useState(false);
  const [isAddingMatchingQuestions, setIsAddingMatchingQuestions] = useState(false);
  const [isUpdatingMatchingQuiz, setIsUpdatingMatchingQuiz] = useState(false);
  const [isDeletingMatchingQuestions, setIsDeletingMatchingQuestions] = useState(false);
  const [isCreatingQuizType, setIsCreatingQuizType] = useState(false);
  
  // Edit Quiz Modal States
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [isUpdatingQuiz, setIsUpdatingQuiz] = useState(false);
  
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

  const toggleSection = (section: 'multipleChoice' | 'matching') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Multiple Choice Question Management
  const handleAddMultipleChoiceQuestion = () => {
    if (!quiz?.multiple_choice_quiz) {
      showToast("Vui lòng tạo loại quiz trắc nghiệm trước!", "info");
      setIsCreateQuizTypeModalOpen(true);
      return;
    }
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

  // Matching Question Management
  const handleAddMatchingQuestion = () => {
    if (!quiz?.matching_quiz) {
      showToast("Vui lòng tạo loại quiz ghép đôi trước!", "info");
      setIsCreateQuizTypeModalOpen(true);
      return;
    }
    setIsAddMatchingModalOpen(true);
  };

  const handleAddMatchingQuestions = async (questions: AddMatchingQuestion[]) => {
    if (!quiz) return;
    
    try {
      setIsAddingMatchingQuestions(true);
      await addMatchingQuestions(quiz.quiz.id, questions);
      showToast(`Đã thêm thành công ${questions.length} cặp ghép!`, "success");
      setIsAddMatchingModalOpen(false);
      setSelectedMatchingType(null); // Reset selected type
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error adding matching questions:", error);
      showToast("Không thể thêm cặp ghép. Vui lòng thử lại!", "error");
    } finally {
      setIsAddingMatchingQuestions(false);
    }
  };

  const handleUpdateMatchingQuestions = async (questions: UpdateMatchingQuestionByType[]) => {
    if (!quiz) return;
    
    try {
      setIsAddingMatchingQuestions(true); // Use same loading state
      await updateMatchingQuestions(quiz.quiz.id, { questions });
      showToast(`Đã cập nhật thành công ${questions.length} cặp ghép!`, "success");
      setIsEditMatchingByTypeModalOpen(false);
      setSelectedMatchingType(null); // Reset selected type
      setSelectedQuestionsForEdit([]); // Reset selected questions
      
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error updating matching questions:", error);
      showToast("Không thể cập nhật cặp ghép. Vui lòng thử lại!", "error");
    } finally {
      setIsAddingMatchingQuestions(false);
    }
  };

  const handleUpdateMatchingQuiz = async (quizData: UpdateMatchingQuizRequest) => {
    if (!quiz?.matching_quiz) return;
    
    try {
      setIsUpdatingMatchingQuiz(true);
      await updateMatchingQuiz(quiz.quiz.id, quizData);
      showToast("Đã cập nhật quiz ghép đôi thành công!", "success");
      setIsEditMatchingModalOpen(false);
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error updating matching quiz:", error);
      showToast("Không thể cập nhật quiz ghép đôi. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdatingMatchingQuiz(false);
    }
  };

  const handleDeleteMatchingQuestions = async (questionIds: string[]) => {
    if (!quiz) return;
    
    try {
      setIsDeletingMatchingQuestions(true);
      await deleteMatchingQuestions(quiz.quiz.id, questionIds);
      showToast(`Đã xóa thành công ${questionIds.length} cặp ghép!`, "success");
      setIsDeleteMatchingModalOpen(false);
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error deleting matching questions:", error);
      showToast("Không thể xóa cặp ghép. Vui lòng thử lại!", "error");
    } finally {
      setIsDeletingMatchingQuestions(false);
    }
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

  const getAvailableQuizTypes = (): ("MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK")[] => {
    if (!quiz) return [];
    const availableTypes: ("MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK")[] = [];
    
    // Check if multiple choice quiz doesn't exist or has no questions
    if (!quiz.multiple_choice_quiz || !quiz.multiple_choice_quiz.questions || quiz.multiple_choice_quiz.questions.length === 0) {
      availableTypes.push("MULTIPLE_CHOICE");
    }
    
    // Check if matching quiz doesn't exist or has no questions
    if (!quiz.matching_quiz || !quiz.matching_quiz.questions || quiz.matching_quiz.questions.length === 0) {
      availableTypes.push("MATCHING");
    }
    
    // Always show True/False and Fill in Blank as "coming soon"
    availableTypes.push("TRUE_FALSE", "FILL_IN_BLANK");
    
    return availableTypes;
  };

  const handleCreateQuizType = async (quizTypeData: CreateQuizTypeRequest) => {
    if (!quiz) return;
    
    // Check if it's a "coming soon" feature
    if (quizTypeData.type === "TRUE_FALSE" || quizTypeData.type === "FILL_IN_BLANK") {
      const typeName = quizTypeData.type === "TRUE_FALSE" ? "Đúng/Sai" : "Điền từ";
      showToast(`Tính năng tạo câu hỏi ${typeName} đang được phát triển!`, "info");
      setIsCreateQuizTypeModalOpen(false);
      return;
    }
    
    try {
      setIsCreatingQuizType(true);
      
      // Add quiz_id to multiple choice data if needed
      if (quizTypeData.type === "MULTIPLE_CHOICE") {
        (quizTypeData.data as any).quiz_id = quiz.quiz.id;
      }
      
      await createQuizType(quiz.quiz.id, quizTypeData);
      
      const typeName = quizTypeData.type === "MULTIPLE_CHOICE" ? "trắc nghiệm" : "ghép đôi";
      showToast(`Đã tạo thành công loại quiz ${typeName}!`, "success");
      setIsCreateQuizTypeModalOpen(false);
      
      // Refresh quiz data
      await fetchQuizDetail();
    } catch (error) {
      console.error("Error creating quiz type:", error);
      showToast("Không thể tạo loại quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsCreatingQuizType(false);
    }
  };

  // Handle Edit Quiz
  const handleEditQuiz = () => {
    setIsEditQuizModalOpen(true);
  };

  const handleUpdateQuiz = async (formData: UpdateQuizRequest) => {
    if (!quiz) return;
    
    try {
      setIsUpdatingQuiz(true);
      
      await updateQuiz(quiz.quiz.id, formData);
      
      // Update the quiz in local state
      setQuiz(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          quiz: {
            ...prev.quiz,
            name: formData.name || prev.quiz.name,
            description: formData.description || prev.quiz.description,
            active: formData.is_active,
            public: formData.is_public
          }
        };
      });
      
      showToast(`Đã cập nhật quiz "${formData.name || quiz.quiz.name}" thành công`, "success");
      setIsEditQuizModalOpen(false);
      
    } catch (error) {
      console.error("Error updating quiz:", error);
      showToast("Không thể cập nhật quiz. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdatingQuiz(false);
    }
  };

  const handleDeleteQuiz = () => {
    // TODO: Implement delete quiz functionality
    showToast("Chức năng xóa quiz sẽ được bổ sung trong phiên bản tiếp theo", "info");
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
            <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  quiz.quiz.public 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {quiz.quiz.public ? 'Công khai' : 'Riêng tư'}
                </span>
              </div>
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
          {quiz.multiple_choice_quiz && (
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
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {quiz.multiple_choice_quiz.questions.reduce((sum, q) => sum + q.points, 0)} điểm
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMultipleChoiceQuestion();
                      }}
                      className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400 px-3 py-1"
                      title="Thêm câu hỏi trắc nghiệm"
                    >
                      <FaPlusCircle className="text-sm" />
                    </Button>
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
                  {quiz.multiple_choice_quiz.questions && quiz.multiple_choice_quiz.questions.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-12">
                      <FaCheck className="text-6xl text-blue-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Chưa có câu hỏi trắc nghiệm
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thêm câu hỏi trắc nghiệm để học sinh có thể chọn đáp án từ các lựa chọn cho sẵn.
                      </p>
                      <Button
                        onClick={handleAddMultipleChoiceQuestion}
                        className="flex items-center gap-2"
                      >
                        <FaPlusCircle />
                        Thêm câu hỏi trắc nghiệm
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Matching Questions Section */}
          {quiz.matching_quiz && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSection('matching')}
              className="w-full px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaQuestionCircle className="text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Câu hỏi ghép đôi ({quiz.matching_quiz?.questions?.length || 0})
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {quiz.matching_quiz?.time_limit && `${quiz.matching_quiz.time_limit}s`}
                  </div>
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
                {quiz.matching_quiz?.questions && quiz.matching_quiz.questions.length > 0 ? (
                  <>
                    {quiz.matching_quiz.time_limit && (
                      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <FaClock className="text-green-600 dark:text-green-400" />
                          <span className="font-medium">Thời gian làm bài: {quiz.matching_quiz.time_limit} giây</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Group questions by type combination */}
                    {(() => {
                      // Define all possible type combinations
                      const allTypeKeys = ['TEXT-TEXT', 'TEXT-IMAGE', 'IMAGE-TEXT', 'IMAGE-IMAGE'];
                      
                      const groupedQuestions = quiz.matching_quiz.questions.reduce((groups, question, index) => {
                        const typeKey = `${question.item_a.matching_type}-${question.item_b.matching_type}`;
                        if (!groups[typeKey]) {
                          groups[typeKey] = [];
                        }
                        groups[typeKey].push({ ...question, originalIndex: index });
                        return groups;
                      }, {} as Record<string, Array<any>>);

                      // Ensure all type combinations are represented
                      allTypeKeys.forEach(typeKey => {
                        if (!groupedQuestions[typeKey]) {
                          groupedQuestions[typeKey] = [];
                        }
                      });

                      const getTypeConfig = (typeKey: string) => {
                        switch (typeKey) {
                          case 'TEXT-TEXT':
                            return {
                              icon: '📝',
                              label: 'Văn bản - Văn bản',
                              bgClass: 'bg-blue-50 dark:bg-blue-900/20',
                              borderClass: 'border-blue-200 dark:border-blue-800',
                              textClass: 'text-blue-800 dark:text-blue-200',
                              subtextClass: 'text-blue-600 dark:text-blue-400',
                              badgeClass: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
                              buttonClass: 'text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400',
                              defaultPoints: 5
                            };
                          case 'TEXT-IMAGE':
                            return {
                              icon: '📝🖼️',
                              label: 'Văn bản - Hình ảnh',
                              bgClass: 'bg-purple-50 dark:bg-purple-900/20',
                              borderClass: 'border-purple-200 dark:border-purple-800',
                              textClass: 'text-purple-800 dark:text-purple-200',
                              subtextClass: 'text-purple-600 dark:text-purple-400',
                              badgeClass: 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
                              buttonClass: 'text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400',
                              defaultPoints: 7
                            };
                          case 'IMAGE-TEXT':
                            return {
                              icon: '🖼️📝',
                              label: 'Hình ảnh - Văn bản',
                              bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
                              borderClass: 'border-indigo-200 dark:border-indigo-800',
                              textClass: 'text-indigo-800 dark:text-indigo-200',
                              subtextClass: 'text-indigo-600 dark:text-indigo-400',
                              badgeClass: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200',
                              buttonClass: 'text-indigo-600 hover:text-indigo-700 border-indigo-300 hover:border-indigo-400',
                              defaultPoints: 7
                            };
                          case 'IMAGE-IMAGE':
                            return {
                              icon: '🖼️',
                              label: 'Hình ảnh - Hình ảnh',
                              bgClass: 'bg-pink-50 dark:bg-pink-900/20',
                              borderClass: 'border-pink-200 dark:border-pink-800',
                              textClass: 'text-pink-800 dark:text-pink-200',
                              subtextClass: 'text-pink-600 dark:text-pink-400',
                              badgeClass: 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200',
                              buttonClass: 'text-pink-600 hover:text-pink-700 border-pink-300 hover:border-pink-400',
                              defaultPoints: 10
                            };
                          default:
                            return {
                              icon: '❓',
                              label: typeKey,
                              bgClass: 'bg-gray-50 dark:bg-gray-900/20',
                              borderClass: 'border-gray-200 dark:border-gray-800',
                              textClass: 'text-gray-800 dark:text-gray-200',
                              subtextClass: 'text-gray-600 dark:text-gray-400',
                              badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                              buttonClass: 'text-gray-600 hover:text-gray-700 border-gray-300 hover:border-gray-400',
                              defaultPoints: 5
                            };
                        }
                      };

                      const handleAddMatchingByType = (typeKey: string) => {
                        // Check if already at maximum limit (5 pairs per type)
                        const existingCount = groupedQuestions[typeKey].length;
                        if (existingCount >= 5) {
                          showToast("Mỗi loại ghép đôi chỉ được phép tối đa 5 cặp!", "info");
                          return;
                        }
                        
                        // Determine minimum number of questions needed
                        const minRequired = existingCount === 0 ? 2 : 1;
                        
                        // Extract type information for the modal
                        const [typeA, typeB] = typeKey.split('-') as ['TEXT' | 'IMAGE', 'TEXT' | 'IMAGE'];
                        
                        // Get config for this type to get default points
                        const config = getTypeConfig(typeKey);
                        
                        // Get points from existing questions of this type, or use default
                        let points = config.defaultPoints; // default fallback
                        if (existingCount > 0) {
                          // Use points from existing questions of same type
                          points = groupedQuestions[typeKey][0].points;
                        }
                        
                        // Set the selected matching type with configuration
                        setSelectedMatchingType({
                          typeA,
                          typeB,
                          points,
                          minRequired: Math.min(minRequired, 5 - existingCount) // Limit by remaining slots
                        });
                        
                        // Open the modal
                        setIsAddMatchingModalOpen(true);
                      };

                      const handleEditMatchingByType = (typeKey: string) => {
                        // Filter questions by type and prepare for editing
                        const questionsToEdit = groupedQuestions[typeKey];
                        if (questionsToEdit.length === 0) return;
                        
                        // Extract type information
                        const [typeA, typeB] = typeKey.split('-') as ['TEXT' | 'IMAGE', 'TEXT' | 'IMAGE'];
                        
                        // Set the selected matching type for edit mode
                        setSelectedMatchingType({
                          typeA,
                          typeB,
                          points: questionsToEdit[0].points,
                          minRequired: questionsToEdit.length
                        });
                        
                        // Store questions for editing
                        setSelectedQuestionsForEdit(questionsToEdit);
                        
                        // Open edit modal
                        setIsEditMatchingByTypeModalOpen(true);
                      };

                      const handleDeleteMatchingByType = (typeKey: string) => {
                        // Filter questions by type for deletion
                        const questionsToDelete = groupedQuestions[typeKey];
                        if (questionsToDelete.length === 0) return;
                        
                        // Store questions for deletion
                        setSelectedQuestionsForDelete(questionsToDelete);
                        
                        // Open delete modal
                        setIsDeleteMatchingModalOpen(true);
                      };

                      const toggleMatchingTypeExpanded = (typeKey: string) => {
                        setExpandedMatchingTypes(prev => ({
                          ...prev,
                          [typeKey]: !prev[typeKey]
                        }));
                      };

                      return allTypeKeys.map((typeKey) => {
                        const questions = groupedQuestions[typeKey];
                        const config = getTypeConfig(typeKey);
                        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

                        return (
                          <div key={typeKey} className="mb-8 last:mb-0">
                            {/* Group Header */}
                            <button
                              onClick={() => toggleMatchingTypeExpanded(typeKey)}
                              className={`w-full mb-4 p-4 ${config.bgClass} border ${config.borderClass} rounded-lg hover:shadow-md transition-all duration-200`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{config.icon}</span>
                                  <div className="text-left">
                                    <h4 className={`text-lg font-semibold ${config.textClass}`}>
                                      {config.label}
                                    </h4>
                                    <p className={`text-sm ${config.subtextClass}`}>
                                      {questions.length}/5 cặp ghép{questions.length > 0 ? ` • ${totalPoints} điểm` : ` • ${config.defaultPoints} điểm/cặp`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`px-3 py-1 ${config.badgeClass} rounded-full text-sm font-medium`}>
                                    {questions.length}/5 cặp
                                  </div>
                                  {questions.length > 0 && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditMatchingByType(typeKey);
                                        }}
                                        className={`${config.buttonClass} px-3 py-1`}
                                        title={`Chỉnh sửa tất cả cặp ghép ${config.label.toLowerCase()}`}
                                      >
                                        <FaEdit className="text-sm" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteMatchingByType(typeKey);
                                        }}
                                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 px-3 py-1"
                                        title={`Xóa tất cả cặp ghép ${config.label.toLowerCase()}`}
                                      >
                                        <FaTrash className="text-sm" />
                                      </Button>
                                    </>
                                  )}
                                  {questions.length < 5 ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddMatchingByType(typeKey);
                                      }}
                                      className={`${config.buttonClass} px-3 py-1`}
                                      title={`Thêm cặp ghép ${config.label.toLowerCase()}${questions.length === 0 ? ` (tối thiểu 2 cặp, ${config.defaultPoints} điểm/cặp)` : ` (${config.defaultPoints} điểm/cặp)`}`}
                                    >
                                      <FaPlusCircle className="text-sm" />
                                    </Button>
                                  ) : (
                                    <div className="px-3 py-1 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded text-sm">
                                      Đã đạt tối đa (5/5)
                                    </div>
                                  )}
                                  {expandedMatchingTypes[typeKey] ? (
                                    <FaChevronUp className={`text-sm ${config.textClass} ml-2`} />
                                  ) : (
                                    <FaChevronDown className={`text-sm ${config.textClass} ml-2`} />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* Questions in this group */}
                            {expandedMatchingTypes[typeKey] && (
                              <>
                                {questions.length > 0 ? (
                                  <div className="space-y-4 pl-4">
                                    {questions.map((question, questionIndex) => (
                                      <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center justify-between mb-4">
                                          <h5 className="font-medium text-gray-900 dark:text-white text-base">
                                            Cặp ghép {questionIndex + 1}
                                          </h5>
                                          <div className="flex items-center gap-2">
                                            <span className={`${config.badgeClass} px-3 py-1 rounded-full font-medium text-sm`}>
                                              {question.points} điểm
                                            </span>
                                          </div>
                                        </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Content A */}
                                      <div className="space-y-3">
                                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                                          <span>Nội dung A</span>
                                          <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            {question.item_a.matching_type}
                                          </span>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                          {question.item_a.matching_type === 'TEXT' ? (
                                            <div className="text-gray-900 dark:text-white font-medium">
                                              {question.item_a.content}
                                            </div>
                                          ) : (
                                            <div className="text-center">
                                              {question.item_a.content && question.item_a.content.startsWith('http') ? (
                                                <div className="w-full max-w-xs mx-auto">
                                                  <img
                                                    src={question.item_a.content}
                                                    alt="Nội dung A"
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.style.display = 'none';
                                                      target.parentElement!.innerHTML = `
                                                        <div class="w-full h-32 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center">
                                                          <div class="text-gray-500 dark:text-gray-400 text-sm mb-2">🖼️ Lỗi tải ảnh</div>
                                                          <div class="text-xs text-gray-400 dark:text-gray-500">Không thể hiển thị hình ảnh</div>
                                                        </div>
                                                      `;
                                                    }}
                                                  />
                                                </div>
                                              ) : (
                                                <div className="w-full max-w-xs mx-auto bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                                    🖼️ Hình ảnh đã upload
                                                  </div>
                                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {question.item_a.content || 'File đã tải lên'}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Content B */}
                                      <div className="space-y-3">
                                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide flex items-center gap-2">
                                          <span>Nội dung B</span>
                                          <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                            {question.item_b.matching_type}
                                          </span>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                          {question.item_b.matching_type === 'TEXT' ? (
                                            <div className="text-gray-900 dark:text-white font-medium">
                                              {question.item_b.content}
                                            </div>
                                          ) : (
                                            <div className="text-center">
                                              {question.item_b.content && question.item_b.content.startsWith('http') ? (
                                                <div className="w-full max-w-xs mx-auto">
                                                  <img
                                                    src={question.item_b.content}
                                                    alt="Nội dung B"
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.style.display = 'none';
                                                      target.parentElement!.innerHTML = `
                                                        <div class="w-full h-32 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center">
                                                          <div class="text-gray-500 dark:text-gray-400 text-sm mb-2">🖼️ Lỗi tải ảnh</div>
                                                          <div class="text-xs text-gray-400 dark:text-gray-500">Không thể hiển thị hình ảnh</div>
                                                        </div>
                                                      `;
                                                    }}
                                                  />
                                                </div>
                                              ) : (
                                                <div className="w-full max-w-xs mx-auto bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                                    🖼️ Hình ảnh đã upload
                                                  </div>
                                                  <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {question.item_b.content || 'File đã tải lên'}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}
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
                            ) : (
                              <div className="pl-4">
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                  <div className="text-gray-400 text-4xl mb-3">{config.icon}</div>
                                  <h6 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Chưa có cặp ghép {config.label.toLowerCase()}
                                  </h6>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                                    Thêm ít nhất 2 cặp ghép để bắt đầu sử dụng loại này (tối đa 5 cặp, {config.defaultPoints} điểm/cặp)
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddMatchingByType(typeKey)}
                                    className={`${config.buttonClass} text-sm`}
                                  >
                                    <FaPlusCircle className="mr-2" />
                                    Thêm cặp đầu tiên
                                  </Button>
                                </div>
                              </div>
                            )}
                              </>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FaQuestionCircle className="text-6xl text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Chưa có câu hỏi ghép đôi
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Thêm câu hỏi ghép đôi để học sinh có thể kết nối các nội dung liên quan với nhau.
                    </p>
                    <Button
                      onClick={handleAddMatchingQuestion}
                      className="flex items-center gap-2"
                    >
                      <FaPlusCircle />
                      Thêm câu hỏi ghép đôi
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Available Quiz Types Section */}
          {getAvailableQuizTypes().length > 0 && (quiz.multiple_choice_quiz || quiz.matching_quiz) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaPlus className="text-indigo-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Các loại quiz có thể thêm
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Các loại câu hỏi chưa có hoặc chưa được sử dụng trong quiz này
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateQuizTypeModalOpen(true)}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 border-indigo-300 hover:border-indigo-400"
                  >
                    <FaPlus />
                    Tạo loại quiz
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {getAvailableQuizTypes().map((type) => {
                      const isExistingButEmpty = (type === "MULTIPLE_CHOICE" && quiz.multiple_choice_quiz?.questions?.length === 0) ||
                                               (type === "MATCHING" && quiz.matching_quiz?.questions?.length === 0);
                      const isCompletelyNew = (type === "MULTIPLE_CHOICE" && !quiz.multiple_choice_quiz) ||
                                            (type === "MATCHING" && !quiz.matching_quiz);
                      
                      return (
                        <span 
                          key={type}
                          className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full"
                          title={isCompletelyNew ? "Loại quiz chưa được tạo" : isExistingButEmpty ? "Loại quiz đã tạo nhưng chưa có câu hỏi" : ""}
                        >
                          {type === "MULTIPLE_CHOICE" ? (
                            <>
                              <FaCheck className="mr-2 text-xs" />
                              Trắc nghiệm {isExistingButEmpty ? "(trống)" : ""}
                            </>
                          ) : type === "MATCHING" ? (
                            <>
                              <FaQuestionCircle className="mr-2 text-xs" />
                              Ghép đôi {isExistingButEmpty ? "(trống)" : ""}
                            </>
                          ) : type === "TRUE_FALSE" ? (
                            <>
                              <FaQuestionCircle className="mr-2 text-xs" />
                              Đúng/Sai (sắp có)
                            </>
                          ) : (
                            <>
                              <FaQuestionCircle className="mr-2 text-xs" />
                              Điền từ (sắp có)
                            </>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!quiz.multiple_choice_quiz && !quiz.matching_quiz && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có câu hỏi
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Quiz này chưa có câu hỏi nào. Bạn có thể thêm câu hỏi để hoàn thiện quiz.
              </p>
              
              {/* Check if quiz types exist */}
              {(!quiz.multiple_choice_quiz && !quiz.matching_quiz) ? (
                // No quiz types exist - show create type button
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Quiz chưa có loại câu hỏi nào
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Tạo loại quiz đầu tiên (Trắc nghiệm hoặc Ghép đôi) để bắt đầu thêm câu hỏi.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsCreateQuizTypeModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <FaPlus />
                    Tạo loại quiz
                  </Button>
                </div>
              ) : (
                // Quiz types exist - show add questions buttons
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    {quiz.multiple_choice_quiz && (
                      <Button 
                        onClick={handleAddMultipleChoiceQuestion} 
                        className="flex items-center gap-2"
                      >
                        <FaCheck />
                        Thêm câu hỏi trắc nghiệm
                      </Button>
                    )}
                    {quiz.matching_quiz && (
                      <Button 
                        onClick={handleAddMatchingQuestion} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FaQuestionCircle />
                        Thêm câu hỏi ghép đôi
                      </Button>
                    )}
                  </div>
                  
                  {/* Show create type button if some types are missing */}
                  {getAvailableQuizTypes().length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Hoặc tạo thêm loại quiz khác:
                      </p>
                      <Button 
                        onClick={() => setIsCreateQuizTypeModalOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FaPlus />
                        Tạo loại quiz mới
                      </Button>
                    </div>
                  )}
                </div>
              )}
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

      {/* Add Matching Modal */}
      <AddMatchingModal
        isOpen={isAddMatchingModalOpen}
        onClose={() => {
          setIsAddMatchingModalOpen(false);
          setSelectedMatchingType(null); // Reset selected type when closing
        }}
        onSubmit={handleAddMatchingQuestions}
        isLoading={isAddingMatchingQuestions}
        presetType={selectedMatchingType}
      />

      {/* Edit Matching Modal (by type) */}
      <EditMatchingModal
        isOpen={isEditMatchingByTypeModalOpen}
        onClose={() => {
          setIsEditMatchingByTypeModalOpen(false);
          setSelectedMatchingType(null); // Reset selected type when closing
          setSelectedQuestionsForEdit([]); // Reset selected questions
        }}
        onSubmit={handleUpdateMatchingQuestions}
        isLoading={isAddingMatchingQuestions} // Use same loading state
        existingQuestions={selectedQuestionsForEdit}
        presetType={selectedMatchingType}
      />

      {/* Edit Matching Quiz Modal */}
      <EditMatchingQuizModal
        isOpen={isEditMatchingModalOpen}
        onClose={() => setIsEditMatchingModalOpen(false)}
        onSubmit={handleUpdateMatchingQuiz}
        matchingQuiz={quiz?.matching_quiz || null}
        isLoading={isUpdatingMatchingQuiz}
      />

      {/* Delete Matching Modal */}
      <DeleteMatchingModal
        isOpen={isDeleteMatchingModalOpen}
        onClose={() => {
          setIsDeleteMatchingModalOpen(false);
          setSelectedQuestionsForDelete([]); // Reset selected questions
        }}
        onSubmit={handleDeleteMatchingQuestions}
        questions={selectedQuestionsForDelete.length > 0 ? selectedQuestionsForDelete : (quiz?.matching_quiz?.questions || [])}
        isLoading={isDeletingMatchingQuestions}
      />

      {/* Create Quiz Type Modal */}
      <CreateQuizTypeModal
        isOpen={isCreateQuizTypeModalOpen}
        onClose={() => setIsCreateQuizTypeModalOpen(false)}
        onSubmit={handleCreateQuizType}
        availableTypes={getAvailableQuizTypes()}
        isLoading={isCreatingQuizType}
      />

      {/* Edit Quiz Modal */}
      <EditQuizModal
        isOpen={isEditQuizModalOpen}
        quiz={quiz}
        onClose={() => {
          setIsEditQuizModalOpen(false);
        }}
        onUpdate={handleUpdateQuiz}
        isUpdating={isUpdatingQuiz}
      />

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

export default QuizDetail;
