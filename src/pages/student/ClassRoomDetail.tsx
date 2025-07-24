import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaBook,
  FaUsers,
  FaChevronLeft,
  FaBullhorn,
  FaClipboardList,
  FaClipboardCheck,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import SkeletonLoader from "../../components/ui/SkeletonLoader";

// Mock classroom data (replace with API call in production)
const mockClassroomDetails = {
  id: "class-001",
  name: "Phát triển ứng dụng cho các thiết bị di động",
  subject: "Mobile Development",
  teacherName: "Hieu Nguyen Trung",
  semester: "Năm học 2024 - 2025 (01-2025) - Lớp Chiều Thứ 5 Hàng Tuần",
  lastUpdated: new Date("2025-07-15"),
  imageUrl: "https://gstatic.com/classroom/themes/img_graduation.jpg",
  announcements: [
    {
      id: "ann-001",
      authorName: "Hieu Nguyen Trung",
      authorAvatar: "H",
      content:
        "Chào mừng các bạn đến với lớp học Phát triển ứng dụng cho các thiết bị di động! Các bạn hãy xem tài liệu đính kèm để chuẩn bị cho buổi học đầu tiên.",
      date: new Date("2025-07-01"),
      attachments: [
        { name: "Syllabus.pdf", url: "#" },
        { name: "Course-Intro.pptx", url: "#" },
      ],
    },
    {
      id: "ann-002",
      authorName: "Hieu Nguyen Trung",
      authorAvatar: "H",
      content:
        "Hieu Nguyen Trung đã đăng một bài tập mới: Nộp Source và File word",
      date: new Date("2025-07-27"),
      dueDate: new Date("2025-08-14"),
      attachments: [],
    },
  ],
  assignments: [
    {
      id: "asn-001",
      title: "Nộp Source và File word",
      dueDate: new Date("2025-08-14"),
      assignedDate: new Date("2025-07-27"),
      status: "assigned",
    },
    {
      id: "asn-002",
      title: "Bài kiểm tra giữa kỳ",
      dueDate: new Date("2025-07-27"),
      assignedDate: new Date("2025-07-01"),
      status: "completed",
    },
    {
      id: "lab-001",
      title: "Bài Lab 3",
      dueDate: new Date("2025-07-27"),
      assignedDate: new Date("2025-07-10"),
      status: "assigned",
    },
    {
      id: "lab-002",
      title: "Bài Lab 2",
      dueDate: new Date("2025-07-27"),
      assignedDate: new Date("2025-07-05"),
      status: "assigned",
    },
  ],
  people: {
    teachers: [
      {
        id: "teacher-001",
        name: "Hieu Nguyen Trung",
        avatar: "H",
      },
    ],
    students: [
      {
        id: "student-001",
        name: "DAM TUAN PHAT",
        avatar: "D",
      },
      {
        id: "student-002",
        name: "DANG THI HIEU NGAN",
        avatar: "D",
      },
      {
        id: "student-003",
        name: "DANG VAN BAO LINH",
        avatar: "D",
      },
      {
        id: "student-004",
        name: "DANG VIET HUNG",
        avatar: "D",
      },
      // Thêm nhiều học sinh khác ở đây nếu cần
    ],
  },
};

type TabType = "stream" | "classwork" | "people";

const ClassRoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [classroom, setClassroom] = useState<
    typeof mockClassroomDetails | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Format date to be displayed in user's locale
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Set page title dynamically based on classroom name
  useEffect(() => {
    if (classroom) {
      document.title = `${classroom.name} | Quiz Edu`;
    } else {
      document.title = "Classroom | Quiz Edu";
    }
  }, [classroom]);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchClassroomDetails = async () => {
      try {
        // In a real app, you would fetch data from your API here using the id parameter
        setTimeout(() => {
          setClassroom(mockClassroomDetails);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching classroom details:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClassroomDetails();
    } else {
      navigate("/student/classrooms");
    }
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate("/student/classrooms");
  };

  // Render the stream tab (announcements/feed)
  const renderStreamTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6 space-y-6">
        {classroom.announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                {announcement.authorAvatar}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {announcement.authorName}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(announcement.date)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {announcement.content}
                </p>

                {announcement.dueDate && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <FaClipboardCheck className="h-4 w-4" />
                    <span>
                      {t("classroom.dueDate")}:{" "}
                      {formatDate(announcement.dueDate)}
                    </span>
                  </div>
                )}

                {announcement.attachments &&
                  announcement.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("classroom.attachments")}:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {announcement.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                          >
                            <FaBook className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the classwork tab
  const renderClassworkTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6">
        <div className="mb-6">
          <select
            className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[var(--color-gradient-to)] focus:ring-1 focus:ring-[var(--color-gradient-from)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            defaultValue="all"
          >
            <option value="all">{t("classroom.allTopics")}</option>
          </select>
        </div>

        <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          {t("classroom.assignedWork")}
        </h3>

        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
          {classroom.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  <FaClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-gray-800 dark:text-white">
                    {assignment.title}
                  </h4>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("classroom.dueDate")}: {formatDate(assignment.dueDate)}
                  </div>
                </div>
              </div>
              <div>
                {assignment.status === "completed" ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {t("classroom.completed")}
                  </span>
                ) : (
                  <Button variant="primary" size="sm">
                    {t("classroom.viewAssignment")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the people tab
  const renderPeopleTab = () => {
    if (!classroom) return null;

    return (
      <div className="mt-6 space-y-8">
        {/* Teachers section */}
        <div>
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            {t("classroom.teachers")}
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {classroom.people.teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                  {teacher.avatar}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {teacher.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {t("classroom.students")}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {classroom.people.students.length} {t("classroom.studentsCount")}
            </span>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {classroom.people.students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 border-b border-gray-200 p-4 last:border-0 dark:border-gray-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white">
                  {student.avatar}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {student.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <SkeletonLoader height="40px" width="300px" animation="pulse" />
        </div>
        <div className="h-40 w-full">
          <SkeletonLoader height="100%" width="100%" animation="pulse" />
        </div>
        <div className="mt-6">
          <SkeletonLoader height="30px" width="500px" animation="pulse" />
        </div>
        <div className="mt-8">
          <SkeletonLoader height="200px" width="100%" animation="pulse" />
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
            {t("classroom.classNotFound")}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t("classroom.classNotFoundDesc")}
          </p>
          <Button
            variant="primary"
            className="cursor-pointer"
            onClick={handleGoBack}
          >
            {t("common.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back button */}
      <button
        onClick={handleGoBack}
        className="mb-4 flex cursor-pointer items-center gap-2 text-blue-600 duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <FaChevronLeft className="h-3 w-3" />
        <span>{t("common.backToClasses")}</span>
      </button>

      {/* Classroom header */}
      <div
        className="relative mb-6 h-48 w-full rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${classroom.imageUrl})` }}
      >
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{classroom.name}</h1>
            <p className="mt-2 text-lg text-gray-200">{classroom.semester}</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("stream")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "stream"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <FaBullhorn className="h-4 w-4" />
            <span>{t("classroom.tabs.stream")}</span>
          </button>
          <button
            onClick={() => setActiveTab("classwork")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "classwork"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <FaClipboardList className="h-4 w-4" />
            <span>{t("classroom.tabs.classwork")}</span>
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "people"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <FaUsers className="h-4 w-4" />
            <span>{t("classroom.tabs.people")}</span>
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "stream" && renderStreamTab()}
        {activeTab === "classwork" && renderClassworkTab()}
        {activeTab === "people" && renderPeopleTab()}
      </div>
    </div>
  );
};

export default ClassRoomDetail;
