import { useEffect, useState } from "react";

type SkeletonProps = {
  className?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: "pulse" | "shimmer" | "none";
};

const SkeletonLoader = ({
  className = "",
  width = "100%",
  height = "20px",
  borderRadius = "0.375rem",
  animation = "pulse",
}: SkeletonProps) => {
  const [shimmerPosition, setShimmerPosition] = useState(-100);

  // For shimmer animation effect
  useEffect(() => {
    if (animation === "shimmer") {
      const interval = setInterval(() => {
        setShimmerPosition((prev) => {
          if (prev > 100) {
            return -100;
          }
          return prev + 1.5; // Slightly faster animation
        });
      }, 10);
      return () => clearInterval(interval);
    }
  }, [animation]);

  const baseStyle = {
    width,
    height,
    borderRadius,
  };

  const animationStyles = {
    pulse: "animate-pulse",
    shimmer: "relative overflow-hidden",
    none: "",
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${animationStyles[animation]} ${className}`}
      style={baseStyle}
    >
      {animation === "shimmer" && (
        <div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-200 via-white to-gray-200 opacity-80 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
          style={{
            transform: `translateX(${shimmerPosition}%)`,
          }}
        />
      )}
    </div>
  );
};

export default SkeletonLoader;
