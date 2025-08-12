import { Link } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { useEffect } from "react";
import { setPageTitle, PAGE_TITLES } from "../../utils/title";

const RegisterOptions = () => {
  // Set page title
  useEffect(() => {
    setPageTitle(PAGE_TITLES.REGISTER);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Join QuizEdu
        </h1>
        <p className="text-gray dark:text-gray-300">
          Choose your account type to get started
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col items-center rounded-xl bg-white/90 p-8 text-center shadow-lg transition-transform hover:scale-105 dark:bg-gray-900/90">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] shadow-lg">
            <FaUserGraduate className="text-4xl text-white" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-[var(--color-gradient-to)]">
            I'm a Student
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Create an account to access quizzes, track your progress, and
            improve your knowledge.
          </p>
          <Link
            to="/authentication/register/student"
            className="rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] px-8 py-3 font-semibold text-white shadow transition-colors hover:opacity-90"
          >
            Register as Student
          </Link>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white/90 p-8 text-center shadow-lg transition-transform hover:scale-105 dark:bg-gray-900/90">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-to)] to-[var(--color-gradient-from)] shadow-lg">
            <FaChalkboardTeacher className="text-4xl text-white" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-[var(--color-gradient-to)]">
            I'm a Teacher
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Create an account to create quizzes, manage classes, and monitor
            student performance.
          </p>
          <Link
            to="/authentication/register/teacher"
            className="rounded-full bg-gradient-to-r from-[var(--color-gradient-to)] to-[var(--color-gradient-from)] px-8 py-3 font-semibold text-white shadow transition-colors hover:opacity-90"
          >
            Register as Teacher
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-black dark:text-gray-300">
          Already have an account?{" "}
          <Link to="/authentication/login" className="hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterOptions;
