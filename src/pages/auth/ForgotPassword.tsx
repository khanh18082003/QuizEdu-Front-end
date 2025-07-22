import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import FormAnimation from "../../components/ui/FormAnimation";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { requestPasswordReset } from "../../services/authService";
import { setPageTitle, PAGE_TITLES } from "../../utils/title";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Set page title
  useEffect(() => {
    setPageTitle(PAGE_TITLES.FORGOT_PASSWORD);
  }, []);

  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    return !/\S+@\S+\.\S+/.test(email) ? "Invalid email address" : "";
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateEmail(email);
    setError(validationError || undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(true);
    const validationError = validateEmail(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordReset(email);

      // Navigate to verification page with necessary data
      navigate("/authentication/verification", {
        state: {
          mode: "passwordReset",
          email: email,
        },
      });
    } catch (error) {
      console.error("Password reset request failed:", error);

      // Display error to user
      if (error?.response?.status === 404) {
        setError("No account found with this email address.");
      } else if (error?.response?.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to request password reset. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormAnimation>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your email to receive a verification code
          </p>
        </div>

        <div className="relative rounded-xl bg-white/90 p-8 shadow-lg dark:bg-gray-900/90">
          {isLoading && (
            <LoadingOverlay
              show={isLoading}
              message="Sending verification code..."
              variant="container"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched) {
                  handleBlur();
                }
              }}
              onBlur={handleBlur}
              error={touched ? error : undefined}
              placeholder="Enter your email"
              required
              autoComplete="email"
              icon={<FaEnvelope className="text-gray-400" />}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6"
              isLoading={isLoading}
              loadingText="Sending..."
            >
              Send Reset Code
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Remembered your password?{" "}
              <Link
                to="/authentication/login"
                className="text-[var(--color-gradient-to)] hover:underline"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </FormAnimation>
  );
};

export default ForgotPassword;
