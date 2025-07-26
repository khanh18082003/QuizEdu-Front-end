import { useState } from "react";
import {
  FaPalette,
  FaGlobe,
  FaBell,
  FaLock,
  FaUserCog,
  FaSave,
  FaCheck,
  FaChalkboardTeacher,
} from "react-icons/fa";
import ThemeToggle from "../../components/ui/ThemeToggle";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";

const TeacherSettings = () => {
  const [savedMessage, setSavedMessage] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    studentSubmissions: true,
    classUpdates: true,
    deadlineReminders: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowStudentContact: true,
  });
  const [teachingPreferences, setTeachingPreferences] = useState({
    autoGrading: true,
    instantFeedback: true,
    allowRetakes: false,
    showCorrectAnswers: true,
    timeLimit: "60",
    passingGrade: "70",
  });

  const handleSave = () => {
    // Simulate saving settings
    setSavedMessage("Settings saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleTeachingPreferenceChange = (
    key: string,
    value: string | boolean,
  ) => {
    setTeachingPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Teacher Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your teaching preferences, account settings, and classroom
          configurations
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6">
        {/* Appearance Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <FaPalette className="text-lg text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize the look and feel of your interface
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Switch between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <FaGlobe className="text-lg text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Language & Region
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set your preferred language and regional settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose your display language
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Teaching Preferences Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <FaChalkboardTeacher className="text-lg text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Teaching Preferences
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure your default quiz and classroom settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto Grading
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically grade multiple choice questions
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={teachingPreferences.autoGrading}
                  onChange={(e) =>
                    handleTeachingPreferenceChange(
                      "autoGrading",
                      e.target.checked,
                    )
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instant Feedback
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show results immediately after quiz completion
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={teachingPreferences.instantFeedback}
                  onChange={(e) =>
                    handleTeachingPreferenceChange(
                      "instantFeedback",
                      e.target.checked,
                    )
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Retakes
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow students to retake quizzes
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={teachingPreferences.allowRetakes}
                  onChange={(e) =>
                    handleTeachingPreferenceChange(
                      "allowRetakes",
                      e.target.checked,
                    )
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Correct Answers
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Display correct answers after quiz completion
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={teachingPreferences.showCorrectAnswers}
                  onChange={(e) =>
                    handleTeachingPreferenceChange(
                      "showCorrectAnswers",
                      e.target.checked,
                    )
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Time Limit (minutes)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Default time limit for new quizzes
                </p>
              </div>
              <select
                value={teachingPreferences.timeLimit}
                onChange={(e) =>
                  handleTeachingPreferenceChange("timeLimit", e.target.value)
                }
                className="block w-24 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              >
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
                <option value="90">90</option>
                <option value="120">120</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Passing Grade (%)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum score to pass quizzes
                </p>
              </div>
              <select
                value={teachingPreferences.passingGrade}
                onChange={(e) =>
                  handleTeachingPreferenceChange("passingGrade", e.target.value)
                }
                className="block w-24 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              >
                <option value="60">60%</option>
                <option value="65">65%</option>
                <option value="70">70%</option>
                <option value="75">75%</option>
                <option value="80">80%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <FaBell className="text-lg text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control how you receive notifications about your classes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={notifications.email}
                  onChange={(e) =>
                    handleNotificationChange("email", e.target.checked)
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Student Submissions
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Notify when students submit assignments
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={notifications.studentSubmissions}
                  onChange={(e) =>
                    handleNotificationChange(
                      "studentSubmissions",
                      e.target.checked,
                    )
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Updates
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Notify about class schedule changes
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={notifications.classUpdates}
                  onChange={(e) =>
                    handleNotificationChange("classUpdates", e.target.checked)
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deadline Reminders
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Remind about upcoming assignment deadlines
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={notifications.deadlineReminders}
                  onChange={(e) =>
                    handleNotificationChange(
                      "deadlineReminders",
                      e.target.checked,
                    )
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <FaLock className="text-lg text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Privacy & Security
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control your privacy and security settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Visibility
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Control who can see your profile
                </p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) =>
                  handlePrivacyChange("profileVisibility", e.target.value)
                }
                className="block w-32 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="students">Students</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Student Contact
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow students to contact you directly
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={privacy.allowStudentContact}
                  onChange={(e) =>
                    handlePrivacyChange("allowStudentContact", e.target.checked)
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
              <FaUserCog className="text-lg text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings and data
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full rounded-lg bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              <div className="font-medium text-gray-900 dark:text-white">
                Change Password
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Update your account password
              </div>
            </button>

            <button className="w-full rounded-lg bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              <div className="font-medium text-gray-900 dark:text-white">
                Export Class Data
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Download your class and student data
              </div>
            </button>

            <button className="w-full rounded-lg bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              <div className="font-medium text-gray-900 dark:text-white">
                Backup Settings
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Create a backup of your preferences
              </div>
            </button>

            <button className="w-full rounded-lg bg-red-50 px-4 py-3 text-left transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30">
              <div className="font-medium text-red-600 dark:text-red-400">
                Delete Account
              </div>
              <div className="text-sm text-red-500 dark:text-red-400">
                Permanently delete your account and data
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          {savedMessage && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <FaCheck className="text-sm" />
              <span className="text-sm font-medium">{savedMessage}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
          >
            <FaSave className="text-sm" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
