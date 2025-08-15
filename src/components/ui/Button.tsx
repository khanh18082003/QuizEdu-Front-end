import type { ButtonHTMLAttributes, ReactNode } from "react";

import ButtonLoader from "./ButtonLoader";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = ({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  isLoading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative hover:scale-[1.02] active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] text-white hover:opacity-90 shadow",
    secondary:
      "bg-white text-[var(--color-gradient-to)] border border-[var(--color-gradient-to)] hover:bg-gray-50",
    outline:
      "bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800",
    ghost:
      "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizeClasses = {
    sm: "py-1 px-4 text-sm",
    md: "py-2 px-6",
    lg: "py-3 px-8 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} ${isDisabled ? "cursor-not-allowed opacity-70" : ""}`}
      disabled={isDisabled}
      {...props}
    >
      <div
        className={`flex items-center justify-center gap-2 ${isLoading ? "invisible" : "visible"}`}
      >
        {children}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <ButtonLoader variant={variant} size={size} />
          {loadingText && <span>{loadingText}</span>}
        </div>
      )}
    </button>
  );
};

export default Button;
