import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FormAnimation from "../../components/ui/FormAnimation";
import {
  registerTeacher,
  type TeacherRegistrationData,
} from "../../services/userService";
import { setPageTitle, PAGE_TITLES } from "../../utils/title";

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    subjects: "",
    experience: "",
    schoolName: "",
  });

  // Set page title
  useEffect(() => {
    setPageTitle(PAGE_TITLES.REGISTER);
  }, []);

  const [touched, setTouched] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
    subjects: false,
    experience: false,
    schoolName: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (
    name: string,
    value: string,
    allFormData = formData,
  ) => {
    switch (name) {
      case "firstName":
        return !value.trim() ? "First name is required" : "";
      case "lastName":
        return !value.trim() ? "Last name is required" : "";
      case "displayName":
        return !value.trim() ? "Display name is required" : "";
      case "email":
        if (!value) return "Email is required";
        return !/\S+@\S+\.\S+/.test(value) ? "Invalid email address" : "";
      case "password": {
        if (!value) return "Password is required";

        // Enhanced password validation
        const lengthValid = value.length >= 8 && value.length <= 20;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
          value,
        );

        if (!lengthValid) return "Password must be between 8-20 characters";
        if (!hasUpperCase)
          return "Password must contain at least one uppercase letter";
        if (!hasLowerCase)
          return "Password must contain at least one lowercase letter";
        if (!hasNumber) return "Password must contain at least one number";
        if (!hasSpecialChar)
          return "Password must contain at least one special character";
        return "";
      }
      case "confirmPassword":
        return value !== allFormData.password ? "Passwords do not match" : "";
      case "subjects":
        return !value.trim() ? "Subjects are required" : "";
      case "experience":
        return !value ? "Experience is required" : "";
      case "schoolName":
        return !value.trim() ? "School name is required" : "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // If field has been touched, validate on change
    if (touched[name]) {
      handleFieldValidation(name, value, updatedFormData);
    }
  };

  const handleFieldValidation = (
    name: string,
    value: string,
    allFormData = formData,
  ) => {
    const error = validateField(name, value, allFormData);

    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Special case: when password changes, also validate confirmPassword
    if (name === "password" && touched.confirmPassword) {
      handleFieldValidation(
        "confirmPassword",
        allFormData.confirmPassword,
        allFormData,
      );
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    handleFieldValidation(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setTouched(allTouched);

    // Validate all fields
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value as string);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);

    // If no errors, proceed with registration
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        // Format request body according to API requirements
        const requestBody: TeacherRegistrationData = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: formData.displayName,
          role: "TEACHER",
          subjects: formData.subjects
            .split(",")
            .map((subject) => subject.trim()),
          experience: formData.experience,
          school_name: formData.schoolName,
        };

        // Make API call to register teacher using the service
        const response = await registerTeacher(requestBody);

        navigate("/authentication/verification", {
          state: {
            response: response.data,
            password: formData.password,
          },
        });
      } catch (error: unknown) {
        console.error("Registration failed:", error);

        // Handle API error response
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage = axiosError.response?.data?.message;

        setErrors((prev) => ({
          ...prev,
          email: errorMessage || "Registration failed. Please try again.",
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FormAnimation>
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Teacher Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create your teacher account to start teaching
          </p>
        </div>

        <div className="relative rounded-xl bg-white/90 p-8 shadow-lg dark:bg-gray-900/90">
          {isLoading && (
            <LoadingOverlay
              show={isLoading}
              message="Creating your account..."
              variant="container"
            />
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName ? errors.firstName : undefined}
                placeholder="Enter your first name"
                required
              />
              <InputField
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName ? errors.lastName : undefined}
                placeholder="Enter your last name"
                required
              />
            </div>

            <InputField
              label="Display Name"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.displayName ? errors.displayName : undefined}
              placeholder="Enter your display name"
              required
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
              placeholder="Enter your email"
              required
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
                placeholder="Create a password"
                required
              />

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
                placeholder="Confirm your password"
                required
              />
            </div>

            <InputField
              label="Subjects (comma separated)"
              name="subjects"
              type="text"
              value={formData.subjects}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.subjects ? errors.subjects : undefined}
              placeholder="E.g., Mathematics, Science, History"
              required
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="mb-4 w-full">
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Years of Experience
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-[var(--color-gradient-from)] focus:ring-2 focus:ring-[var(--color-gradient-from)]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 ${touched.experience && errors.experience ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} `}
                  required
                >
                  <option value="" disabled>
                    Select years
                  </option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-15">11-15 years</option>
                  <option value="16+">16+ years</option>
                </select>
                {touched.experience && errors.experience && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.experience}
                  </p>
                )}
              </div>

              <InputField
                label="School/Institution"
                name="schoolName"
                type="text"
                value={formData.schoolName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.schoolName ? errors.schoolName : undefined}
                placeholder="Your school or university"
                required
              />
            </div>

            <div className="mt-2 flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[var(--color-gradient-from)] focus:ring-[var(--color-gradient-from)]"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-[var(--color-gradient-to)] hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[var(--color-gradient-to)] hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6 cursor-pointer duration-200"
              isLoading={isLoading}
              loadingText="Creating Account..."
            >
              Create Teacher Account
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              to="/authentication/login"
              className="text-[var(--color-gradient-from)] hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Are you a student?{" "}
            <Link
              to="/authentication/register/student"
              className="text-[var(--color-gradient-from)] hover:underline"
            >
              Register as a student
            </Link>
          </p>
        </div>
      </div>
    </FormAnimation>
  );
};

export default TeacherRegister;
