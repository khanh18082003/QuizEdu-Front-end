import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FormAnimation from "../../components/ui/FormAnimation";
import {
  createPassword,
  type PasswordCreationData,
  type RegisterResponse,
} from "../../services/userService";
import { setPageTitle, PAGE_TITLES } from "../../utils/title";
import Toast from "../../components/ui/Toast";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";

const PasswordCreation = () => {
  const navigate = useNavigate();
  const user = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Set page title
  useEffect(() => {
    setPageTitle(PAGE_TITLES.PASSWORD_CREATION || "Create Password");
  }, []);

  // Validation functions
  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`])/.test(password))
      return "Password must contain at least one special character";
    return "";
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ): string => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field by removing the key
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    let error = "";
    if (name === "password") {
      error = validatePassword(formData.password);
    } else if (name === "confirmPassword") {
      error = validateConfirmPassword(
        formData.confirmPassword,
        formData.password,
      );
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    } else {
      // No error -> remove the key if it exists
      setErrors((prev) => {
        if (!(name in prev)) return prev;
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password,
    );

    const newErrors: Record<string, string> = {};
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const requestData: PasswordCreationData = {
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      await createPassword(requestData);

      // Show success message
      setToastType("success");
      setToastMessage("Password created successfully! Redirecting...");
      setShowToast(true);

      // Redirect to appropriate dashboard after a short delay
      setTimeout(() => {
        // Navigate based on user role
        if (user?.role?.toLowerCase() === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      }, 2000);
    } catch (error: unknown) {
      console.error("Password creation failed:", error);

      // Handle API error response
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        "Password creation failed. Please try again.";
      setToastType("error");
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormAnimation>
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] text-white shadow-lg">
            <FaLock className="text-2xl" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Create Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set up a secure password to protect your account
          </p>
        </div>

        <div className="relative rounded-xl bg-white/90 p-8 shadow-lg dark:bg-gray-900/90">
          {isLoading && (
            <LoadingOverlay
              show={isLoading}
              message="Creating password..."
              variant="container"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div className="relative">
              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
                placeholder="Enter your password"
                icon={<FaLock />}
                required
              />
              <button
                type="button"
                className="absolute top-10 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
                placeholder="Confirm your password"
                icon={<FaLock />}
                required
              />
              <button
                type="button"
                className="absolute top-10 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                Password Requirements:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li
                  className={
                    formData.password.length >= 8
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  • At least 8 characters long
                </li>
                <li
                  className={
                    /(?=.*[a-z])/.test(formData.password)
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  • One lowercase letter
                </li>
                <li
                  className={
                    /(?=.*[A-Z])/.test(formData.password)
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  • One uppercase letter
                </li>
                <li
                  className={
                    /(?=.*\d)/.test(formData.password)
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  • One number
                </li>
                <li
                  className={
                    /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`])/.test(
                      formData.password,
                    )
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  • One special character (!@#$%^&*()_+-=[]&#123;&#125;|;':",.
                  &lt;&gt;?/~`)
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6 cursor-pointer duration-200"
              isLoading={isLoading}
              loadingText="Creating Password..."
              disabled={
                !formData.password ||
                !formData.confirmPassword ||
                Object.values(errors).some(Boolean)
              }
            >
              Create Password
            </Button>
          </form>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => {
          setShowToast(false);
          setToastMessage("");
        }}
      />
    </FormAnimation>
  );
};

export default PasswordCreation;
