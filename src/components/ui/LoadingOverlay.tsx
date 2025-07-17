import React from "react";

type LoadingOverlayProps = {
  show: boolean;
  message?: string;
  variant?: "fullscreen" | "container";
  blur?: boolean;
};

/**
 * A loading overlay component that can be used to indicate loading state
 * with a message and optional blur background.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  message = "Loading...",
  variant = "container",
  blur = true,
}) => {
  if (!show) return null;

  const overlayClasses = {
    fullscreen: "fixed inset-0 z-50",
    container: "absolute inset-0 z-10",
  };

  const blurClasses = blur ? "backdrop-blur-sm" : "";

  return (
    <div
      className={`${overlayClasses[variant]} flex flex-col items-center justify-center bg-gray-900/30 dark:bg-gray-900/50 ${blurClasses}`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl bg-white/90 p-6 shadow-xl dark:bg-gray-800/90">
        <div className="relative h-12 w-12">
          {/* Circular spinner with gradient */}
          <div className="absolute inset-0 h-full w-full animate-spin rounded-full border-4 border-t-transparent border-r-[var(--color-gradient-to)] border-b-transparent border-l-[var(--color-gradient-from)]"></div>
          <div className="absolute inset-2 h-8 w-8 animate-ping rounded-full bg-gradient-to-r from-[var(--color-gradient-from)]/30 to-[var(--color-gradient-to)]/30"></div>
          <div className="absolute inset-4 h-4 w-4 animate-pulse rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)]"></div>
        </div>

        {message && (
          <p className="text-center font-medium text-gray-700 dark:text-gray-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
