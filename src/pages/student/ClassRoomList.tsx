import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaBook,
  FaUserAlt,
  FaClock,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import { usePageTitle, PAGE_TITLES } from "../../utils/title";

// Mock classroom data (replace with API call in production)
const mockClassrooms = [
  {
    id: "class-001",
    name: "Mathematics 101",
    subject: "Mathematics",
    teacherName: "Dr. Smith",
    semester: "Năm học 2024 - 2025 (01-2025)",
    lastUpdated: new Date("2025-07-15"),
    imageUrl: "https://gstatic.com/classroom/themes/img_graduation.jpg",
  },
  {
    id: "class-002",
    name: "Biology Advanced",
    subject: "Biology",
    teacherName: "Prof. Johnson",
    semester: "Năm học 2024 - 2025 (01-2025)",
    lastUpdated: new Date("2025-07-10"),
    imageUrl: "https://gstatic.com/classroom/themes/img_bookclub.jpg",
  },
  {
    id: "class-003",
    name: "English Literature",
    subject: "English",
    teacherName: "Ms. Williams",
    semester: "Năm học 2023 - 2024 (01-2024)",
    lastUpdated: new Date("2025-07-18"),
    imageUrl: "https://gstatic.com/classroom/themes/img_reachout.jpg",
  },
  {
    id: "class-004",
    name: "Chemistry Fundamentals",
    subject: "Chemistry",
    teacherName: "Dr. Garcia",
    semester: "Năm học 2024 - 2025 (01-2025)",
    lastUpdated: new Date("2025-07-05"),
    imageUrl: "https://gstatic.com/classroom/themes/Chemistry.jpg",
  },
];

const ClassRoomList = () => {
  const { t } = useTranslation();
  usePageTitle(PAGE_TITLES.CLASSROOM_LIST);

  const [searchQuery, setSearchQuery] = useState("");
  const [classrooms, setClassrooms] = useState<typeof mockClassrooms>([]);
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

  // Format date to be displayed in user's locale
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    // Simulate API call with a delay
    const fetchClassrooms = async () => {
      try {
        // In a real app, you would fetch data from your API here
        setTimeout(() => {
          setClassrooms(mockClassrooms);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  // Filter classrooms based on search query
  const filteredClassrooms = searchQuery
    ? classrooms.filter(
        (classroom) =>
          classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classroom.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          classroom.teacherName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : classrooms;

  // Handle join class form submission
  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the class code to your API
    console.log("Joining class with code:", classCode);
    setClassCode("");
    setIsJoinDialogOpen(false);
    // Optionally add the new class to the list or refresh the list
  };

  // Handle unenroll/leave class
  const openUnenrollDialog = (classId: string, className: string) => {
    setUnenrollDialog({
      isOpen: true,
      classId,
      className,
    });
  };

  const handleUnenroll = () => {
    if (!unenrollDialog.classId) return;

    // In a real app, you would call an API to unenroll from the class
    console.log("Unenrolling from class:", unenrollDialog.classId);

    // Update the UI by removing the class from the list
    setClassrooms((prevClassrooms) =>
      prevClassrooms.filter(
        (classroom) => classroom.id !== unenrollDialog.classId,
      ),
    );

    // Close the dialog
    setUnenrollDialog({
      isOpen: false,
      classId: null,
      className: "",
    });
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
                    <div
                      className="h-28 bg-cover bg-center"
                      style={{ backgroundImage: `url(${classroom.imageUrl})` }}
                    >
                      {/* Title overlay on banner image */}
                      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">
                          {classroom.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-200">
                          {classroom.semester}
                        </p>
                      </div>
                    </div>

                    {/* Teacher avatar */}
                    <div className="absolute right-4 -bottom-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-orange-500 text-xl font-bold text-white shadow-md">
                      {classroom.teacherName.charAt(0)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 pt-8">
                    <div className="mb-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FaUserAlt className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {classroom.teacherName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaBook className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {classroom.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(classroom.lastUpdated)}
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

                      <Link to={`/student/classroom/${classroom.id}`}>
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
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
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="primary" size="md" type="submit">
                  {t("classroom.joinClass")}
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
                variant="danger"
                size="md"
                onClick={handleUnenroll}
                className="bg-red-500 hover:bg-red-600"
              >
                {t("classroom.leaveClass")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassRoomList;
