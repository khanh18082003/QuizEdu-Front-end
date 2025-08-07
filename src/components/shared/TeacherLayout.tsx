import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import SkeletonDashboard from "../ui/SkeletonDashboard";
import {
  FaHome,
  FaBook,
  FaClipboardList,
  FaChalkboardTeacher,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  type RegisterResponse,
} from "../../services/userService";
import { logoutUser } from "../../services/authService";
import { useEffect, useState } from "react";
import { myProfile, clearProfile } from "../../actions/user";
import {
  clearAuthCredentials,
  setAuthCredentials,
} from "../../utils/axiosCustom";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";

const TeacherLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );
  const dispatch = useDispatch();

  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Lấy token từ sessionStorage
        const token = sessionStorage.getItem("token");

        if (!token) {
          // Không có token, chuyển hướng đến trang đăng nhập
          navigate("/authentication/login");
          return;
        }

        // Đảm bảo token được thiết lập cho các API request
        setAuthCredentials(token);

        // Chỉ fetch profile nếu chưa có
        if (!user.id || user.id.length === 0) {
          setIsLoading(true);
          const response = await fetchUserProfile();

          if (response.data) {
            // Lưu profile vào Redux store
            dispatch(myProfile(response.data));

            // Kiểm tra role, nếu không phải teacher thì chuyển hướng
            if (response.data.role.toLowerCase() !== "teacher") {
              navigate("/student/dashboard");
              return;
            }

            // Kiểm tra nếu user cần tạo password
            if (response.data.no_password) {
              navigate("/authentication/create-password");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);

        // Clear authentication credentials (removes token from localStorage)
        clearAuthCredentials();

        // Clear user profile from Redux state
        dispatch(clearProfile());

        // Navigate to login page
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [dispatch, navigate, user]);

  // Show loading indicator while profile is being fetched
  if (isLoading && (!user || !user.id)) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Skeleton */}
        <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-100/40 bg-white shadow-lg transition-transform lg:static lg:translate-x-0 dark:border-gray-700/40 dark:bg-gray-800">
          {/* Logo - Skeleton */}
          <div className="flex h-16 items-center border-b border-gray-100/40 px-6 dark:border-gray-700/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-7 w-32 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Nav links - Skeleton */}
          <nav className="flex-1 space-y-1 p-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </nav>

          {/* Bottom section - Skeleton */}
          <div className="mt-auto border-t border-gray-100/40 p-4 dark:border-gray-700/40">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-4 flex justify-between">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </aside>

        {/* Main content - Skeleton */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Top header - Skeleton */}
          <header className="sticky top-0 z-40 border-b border-gray-100/40 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/40 dark:bg-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="h-7 w-48 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </header>

          {/* Page content - Import Skeleton Dashboard */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              <SkeletonDashboard />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Define teacher navigation items
  const navItems = [
    {
      to: "/teacher/dashboard",
      label: "Dashboard",
      icon: <FaHome className="text-xl" />,
      match: /^\/teacher\/dashboard/,
    },
    {
      to: "/teacher/classes",
      label: "Classes",
      icon: <FaBook className="text-xl" />,
      match: /^\/teacher\/classes/,
    },
    {
      to: "/teacher/quizzes",
      label: "Quizzes",
      icon: <FaClipboardList className="text-xl" />,
      match: /^\/teacher\/quizzes/,
    },
    {
      to: "/teacher/profile",
      label: "Profile",
      icon: <FaChalkboardTeacher className="text-xl" />,
      match: /^\/teacher\/profile/,
    },
    {
      to: "/teacher/settings",
      label: "Settings",
      icon: <FaCog className="text-xl" />,
      match: /^\/teacher\/settings/,
    },
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout API with the user role
      await logoutUser({ role: "TEACHER" });

      // Clear authentication credentials (removes token from localStorage)
      clearAuthCredentials();

      // Clear user profile from Redux state
      dispatch(clearProfile());

      // Navigate to login page
      navigate("/authentication/login");
    } catch (error) {
      console.error("Logout failed:", error);

      // Even if the API call fails, still clear credentials and redirect
      clearAuthCredentials();
      dispatch(clearProfile());
      navigate("/authentication/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-100/40 bg-white shadow-lg transition-all duration-300 lg:static lg:translate-x-0 dark:border-gray-700/40 dark:bg-gray-800 ${
          isSidebarCollapsed ? "w-16" : "w-72"
        } ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-100/40 px-6 dark:border-gray-700/40">
          <Link to="/teacher/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] text-xl text-white shadow-md">
              🎓
            </div>
            {!isSidebarCollapsed && (
              <h1 className="bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                Quiz Edu
              </h1>
            )}
          </Link>
        </div>

        {/* Collapse toggle button */}
        <div className="hidden justify-end p-2 lg:flex">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <FaBars className="h-4 w-4" />
            ) : (
              <FaTimes className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-2 px-3 py-2">
          {navItems.map((item) => {
            const isActive = item.match.test(location.pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100/60 dark:text-gray-300 dark:hover:bg-gray-700/60"
                } ${isSidebarCollapsed ? "justify-center" : ""}`}
                title={isSidebarCollapsed ? item.label : ""}
              >
                <span
                  className={`${isActive ? "text-white" : "text-[var(--color-gradient-from)]"} ${isSidebarCollapsed ? "text-lg" : ""}`}
                >
                  {item.icon}
                </span>
                {!isSidebarCollapsed && item.label}
                {isSidebarCollapsed && (
                  <span className="absolute left-full z-50 ml-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-gray-100/40 p-3 dark:border-gray-700/40">
          <button
            className={`group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-900/20 ${isSidebarCollapsed ? "justify-center" : ""}`}
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <FaSignOutAlt
              className={`text-xl ${isSidebarCollapsed ? "text-lg" : ""}`}
            />
            {!isSidebarCollapsed && "Logout"}
            {isSidebarCollapsed && (
              <span className="absolute left-full z-50 ml-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                Logout
              </span>
            )}
          </button>
          {!isSidebarCollapsed && (
            <div className="mt-5 flex justify-between px-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-40 border-b border-gray-100/40 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm dark:border-gray-700/40 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Toggle mobile menu"
              >
                <FaBars className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Teacher Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="group relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] text-white shadow-md transition-transform group-hover:scale-105">
                  {user && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.display_name || "User Avatar"}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="font-medium">${user.display_name ? user.display_name.substring(0, 2).toUpperCase() : ""}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="font-medium">
                      {user && user.display_name
                        ? user.display_name.substring(0, 2).toUpperCase()
                        : ""}
                    </span>
                  )}
                </div>
              </div>
              {user && user.display_name && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.display_name}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content - Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-5 py-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
