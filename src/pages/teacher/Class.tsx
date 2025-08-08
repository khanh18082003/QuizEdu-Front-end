import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaPlus, FaUserAlt, FaClock, FaEdit, FaTrash } from "react-icons/fa";
import Button from "../../components/ui/Button";
import CreateClassModal from "../../components/ui/CreateClassModal";
import EditClassModal from "../../components/ui/EditClassModal";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { usePageTitle, PAGE_TITLES } from "../../utils/title";
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  type CreateClassroomRequest,
  type UpdateClassroomRequest,
  type ClassRoomResponse,
} from "../../services/classroomService";
import Toast from "../../components/ui/Toast";

const Class = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle(PAGE_TITLES.TEACHER_CLASSES);

  const [searchQuery, setSearchQuery] = useState("");
  const [classrooms, setClassrooms] = useState<ClassRoomResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassRoomResponse | null>(null);
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

  // Format date to be displayed in user's locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter classrooms based on search query
  const filteredClassrooms = searchQuery
    ? classrooms.filter(
        (classroom) =>
          classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classroom.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          classroom.class_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : classrooms;

  // Show toast notification
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({
        isVisible: true,
        message,
        type,
      });
    },
    [],
  );

  // Hide toast
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Fetch classrooms from API
  const fetchClassrooms = useCallback(
    async (page: number = 1, pageSize: number = 9) => {
      try {
        setIsLoading(true);
        const response = await getClassrooms(page, pageSize);
        setClassrooms(response.data.data);
        setPagination({
          page: response.data.page,
          pageSize: response.data.page_size,
          total: response.data.total,
          pages: response.data.pages,
        });
      } catch (error) {
        console.error("Error fetching classrooms:", error);
        showToast(t("errors.general"), "error");
      } finally {
        setIsLoading(false);
      }
    },
    [t, showToast],
  );

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleCreateClass = async (formData: CreateClassroomRequest) => {
    try {
      setIsCreating(true);
      await createClassroom(formData);
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

  const handleUpdateClass = async (formData: UpdateClassroomRequest) => {
    if (!selectedClassroom) return;
    
    try {
      setIsUpdating(true);
      await updateClassroom(selectedClassroom.id, formData);
      await fetchClassrooms(pagination.page, pagination.pageSize);
      showToast("Cập nhật lớp học thành công!", "success");
      setIsEditModalOpen(false);
      setSelectedClassroom(null);
    } catch (error) {
      console.error("Error updating classroom:", error);
      showToast("Không thể cập nhật lớp học. Vui lòng thử lại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClass = (classroom: ClassRoomResponse) => {
    setSelectedClassroom(classroom);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClassroom(null);
  };

  const handleDeleteClass = (classroom: ClassRoomResponse) => {
    setSelectedClassroom(classroom);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClassroom) return;

    try {
      setIsDeleting(true);
      await deleteClassroom(selectedClassroom.id);
      await fetchClassrooms(pagination.page, pagination.pageSize);
      showToast("Xóa lớp học thành công!", "success");
      setShowDeleteModal(false);
      setSelectedClassroom(null);
    } catch (error) {
      console.error("Error deleting classroom:", error);
      showToast("Không thể xóa lớp học. Vui lòng thử lại!", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedClassroom(null);
  };

  const handleClassClick = (classroom: ClassRoomResponse) => {
    navigate(`/teacher/classes/${classroom.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header and Actions */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t("teacherClass.myClasses")}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t("teacherClass.manageClasses")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={t("teacherClass.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-4 pl-10 text-sm shadow-sm focus:border-[var(--color-gradient-to)] focus:ring-1 focus:ring-[var(--color-gradient-from)] focus:outline-none sm:w-64 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <FaSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          </div>

          {/* Create Class Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            <span>{t("teacherClass.createClass")}</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <SkeletonLoader
                height="120px"
                className="w-full"
                animation="pulse"
              />
              <div className="p-4 pt-8">
                <SkeletonLoader
                  height="24px"
                  width="70%"
                  className="mb-3"
                  animation="pulse"
                />
                <div className="mb-4 flex flex-col gap-2">
                  <SkeletonLoader height="16px" width="50%" animation="pulse" />
                  <SkeletonLoader height="16px" width="60%" animation="pulse" />
                  <SkeletonLoader height="16px" width="40%" animation="pulse" />
                </div>
                <div className="flex justify-between">
                  <SkeletonLoader height="32px" width="30%" animation="pulse" />
                  <SkeletonLoader height="32px" width="25%" animation="pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Filtered Results Label */}
          {searchQuery && (
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Search results for: "{searchQuery}"
              </h2>
            </div>
          )}

          {/* No Results Message */}
          {filteredClassrooms.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-4 h-24 w-24 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="mb-1 text-xl font-semibold text-gray-700 dark:text-gray-300">
                {searchQuery ? "No classes found" : t("teacherClass.noClasses")}
              </h3>
              {!searchQuery && (
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  {t("teacherClass.noClassesDesc")}
                </p>
              )}
              {!searchQuery && (
                <Button onClick={() => setIsModalOpen(true)} variant="primary">
                  {t("teacherClass.createFirstClass")}
                </Button>
              )}
            </div>
          )}

          {/* Classroom Grid */}
          {filteredClassrooms.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClassrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  onClick={() => handleClassClick(classroom)}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Card Header with Gradient Background */}
                  <div className="relative">
                    <div className="h-28 bg-gradient-to-br from-blue-400 to-purple-500 bg-cover bg-center">
                      {/* Title overlay on banner */}
                      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">
                          {classroom.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-200">
                          {classroom.class_code}
                        </p>
                      </div>
                    </div>

                    {/* Teacher avatar */}
                    <div className="absolute right-4 -bottom-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-orange-500 text-xl font-bold text-white shadow-md">
                      {classroom.teacher?.display_name?.charAt(0) || "T"}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 pt-8">
                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden" 
                         style={{
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical',
                         }}>
                        {classroom.description || "Không có mô tả"}
                      </p>
                    </div>

                    <div className="mb-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FaUserAlt className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {classroom.teacher?.display_name || "Teacher"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(classroom.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-1.5 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClass(classroom);
                        }}
                      >
                        <FaEdit className="h-3 w-3" />
                        <span className="text-xs font-medium">Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-1.5 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(classroom);
                        }}
                      >
                        <FaTrash className="h-3 w-3" />
                        <span className="text-xs font-medium">Delete</span>
                      </Button>

                      <Button 
                        variant="primary" 
                        size="sm"
                        className="flex items-center justify-center gap-1.5 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClassClick(classroom);
                        }}
                      >
                        <span className="text-xs font-medium">View</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Edit Class Modal */}
      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateClass}
        isLoading={isUpdating}
        classroom={selectedClassroom}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FaTrash className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Xác nhận xóa lớp học
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Bạn có chắc chắn muốn xóa lớp học <strong className="text-gray-900 dark:text-white">"{selectedClassroom?.name}"</strong> không?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Cảnh báo: Hành động này không thể hoàn tác!
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1 ml-6">
                  Tất cả dữ liệu liên quan đến lớp học này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 p-6 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 focus:ring-red-500"
                isLoading={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa lớp học"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
