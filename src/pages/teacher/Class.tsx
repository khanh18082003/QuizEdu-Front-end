
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import CreateClassModal from "../../components/ui/CreateClassModal";
import Toast from "../../components/ui/Toast";
import {
  getClassrooms,
  createClassroom,
  type CreateClassroomRequest,
  type ClassRoomResponse,
} from "../../services/classroomService";

const Class = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<ClassRoomResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 9,
    total: 0,
    pages: 0,
  });
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });
  const [copiedClassCodes, setCopiedClassCodes] = useState<Set<string>>(new Set());

  // Fetch classrooms when component mounts
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Show toast notification
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchClassrooms = async (page: number = 1, pageSize: number = 9) => {
    try {
      setIsLoading(true);
      
      // Toggle between mock data và real API - thay đổi giá trị này để test
      const USE_MOCK_DATA = false; // Set true để dùng mock data, false để dùng real API
      
      if (USE_MOCK_DATA) {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for classrooms
        const mockClassrooms: ClassRoomResponse[] = [
          {
            id: "CLASS001",
            name: "Lập trình Web 2024",
            description: "Môn học lập trình web frontend và backend với React, Node.js. Học sinh sẽ được học từ HTML/CSS cơ bản đến các framework hiện đại.",
            class_code: "WEB2024"
          },
          {
            id: "CLASS002", 
            name: "Mobile App Development",
            description: "Phát triển ứng dụng di động với React Native và Flutter. Từ cơ bản đến nâng cao, tích hợp API và publish app.",
            class_code: "MOBILE24"
          },
          {
            id: "CLASS003",
            name: "Database Design",
            description: "Thiết kế cơ sở dữ liệu với MySQL, PostgreSQL. Học cách tối ưu hóa query và quản lý dữ liệu hiệu quả.",
            class_code: "DB2024"
          },
          {
            id: "CLASS004",
            name: "DevOps & Cloud",
            description: "Triển khai ứng dụng lên cloud (AWS, Azure), CI/CD pipeline, Docker, Kubernetes và monitoring.",
            class_code: "DEVOPS24"
          },
          {
            id: "CLASS005",
            name: "UI/UX Design",
            description: "Thiết kế giao diện người dùng với Figma, Adobe XD. Học về user research, wireframing và prototyping.",
            class_code: "UIUX24"
          },
          {
            id: "CLASS006",
            name: "Machine Learning Basics",
            description: "Nhập môn Machine Learning với Python, scikit-learn. Từ linear regression đến neural networks cơ bản.",
            class_code: "ML2024"
          }
        ];

        // Mock pagination response
        const mockResponse = {
          data: {
            data: mockClassrooms.slice((page - 1) * pageSize, page * pageSize),
            page: page,
            page_size: pageSize,
            total: mockClassrooms.length,
            pages: Math.ceil(mockClassrooms.length / pageSize)
          }
        };

        setClassrooms(mockResponse.data.data);
        setPagination({
          page: mockResponse.data.page,
          pageSize: mockResponse.data.page_size,
          total: mockResponse.data.total,
          pages: mockResponse.data.pages,
        });
      } else {
        // Use real API
        const response = await getClassrooms(page, pageSize);
        setClassrooms(response.data.data);
        setPagination({
          page: response.data.page,
          pageSize: response.data.page_size,  // Map từ page_size
          total: response.data.total,
          pages: response.data.pages,
        });
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      showToast("Không thể tải danh sách lớp học", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (formData: CreateClassroomRequest) => {
    try {
      setIsCreating(true);
      
      await createClassroom(formData);
      
      // Refresh the classroom list to include the new classroom
      await fetchClassrooms(pagination.page, pagination.pageSize);
      
      showToast("Tạo lớp học thành công!", "success");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating classroom:", error);
      showToast("Không thể tạo lớp học. Vui lòng thử lại!", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClassClick = (classroom: ClassRoomResponse) => {
    // Navigate to classroom detail page
    navigate(`/teacher/classes/${classroom.id}`);
  };

  // Handle copy class code
  const handleCopyClassCode = (classCode: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering handleClassClick
    navigator.clipboard.writeText(classCode).then(() => {
      // Add to copied set
      setCopiedClassCodes(prev => new Set(prev).add(classCode));
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedClassCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(classCode);
          return newSet;
        });
      }, 2000);
    }).catch(() => {
      showToast("Không thể copy mã lớp", "error");
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchClassrooms(newPage, pagination.pageSize);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            </div>
            <div className="mb-4">
              <div className="h-6 bg-blue-100 dark:bg-blue-900 rounded-full w-20"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lớp học của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý và theo dõi các lớp học của bạn
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo lớp học
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Classroom Grid */}
          {classrooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chưa có lớp học nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bắt đầu bằng cách tạo lớp học đầu tiên của bạn
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
              >
                Tạo lớp học đầu tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  onClick={() => handleClassClick(classroom)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    {/* Class Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {classroom.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {classroom.description}
                        </p>
                      </div>
                    </div>

                    {/* Class Code */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {classroom.class_code}
                        </span>
                        <button
                          onClick={(e) => handleCopyClassCode(classroom.class_code, e)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={copiedClassCodes.has(classroom.class_code) ? "Đã copy!" : "Copy mã lớp"}
                        >
                          {copiedClassCodes.has(classroom.class_code) ? (
                            // Checkmark icon when copied
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            // Copy icon when not copied
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {classrooms.length > 0 && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị {(pagination.page - 1) * pagination.pageSize + 1} đến{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} của{' '}
                {pagination.total} lớp học
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Trước
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <Button
                      key={i}
                      variant={i + 1 === pagination.page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className="w-10 h-10"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClass}
        isLoading={isCreating}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default Class;
