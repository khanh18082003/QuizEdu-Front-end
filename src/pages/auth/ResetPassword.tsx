import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import FormAnimation from "../../components/ui/FormAnimation";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { resetPassword } from "../../services/userService";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validate password field
  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";

    const lengthValid = password.length >= 8 && password.length <= 20;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!lengthValid) return "Password must be between 8-20 characters";
    if (!hasUpperCase)
      return "Password must contain at least one uppercase letter";
    if (!hasLowerCase)
      return "Password must contain at least one lowercase letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecialChar)
      return "Password must contain at least one special character";

    return "";
  };

  // Validate confirm password field
  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ): string => {
    if (!confirmPassword) return "Confirm password is required";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate on change if field has been touched
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "password") {
      error = validatePassword(value);
    } else if (name === "confirmPassword") {
      error = validateConfirmPassword(value, formData.password);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error === "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      password: true,
      confirmPassword: true,
    });

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

    // If no errors, proceed with password reset
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setGeneralError(null);

      try {
        // Call resetPassword with email, password and verification code
        const response = await resetPassword(
          email,
          formData.password,
          formData.confirmPassword,
        );

        if (response.code === "M000" && response.status === 200) {
          // Show success and redirect to login
          navigate("/authentication/login", {
            state: {
              passwordResetSuccess: true,
              email,
            },
          });
        } else {
          setGeneralError(
            "Failed to reset password. The server didn't respond as expected.",
          );
        }
      } catch (error) {
        console.error("Password reset failed:", error);
        if (error?.response?.status === 401) {
          setGeneralError(
            "Your reset code has expired. Please request a new password reset.",
          );
        } else {
          setGeneralError(
            error?.response?.data?.message ||
              "Failed to reset password. Please try again.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FormAnimation>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create a new secure password for your account
          </p>
          {email && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Email: {email}
            </p>
          )}
        </div>

        <div className="relative rounded-xl bg-white/90 p-8 shadow-lg dark:bg-gray-900/90">
          {isLoading && (
            <LoadingOverlay
              show={isLoading}
              message="Updating your password..."
              variant="container"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {generalError}
                </p>
              </div>
            )}

            <InputField
              label="New Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : undefined}
              placeholder="Create a new password"
              required
              icon={<FaLock className="text-gray-400" />}
            />

            <InputField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
              placeholder="Confirm your new password"
              required
              icon={<FaLock className="text-gray-400" />}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6"
              isLoading={isLoading}
              loadingText="Resetting..."
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </FormAnimation>
  );
};

export default ResetPassword;
