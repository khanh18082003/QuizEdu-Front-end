import {
  FaPlus,
  FaEye,
  FaUsers,
  FaBookOpen,
  FaChalkboard,
  FaClipboardList,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import { PAGE_TITLES, usePageTitle } from "../../utils/title";
import { useTranslation } from "react-i18next";

const TeacherHome = () => {
  // Set page title
  const { t } = useTranslation();
  // Set page title
  usePageTitle(PAGE_TITLES.TEACHER_HOME);

  const activeClasses = [
    {
      id: 1,
      name: "Physics 101",
      code: "123456",
      students: 42,
      quizzes: 8,
      avg: "76%",
    },
    {
      id: 2,
      name: "Chemistry Basics",
      code: "789012",
      students: 38,
      quizzes: 5,
      avg: "82%",
    },
    {
      id: 3,
      name: "Advanced Mathematics",
      code: "345678",
      students: 24,
      quizzes: 10,
      avg: "68%",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "quiz",
      title: "Physics Quiz - Gravity",
      status: "Published",
      date: "2 days ago",
    },
    {
      id: 2,
      type: "student",
      title: "New student joined: John Doe",
      status: "",
      date: "3 days ago",
    },
    {
      id: 3,
      type: "quiz",
      title: "Chemistry Quiz - Elements",
      status: "Draft",
      date: "5 days ago",
    },
  ];

  const stats = [
    {
      id: 1,
      label: "Active Students",
      value: 104,
      icon: <FaUsers className="text-purple-500" size={24} />,
    },
    {
      id: 2,
      label: "Active Classes",
      value: 3,
      icon: <FaBookOpen className="text-blue-500" size={24} />,
    },
    {
      id: 3,
      label: "Quizzes Created",
      value: 23,
      icon: <FaClipboardList className="text-green-500" size={24} />,
    },
    {
      id: 4,
      label: "Avg. Score",
      value: "75%",
      icon: <FaChalkboard className="text-amber-500" size={24} />,
    },
  ];

  const createClass = () => {
    // Implement create class functionality
    console.log("Create class clicked");
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header with user info */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-gradient-from)]">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create classes, quizzes, and track your students' progress
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex items-center rounded-lg bg-white p-6 shadow dark:bg-gray-800"
          >
            <div className="mr-4">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Classes and Activity */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Classes */}
        <div className="col-span-2 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Active Classes
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={createClass}
              icon={<FaPlus className="mr-1" />}
            >
              Create Class
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left dark:border-gray-700">
                  <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                    Class Name
                  </th>
                  <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                    Code
                  </th>
                  <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                    Students
                  </th>
                  <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                    Quizzes
                  </th>
                  <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                    Avg. Score
                  </th>
                  <th className="pt-2 pb-3 font-medium text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeClasses.map((cls) => (
                  <tr key={cls.id} className="border-b dark:border-gray-700">
                    <td className="py-4 font-medium text-gray-800 dark:text-white">
                      {cls.name}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-300">
                      {cls.code}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-300">
                      {cls.students}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-300">
                      {cls.quizzes}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-300">
                      {cls.avg}
                    </td>
                    <td className="py-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FaEye className="mr-1" />}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {activity.title}
                  </h3>
                  {activity.status && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        activity.status === "Published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activity.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="primary"
            className="h-auto justify-start p-4"
            icon={<FaPlus className="text-xl" />}
          >
            <div className="ml-3 text-left">
              <div className="font-medium">Create Quiz</div>
              <div className="text-xs opacity-80">Design a new assessment</div>
            </div>
          </Button>
          <Button
            variant="secondary"
            className="h-auto justify-start p-4"
            icon={<FaClipboardList className="text-xl" />}
          >
            <div className="ml-3 text-left">
              <div className="font-medium">Manage Quizzes</div>
              <div className="text-xs opacity-80">
                Edit or delete existing quizzes
              </div>
            </div>
          </Button>
          <Button
            variant="accent"
            className="h-auto justify-start p-4"
            icon={<FaUsers className="text-xl" />}
          >
            <div className="ml-3 text-left">
              <div className="font-medium">Student Reports</div>
              <div className="text-xs opacity-80">
                View performance analytics
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto justify-start p-4"
            icon={<FaBookOpen className="text-xl" />}
          >
            <div className="ml-3 text-left">
              <div className="font-medium">Learning Resources</div>
              <div className="text-xs opacity-80">
                Browse teaching materials
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
