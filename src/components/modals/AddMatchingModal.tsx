import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import type { AddMatchingQuestion } from "../../services/quizService";

interface AddMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questions: AddMatchingQuestion[]) => void;
  isLoading?: boolean;
  presetType?: {
    typeA: 'TEXT' | 'IMAGE';
    typeB: 'TEXT' | 'IMAGE';
    points: number;
    minRequired: number;
  } | null;
}

const AddMatchingModal: React.FC<AddMatchingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  presetType = null,
}) => {
  const [questions, setQuestions] = useState<AddMatchingQuestion[]>([
    {
      content_a: "",
      type_a: "TEXT",
      content_b: "",
      type_b: "TEXT",
      points: 1,
    },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultQuestion = {
        content_a: "",
        type_a: presetType?.typeA || "TEXT",
        content_b: "",
        type_b: presetType?.typeB || "TEXT",
        points: presetType?.points || 1,
      };

      // If preset type requires minimum questions, create that many
      const questionCount = presetType?.minRequired || 1;
      const initialQuestions = Array(questionCount).fill(null).map(() => ({ ...defaultQuestion }));
      
      setQuestions(initialQuestions);
      setErrors({});
      // Clean up any existing file previews
      Object.values(filePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setFilePreviews({});
    }
  }, [isOpen, presetType]); // Remove filePreviews dependency to avoid infinite loop

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

  const addQuestion = () => {
    // Check limit of 5 pairs per type
    if (questions.length >= 5) {
      return; // Don't add more than 5 questions
    }
    
    setQuestions([
      ...questions,
      {
        content_a: "",
        type_a: presetType?.typeA || "TEXT",
        content_b: "",
        type_b: presetType?.typeB || "TEXT",
        points: presetType?.points || 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof AddMatchingQuestion, value: any) => {
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
              URL.revokeObjectURL(prev[previewKey]);
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
              URL.revokeObjectURL(prev[previewKey]);
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
      
      // Create preview URL
      const previewKey = `${index}-${field}`;
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews(prev => ({
        ...prev,
        [previewKey]: previewUrl
      }));
    } else {
      // Clear the file
      updateQuestion(index, field, undefined);
      const previewKey = `${index}-${field}`;
      if (filePreviews[previewKey]) {
        URL.revokeObjectURL(filePreviews[previewKey]);
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

    // Check total number of questions
    if (questions.length > 5) {
      newErrors['general'] = "Mỗi loại ghép đôi chỉ được phép tối đa 5 cặp";
    }

    // Check minimum required questions (from presetType)
    if (presetType?.minRequired && questions.length < presetType.minRequired) {
      newErrors['general'] = `Cần thêm ít nhất ${presetType.minRequired} cặp ghép`;
    }

    questions.forEach((question, index) => {
      // Validate content A
      if (question.type_a === "TEXT" && (!question.content_a || !question.content_a.trim())) {
        newErrors[`${index}-content_a`] = "Nội dung A không được để trống";
      } else if (question.type_a === "IMAGE" && !question.file_content_a) {
        newErrors[`${index}-content_a`] = "Vui lòng chọn file hình ảnh cho nội dung A";
      }
      
      // Validate content B
      if (question.type_b === "TEXT" && (!question.content_b || !question.content_b.trim())) {
        newErrors[`${index}-content_b`] = "Nội dung B không được để trống";
      } else if (question.type_b === "IMAGE" && !question.file_content_b) {
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
      onSubmit(questions);
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
                {presetType ? `Thêm câu hỏi ghép đôi - ${
                  presetType.typeA === 'TEXT' && presetType.typeB === 'TEXT' ? '📝 Văn bản - Văn bản' :
                  presetType.typeA === 'TEXT' && presetType.typeB === 'IMAGE' ? '📝🖼️ Văn bản - Hình ảnh' :
                  presetType.typeA === 'IMAGE' && presetType.typeB === 'TEXT' ? '🖼️📝 Hình ảnh - Văn bản' :
                  '🖼️ Hình ảnh - Hình ảnh'
                }` : 'Thêm câu hỏi ghép đôi'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {presetType ? (
                  <>Tạo cặp ghép <strong>{presetType.typeA}-{presetType.typeB}</strong> với <strong>{presetType.points} điểm/cặp</strong> (tối đa 5 cặp)</>
                ) : (
                  'Tạo cặp ghép để học sinh kết nối các nội dung liên quan (tối đa 5 cặp)'
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
          {/* General Error */}
          {errors.general && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <FaTimes className="text-red-600 dark:text-red-400" />
                <span className="font-medium text-sm">{errors.general}</span>
              </div>
            </div>
          )}

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
                  </div>
                  {questions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={isLoading}
                    >
                      <FaTrash className="text-sm" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Content A */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        A
                      </div>
                      <div>
                        <label className="text-base font-semibold text-blue-600 dark:text-blue-400">
                          Nội dung A
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Phía bên trái của cặp ghép
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Loại nội dung
                        </label>
                        <select
                          value={question.type_a}
                          onChange={(e) => {
                            const newType = e.target.value as "TEXT" | "IMAGE";
                            updateQuestion(index, "type_a", newType);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                          disabled={isLoading || presetType !== null}
                        >
                          <option value="TEXT">📝 Văn bản</option>
                          <option value="IMAGE">🖼️ Hình ảnh</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nội dung
                        </label>
                        {question.type_a === "TEXT" ? (
                          <textarea
                            key={`textarea-a-${index}`}
                            value={question.content_a || ""}
                            onChange={(e) => {
                              updateQuestion(index, "content_a", e.target.value);
                            }}
                            placeholder="Nhập nội dung văn bản..."
                            disabled={isLoading}
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all ${
                              errors[`${index}-content_a`] 
                                ? 'border-red-500 dark:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        ) : (
                          <div key={`fileupload-a-${index}`} className="space-y-3">
                            {/* File upload area */}
                            <div className="relative">
                              <input
                                id={`file-input-a-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(index, "file_content_a", file);
                                }}
                                disabled={isLoading}
                                className="hidden"
                              />
                              <div
                                onClick={() => {
                                  document.getElementById(`file-input-a-${index}`)?.click();
                                }}
                                className={`w-full min-h-[120px] border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center gap-3 p-4 ${
                                  errors[`${index}-content_a`] 
                                    ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' 
                                    : 'border-blue-300 dark:border-blue-600 bg-blue-25 dark:bg-blue-900/5'
                                }`}
                              >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Nhấn để chọn hình ảnh
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    PNG, JPG, GIF tối đa 10MB
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Image preview */}
                            {filePreviews[`${index}-file_content_a`] && (
                              <div className="relative group">
                                <img
                                  src={filePreviews[`${index}-file_content_a`]}
                                  alt="Preview A"
                                  className="max-w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`file-input-a-${index}`)?.click()}
                                    className="opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-all"
                                  >
                                    Thay đổi
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Clear the file and preview
                                    updateQuestion(index, "file_content_a", undefined);
                                    const previewKey = `${index}-file_content_a`;
                                    if (filePreviews[previewKey]) {
                                      URL.revokeObjectURL(filePreviews[previewKey]);
                                      setFilePreviews(prev => {
                                        const newPreviews = { ...prev };
                                        delete newPreviews[previewKey];
                                        return newPreviews;
                                      });
                                    }
                                    // Reset file input
                                    const fileInput = document.getElementById(`file-input-a-${index}`) as HTMLInputElement;
                                    if (fileInput) fileInput.value = '';
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs transition-colors"
                                  disabled={isLoading}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {errors[`${index}-content_a`] && (
                          <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                            <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">!</span>
                            {errors[`${index}-content_a`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content B */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                        B
                      </div>
                      <div>
                        <label className="text-base font-semibold text-purple-600 dark:text-purple-400">
                          Nội dung B
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Phía bên phải của cặp ghép
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Loại nội dung
                        </label>
                        <select
                          value={question.type_b}
                          onChange={(e) => {
                            const newType = e.target.value as "TEXT" | "IMAGE";
                            updateQuestion(index, "type_b", newType);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                          disabled={isLoading || presetType !== null}
                        >
                          <option value="TEXT">📝 Văn bản</option>
                          <option value="IMAGE">🖼️ Hình ảnh</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nội dung
                        </label>
                        {question.type_b === "TEXT" ? (
                          <textarea
                            key={`textarea-b-${index}`}
                            value={question.content_b || ""}
                            onChange={(e) => {
                              updateQuestion(index, "content_b", e.target.value);
                            }}
                            placeholder="Nhập nội dung văn bản..."
                            disabled={isLoading}
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all ${
                              errors[`${index}-content_b`] 
                                ? 'border-red-500 dark:border-red-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        ) : (
                          <div key={`fileupload-b-${index}`} className="space-y-3">
                            {/* File upload area */}
                            <div className="relative">
                              <input
                                id={`file-input-b-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(index, "file_content_b", file);
                                }}
                                disabled={isLoading}
                                className="hidden"
                              />
                              <div
                                onClick={() => {
                                  document.getElementById(`file-input-b-${index}`)?.click();
                                }}
                                className={`w-full min-h-[120px] border-2 border-dashed rounded-lg cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 flex flex-col items-center justify-center gap-3 p-4 ${
                                  errors[`${index}-content_b`] 
                                    ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' 
                                    : 'border-purple-300 dark:border-purple-600 bg-purple-25 dark:bg-purple-900/5'
                                }`}
                              >
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Nhấn để chọn hình ảnh
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    PNG, JPG, GIF tối đa 10MB
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Image preview */}
                            {filePreviews[`${index}-file_content_b`] && (
                              <div className="relative group">
                                <img
                                  src={filePreviews[`${index}-file_content_b`]}
                                  alt="Preview B"
                                  className="max-w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`file-input-b-${index}`)?.click()}
                                    className="opacity-0 group-hover:opacity-100 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-all"
                                  >
                                    Thay đổi
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Clear the file and preview
                                    updateQuestion(index, "file_content_b", undefined);
                                    const previewKey = `${index}-file_content_b`;
                                    if (filePreviews[previewKey]) {
                                      URL.revokeObjectURL(filePreviews[previewKey]);
                                      setFilePreviews(prev => {
                                        const newPreviews = { ...prev };
                                        delete newPreviews[previewKey];
                                        return newPreviews;
                                      });
                                    }
                                    // Reset file input
                                    const fileInput = document.getElementById(`file-input-b-${index}`) as HTMLInputElement;
                                    if (fileInput) fileInput.value = '';
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs transition-colors"
                                  disabled={isLoading}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {errors[`${index}-content_b`] && (
                          <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                            <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">!</span>
                            {errors[`${index}-content_b`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Điểm số
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-lg">⭐</span>
                    </div>
                    <input
                      type="text"
                      value={question.points.toString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        const numValue = value === '' ? 1 : parseInt(value, 10);
                        if (numValue >= 1 && numValue <= 100) {
                          updateQuestion(index, "points", numValue);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || parseInt(e.target.value) < 1) {
                          updateQuestion(index, "points", 1);
                        }
                      }}
                      placeholder="1-100"
                      disabled={isLoading || (presetType !== null && presetType.minRequired === 1)}
                      className={`w-28 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-bold text-lg transition-all shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
                        errors[`${index}-points`] 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">điểm</span>
                  </div>
                  {presetType && presetType.minRequired >= 2 && questions.length > 1 && (
                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">ℹ</span>
                      Điểm này sẽ áp dụng cho tất cả {questions.length} cặp ghép {presetType.typeA}-{presetType.typeB}
                    </p>
                  )}
                  {presetType && presetType.minRequired === 1 && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">🔒</span>
                      Điểm đã được thiết lập cho loại {presetType.typeA}-{presetType.typeB}: {presetType.points} điểm
                    </p>
                  )}
                  {errors[`${index}-points`] && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                      <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">!</span>
                      {errors[`${index}-points`]}
                    </p>
                  )}
                </div>

                {/* Preview */}
                {((question.type_a === "TEXT" && question.content_a) || (question.type_a === "IMAGE" && question.file_content_a)) && 
                 ((question.type_b === "TEXT" && question.content_b) || (question.type_b === "IMAGE" && question.file_content_b)) && (
                  <div className="mt-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        👁️ Xem trước
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
                          {question.type_a === "TEXT" ? "📝" : "🖼️"} {question.type_a === "TEXT" ? "Văn bản" : "Hình ảnh"}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white max-h-16 overflow-hidden">
                          {question.type_a === "TEXT" ? (
                            question.content_a
                          ) : (
                            filePreviews[`${index}-file_content_a`] ? (
                              <img
                                src={filePreviews[`${index}-file_content_a`]}
                                alt="Preview A"
                                className="max-w-full h-16 object-cover rounded"
                              />
                            ) : (
                              "Hình ảnh đã chọn"
                            )
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <FaArrowRightArrowLeft className="text-gray-400 text-lg" />
                      </div>
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2 flex items-center gap-1">
                          {question.type_b === "TEXT" ? "📝" : "🖼️"} {question.type_b === "TEXT" ? "Văn bản" : "Hình ảnh"}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white max-h-16 overflow-hidden">
                          {question.type_b === "TEXT" ? (
                            question.content_b
                          ) : (
                            filePreviews[`${index}-file_content_b`] ? (
                              <img
                                src={filePreviews[`${index}-file_content_b`]}
                                alt="Preview B"
                                className="max-w-full h-16 object-cover rounded"
                              />
                            ) : (
                              "Hình ảnh đã chọn"
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <div className="mt-8 flex justify-center">
            {questions.length < 5 ? (
              <Button
                variant="outline"
                onClick={addQuestion}
                className="flex items-center gap-3 text-green-600 hover:text-green-700 border-green-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-6 py-3 rounded-lg transition-all"
                disabled={isLoading}
              >
                <FaPlus className="text-sm" />
                <span className="font-medium">Thêm cặp ghép mới ({questions.length}/5)</span>
              </Button>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 text-center">
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  Đã đạt giới hạn tối đa (5/5 cặp)
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Mỗi loại ghép đôi chỉ được phép tối đa 5 cặp
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              📊 Tổng cộng: <span className="text-gray-900 dark:text-white">{questions.length} cặp ghép</span>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              ⭐ Tổng điểm: <span className="text-yellow-600 dark:text-yellow-400 font-bold">{questions.reduce((sum, q) => sum + q.points, 0)} điểm</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              isLoading={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <span className="flex items-center gap-2">
                <span>✨</span>
                Thêm câu hỏi
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMatchingModal;
