import { useState } from "react";
import { FaTimes, FaPlus, FaCheck, FaExchangeAlt, FaToggleOn, FaPen, FaClock, FaExclamationTriangle } from "react-icons/fa";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import type { 
  CreateQuizTypeRequest, 
  CreateMatchingQuestionData, 
  CreateMultipleChoiceQuestionData,
  CreateMultipleChoiceAnswerData 
} from "../../services/quizService";

interface CreateQuizTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizTypeData: CreateQuizTypeRequest) => void;
  availableTypes: ("MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK")[];
  isLoading?: boolean;
}

const CreateQuizTypeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  availableTypes,
  isLoading = false 
}: CreateQuizTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<"MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "">("");
  
  // Warning modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingType, setPendingType] = useState<"MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Matching quiz state
  const [matchingTimeLimit, setMatchingTimeLimit] = useState(60);
  const [matchingQuestions, setMatchingQuestions] = useState<CreateMatchingQuestionData[]>([
    {
      content_a: "",
      type_a: "TEXT",
      content_b: "",
      type_b: "TEXT",
      points: 1
    }
  ]);
  const [matchingPoints, setMatchingPoints] = useState(1);

  // Multiple choice quiz state
  const [mcQuestions, setMcQuestions] = useState<CreateMultipleChoiceQuestionData[]>([
    {
      question_text: "",
      hint: "",
      time_limit: 30,
      allow_multiple_answers: false,
      points: 1,
      answers: [
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false }
      ]
    }
  ]);

  const handleSubmit = () => {
    if (!selectedType) {
      setErrorMessage("Vui lòng chọn loại quiz!");
      setShowErrorModal(true);
      return;
    }

    console.log("=== QUIZ CREATION DEBUG ===");
    console.log("Selected Type:", selectedType);

    if (selectedType === "MATCHING") {
      // Validate matching questions
      const validQuestions = matchingQuestions.filter(q => 
        q.content_a.trim() !== "" && q.content_b.trim() !== ""
      );
      
      console.log("Raw Matching Questions:", matchingQuestions);
      console.log("Valid Matching Questions:", validQuestions);
      console.log("Matching Time Limit:", matchingTimeLimit);
      console.log("Matching Points:", matchingPoints);
      
      if (validQuestions.length === 0) {
        setErrorMessage("Vui lòng nhập ít nhất một cặp ghép hợp lệ!");
        setShowErrorModal(true);
        return;
      }

      // Apply uniform points to all questions
      const questionsWithPoints = validQuestions.map(q => ({
        ...q,
        points: matchingPoints
      }));

      const quizTypeData: CreateQuizTypeRequest = {
        type: "MATCHING",
        data: {
          time_limit: matchingTimeLimit,
          questions: questionsWithPoints
        }
      };
      
      console.log("Final Matching Quiz Data:", JSON.stringify(quizTypeData, null, 2));
      console.log("API CALL - Sending to server:", quizTypeData);
      console.log("API CALL - Data stringified:", JSON.stringify(quizTypeData));
      onSubmit(quizTypeData);
    } else if (selectedType === "MULTIPLE_CHOICE") {
      // Validate multiple choice questions
      const validQuestions = mcQuestions.filter(q => {
        const hasValidText = q.question_text.trim() !== "";
        const hasValidAnswers = q.answers.some(a => a.answer_text.trim() !== "");
        const hasCorrectAnswer = q.answers.some(a => a.correct);
        return hasValidText && hasValidAnswers && hasCorrectAnswer;
      });

      console.log("Raw MC Questions:", mcQuestions);
      console.log("Valid MC Questions:", validQuestions);

      if (validQuestions.length === 0) {
        setErrorMessage("Vui lòng nhập ít nhất một câu hỏi trắc nghiệm hợp lệ!");
        setShowErrorModal(true);
        return;
      }

      const quizTypeData: CreateQuizTypeRequest = {
        type: "MULTIPLE_CHOICE",
        data: {
          questions: validQuestions.map(q => ({
            ...q,
            answers: q.answers.filter(a => a.answer_text.trim() !== "")
          }))
        }
      };
      
      console.log("Final Multiple Choice Quiz Data:", JSON.stringify(quizTypeData, null, 2));
      console.log("API CALL - Sending to server:", quizTypeData);
      console.log("API CALL - Data stringified:", JSON.stringify(quizTypeData));
      onSubmit(quizTypeData);
    }
  };

  const resetForm = () => {
    setSelectedType("");
    setMatchingTimeLimit(60);
    setMatchingPoints(1);
    setMatchingQuestions([{
      content_a: "",
      type_a: "TEXT",
      content_b: "",
      type_b: "TEXT",
      points: 1
    }]);
    setMcQuestions([{
      question_text: "",
      hint: "",
      time_limit: 30,
      allow_multiple_answers: false,
      points: 1,
      answers: [
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false }
      ]
    }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Matching question handlers
  const addMatchingQuestion = () => {
    setMatchingQuestions([...matchingQuestions, {
      content_a: "",
      type_a: "TEXT",
      content_b: "",
      type_b: "TEXT",
      points: matchingPoints
    }]);
  };

  const updateMatchingQuestion = (index: number, field: keyof CreateMatchingQuestionData, value: any) => {
    const updated = [...matchingQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setMatchingQuestions(updated);
  };

  const removeMatchingQuestion = (index: number) => {
    if (matchingQuestions.length > 1) {
      setMatchingQuestions(matchingQuestions.filter((_, i) => i !== index));
    }
  };

  // Apply uniform points to all matching questions
  const applyUniformPoints = (points: number) => {
    setMatchingPoints(points);
    const updated = matchingQuestions.map(q => ({ ...q, points }));
    setMatchingQuestions(updated);
  };

  // Multiple choice question handlers
  const addMcQuestion = () => {
    setMcQuestions([...mcQuestions, {
      question_text: "",
      hint: "",
      time_limit: 30,
      allow_multiple_answers: false,
      points: 1,
      answers: [
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false },
        { answer_text: "", correct: false }
      ]
    }]);
  };

  const updateMcQuestion = (index: number, field: keyof CreateMultipleChoiceQuestionData, value: any) => {
    const updated = [...mcQuestions];
    
    // Special handling for allow_multiple_answers
    if (field === 'allow_multiple_answers' && value === false) {
      const firstCorrectIndex = updated[index].answers.findIndex(a => a.correct);
      updated[index].answers.forEach((answer, answerIndex) => {
        if (answerIndex !== firstCorrectIndex) {
          answer.correct = false;
        }
      });
    }
    
    updated[index] = { ...updated[index], [field]: value };
    setMcQuestions(updated);
  };

  const updateMcAnswer = (questionIndex: number, answerIndex: number, field: keyof CreateMultipleChoiceAnswerData, value: any) => {
    const updated = [...mcQuestions];
    
    if (field === 'correct' && value === true) {
      if (!updated[questionIndex].allow_multiple_answers) {
        updated[questionIndex].answers.forEach((answer, index) => {
          if (index !== answerIndex) {
            answer.correct = false;
          }
        });
      }
    }
    
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value
    };
    setMcQuestions(updated);
  };

  const addMcAnswer = (questionIndex: number) => {
    const updated = [...mcQuestions];
    updated[questionIndex].answers.push({ answer_text: "", correct: false });
    setMcQuestions(updated);
  };

  const removeMcAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...mcQuestions];
    if (updated[questionIndex].answers.length > 2) {
      updated[questionIndex].answers.splice(answerIndex, 1);
      setMcQuestions(updated);
    }
  };

  const removeMcQuestion = (index: number) => {
    if (mcQuestions.length > 1) {
      setMcQuestions(mcQuestions.filter((_, i) => i !== index));
    }
  };

  // Check if user has entered data
  const hasMatchingData = () => {
    return matchingQuestions.some(q => q.content_a.trim() !== "" || q.content_b.trim() !== "");
  };

  const hasMultipleChoiceData = () => {
    return mcQuestions.some(q => 
      q.question_text.trim() !== "" || 
      q.hint?.trim() !== "" || 
      q.answers.some(a => a.answer_text.trim() !== "")
    );
  };

  const handleTypeChange = (newType: "MATCHING" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK") => {
    if (selectedType && selectedType !== newType) {
      let hasData = false;
      
      if (selectedType === "MATCHING" && hasMatchingData()) {
        hasData = true;
      } else if (selectedType === "MULTIPLE_CHOICE" && hasMultipleChoiceData()) {
        hasData = true;
      }
      
      if (hasData) {
        setPendingType(newType);
        setShowWarningModal(true);
        return;
      }
      
      // Reset form data when changing type
      resetForm();
    }
    
    setSelectedType(newType);
  };

  const handleConfirmTypeChange = () => {
    if (pendingType) {
      resetForm();
      setSelectedType(pendingType);
    }
    setShowWarningModal(false);
    setPendingType(null);
  };

  const handleCancelTypeChange = () => {
    setShowWarningModal(false);
    setPendingType(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaPlus className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tạo loại quiz mới
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chọn loại quiz và tạo câu hỏi đầu tiên
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Type Selection - Always at top */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Chọn loại quiz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTypes.includes("MULTIPLE_CHOICE") && (
                <button
                  onClick={() => handleTypeChange("MULTIPLE_CHOICE")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedType === "MULTIPLE_CHOICE"
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaCheck className="text-blue-500 text-xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Trắc nghiệm
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    Tạo câu hỏi với nhiều lựa chọn đáp án. Học sinh chọn đáp án đúng từ các tùy chọn cho sẵn.
                  </p>
                </button>
              )}
              
              {availableTypes.includes("MATCHING") && (
                <button
                  onClick={() => handleTypeChange("MATCHING")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedType === "MATCHING"
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaExchangeAlt className="text-green-500 text-xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ghép đôi
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    Tạo các cặp nội dung để học sinh ghép với nhau. Phù hợp cho việc liên kết khái niệm.
                  </p>
                </button>
              )}

              {availableTypes.includes("TRUE_FALSE") && (
                <button
                  disabled
                  className="p-6 border-2 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-75"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaToggleOn className="text-yellow-500 text-xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Đúng/Sai
                    </h4>
                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                      Đang phát triển
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    Tạo câu hỏi với hai lựa chọn: Đúng hoặc Sai. Đơn giản và hiệu quả cho việc kiểm tra kiến thức cơ bản.
                  </p>
                </button>
              )}

              {availableTypes.includes("FILL_IN_BLANK") && (
                <button
                  disabled
                  className="p-6 border-2 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-75"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaPen className="text-purple-500 text-xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Điền từ
                    </h4>
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                      Đang phát triển
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    Tạo câu hỏi với chỗ trống để học sinh điền từ. Phù hợp cho việc kiểm tra từ vựng và kiến thức cụ thể.
                  </p>
                </button>
              )}
            </div>
          </div>

          {/* Quiz Type Content - Show only when type is selected */}
          {selectedType === "MATCHING" && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                  Cài đặt quiz ghép đôi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Thời gian (giây)"
                    type="number"
                    value={matchingTimeLimit}
                    onChange={(e) => setMatchingTimeLimit(parseInt(e.target.value) || 60)}
                    min={30}
                    max={600}
                  />
                  <InputField
                    label="Điểm cho mỗi cặp (áp dụng đồng loạt)"
                    type="number"
                    value={matchingPoints}
                    onChange={(e) => applyUniformPoints(parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cặp ghép đôi
                </h3>
                
                <div className="space-y-4">
                  {matchingQuestions.map((question, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Cặp {index + 1}
                        </h4>
                        {matchingQuestions.length > 1 && (
                          <button
                            onClick={() => removeMatchingQuestion(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                            Nội dung A
                          </label>
                          <textarea
                            value={question.content_a}
                            onChange={(e) => updateMatchingQuestion(index, 'content_a', e.target.value)}
                            placeholder="Nhập nội dung A..."
                            className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                            Nội dung B
                          </label>
                          <textarea
                            value={question.content_b}
                            onChange={(e) => updateMatchingQuestion(index, 'content_b', e.target.value)}
                            placeholder="Nhập nội dung B..."
                            className="w-full px-3 py-2 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                          {matchingPoints} điểm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={addMatchingQuestion}
                    className="flex items-center gap-2"
                  >
                    <FaPlus />
                    Thêm cặp
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedType === "MULTIPLE_CHOICE" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Cài đặt quiz trắc nghiệm
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tạo câu hỏi trắc nghiệm với nhiều lựa chọn đáp án. Mỗi câu hỏi có thể có thời gian và điểm số riêng.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Câu hỏi trắc nghiệm
                </h3>
                
                <div className="space-y-6">
                  {mcQuestions.map((question, questionIndex) => (
                    <div key={questionIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Câu hỏi {questionIndex + 1}
                        </h4>
                        {mcQuestions.length > 1 && (
                          <button
                            onClick={() => removeMcQuestion(questionIndex)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <InputField
                          label="Nội dung câu hỏi"
                          type="text"
                          value={question.question_text}
                          onChange={(e) => updateMcQuestion(questionIndex, 'question_text', e.target.value)}
                          placeholder="Nhập nội dung câu hỏi..."
                          required
                        />
                        
                        <InputField
                          label="Gợi ý (tùy chọn)"
                          type="text"
                          value={question.hint || ""}
                          onChange={(e) => updateMcQuestion(questionIndex, 'hint', e.target.value)}
                          placeholder="Nhập gợi ý cho học sinh..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InputField
                            label="Thời gian (giây)"
                            type="number"
                            value={question.time_limit}
                            onChange={(e) => updateMcQuestion(questionIndex, 'time_limit', parseInt(e.target.value) || 30)}
                            min={10}
                            max={300}
                          />
                          <InputField
                            label="Điểm số"
                            type="number"
                            value={question.points}
                            onChange={(e) => updateMcQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                            min={1}
                            max={100}
                          />
                          <div className="flex items-center">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <input
                                type="checkbox"
                                checked={question.allow_multiple_answers}
                                onChange={(e) => updateMcQuestion(questionIndex, 'allow_multiple_answers', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Cho phép chọn nhiều đáp án
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Các đáp án
                            </label>
                            <button
                              onClick={() => addMcAnswer(questionIndex)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <FaPlus className="text-xs" />
                              Thêm đáp án
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {question.answers.map((answer, answerIndex) => (
                              <div key={answerIndex} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => updateMcAnswer(questionIndex, answerIndex, 'correct', !answer.correct)}
                                  className={`flex-shrink-0 w-6 h-6 ${
                                    question.allow_multiple_answers ? 'rounded' : 'rounded-full'
                                  } border-2 flex items-center justify-center transition-all ${
                                    answer.correct 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'bg-gray-200 border-gray-300 dark:bg-gray-600 dark:border-gray-500 hover:border-green-400'
                                  }`}
                                >
                                  {answer.correct && (
                                    question.allow_multiple_answers 
                                      ? <FaCheck className="text-xs" />
                                      : <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </button>
                                
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                                  {String.fromCharCode(65 + answerIndex)}.
                                </span>
                                
                                <input
                                  type="text"
                                  value={answer.answer_text}
                                  onChange={(e) => updateMcAnswer(questionIndex, answerIndex, 'answer_text', e.target.value)}
                                  placeholder="Nhập nội dung đáp án..."
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                
                                {question.answers.length > 2 && (
                                  <button
                                    onClick={() => removeMcAnswer(questionIndex, answerIndex)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <FaTimes className="text-sm" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={addMcQuestion}
                    className="flex items-center gap-2"
                  >
                    <FaPlus />
                    Thêm câu hỏi
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedType === "MATCHING" && (
              <span>Sẽ tạo {matchingQuestions.filter(q => q.content_a.trim() && q.content_b.trim()).length} cặp ghép</span>
            )}
            {selectedType === "MULTIPLE_CHOICE" && (
              <span>Sẽ tạo {mcQuestions.filter(q => q.question_text.trim() && q.answers.some(a => a.correct)).length} câu hỏi</span>
            )}
            {selectedType === "TRUE_FALSE" && (
              <span className="text-yellow-600 dark:text-yellow-400">Tính năng đang phát triển - sẽ sớm ra mắt!</span>
            )}
            {selectedType === "FILL_IN_BLANK" && (
              <span className="text-purple-600 dark:text-purple-400">Tính năng đang phát triển - sẽ sớm ra mắt!</span>
            )}
            {!selectedType && <span>Chọn loại quiz để bắt đầu</span>}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !selectedType || (selectedType === "TRUE_FALSE" || selectedType === "FILL_IN_BLANK")}
              className="px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tạo...
                </div>
              ) : (selectedType === "TRUE_FALSE" || selectedType === "FILL_IN_BLANK") ? (
                <div className="flex items-center gap-2">
                  <FaClock />
                  Đang phát triển
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FaPlus />
                  Tạo loại quiz
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            {/* Warning Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Cảnh báo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dữ liệu sẽ bị mất
                </p>
              </div>
            </div>

            {/* Warning Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Bạn đã nhập dữ liệu cho loại quiz hiện tại. Chuyển sang loại khác sẽ <strong>xóa toàn bộ dữ liệu</strong> đã nhập. 
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Bạn có chắc chắn muốn tiếp tục?
              </p>
            </div>

            {/* Warning Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Button
                variant="secondary"
                onClick={handleCancelTypeChange}
                className="px-4"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmTypeChange}
                className="px-4 bg-yellow-500 hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600"
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            {/* Error Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <FaTimes className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Lỗi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vui lòng kiểm tra lại
                </p>
              </div>
            </div>

            {/* Error Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                {errorMessage}
              </p>
            </div>

            {/* Error Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Button
                variant="primary"
                onClick={() => setShowErrorModal(false)}
                className="px-6"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuizTypeModal;
