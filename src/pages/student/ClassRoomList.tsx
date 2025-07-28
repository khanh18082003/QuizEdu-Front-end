import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaUserAlt,
  FaClock,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { usePageTitle, PAGE_TITLES } from "../../utils/title";

import {
  cancelRegisterClassroom,
  getClassrooms,
  joinClassroom,
  type ClassRoomResponse,
} from "../../services/classroomService";
import Toast from "../../components/ui/Toast";

const ClassRoomList = () => {
  const { t } = useTranslation();
  usePageTitle(PAGE_TITLES.CLASSROOM_LIST);

  const [searchQuery, setSearchQuery] = useState("");
  const [classrooms, setClassrooms] = useState<Array<ClassRoomResponse>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [unenrollDialog, setUnenrollDialog] = useState<{
    isOpen: boolean;
    classId: string | null;
    className: string;
  }>({
    isOpen: false,
    classId: null,
    className: "",
  });

  const [pageable] = useState({
    page: 1,
    pageSize: 9,
  });

  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Show toast notification
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  // Hide toast
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Format date to be displayed in user's locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setIsLoading(true);
        const response = await getClassrooms(pageable.page, pageable.pageSize);
        setClassrooms(response.data.data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
        showToast("Failed to show classrooms", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [pageable.page, pageable.pageSize]);

  // Filter classrooms based on search query
  const filteredClassrooms = searchQuery
    ? classrooms.filter(
        (classroom) =>
          classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classroom.teacher.subjects.some((subject) =>
            subject.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          classroom.teacher.display_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : classrooms;

  // Handle join class form submission
  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classCode.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      const data = await joinClassroom(classCode.trim());

      if (data.code === "M000") {
        // Clear the form and close dialog
        setClassCode("");
        setIsJoinDialogOpen(false);
        showToast("Join classroom successfully", "success");

        // Refresh the classroom list to include the new classroom
        const response = await getClassrooms(pageable.page, pageable.pageSize);
        setClassrooms(response.data.data);
      } else {
        console.error("Failed to join classroom:", data.message);
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unenroll/leave class
  const openUnenrollDialog = (classId: string, className: string) => {
    setUnenrollDialog({
      isOpen: true,
      classId,
      className,
    });
  };

  const handleUnenroll = async () => {
    if (!unenrollDialog.classId) return;
    try {
      setIsLoading(true);
      const data = await cancelRegisterClassroom(unenrollDialog.classId);

      if (data.code === "M000") {
        // Remove the classroom from the list immediately for better UX
        setClassrooms((prevClassrooms) =>
          prevClassrooms.filter(
            (classroom) => classroom.id !== unenrollDialog.classId,
          ),
        );
        showToast("Unenrolled from classroom successfully", "success");
      } else {
        console.error("Failed to unenroll:", data.message);
      }
    } catch (error) {
      console.error("Error unenrolling from classroom:", error);
      showToast("Failed to unenroll from classroom", "error");
    } finally {
      setIsLoading(false);

      // Close the dialog regardless of success or failure
      setUnenrollDialog({
        isOpen: false,
        classId: null,
        className: "",
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header and Actions */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("classroom.myClasses")}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={t("classroom.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-4 pl-10 text-sm shadow-sm focus:border-[var(--color-gradient-to)] focus:ring-1 focus:ring-[var(--color-gradient-from)] focus:outline-none sm:w-64 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <FaSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          </div>

          {/* Join Class Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsJoinDialogOpen(true)}
            className="flex items-center justify-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            <span>{t("classroom.joinClass")}</span>
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
                {t("classroom.searchResults")}: "{searchQuery}"
              </h2>
            </div>
          )}

          {/* No Results Message */}
          {filteredClassrooms.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800">
              <img
                src="https://via.placeholder.com/150/6B7280/FFFFFF?text=Empty"
                alt="No classes"
                className="mb-4 h-32 w-32 rounded-full opacity-50"
              />
              <h3 className="mb-1 text-xl font-semibold text-gray-700 dark:text-gray-300">
                {searchQuery
                  ? t("classroom.noResults")
                  : t("classroom.noClasses")}
              </h3>
              {!searchQuery && (
                <p className="text-gray-600 dark:text-gray-400">
                  {t("classroom.joinClass")} to get started.
                </p>
              )}
            </div>
          )}

          {/* Classroom Grid */}
          {filteredClassrooms.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClassrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Card Header with Image and Overlay Text */}
                  <div className="relative">
                    <div className="h-28 bg-gradient-to-br from-blue-400 to-purple-500 bg-cover bg-center">
                      {/* Title overlay on banner image */}
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
                    <div className="absolute right-4 -bottom-8 flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-orange-500 text-xl font-bold text-white shadow-md">
                      {classroom.teacher.avatar ? (
                        <img
                          src={classroom.teacher.avatar}
                          alt={classroom.teacher.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        classroom.teacher.display_name.charAt(0)
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 pt-8">
                    <div className="mb-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FaUserAlt className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {classroom.teacher.display_name}
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
                        onClick={() =>
                          openUnenrollDialog(classroom.id, classroom.name)
                        }
                      >
                        <FaSignOutAlt className="h-3 w-3" />
                        <span>{t("classroom.unenroll")}</span>
                      </Button>

                      <Link
                        to={`/student/classroom/${classroom.id}`}
                        state={{ teacher: classroom.teacher }}
                      >
                        <Button variant="primary" size="sm">
                          {t("classroom.viewClass")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Join Class Dialog */}
      {isJoinDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
              {t("classroom.joinClass")}
            </h2>
            <form onSubmit={handleJoinClass}>
              <div className="mb-4">
                <label
                  htmlFor="classCode"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("classroom.enterClassCode")}
                </label>
                <input
                  type="text"
                  id="classCode"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-[var(--color-gradient-to)] focus:ring-1 focus:ring-[var(--color-gradient-from)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsJoinDialogOpen(false)}
                  disabled={isLoading}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("classroom.joinClass")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unenroll Dialog */}
      {unenrollDialog.isOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30">
                <FaExclamationTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {t("classroom.leaveClass")}
              </h2>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {t("classroom.confirmLeave", {
                className: unenrollDialog.className,
              })}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                className="cursor-pointer"
                onClick={() =>
                  setUnenrollDialog({
                    isOpen: false,
                    classId: null,
                    className: "",
                  })
                }
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleUnenroll}
                className="cursor-pointer border-red-500 bg-red-500 hover:bg-red-600"
              >
                {t("classroom.leaveClass")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default ClassRoomList;
