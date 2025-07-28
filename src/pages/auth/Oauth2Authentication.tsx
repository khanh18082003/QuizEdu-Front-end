import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGoogle,
  FaCheckCircle,
  FaTimesCircle,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { outboundAuthentication } from "../../services/authService";
import { UserRole } from "../../types/userRole";
import FormAnimation from "../../components/ui/FormAnimation";

export const Oauth2Authentication = () => {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<
    "processing" | "success" | "error" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  const callAuthenticationAPI = useCallback(
    async (authCode: string, role: string) => {
      try {
        setAuthStatus("processing");
        setUserRole(role);

        const response = await outboundAuthentication(authCode, role);

        if (response && response.data) {
          sessionStorage.setItem("token", response.data.access_token);
          setAuthStatus("success");

          // Delay navigation to show success state
          setTimeout(() => {
            if (role === UserRole.TEACHER) {
              navigate("/teacher/dashboard");
            } else {
              navigate("/student/dashboard");
            }
          }, 500);
        }
      } catch (error: unknown) {
        console.error("Authentication error:", error);
        setAuthStatus("error");
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try again.";
        setErrorMessage(errorMsg);
      } finally {
        // isLoading is managed by authStatus state
      }
    },
    [navigate],
  );

  useEffect(() => {
    // Extract the authentication code from URL
    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    // Extract the role from URL state parameter
    const stateRegex = /state=([^&]+)/;
    const stateMatch = window.location.href.match(stateRegex);

    // Get role from state parameter or default to "student"
    const role = stateMatch ? stateMatch[1] : UserRole.STUDENT;

    if (isMatch) {
      const authCode = isMatch[1];
      callAuthenticationAPI(authCode, role);
    } else {
      setAuthStatus("error");
      setErrorMessage(
        "No authentication code found. Please try logging in again.",
      );
    }
  }, [callAuthenticationAPI]);

  const getRoleIcon = (role: string) => {
    return role === UserRole.TEACHER ? (
      <FaChalkboardTeacher />
    ) : (
      <FaUserGraduate />
    );
  };

  const getRoleText = (role: string) => {
    return role === UserRole.TEACHER ? "Teacher" : "Student";
  };

  const handleRetry = () => {
    navigate("/auth/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <FormAnimation>
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200/50 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <FaGoogle className="text-2xl text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Google Authentication
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Completing your sign-in process...
              </p>
            </div>

            {/* Content based on status */}
            {authStatus === "processing" && (
              <div className="space-y-6 text-center">
                <div className="relative">
                  <div className="mx-auto mb-4 h-20 w-20">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-purple-500"></div>
                    <div className="absolute inset-2 animate-ping rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                    <div className="absolute inset-6 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-200">
                    {getRoleIcon(userRole)}
                    <span className="font-medium">
                      Authenticating as {getRoleText(userRole)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Verifying your Google credentials...
                    </p>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {authStatus === "success" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Welcome back!
                  </h2>
                  <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-200">
                    {getRoleIcon(userRole)}
                    <span>
                      Successfully signed in as {getRoleText(userRole)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Redirecting you to your dashboard...
                  </p>
                </div>
              </div>
            )}

            {authStatus === "error" && (
              <div className="space-y-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <FaTimesCircle className="text-3xl text-red-500" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Authentication Failed
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {errorMessage}
                  </p>

                  <button
                    onClick={handleRetry}
                    className="w-full transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-700 active:scale-95"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!authStatus && (
              <div className="space-y-6 text-center">
                <div className="mx-auto mb-4 h-20 w-20">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-purple-500"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Initializing authentication...
                </p>
              </div>
            )}
          </div>
        </div>
      </FormAnimation>
    </div>
  );
};
