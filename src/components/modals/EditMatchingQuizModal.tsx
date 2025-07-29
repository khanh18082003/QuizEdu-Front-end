import { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaEdit } from "react-icons/fa";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import type { 
  UpdateMatchingQuizRequest, 
  UpdateMatchingQuestion,
  MatchingQuiz
} from "../../services/quizService";

interface EditMatchingQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizData: UpdateMatchingQuizRequest) => void;
  matchingQuiz: MatchingQuiz | null;
  isLoading?: boolean;
}

const EditMatchingQuizModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  matchingQuiz,
  isLoading = false 
}: EditMatchingQuizModalProps) => {
  const [timeLimit, setTimeLimit] = useState(60);
  const [questions, setQuestions] = useState<UpdateMatchingQuestion[]>([]);
  const [uniformPoints, setUniformPoints] = useState(1);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize data when modal opens or quiz data changes
  useEffect(() => {
    if (isOpen && matchingQuiz) {
      setTimeLimit(matchingQuiz.time_limit);
      
      // Convert MatchingQuestion to UpdateMatchingQuestion format
      const convertedQuestions: UpdateMatchingQuestion[] = matchingQuiz.questions.map(q => ({
        id: q.id,
        content_a: q.item_a.content,
        type_a: q.item_a.matching_type,
        content_b: q.item_b.content,
        type_b: q.item_b.matching_type,
        points: q.points
      }));
      
      setQuestions(convertedQuestions);
      
      // Set uniform points from first question
      if (convertedQuestions.length > 0) {
        setUniformPoints(convertedQuestions[0].points);
      }
    }
  }, [isOpen, matchingQuiz]);

  const handleSubmit = () => {
    console.log("=== MATCHING QUIZ UPDATE DEBUG ===");
    console.log("Time Limit:", timeLimit);
    console.log("Questions:", questions);
    
    // Validate questions
    const validQuestions = questions.filter(q => 
      q.content_a.trim() !== "" && q.content_b.trim() !== ""
    );
    
    console.log("Valid Questions:", validQuestions);
    
    if (validQuestions.length === 0) {
      setErrorMessage("Vui lòng nhập ít nhất một cặp ghép hợp lệ!");
      setShowErrorModal(true);
      return;
    }

    const quizData: UpdateMatchingQuizRequest = {
      time_limit: timeLimit,
      questions: validQuestions
    };
    
    console.log("Final Update Data:", JSON.stringify(quizData, null, 2));
    console.log("API CALL - Updating matching quiz:", quizData);
    console.log("API CALL - Data stringified:", JSON.stringify(quizData));
    
    onSubmit(quizData);
  };

  const handleClose = () => {
    onClose();
  };

  // Question handlers
  const updateQuestion = (index: number, field: keyof UpdateMatchingQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Apply uniform points to all questions
  const applyUniformPoints = (points: number) => {
    setUniformPoints(points);
    const updated = questions.map(q => ({ ...q, points }));
    setQuestions(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FaEdit className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Chỉnh sửa quiz ghép đôi
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cập nhật câu hỏi và cài đặt quiz ghép đôi
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
          {/* Settings */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              Cài đặt quiz ghép đôi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Thời gian (giây)"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                min={30}
                max={600}
              />
              <InputField
                label="Điểm cho mỗi cặp (áp dụng đồng loạt)"
                type="number"
                value={uniformPoints}
                onChange={(e) => applyUniformPoints(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
              />
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cặp ghép đôi
            </h3>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Cặp {index + 1} 
                    </h4>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(index)}
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
                        onChange={(e) => updateQuestion(index, 'content_a', e.target.value)}
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
                        onChange={(e) => updateQuestion(index, 'content_b', e.target.value)}
                        placeholder="Nhập nội dung B..."
                        className="w-full px-3 py-2 border border-purple-200 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                      {question.points} điểm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span>Sẽ cập nhật {questions.filter(q => q.content_a.trim() && q.content_b.trim()).length} cặp ghép</span>
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
              disabled={isLoading}
              className="px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang cập nhật...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FaCheck />
                  Cập nhật quiz
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

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

export default EditMatchingQuizModal;
