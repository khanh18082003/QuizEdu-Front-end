import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import Toast from "../../components/ui/Toast";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { 
  createQuizWithFormData,
  type CreateMultipleChoiceQuestion,
  type CreateMatchingQuestion,
  type CreateFillInBlankQuestion,
  type CreateTrueFalseQuestion
} from "../../services/quizService";
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
  FaClipboardList,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle
} from "react-icons/fa";

// Extended interface to support file uploads and grouped matching
interface CreateMatchingQuestionWithFile extends CreateMatchingQuestion {
  file_a?: File;
  file_b?: File;
}

// Interface for matching groups
interface MatchingGroup {
  id: string;
  type_combination: string; // "TEXT-TEXT", "TEXT-IMAGE", "IMAGE-TEXT", "IMAGE-IMAGE"
  points_per_pair: number;
  questions: CreateMatchingQuestionWithFile[];
}

type QuizType = "multiple_choice" | "matching" | "fill_in_blank" | "true_false";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<QuizType | "basic">("basic");
  
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

  // Basic quiz info
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    description: "",
    is_active: true,
    is_public: false,
  });

  // Multiple Choice Questions
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState<CreateMultipleChoiceQuestion[]>([]);
  
  // Matching Questions organized by groups
  const [matchingGroups, setMatchingGroups] = useState<MatchingGroup[]>([]);
  const [matchingTimeLimit, setMatchingTimeLimit] = useState(60);
  
  // Fill in Blank Questions (for future development)
  const [fillInBlankQuestions, _setFillInBlankQuestions] = useState<CreateFillInBlankQuestion[]>([]);
  
  // True/False Questions (for future development)
  const [trueFalseQuestions, _setTrueFalseQuestions] = useState<CreateTrueFalseQuestion[]>([]);

  const handleInputChange = (field: string, value: any) => {
    setBasicInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Multiple Choice Functions
  const addMultipleChoiceQuestion = () => {
    const newQuestion: CreateMultipleChoiceQuestion = {
      question_text: "",
      hint: "",
      time_limit: 30,
      allow_multiple_answers: false,
      points: 1,
      answers: [
        { answer_text: "", correct: true },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false }
      ]
    };
    setMultipleChoiceQuestions([...multipleChoiceQuestions, newQuestion]);
  };

  const updateMultipleChoiceQuestion = (index: number, field: string, value: any) => {
    const updated = [...multipleChoiceQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setMultipleChoiceQuestions(updated);
  };

  const updateMultipleChoiceAnswer = (questionIndex: number, answerIndex: number, field: string, value: any) => {
    const updated = [...multipleChoiceQuestions];
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value
    };
    setMultipleChoiceQuestions(updated);
  };

  const addAnswerToMultipleChoice = (questionIndex: number) => {
    const updated = [...multipleChoiceQuestions];
    updated[questionIndex].answers.push({ answer_text: "", correct: false });
    setMultipleChoiceQuestions(updated);
  };

  const removeAnswerFromMultipleChoice = (questionIndex: number, answerIndex: number) => {
    const updated = [...multipleChoiceQuestions];
    if (updated[questionIndex].answers.length > 2) { // Keep at least 2 answers
      updated[questionIndex].answers.splice(answerIndex, 1);
      setMultipleChoiceQuestions(updated);
    }
  };

  const removeMultipleChoiceQuestion = (index: number) => {
    setMultipleChoiceQuestions(multipleChoiceQuestions.filter((_, i) => i !== index));
  };

  // Matching Functions
  const addMatchingGroup = (typeCombination: string) => {
    const newGroup: MatchingGroup = {
      id: `group_${Date.now()}`,
      type_combination: typeCombination,
      points_per_pair: 1,
      questions: []
    };
    
    // Add minimum 2 empty questions
    for (let i = 0; i < 2; i++) {
      const [typeA, typeB] = typeCombination.split('-');
      newGroup.questions.push({
        content_a: "",
        type_a: typeA as "TEXT" | "IMAGE",
        content_b: "",
        type_b: typeB as "TEXT" | "IMAGE", 
        points: 1,
        file_a: undefined,
        file_b: undefined
      });
    }
    
    setMatchingGroups([...matchingGroups, newGroup]);
  };

  const updateMatchingGroup = (groupId: string, field: string, value: any) => {
    setMatchingGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, [field]: value } : group
    ));
  };

  const addQuestionToGroup = (groupId: string) => {
    setMatchingGroups(prev => prev.map(group => {
      if (group.id === groupId && group.questions.length < 5) {
        const [typeA, typeB] = group.type_combination.split('-');
        const newQuestion: CreateMatchingQuestionWithFile = {
          content_a: "",
          type_a: typeA as "TEXT" | "IMAGE",
          content_b: "",
          type_b: typeB as "TEXT" | "IMAGE",
          points: group.points_per_pair,
          file_a: undefined,
          file_b: undefined
        };
        return { ...group, questions: [...group.questions, newQuestion] };
      }
      return group;
    }));
  };

  const removeQuestionFromGroup = (groupId: string, questionIndex: number) => {
    setMatchingGroups(prev => prev.map(group => {
      if (group.id === groupId && group.questions.length > 2) {
        const updatedQuestions = group.questions.filter((_, index) => index !== questionIndex);
        return { ...group, questions: updatedQuestions };
      }
      return group;
    }));
  };

  const updateQuestionInGroup = (groupId: string, questionIndex: number, field: string, value: any) => {
    setMatchingGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const updatedQuestions = group.questions.map((question, index) =>
          index === questionIndex ? { ...question, [field]: value } : question
        );
        return { ...group, questions: updatedQuestions };
      }
      return group;
    }));
  };

  const handleGroupFileUpload = (groupId: string, questionIndex: number, field: 'file_a' | 'file_b', file: File | null) => {
    setMatchingGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const updatedQuestions = group.questions.map((question, index) => {
          if (index === questionIndex) {
            const updatedQuestion = { ...question, [field]: file };
            // Clear corresponding content when file is selected
            if (file) {
              const contentField = field === 'file_a' ? 'content_a' : 'content_b';
              updatedQuestion[contentField] = '';
            }
            return updatedQuestion;
          }
          return question;
        });
        return { ...group, questions: updatedQuestions };
      }
      return group;
    }));
  };

  const clearGroupFile = (groupId: string, questionIndex: number, field: 'file_a' | 'file_b') => {
    setMatchingGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const updatedQuestions = group.questions.map((question, index) =>
          index === questionIndex ? { ...question, [field]: undefined } : question
        );
        return { ...group, questions: updatedQuestions };
      }
      return group;
    }));
  };

  const removeMatchingGroup = (groupId: string) => {
    setMatchingGroups(matchingGroups.filter(group => group.id !== groupId));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate basic info
      if (!basicInfo.name.trim() || !basicInfo.description.trim()) {
        showToast("Vui lòng điền đầy đủ thông tin cơ bản", "error");
        setActiveTab("basic");
        return;
      }

      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add basic info
      formData.append('name', basicInfo.name);
      formData.append('description', basicInfo.description);
      formData.append('isActive', basicInfo.is_active.toString());
      formData.append("isPublic", basicInfo.is_public.toString());

      // Add multiple choice questions if they exist
      if (multipleChoiceQuestions.length > 0) {
        multipleChoiceQuestions.forEach((question, qIndex) => {
          formData.append(`multipleChoiceQuiz.questions[${qIndex}].questionText`, question.question_text);
          formData.append(`multipleChoiceQuiz.questions[${qIndex}].hint`, question.hint);
          formData.append(`multipleChoiceQuiz.questions[${qIndex}].timeLimit`, question.time_limit.toString());
          formData.append(`multipleChoiceQuiz.questions[${qIndex}].allowMultipleAnswers`, question.allow_multiple_answers.toString());
          formData.append(`multipleChoiceQuiz.questions[${qIndex}].points`, question.points.toString());
          
          question.answers.forEach((answer, aIndex) => {
            formData.append(`multipleChoiceQuiz.questions[${qIndex}].answers[${aIndex}].answerText`, answer.answer_text);
            formData.append(`multipleChoiceQuiz.questions[${qIndex}].answers[${aIndex}].correct`, answer.correct.toString());
          });
        });
      }

      // Add matching questions if they exist
      if (matchingGroups.length > 0) {
        formData.append('matchingQuiz.timeLimit', matchingTimeLimit.toString());
        
        let questionIndex = 0;
        matchingGroups.forEach((group) => {
          group.questions.forEach((question) => {
            formData.append(`matchingQuiz.questions[${questionIndex}].points`, group.points_per_pair.toString());
            
            // Handle side A
            if (question.file_a) {
              formData.append(`matchingQuiz.questions[${questionIndex}].fileContentA`, question.file_a);
              formData.append(`matchingQuiz.questions[${questionIndex}].typeA`, 'IMAGE');
            } else if (question.content_a) {
              formData.append(`matchingQuiz.questions[${questionIndex}].contentA`, question.content_a);
              formData.append(`matchingQuiz.questions[${questionIndex}].typeA`, 'TEXT');
            }

            // Handle side B
            if (question.file_b) {
              formData.append(`matchingQuiz.questions[${questionIndex}].fileContentB`, question.file_b);
              formData.append(`matchingQuiz.questions[${questionIndex}].typeB`, 'IMAGE');
            } else if (question.content_b) {
              formData.append(`matchingQuiz.questions[${questionIndex}].contentB`, question.content_b);
              formData.append(`matchingQuiz.questions[${questionIndex}].typeB`, 'TEXT');
            }
            
            questionIndex++;
          });
        });
      }

      // TODO: Replace with actual FormData API call
      // For now, we'll use the existing API but this should be updated to handle FormData
      console.log('FormData to be sent:');
      console.log('Basic info state:', basicInfo);
      console.log('is_public value:', basicInfo.is_public);
      console.log('is_public type:', typeof basicInfo.is_public);
      
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `[FILE: ${value.name}]` : value}`);
      }

      // Use the new FormData API
      await createQuizWithFormData(formData);
      showToast("Tạo quiz thành công! Bạn có thể thêm câu hỏi sau.", "success");
      
      // Navigate back to quiz management after a delay
      setTimeout(() => {
        navigate("/teacher/quizzes");
      }, 1500);

    } catch (error) {
      console.error("Error creating quiz:", error);
      showToast("Có lỗi xảy ra khi tạo quiz", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalQuestions = () => {
    const matchingQuestionsCount = matchingGroups.reduce((total, group) => total + group.questions.length, 0);
    return multipleChoiceQuestions.length + 
           matchingQuestionsCount + 
           fillInBlankQuestions.length + 
           trueFalseQuestions.length;
  };

  const calculateTotalPoints = () => {
    const mcPoints = multipleChoiceQuestions.reduce((sum, q) => sum + q.points, 0);
    const matchingPoints = matchingGroups.reduce((sum, group) => 
      sum + (group.questions.length * group.points_per_pair), 0);
    const fillPoints = fillInBlankQuestions.reduce((sum, q) => sum + q.points, 0);
    const tfPoints = trueFalseQuestions.reduce((sum, q) => sum + q.points, 0);
    return mcPoints + matchingPoints + fillPoints + tfPoints;
  };

  if (isLoading) {
    return <LoadingOverlay show={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/teacher/quizzes")}
                className="flex items-center gap-2"
              >
                <FaArrowLeft />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Tạo Quiz Mới
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {calculateTotalQuestions()} câu hỏi • {calculateTotalPoints()} điểm
                  {calculateTotalQuestions() === 0 && " • Có thể thêm câu hỏi sau"}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSubmit}
              className="flex items-center gap-2"
              disabled={!basicInfo.name.trim() || !basicInfo.description.trim()}
            >
              <FaSave />
              Lưu Quiz
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaClipboardList />
                Thông tin cơ bản
              </div>
            </button>
            <button
              onClick={() => setActiveTab("multiple_choice")}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${
                activeTab === "multiple_choice"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCheck />
                Trắc nghiệm ({multipleChoiceQuestions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("matching")}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${
                activeTab === "matching"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaQuestionCircle />
                Ghép đôi ({matchingGroups.reduce((total, group) => total + group.questions.length, 0)})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("fill_in_blank")}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${
                activeTab === "fill_in_blank"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaExclamationTriangle />
                Điền từ ({fillInBlankQuestions.length}) - Đang phát triển
              </div>
            </button>
            <button
              onClick={() => setActiveTab("true_false")}
              className={`px-6 py-4 whitespace-nowrap font-medium text-sm border-b-2 transition-colors ${
                activeTab === "true_false"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaToggleOn />
                Đúng/Sai ({trueFalseQuestions.length}) - Đang phát triển
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Thông tin cơ bản
              </h3>
              
              <InputField
                label="Tên Quiz"
                type="text"
                value={basicInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên quiz..."
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={basicInfo.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Nhập mô tả quiz..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái hoạt động
                </label>
                <button
                  type="button"
                  onClick={() => handleInputChange("is_active", !basicInfo.is_active)}
                  className="flex items-center gap-2"
                >
                  {basicInfo.is_active ? (
                    <FaToggleOn className="text-2xl text-green-500" />
                  ) : (
                    <FaToggleOff className="text-2xl text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {basicInfo.is_active ? "Hoạt động" : "Tạm dừng"}
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chế độ công khai
                </label>
                <button
                  type="button"
                  onClick={() => handleInputChange("is_public", !basicInfo.is_public)}
                  className="flex items-center gap-2"
                >
                  {basicInfo.is_public ? (
                    <FaToggleOn className="text-2xl text-blue-500" />
                  ) : (
                    <FaToggleOff className="text-2xl text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {basicInfo.is_public ? "Công khai" : "Riêng tư"}
                  </span>
                </button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaQuestionCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Thông tin về câu hỏi
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Bạn có thể tạo quiz chỉ với thông tin cơ bản và thêm câu hỏi sau khi lưu. 
                      Sử dụng các tab bên trên để thêm câu hỏi trắc nghiệm, ghép đôi hoặc các loại khác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "multiple_choice" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Câu hỏi trắc nghiệm ({multipleChoiceQuestions.length})
                </h3>
                <Button onClick={addMultipleChoiceQuestion} className="flex items-center gap-2">
                  <FaPlus />
                  Thêm câu hỏi
                </Button>
              </div>

              {multipleChoiceQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaQuestionCircle className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Chưa có câu hỏi trắc nghiệm nào</p>
                  <p className="text-sm">Nhấn "Thêm câu hỏi" để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {multipleChoiceQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                          Câu hỏi {qIndex + 1}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                            {question.points} điểm
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {question.time_limit}s
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMultipleChoiceQuestion(qIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Xóa câu hỏi"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <InputField
                            label="Câu hỏi"
                            type="text"
                            value={question.question_text}
                            onChange={(e) => updateMultipleChoiceQuestion(qIndex, "question_text", e.target.value)}
                            placeholder="Nhập câu hỏi..."
                          />
                        </div>
                        <InputField
                          label="Gợi ý"
                          type="text"
                          value={question.hint}
                          onChange={(e) => updateMultipleChoiceQuestion(qIndex, "hint", e.target.value)}
                          placeholder="Nhập gợi ý..."
                        />
                        <InputField
                          label="Thời gian (giây)"
                          type="number"
                          value={question.time_limit}
                          onChange={(e) => updateMultipleChoiceQuestion(qIndex, "time_limit", parseInt(e.target.value) || 30)}
                          min="10"
                          max="300"
                        />
                        <InputField
                          label="Điểm"
                          type="number"
                          value={question.points}
                          onChange={(e) => updateMultipleChoiceQuestion(qIndex, "points", parseInt(e.target.value) || 1)}
                          min="1"
                          max="20"
                        />
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nhiều đáp án đúng
                          </label>
                          <button
                            type="button"
                            onClick={() => updateMultipleChoiceQuestion(qIndex, "allow_multiple_answers", !question.allow_multiple_answers)}
                            className="flex items-center gap-2"
                          >
                            {question.allow_multiple_answers ? (
                              <FaToggleOn className="text-xl text-green-500" />
                            ) : (
                              <FaToggleOff className="text-xl text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Các đáp án
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addAnswerToMultipleChoice(qIndex)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <FaPlus className="text-xs" />
                            Thêm đáp án
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {question.answers.map((answer, aIndex) => (
                            <div key={aIndex} className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateMultipleChoiceAnswer(qIndex, aIndex, "correct", !answer.correct)}
                                className="flex-shrink-0"
                                title={answer.correct ? "Đáp án đúng" : "Đáp án sai"}
                              >
                                {answer.correct ? (
                                  <FaCheck className="text-green-500" />
                                ) : (
                                  <FaTimes className="text-gray-400" />
                                )}
                              </button>
                              <span className="flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <input
                                type="text"
                                value={answer.answer_text}
                                onChange={(e) => updateMultipleChoiceAnswer(qIndex, aIndex, "answer_text", e.target.value)}
                                placeholder={`Đáp án ${String.fromCharCode(65 + aIndex)}...`}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                              {question.answers.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeAnswerFromMultipleChoice(qIndex, aIndex)}
                                  className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Xóa đáp án"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "matching" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Câu hỏi ghép đôi ({matchingGroups.reduce((total, group) => total + group.questions.length, 0)} cặp)
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    onChange={(e) => {
                      if (e.target.value) {
                        addMatchingGroup(e.target.value);
                        e.target.value = ""; // Reset dropdown
                      }
                    }}
                    value=""
                  >
                    <option value="">Chọn loại ghép đôi...</option>
                    <option value="TEXT-TEXT">📝 Text - Text</option>
                    <option value="TEXT-IMAGE">📝🖼️ Text - Image</option>
                    <option value="IMAGE-TEXT">🖼️📝 Image - Text</option>
                    <option value="IMAGE-IMAGE">🖼️ Image - Image</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="Thời gian cho toàn bộ bài (giây)"
                  type="number"
                  value={matchingTimeLimit}
                  onChange={(e) => setMatchingTimeLimit(parseInt(e.target.value) || 60)}
                  min="30"
                  max="600"
                />
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaQuestionCircle />
                  <span>Thời gian áp dụng cho toàn bộ phần ghép đôi</span>
                </div>
              </div>

              {matchingGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaQuestionCircle className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Chưa có nhóm ghép đôi nào</p>
                  <p className="text-sm">Chọn loại ghép đôi từ dropdown để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {matchingGroups.map((group) => {
                    const typeConfig = {
                      'TEXT-TEXT': { icon: '📝', label: 'Text - Text', color: 'blue' },
                      'TEXT-IMAGE': { icon: '📝🖼️', label: 'Text - Image', color: 'purple' },
                      'IMAGE-TEXT': { icon: '🖼️📝', label: 'Image - Text', color: 'indigo' },
                      'IMAGE-IMAGE': { icon: '🖼️', label: 'Image - Image', color: 'pink' }
                    }[group.type_combination] || { icon: '❓', label: group.type_combination, color: 'gray' };

                    return (
                      <div key={group.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/30">
                        {/* Group Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{typeConfig.icon}</span>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                                {typeConfig.label}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {group.questions.length} cặp • {group.points_per_pair} điểm/cặp
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <InputField
                              label=""
                              type="number"
                              value={group.points_per_pair}
                              onChange={(e) => updateMatchingGroup(group.id, 'points_per_pair', parseInt(e.target.value) || 1)}
                              min="1"
                              max="10"
                              placeholder="Điểm/cặp"
                              className="w-20"
                            />
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => removeMatchingGroup(group.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Xóa nhóm"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>

                        {/* Questions in Group */}
                        <div className="space-y-4">
                          {group.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="border border-gray-300 dark:border-gray-500 rounded-lg p-4 bg-white dark:bg-gray-800">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                  Cặp {questionIndex + 1}
                                </h5>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addQuestionToGroup(group.id)}
                                    disabled={group.questions.length >= 5}
                                    className="text-green-600 hover:text-green-700 text-xs"
                                    title="Thêm cặp"
                                  >
                                    <FaPlus />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm" 
                                    onClick={() => removeQuestionFromGroup(group.id, questionIndex)}
                                    disabled={group.questions.length <= 2}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                    title="Xóa cặp"
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Side A */}
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nội dung A ({question.type_a})
                                  </label>
                                  
                                  {question.type_a === "TEXT" ? (
                                    <input
                                      type="text"
                                      value={question.content_a}
                                      onChange={(e) => updateQuestionInGroup(group.id, questionIndex, "content_a", e.target.value)}
                                      placeholder="Nhập nội dung A..."
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                  ) : (
                                    <div className="space-y-2">
                                      {question.file_a ? (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                          <span className="text-sm text-green-700 dark:text-green-300 truncate">
                                            {question.file_a.name}
                                          </span>
                                          <button
                                            onClick={() => clearGroupFile(group.id, questionIndex, 'file_a')}
                                            className="text-red-500 hover:text-red-700"
                                            title="Xóa file"
                                          >
                                            <FaTimes className="text-xs" />
                                          </button>
                                        </div>
                                      ) : (
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleGroupFileUpload(group.id, questionIndex, 'file_a', e.target.files?.[0] || null)}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Side B */}
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nội dung B ({question.type_b})
                                  </label>
                                  
                                  {question.type_b === "TEXT" ? (
                                    <input
                                      type="text"
                                      value={question.content_b}
                                      onChange={(e) => updateQuestionInGroup(group.id, questionIndex, "content_b", e.target.value)}
                                      placeholder="Nhập nội dung B..."
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                  ) : (
                                    <div className="space-y-2">
                                      {question.file_b ? (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                          <span className="text-sm text-green-700 dark:text-green-300 truncate">
                                            {question.file_b.name}
                                          </span>
                                          <button
                                            onClick={() => clearGroupFile(group.id, questionIndex, 'file_b')}
                                            className="text-red-500 hover:text-red-700"
                                            title="Xóa file"
                                          >
                                            <FaTimes className="text-xs" />
                                          </button>
                                        </div>
                                      ) : (
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleGroupFileUpload(group.id, questionIndex, 'file_b', e.target.files?.[0] || null)}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add/Remove Questions Info */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            📋 Mỗi nhóm có từ 2-5 cặp. Hiện tại: {group.questions.length}/5 cặp
                            {group.questions.length < 5 && " • Có thể thêm cặp mới"}
                            {group.questions.length > 2 && " • Có thể xóa cặp"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "fill_in_blank" && (
            <div className="text-center py-12">
              <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tính năng đang được phát triển
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chức năng tạo câu hỏi điền từ sẽ được bổ sung trong phiên bản tiếp theo
              </p>
            </div>
          )}

          {activeTab === "true_false" && (
            <div className="text-center py-12">
              <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tính năng đang được phát triển
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chức năng tạo câu hỏi đúng/sai sẽ được bổ sung trong phiên bản tiếp theo
              </p>
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

export default CreateQuiz;
