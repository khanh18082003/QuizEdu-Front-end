import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlay, FaRedo, FaUserMinus, FaUserPlus } from "react-icons/fa";
import Button from "../ui/Button";
import type { RegisterResponse } from "../../services/userService";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: RegisterResponse[];
  onStudentSelected: (student: RegisterResponse) => void;
}

const SpinWheelModal = ({ isOpen, onClose, students, onStudentSelected }: SpinWheelModalProps) => {
  const [availableStudents, setAvailableStudents] = useState<RegisterResponse[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RegisterResponse | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);
  const spinDuration = 3000;

  // Initialize available students when modal opens
  useEffect(() => {
    if (isOpen && students.length > 0) {
      setAvailableStudents([...students]);
      setSelectedStudent(null);
      setRotation(0);
    }
  }, [isOpen, students]);

  // Calculate wheel segments
  const segmentAngle = availableStudents.length > 0 ? 360 / availableStudents.length : 0;
  
  // Generate vibrant colors for wheel segments
  const generateColors = (count: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  const colors = generateColors(availableStudents.length);

  // Calculate which student the pointer is pointing to
  const getPointedStudent = () => {
    if (availableStudents.length === 0) return null;
    
    // Pointer is at 3 o'clock (90 degrees), calculate which segment it points to
    const normalizedAngle = (360 - (rotation % 360)) % 360;
    const adjustedAngle = (normalizedAngle + 90) % 360; // Adjust for pointer position
    const selectedIndex = Math.floor(adjustedAngle / segmentAngle) % availableStudents.length;
    return availableStudents[selectedIndex];
  };

  const pointedStudent = getPointedStudent();

  // Spin the wheel with realistic physics
  const spinWheel = () => {
    if (availableStudents.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedStudent(null);

    // More realistic spin: 4-6 full rotations plus random angle
    const fullRotations = (4 + Math.random() * 2) * 360;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + fullRotations + randomAngle;

    setRotation(totalRotation);

    // Calculate winner after spin completes
    setTimeout(() => {
      const finalAngle = totalRotation % 360;
      const normalizedAngle = (360 - finalAngle) % 360;
      const adjustedAngle = (normalizedAngle + 90) % 360;
      const selectedIndex = Math.floor(adjustedAngle / segmentAngle) % availableStudents.length;
      const winner = availableStudents[selectedIndex];
      
      setSelectedStudent(winner);
      setIsSpinning(false);
    }, spinDuration);
  };

  // Confirm selection
  const confirmSelection = () => {
    if (selectedStudent) {
      onStudentSelected(selectedStudent);
      onClose();
    }
  };

  // Reset wheel
  const resetWheel = () => {
    if (isSpinning) return;
    setAvailableStudents([...students]);
    setSelectedStudent(null);
    setRotation(0);
  };

  // Remove student from wheel
  const removeStudent = (studentToRemove: RegisterResponse) => {
    if (isSpinning) return;
    setAvailableStudents(prev => prev.filter(s => s.id !== studentToRemove.id));
    setSelectedStudent(null);
  };

  // Add student back to wheel
  const addStudent = (studentToAdd: RegisterResponse) => {
    if (isSpinning) return;
    setAvailableStudents(prev => [...prev, studentToAdd]);
  };

  // Get removed students
  const removedStudents = students.filter(s => !availableStudents.find(as => as.id === s.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🎯 Vòng quay chọn học sinh
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wheel Section */}
            <div className="lg:col-span-2">
              <div className="flex flex-col items-center space-y-6">
                {/* Wheel Container with Pointer */}
                <div className="relative">
                  {/* Main Wheel */}
                  <div className="relative w-96 h-96 rounded-full overflow-hidden shadow-2xl bg-white">
                    {availableStudents.length > 0 ? (
                      <svg
                        ref={wheelRef}
                        className="w-full h-full transition-transform"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transitionDuration: isSpinning ? `${spinDuration}ms` : '0ms',
                          transitionTimingFunction: isSpinning ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'ease'
                        }}
                        viewBox="0 0 200 200"
                      >
                        {availableStudents.map((student, index) => {
                          const startAngle = (index * segmentAngle) * (Math.PI / 180);
                          const endAngle = ((index + 1) * segmentAngle) * (Math.PI / 180);
                          
                          const x1 = 100 + 100 * Math.cos(startAngle);
                          const y1 = 100 + 100 * Math.sin(startAngle);
                          const x2 = 100 + 100 * Math.cos(endAngle);
                          const y2 = 100 + 100 * Math.sin(endAngle);
                          
                          const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                          
                          const pathData = [
                            `M 100 100`,
                            `L ${x1} ${y1}`,
                            `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `Z`
                          ].join(' ');

                          // Calculate text position
                          const textAngle = startAngle + (endAngle - startAngle) / 2;
                          const textRadius = 70;
                          const textX = 100 + textRadius * Math.cos(textAngle);
                          const textY = 100 + textRadius * Math.sin(textAngle);
                          const textRotation = (textAngle * 180 / Math.PI + 90) % 360;

                          // Check if this student is being pointed to or selected
                          const isPointed = pointedStudent?.id === student.id && !isSpinning;
                          const isSelected = selectedStudent?.id === student.id;
                          const isHighlighted = isPointed || isSelected;

                          return (
                            <g key={student.id}>
                              <path
                                d={pathData}
                                fill={colors[index]}
                                stroke="white"
                                strokeWidth="2"
                                className={`transition-all duration-300 ${
                                  isHighlighted 
                                    ? 'brightness-125 drop-shadow-xl scale-105' 
                                    : 'hover:brightness-110'
                                }`}
                                style={{
                                  transformOrigin: '100px 100px',
                                  filter: isHighlighted ? 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'none'
                                }}
                              />
                              <text
                                x={textX}
                                y={textY}
                                fill="white"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${textRotation > 90 && textRotation < 270 ? textRotation + 180 : textRotation} ${textX} ${textY})`}
                                style={{ 
                                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                  filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'
                                }}
                                className={`transition-all duration-300 ${isHighlighted ? 'animate-pulse' : ''}`}
                              >
                                {student.first_name} {student.last_name}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                          Không có học sinh nào<br />để quay
                        </p>
                      </div>
                    )}

                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-gray-300 shadow-lg flex items-center justify-center z-10">
                      <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* Pointer Arrow - positioned at 3 o'clock */}
                  <div className="absolute top-1/2 right-0 transform translate-x-6 -translate-y-1/2 z-20">
                    <div className="relative">
                      {/* Arrow pointing left into the wheel */}
                      <div 
                        className="w-0 h-0 border-t-[20px] border-b-[20px] border-r-[35px] border-transparent border-r-yellow-500 drop-shadow-lg animate-pulse"
                        style={{
                          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={spinWheel}
                    disabled={isSpinning || availableStudents.length === 0}
                    className="flex items-center gap-2 px-8 py-4 text-lg"
                  >
                    {isSpinning ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Đang quay...
                      </>
                    ) : (
                      <>
                        <FaPlay />
                        Quay wheel
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetWheel}
                    disabled={isSpinning}
                    className="flex items-center gap-2 px-6 py-4"
                  >
                    <FaRedo />
                    Reset
                  </Button>
                </div>

                {/* Final Result */}
                {selectedStudent && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-green-400 dark:border-green-600 w-full max-w-md shadow-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <span className="text-xl text-white font-bold">
                          {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse">
                        🎉 Học sinh được chọn!
                      </h3>
                      <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </p>
                      <div className="space-y-2">
                        <Button onClick={confirmSelection} className="w-full">
                          Xác nhận và bắt đầu kiểm tra
                        </Button>
                        <button
                          onClick={() => setSelectedStudent(null)}
                          className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
                        >
                          Quay lại
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student Management Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quản lý học sinh ({availableStudents.length}/{students.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (isSpinning) return;
                      const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
                      setAvailableStudents([randomStudent]);
                      setSelectedStudent(null);
                    }}
                    disabled={isSpinning || availableStudents.length <= 1}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={availableStudents.length <= 1 ? "Cần ít nhất 2 học sinh để loại bỏ" : "Chỉ giữ lại 1 học sinh ngẫu nhiên"}
                  >
                    Loại bỏ gần hết
                  </button>
                  <button
                    onClick={resetWheel}
                    disabled={isSpinning || availableStudents.length === students.length}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Thêm lại tất cả học sinh"
                  >
                    Thêm lại tất cả
                  </button>
                </div>
              </div>

              {/* Available Students */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  ✅ Trong vòng quay ({availableStudents.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableStudents.map((student, index) => (
                    <div 
                      key={student.id} 
                      className={`flex items-center justify-between p-2 rounded border transition-all duration-300 ${
                        selectedStudent?.id === student.id
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-400'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{ 
                            backgroundColor: colors[index]
                          }}
                        >
                          <span className="text-white text-xs font-bold">
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStudent(student)}
                        disabled={isSpinning || availableStudents.length <= 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-100 transition-colors"
                        title={availableStudents.length <= 1 ? "Cần ít nhất 1 học sinh để quay" : "Loại bỏ khỏi vòng quay"}
                      >
                        <FaUserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Removed Students */}
              {removedStudents.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                    ❌ Đã loại bỏ ({removedStudents.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {removedStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {student.first_name} {student.last_name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addStudent(student)}
                          disabled={isSpinning}
                          className="text-green-500 hover:text-green-700 disabled:opacity-50 p-1 rounded-full hover:bg-green-100"
                          title="Thêm lại vào vòng quay"
                        >
                          <FaUserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  💡 Hướng dẫn sử dụng
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Mũi tên vàng bên phải sẽ chỉ học sinh được chọn</li>
                  <li>• Phần được chỉ sẽ sáng lên và có hiệu ứng đặc biệt</li>
                  <li>• Có thể loại bỏ từng học sinh hoặc chỉ giữ lại 1 người</li>
                  <li>• Cần ít nhất 1 học sinh để có thể quay</li>
                  <li>• Nhấn "Reset" để đưa tất cả học sinh trở lại</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelModal;
