import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaGoogle,
  FaEnvelope,
  FaLock,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FormAnimation from "../../components/ui/FormAnimation";
import { loginUser } from "../../services/authService";
import { UserRole } from "../../types/userRole";
import { setAuthCredentials } from "../../utils/axiosCustom";
import { OAuthConfig } from "../../utils/oauth2";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { passwordResetSuccess, email: resetEmail } = location.state || {};

  const [email, setEmail] = useState(resetEmail || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] =
    useState<boolean>(!!passwordResetSuccess);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    {
      email: resetEmail ? true : false,
      password: false,
    },
  );
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // Auto-hide success message after 8 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Hide success message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccess]);

  const validateField = (field: "email" | "password", value: string) => {
    if (field === "email") {
      if (!value) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
    } else if (field === "password") {
      if (!value) return "Password is required";

      // Enhanced password validation
      const lengthValid = value.length >= 8 && value.length <= 20;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

      if (!lengthValid) return "Password must be between 8-20 characters";
      if (!hasUpperCase)
        return "Password must contain at least one uppercase letter";
      if (!hasLowerCase)
        return "Password must contain at least one lowercase letter";
      if (!hasNumber) return "Password must contain at least one number";
      if (!hasSpecialChar)
        return "Password must contain at least one special character";
    }
    return "";
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched({ ...touched, [field]: true });

    const value = field === "email" ? email : password;
    const errorMessage = validateField(field, value);

    if (errorMessage) {
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);

    const newErrors: { email?: string; password?: string } = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    // If no errors, proceed with login
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      // Login with full interface
      const authRequest = {
        email,
        password,
        role: role.toUpperCase(),
        platform: "web",
        version: "1.0.0",
        device_token: undefined, // Could be implemented with push notification service
      };

      loginUser(authRequest)
        .then((token) => {
          if (token.code === "M000") {
            // Use the setAuthCredentials function from axiosCustom.ts
            setAuthCredentials(token.data.access_token);

            // Navigate to the appropriate dashboard based on role
            if (role === UserRole.STUDENT) {
              navigate("/student/dashboard");
            } else {
              navigate("/teacher/dashboard");
            }
          }
        })
        .catch((error) => {
          console.error("Login failed:", error);
          setErrors({ email: "Login failed. Please try again." });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleGoogleLogin = () => {
    // Google SSO login logic with selected role
    console.log("Login with Google as", role);
    const redirectUrl = OAuthConfig.google.redirectUri;
    const authUrl = OAuthConfig.google.authUri;
    const clientId = OAuthConfig.google.clientId;

    // Add the selected role as state parameter to be retrieved after OAuth flow
    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      redirectUrl,
    )}&response_type=code&client_id=${clientId}&scope=openid%20email%20profile&state=${role}`;
    window.location.href = targetUrl;
  };

  return (
    <FormAnimation>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to continue your learning journey
          </p>
        </div>

        <div className="relative rounded-xl bg-white/90 p-8 shadow-lg dark:bg-gray-900/90">
          {isLoading && (
            <LoadingOverlay
              show={isLoading}
              message="Signing you in..."
              variant="container"
            />
          )}

          {/* Password reset success message */}
          {showSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-green-500 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Your password has been successfully reset. You can now sign
                    in with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuccess(false)}
                  className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-800/50"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            fullWidth
            className="mb-6 flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="text-[#4285F4]" />
            <span>Sign in with Google</span>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole(UserRole.STUDENT)}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                  role === UserRole.STUDENT
                    ? "border-[var(--color-gradient-to)] bg-[var(--color-gradient-to)]/10 text-[var(--color-gradient-to)]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <FaUserGraduate size={18} />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.TEACHER)}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition-all ${
                  role === UserRole.TEACHER
                    ? "border-[var(--color-gradient-to)] bg-[var(--color-gradient-to)]/10 text-[var(--color-gradient-to)]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <FaChalkboardTeacher size={18} />
                <span>Teacher</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  handleBlur("email");
                }
              }}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : undefined}
              placeholder="Enter your email"
              required
              autoComplete="email"
              icon={<FaEnvelope className="text-gray-400" />}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  handleBlur("password");
                }
              }}
              onBlur={() => handleBlur("password")}
              error={touched.password ? errors.password : undefined}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              icon={<FaLock className="text-gray-400" />}
            />

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                <Link
                  to="/authentication/forgot-password"
                  className="text-[var(--color-gradient-to)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6 cursor-pointer"
              isLoading={isLoading}
              loadingText="Signing In..."
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <Link
              to="/authentication/register"
              className="text-[var(--color-gradient-from)] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </FormAnimation>
  );
};

export default Login;
