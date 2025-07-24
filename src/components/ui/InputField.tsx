import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const InputField = ({
  label,
  error,
  fullWidth = true,
  className = "",
  id,
  icon,
  onBlur,
  type,
  ...props
}: InputFieldProps) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (onBlur) {
      onBlur(e);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Only show error if field has been touched
  const showError = touched && error;

  return (
    <div className={`mb-4 ${fullWidth ? "w-full" : ""}`}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 dark:text-[var(--color-gradient-to)]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 ${
            icon ? "pl-10" : ""
          } ${isPassword ? "pr-10" : ""} focus:border-[var(--color-gradient-from)] focus:ring-2 focus:ring-[var(--color-gradient-to)]/50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 ${
            showError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          } ${className} `}
          type={inputType}
          onBlur={handleBlur}
          {...props}
        />
        {isPassword && (
          <div
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={togglePasswordVisibility}
          >
            {showPassword && props.value ? (
              <FaEye />
            ) : props.value ? (
              <FaEyeSlash />
            ) : null}
          </div>
        )}
      </div>
      {showError && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default InputField;
