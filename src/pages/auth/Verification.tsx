import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent, ChangeEvent, ClipboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import FormAnimation from "../../components/ui/FormAnimation";
import LoadingOverlay from "../../components/ui/LoadingOverlay";

import {
  verifyUser,
  resendVerificationCode,
  loginUser,
} from "../../services/authService";
import { setAuthCredentials } from "../../utils/axiosCustom";
import { setPageTitle, PAGE_TITLES } from "../../utils/title";

const Verification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { response, password, mode, email } = location.state || {};

  // Determine if we're in password reset mode
  const isPasswordReset = mode === "passwordReset";

  // Verification code state (array of 6 characters)
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Create refs for each input
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Initialize the refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);

    // Automatically focus the first input field when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Set page title
  useEffect(() => {
    setPageTitle(PAGE_TITLES.VERIFICATION);
  }, []);

  // Timer for resend button countdown
  useEffect(() => {
    if (!canResend && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setCanResend(true);
    }
  }, [timeRemaining, canResend]);

  // Validate input is only numbers or uppercase letters
  const validateInput = (value: string): string => {
    // Convert to uppercase and filter out non-alphanumeric characters
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  // Handle input change
  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = validateInput(event.target.value);

    // Update the code array
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to the next input if this one is filled
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear any previous errors
    if (error) setError("");
  };

  // Handle key press for navigation between inputs and backspace
  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        // If current input is empty and backspace is pressed, move to previous input
        inputRefs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      // Move to previous input on left arrow
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      // Move to next input on right arrow
      inputRefs.current[index + 1]?.focus();
    } else if (event.key === "Enter") {
      // If all fields are filled and Enter is pressed, submit the form
      if (!code.some((c) => c === "") && !isSubmitting) {
        handleSubmit(event);
      }
    }
  };

  // Handle pasting verification code
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").trim();

    // Filter and get only valid characters
    const validChars = pastedData
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .split("")
      .slice(0, 6);

    // Fill the code fields
    const newCode = [...code];
    validChars.forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });

    setCode(newCode);

    // Focus on the next empty field or the last field
    const nextEmptyIndex = newCode.findIndex((c) => c === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous states
    setError("");
    setIsSuccess(false);

    // Check if all fields are filled
    if (code.some((c) => c === "")) {
      setError("Please enter the complete verification code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const verificationCode = code.join("");

      // Handle password reset verification
      if (isPasswordReset) {
        // We need email to proceed
        const userEmail = email || response?.email;

        if (!userEmail) {
          setError("Missing email information. Please try again.");
          setIsSubmitting(false);
          return;
        }

        try {
          // Verify the reset code using email instead of ID
          const resetResponse = await verifyUser(userEmail, verificationCode);

          // If verification is successful
          if (resetResponse) {
            // Show success state
            setIsSuccess(true);

            // Navigate after a short delay to show success state
            setTimeout(() => {
              navigate("/authentication/reset-password", {
                state: {
                  email: userEmail,
                  verificationCode: verificationCode,
                },
              });
            }, 1000);
          }
        } catch (error: any) {
          console.error("Password reset verification error:", error);
          const errorCode = error?.response?.data?.code;

          if (errorCode === "U103") {
            setError("Code has been used already. Please request a new code.");
          } else if (errorCode === "U104") {
            setError("Code has expired. Please request a new code.");
          } else if (errorCode === "U102") {
            setError(
              "User account not found. Please check your email address.",
            );
          } else {
            setError(
              error?.response?.data?.message ||
                "Invalid verification code. Please try again.",
            );
          }
        }
      }
      // Handle account verification
      else {
        if (!response || !password) {
          setError("Missing verification information. Please try again.");
          setIsSubmitting(false);
          return;
        }

        if (!response.email) {
          setError("Missing email information. Please try again.");
          setIsSubmitting(false);
          return;
        }

        try {
          // Verify the code using email instead of ID
          const success = await verifyUser(response.email, verificationCode);

          if (success) {
            // Show success state
            setIsSuccess(true);

            // Log in the user automatically after successful verification
            const authRequest = {
              email: response.email,
              password,
              role: response.role.toUpperCase(),
              platform: "web",
              version: "1.0.0",
              device_token: undefined,
            };

            const tokenResponse = await loginUser(authRequest);
            // Set auth credentials
            setAuthCredentials(tokenResponse.data.access_token);

            // Navigate to the appropriate dashboard based on role
            setTimeout(() => {
              if (response.role.toLowerCase() === "student") {
                navigate("/student/dashboard");
              } else if (response.role.toLowerCase() === "teacher") {
                navigate("/teacher/dashboard");
              } else {
                navigate("/authentication/login");
              }
            }, 1000);
          }
        } catch (error: any) {
          console.error("Account verification error:", error);
          const errorCode = error?.response?.data?.code;

          if (errorCode === "U103") {
            setError("Code has been used already. Please request a new code.");
          } else if (errorCode === "U104") {
            setError("Code has expired. Please request a new code.");
          } else if (
            errorCode === "M100" &&
            error?.response?.data?.status === 401
          ) {
            setError(
              "Invalid code or expired time. Please request a new code.",
            );
          } else {
            setError(
              error?.response?.data?.message ||
                "Invalid verification code. Please try again.",
            );
          }
        }
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setError(
        error?.response?.data?.message ||
          "Verification failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend verification code
  const handleResend = async () => {
    if (!canResend) return;

    // For password reset, we need an email
    if (isPasswordReset && !email) {
      setError("Email information is missing. Please try again.");
      return;
    }

    // For account verification, we need response.email and other fields
    if (
      !isPasswordReset &&
      (!response?.email || !response?.first_name || !response?.last_name)
    ) {
      setError("User information is missing. Please try again.");
      return;
    }

    setIsResending(true);
    try {
      let success;

      if (isPasswordReset) {
        // Resend password reset code
        success = await resendVerificationCode(email, "", "");
        console.log("Resent password reset code:", success);
      } else {
        // Resend account verification code
        success = await resendVerificationCode(
          response?.email,
          response?.first_name,
          response?.last_name,
        );
      }

      if (success) {
        // Reset the timer and disable resend button
        setTimeRemaining(60);
        setCanResend(false);
      } else {
        setError("Could not resend the code. Please try again later.");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      const errorCode = error?.response?.data?.code;
      console.error("Resend code error code:", errorCode);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <FormAnimation>
      <div className="mx-auto max-w-lg py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {isPasswordReset ? "Reset Your Password" : "Account Verification"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            We have sent a 6-digit verification code to{" "}
            {response?.email || email}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The verification code is only valid for 10 minutes
          </p>
        </div>

        <div className="relative rounded-xl bg-white/90 p-8 shadow-lg dark:bg-gray-900/90">
          {isSubmitting && (
            <LoadingOverlay
              show={isSubmitting}
              message={
                isPasswordReset ? "Verifying code..." : "Verifying account..."
              }
              variant="container"
            />
          )}
          {isSuccess && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/95 dark:bg-gray-900/95">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="h-10 w-10 text-green-500 dark:text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
                  {isPasswordReset
                    ? "Verification Successful"
                    : "Account Verified"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isPasswordReset
                    ? "Redirecting to password reset..."
                    : "Logging you in..."}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Verification code inputs */}
            <div className="flex flex-col space-y-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Enter verification code
              </label>

              <div className="flex justify-between space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="h-14 w-12">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={code[index]}
                      onChange={(e) => handleChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="h-full w-full rounded-md border border-gray-300 text-center text-2xl font-bold focus:border-[var(--color-gradient-from)] focus:ring-2 focus:ring-[var(--color-gradient-from)]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      autoFocus={index === 0}
                      aria-label={`Verification code digit ${index + 1} of 6`}
                      aria-required="true"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      inputMode="numeric"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                loadingText={
                  isPasswordReset ? "Verifying..." : "Verifying Account..."
                }
              >
                {isPasswordReset ? "Verify Code" : "Verify Account"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Didn't receive the code?{" "}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-[var(--color-gradient-from)] hover:underline focus:outline-none"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </button>
                ) : (
                  <span className="text-gray-400">
                    Resend code in {timeRemaining} seconds
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </FormAnimation>
  );
};

export default Verification;
