import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import type { UpdateMatchingQuestionByType, MatchingQuestion } from "../../services/quizService";

interface EditMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questions: UpdateMatchingQuestionByType[]) => void;
  isLoading?: boolean;
  existingQuestions: MatchingQuestion[];
  presetType?: {
    typeA: 'TEXT' | 'IMAGE';
    typeB: 'TEXT' | 'IMAGE';
    points: number;
    minRequired: number;
  } | null;
}

const EditMatchingModal: React.FC<EditMatchingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  existingQuestions,
  presetType = null,
}) => {
  const [questions, setQuestions] = useState<UpdateMatchingQuestionByType[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [expandedQuestions, setExpandedQuestions] = useState<{ [key: number]: boolean }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Convert existing questions to editable format
      const editableQuestions = existingQuestions.map(q => ({
        id: q.id,
        content_a: q.item_a.matching_type === 'TEXT' ? q.item_a.content : '',
        type_a: q.item_a.matching_type,
        content_b: q.item_b.matching_type === 'TEXT' ? q.item_b.content : '',
        type_b: q.item_b.matching_type,
        points: q.points,
      }));
      
      setQuestions(editableQuestions);
      setErrors({});
      
      // Initialize all questions as expanded by default
      const initialExpanded: { [key: number]: boolean } = {};
      editableQuestions.forEach((_, index) => {
        initialExpanded[index] = true;
      });
      setExpandedQuestions(initialExpanded);
      
      // Clean up any existing file previews
      Object.values(filePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Set up file previews for existing images
      const newPreviews: { [key: string]: string } = {};
      existingQuestions.forEach((q, index) => {
        if (q.item_a.matching_type === 'IMAGE' && q.item_a.content) {
          newPreviews[`${index}-file_content_a`] = q.item_a.content;
        }
        if (q.item_b.matching_type === 'IMAGE' && q.item_b.content) {
          newPreviews[`${index}-file_content_b`] = q.item_b.content;
        }
      });
      setFilePreviews(newPreviews);
    }
  }, [isOpen, existingQuestions, presetType]);

  // Clean up file previews on unmount
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [filePreviews]);

  // Toggle expand/collapse for individual questions
  const toggleQuestionExpanded = (index: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Expand/collapse all questions
  const toggleAllQuestions = (expanded: boolean) => {
    const newExpandedState: { [key: number]: boolean } = {};
    questions.forEach((_, index) => {
      newExpandedState[index] = expanded;
    });
    setExpandedQuestions(newExpandedState);
  };

  const updateQuestion = (index: number, field: keyof UpdateMatchingQuestionByType, value: any) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const currentQuestion = { ...updatedQuestions[index] };
      
      // Update the field with proper typing
      (currentQuestion as any)[field] = value;

      // If updating points and this is a preset type with multiple questions, update all questions
      if (field === "points" && presetType && presetType.minRequired >= 2) {
        updatedQuestions.forEach((_, i) => {
          updatedQuestions[i] = { ...updatedQuestions[i], points: value };
        });
      } else {
        updatedQuestions[index] = currentQuestion;
      }

      // If changing type, clear the opposite content field
      if (field === "type_a") {
        if (value === "TEXT") {
          currentQuestion.file_content_a = undefined;
          // Clean up preview
          const previewKey = `${index}-file_content_a`;
          setFilePreviews(prev => {
            if (prev[previewKey]) {
              // Only revoke blob URLs, not server URLs
              if (prev[previewKey].startsWith('blob:')) {
                URL.revokeObjectURL(prev[previewKey]);
              }
              const newPreviews = { ...prev };
              delete newPreviews[previewKey];
              return newPreviews;
            }
            return prev;
          });
          // Reset file input
          setTimeout(() => {
            const fileInput = document.getElementById(`file-input-a-${index}`) as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }, 0);
        } else if (value === "IMAGE") {
          currentQuestion.content_a = "";
        }
        updatedQuestions[index] = currentQuestion;
      } else if (field === "type_b") {
        if (value === "TEXT") {
          currentQuestion.file_content_b = undefined;
          // Clean up preview
          const previewKey = `${index}-file_content_b`;
          setFilePreviews(prev => {
            if (prev[previewKey]) {
              // Only revoke blob URLs, not server URLs
              if (prev[previewKey].startsWith('blob:')) {
                URL.revokeObjectURL(prev[previewKey]);
              }
              const newPreviews = { ...prev };
              delete newPreviews[previewKey];
              return newPreviews;
            }
            return prev;
          });
          // Reset file input
          setTimeout(() => {
            const fileInput = document.getElementById(`file-input-b-${index}`) as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }, 0);
        } else if (value === "IMAGE") {
          currentQuestion.content_b = "";
        }
        updatedQuestions[index] = currentQuestion;
      } else if (field !== "points") {
        updatedQuestions[index] = currentQuestion;
      }

      return updatedQuestions;
    });

    // Clear error for this field
    const errorKey = `${index}-${field}`;
    setErrors(prevErrors => {
      if (prevErrors[errorKey]) {
        const newErrors = { ...prevErrors };
        delete newErrors[errorKey];
        return newErrors;
      }
      return prevErrors;
    });
  };

  const handleFileChange = (index: number, field: 'file_content_a' | 'file_content_b', file: File | null) => {
    if (file) {
      // Update the question with the file
      updateQuestion(index, field, file);
      
      // Create preview URL for new file
      const previewKey = `${index}-${field}`;
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews(prev => {
        // Clean up old preview if it was a blob URL
        if (prev[previewKey] && prev[previewKey].startsWith('blob:')) {
          URL.revokeObjectURL(prev[previewKey]);
        }
        return {
          ...prev,
          [previewKey]: previewUrl
        };
      });
    } else {
      // Clear the file
      updateQuestion(index, field, undefined);
      const previewKey = `${index}-${field}`;
      if (filePreviews[previewKey]) {
        // Only revoke blob URLs, not server URLs
        if (filePreviews[previewKey].startsWith('blob:')) {
          URL.revokeObjectURL(filePreviews[previewKey]);
        }
        setFilePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[previewKey];
          return newPreviews;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    questions.forEach((question, index) => {
      // Validate content A
      if (question.type_a === "TEXT" && !question.content_a?.trim()) {
        newErrors[`${index}-content_a`] = "Nội dung A không được để trống";
      } else if (question.type_a === "IMAGE" && !question.file_content_a && !filePreviews[`${index}-file_content_a`]) {
        newErrors[`${index}-content_a`] = "Vui lòng chọn file hình ảnh cho nội dung A";
      }
      
      // Validate content B
      if (question.type_b === "TEXT" && !question.content_b?.trim()) {
        newErrors[`${index}-content_b`] = "Nội dung B không được để trống";
      } else if (question.type_b === "IMAGE" && !question.file_content_b && !filePreviews[`${index}-file_content_b`]) {
        newErrors[`${index}-content_b`] = "Vui lòng chọn file hình ảnh cho nội dung B";
      }
      
      if (question.points <= 0) {
        newErrors[`${index}-points`] = "Điểm phải lớn hơn 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Clean up questions data to match backend expectations
      const cleanedQuestions = questions.map((question, index) => {
        const cleanedQuestion: any = {
          id: question.id,
          type_a: question.type_a,     // Keep snake_case as original
          type_b: question.type_b,
          points: question.points,
        };

        // Handle content A based on type
        if (question.type_a === 'TEXT') {
          // For TEXT type, always send content_a (even if empty)
          cleanedQuestion.content_a = question.content_a?.trim() || '';
        } else if (question.type_a === 'IMAGE') {
          // For IMAGE type, only send file_content_a if user uploaded new file
          if (question.file_content_a) {
            cleanedQuestion.file_content_a = question.file_content_a;
          }
          // If no new file uploaded, don't send file_content_a field
          // Backend will preserve existing image
        }

        // Handle content B based on type  
        if (question.type_b === 'TEXT') {
          // For TEXT type, always send content_b (even if empty)
          cleanedQuestion.content_b = question.content_b?.trim() || '';
        } else if (question.type_b === 'IMAGE') {
          // For IMAGE type, only send file_content_b if user uploaded new file
          if (question.file_content_b) {
            cleanedQuestion.file_content_b = question.file_content_b;
          }
          // If no new file uploaded, don't send file_content_b field
          // Backend will preserve existing image
        }

        return cleanedQuestion;
      });

      onSubmit(cleanedQuestions);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FaArrowRightArrowLeft className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {presetType ? `Chỉnh sửa câu hỏi ghép đôi - ${
                  presetType.typeA === 'TEXT' && presetType.typeB === 'TEXT' ? '📝 Văn bản - Văn bản' :
                  presetType.typeA === 'TEXT' && presetType.typeB === 'IMAGE' ? '📝🖼️ Văn bản - Hình ảnh' :
                  presetType.typeA === 'IMAGE' && presetType.typeB === 'TEXT' ? '🖼️📝 Hình ảnh - Văn bản' :
                  '🖼️ Hình ảnh - Hình ảnh'
                }` : 'Chỉnh sửa câu hỏi ghép đôi'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {presetType ? (
                  <>Chỉnh sửa cặp ghép <strong>{presetType.typeA}-{presetType.typeB}</strong> với <strong>{presetType.points} điểm/cặp</strong></>
                ) : (
                  'Chỉnh sửa cặp ghép để học sinh có thể kết nối các nội dung liên quan'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          {/* Toggle All Button */}
          <div className="flex justify-end mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toggleAllQuestions(true)}
                className="text-xs px-3 py-1"
                disabled={isLoading}
              >
                <FaChevronDown className="mr-1" />
                Mở rộng tất cả
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleAllQuestions(false)}
                className="text-xs px-3 py-1"
                disabled={isLoading}
              >
                <FaChevronUp className="mr-1" />
                Thu gọn tất cả
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {questions.map((question, index) => (
              <div
                key={`question-${index}`}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cặp ghép {index + 1}
                    </h3>
                    {!expandedQuestions[index] && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ({question.type_a} - {question.type_b}) • {question.points} điểm
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleQuestionExpanded(index)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={isLoading}
                  >
                    {expandedQuestions[index] ? (
                      <FaChevronUp className="text-lg" />
                    ) : (
                      <FaChevronDown className="text-lg" />
                    )}
                  </button>
                </div>

                {expandedQuestions[index] && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Content A */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Nội dung A
                      </label>
                      <select
                        value={question.type_a}
                        onChange={(e) => updateQuestion(index, "type_a", e.target.value as "TEXT" | "IMAGE")}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium text-blue-800 dark:text-blue-200 disabled:opacity-50"
                        disabled={isLoading || (presetType !== null)}
                      >
                        <option value="TEXT">📝 Văn bản</option>
                        <option value="IMAGE">🖼️ Hình ảnh</option>
                      </select>
                    </div>

                    {question.type_a === "TEXT" ? (
                      <div>
                        <textarea
                          value={question.content_a || ""}
                          onChange={(e) => updateQuestion(index, "content_a", e.target.value)}
                          placeholder="Nhập nội dung văn bản cho A..."
                          className={`w-full px-4 py-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
                            errors[`${index}-content_a`] ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          rows={4}
                          disabled={isLoading}
                        />
                        {errors[`${index}-content_a`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`${index}-content_a`]}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          id={`file-input-a-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(index, "file_content_a", e.target.files?.[0] || null)}
                          className={`w-full px-4 py-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-800 dark:file:text-blue-200 transition-all ${
                            errors[`${index}-content_a`] ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          disabled={isLoading}
                        />
                        {filePreviews[`${index}-file_content_a`] && (
                          <div className="mt-3">
                            <img
                              src={filePreviews[`${index}-file_content_a`]}
                              alt="Preview A"
                              className="w-full max-w-xs h-32 object-cover rounded-lg border border-blue-200 dark:border-blue-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {filePreviews[`${index}-file_content_a`].startsWith('blob:') ? 'Hình ảnh mới được chọn' : 'Hình ảnh hiện tại'}
                            </p>
                          </div>
                        )}
                        {errors[`${index}-content_a`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`${index}-content_a`]}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center lg:py-12">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <FaArrowRightArrowLeft className="text-white text-lg" />
                    </div>
                  </div>

                  {/* Content B */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                        Nội dung B
                      </label>
                      <select
                        value={question.type_b}
                        onChange={(e) => updateQuestion(index, "type_b", e.target.value as "TEXT" | "IMAGE")}
                        className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm font-medium text-purple-800 dark:text-purple-200 disabled:opacity-50"
                        disabled={isLoading || (presetType !== null)}
                      >
                        <option value="TEXT">📝 Văn bản</option>
                        <option value="IMAGE">🖼️ Hình ảnh</option>
                      </select>
                    </div>

                    {question.type_b === "TEXT" ? (
                      <div>
                        <textarea
                          value={question.content_b || ""}
                          onChange={(e) => updateQuestion(index, "content_b", e.target.value)}
                          placeholder="Nhập nội dung văn bản cho B..."
                          className={`w-full px-4 py-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all ${
                            errors[`${index}-content_b`] ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          rows={4}
                          disabled={isLoading}
                        />
                        {errors[`${index}-content_b`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`${index}-content_b`]}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          id={`file-input-b-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(index, "file_content_b", e.target.files?.[0] || null)}
                          className={`w-full px-4 py-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 dark:file:bg-purple-800 dark:file:text-purple-200 transition-all ${
                            errors[`${index}-content_b`] ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                          disabled={isLoading}
                        />
                        {filePreviews[`${index}-file_content_b`] && (
                          <div className="mt-3">
                            <img
                              src={filePreviews[`${index}-file_content_b`]}
                              alt="Preview B"
                              className="w-full max-w-xs h-32 object-cover rounded-lg border border-purple-200 dark:border-purple-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {filePreviews[`${index}-file_content_b`].startsWith('blob:') ? 'Hình ảnh mới được chọn' : 'Hình ảnh hiện tại'}
                            </p>
                          </div>
                        )}
                        {errors[`${index}-content_b`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`${index}-content_b`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Điểm số cho cặp ghép này
                    {presetType && presetType.minRequired >= 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Thay đổi điểm sẽ áp dụng cho tất cả cặp trong loại này)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, "points", parseInt(e.target.value) || 0)}
                    min="1"
                    max="100"
                    className={`w-32 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors[`${index}-points`] ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                    disabled={isLoading || (presetType !== null && presetType.minRequired === 1)}
                  />
                  {errors[`${index}-points`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`${index}-points`]}</p>
                  )}
                  {presetType !== null && presetType.minRequired === 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Điểm được khóa theo cặp ghép đầu tiên của loại này
                    </p>
                  )}
                </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Remove Add Question Button in edit mode - users can only edit existing pairs */}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{questions.length}</span> cặp ghép • 
            <span className="font-medium ml-1">{questions.reduce((sum, q) => sum + q.points, 0)}</span> điểm tổng
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || questions.length === 0}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật câu hỏi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMatchingModal;
