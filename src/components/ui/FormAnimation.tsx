import React, { useEffect, useState } from "react";

type FormAnimationProps = {
  children: React.ReactNode;
  delay?: number;
};

/**
 * Wrapper component that adds a subtle fade-in and slide-up animation to forms
 * when they first load
 */
const FormAnimation: React.FC<FormAnimationProps> = ({
  children,
  delay = 150,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 filter-none"
          : "translate-y-4 opacity-0 blur-sm"
      }`}
    >
      {children}
    </div>
  );
};

export default FormAnimation;
