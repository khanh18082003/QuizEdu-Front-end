import { useState } from "react";
import {
  FaSearch,
  FaTrophy,
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaClipboardList,
} from "react-icons/fa";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { PAGE_TITLES, usePageTitle } from "../../utils/title";
import { useTranslation } from "react-i18next";

const StudentHome = () => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  // Set page title
  const { t } = useTranslation();
  // Set page title
  usePageTitle(PAGE_TITLES.STUDENT_HOME);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the room code - should be 6 digits
    if (!/^\d{6}$/.test(roomCode)) {
      setError("Room code must be 6 digits");
      return;
    }

    // TODO: API call to join room
    console.log(`Joining room with code: ${roomCode}`);
  };

  const recentActivities = [
    {
      id: 1,
      type: "quiz",
      title: "Physics Quiz - Forces",
      score: "85%",
      date: "2 days ago",
    },
    {
      id: 2,
      type: "assignment",
      title: "Math Assignment - Calculus",
      score: "Pending",
      date: "5 days ago",
    },
    {
      id: 3,
      type: "exam",
      title: "Chemistry Final Exam",
      score: "92%",
      date: "1 week ago",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      type: "quiz",
      title: "Biology Quiz - Cell Division",
      date: "Tomorrow, 10:00 AM",
    },
    {
      id: 2,
      type: "exam",
      title: "Literature Mid-term",
      date: "Nov 15, 11:30 AM",
    },
  ];

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Join Class */}
        <div className="col-span-1 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Join Class
          </h2>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <InputField
              id="roomCode"
              label="Enter 6-digit room code"
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                setError("");
              }}
              error={error}
              icon={<FaSearch />}
              className="mb-4"
              maxLength={6}
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!roomCode}
            >
              Join Class
            </Button>
          </form>
        </div>

        {/* Statistics */}
        <div className="col-span-1 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Your Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center justify-center text-blue-500">
                <FaTrophy size={24} />
              </div>
              <p className="text-center text-lg font-bold">87%</p>
              <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                Average Score
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="mb-2 flex items-center justify-center text-green-500">
                <FaClipboardList size={24} />
              </div>
              <p className="text-center text-lg font-bold">12</p>
              <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                Quizzes Taken
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <div className="mb-2 flex items-center justify-center text-purple-500">
                <FaChalkboardTeacher size={24} />
              </div>
              <p className="text-center text-lg font-bold">5</p>
              <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                Enrolled Classes
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <div className="mb-2 flex items-center justify-center text-amber-500">
                <FaCalendarCheck size={24} />
              </div>
              <p className="text-center text-lg font-bold">2</p>
              <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                Upcoming Events
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-span-1 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
            Recent Activities
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-gray-100 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {activity.title}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.date}
                  </span>
                  <span
                    className={`text-xs font-medium ${activity.score === "Pending" ? "text-amber-500" : "text-green-500"}`}
                  >
                    {activity.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Upcoming Events
        </h2>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.date}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={event.type === "exam" ? "danger" : "secondary"}
                >
                  {event.type === "exam" ? "Prepare" : "Review"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No upcoming events
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
