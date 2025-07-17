import React from "react";

type ButtonLoaderProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  color?: string;
};

/**
 * A modern, animated loader component for buttons
 */
const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  variant = "primary",
  size = "md",
  color,
}) => {
  // Size mapping for the loader
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Calculate color based on variant
  const getColor = () => {
    if (color) return color;

    switch (variant) {
      case "primary":
        return "white";
      case "secondary":
      case "outline":
      case "ghost":
        return "var(--color-gradient-from)";
      default:
        return "white";
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-2 border-t-transparent`}
        style={{
          borderColor: `${getColor()}33`,
          borderTopColor: "transparent",
          borderLeftColor: getColor(),
          borderRightColor: getColor(),
        }}
      ></div>
    </div>
  );
};

export default ButtonLoader;
