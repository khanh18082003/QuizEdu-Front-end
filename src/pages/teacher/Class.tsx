import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaPlus, FaUserAlt, FaClock } from "react-icons/fa";
import Button from "../../components/ui/Button";
import CreateClassModal from "../../components/ui/CreateClassModal";
import Toast from "../../components/ui/Toast";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { usePageTitle, PAGE_TITLES } from "../../utils/title";
import {
  getClassrooms,
  createClassroom,
  type CreateClassroomRequest,
  type ClassRoomResponse,
} from "../../services/classroomService";

const Class = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle(PAGE_TITLES.TEACHER_CLASSES);

  const [searchQuery, setSearchQuery] = useState("");
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
                    <div className="mt-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit/delete action
                        }}
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>Edit</span>
                      </Button>

                      <Button variant="primary" size="sm">
                        View
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
