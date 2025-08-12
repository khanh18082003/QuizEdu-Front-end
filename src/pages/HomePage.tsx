import { Link } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaRocket,
  FaChartLine,
  FaBolt,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { setPageTitle, PAGE_TITLES, usePageTitle } from "../utils/title";
import { useTranslation } from "react-i18next";

const feedbacks = [
  {
    icon: <FaChalkboardTeacher className="text-2xl text-[#7e51c2]" />,
    name: "Ms. Linh, Teacher",
    text: "QuizEdu giúp tôi tạo đề kiểm tra nhanh chóng, học sinh rất thích vì giao diện đẹp và phản hồi tức thì!",
  },
  {
    icon: <FaUserGraduate className="text-2xl text-[#5d7cff]" />,
    name: "Nam, Student",
    text: "Mình thích QuizEdu vì dễ dùng, làm bài xong biết điểm ngay và có thể xem lại đáp án chi tiết.",
  },
  {
    icon: <FaUserGraduate className="text-2xl text-[#5d7cff]" />,
    name: "Mai, Student",
    text: "Nhờ QuizEdu mình học nhóm rất hiệu quả, các bạn cùng thi đua và trao đổi đáp án dễ dàng.",
  },
  {
    icon: <FaChalkboardTeacher className="text-2xl text-[#7e51c2]" />,
    name: "Mr. Hùng, Teacher",
    text: "Tôi đánh giá cao tính năng thống kê kết quả, giúp tôi nắm bắt nhanh tình hình lớp học.",
  },
];

const HomePage = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const { t } = useTranslation();
  // Set page title
  usePageTitle(PAGE_TITLES.HOME);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection("right");
      setCurrent((prev) => (prev + 1) % feedbacks.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const goTo = (idx: number) => {
    setDirection(idx > current ? "right" : "left");
    setCurrent(idx);
  };
  const prev = () => {
    setDirection("left");
    setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };
  const next = () => {
    setDirection("right");
    setCurrent((prev) => (prev + 1) % feedbacks.length);
  };

  return (
    <>
      <section className="mb-16 text-center">
        <h2 className="mb-4 text-5xl font-extrabold tracking-tight text-[#232946] dark:text-white">
          Welcome to Quiz Edu
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-700 dark:text-gray-200">
          The modern interactive learning platform for students and teachers to
          create, share, and participate in educational quizzes.
        </p>
      </section>

      <section className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--color-gradient-from)] bg-white/90 p-10 text-center shadow-lg transition-transform hover:scale-105 dark:bg-gray-900/90">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] shadow-lg">
            <FaUserGraduate className="text-4xl text-white" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-[var(--color-gradient-to)]">
            Student
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Access quizzes, track your progress, and improve your knowledge with
            ease.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/authentication/register/student"
              className="rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] px-8 py-3 font-semibold text-white shadow transition-colors hover:opacity-90"
            >
              Register as Student
            </Link>
            <Link
              to="/authentication/login"
              className="text-center text-sm text-[var(--color-gradient-from)] hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--color-gradient-to)] bg-white/90 p-10 text-center shadow-lg transition-transform hover:scale-105 dark:bg-gray-900/90">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-to)] to-[var(--color-gradient-from)] shadow-lg">
            <FaChalkboardTeacher className="text-4xl text-white" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-[var(--color-gradient-to)]">
            Teacher
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Create quizzes, manage classes, and monitor student performance
            easily.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/authentication/register/teacher"
              className="rounded-full bg-gradient-to-r from-[var(--color-gradient-to)] to-[var(--color-gradient-from)] px-8 py-3 font-semibold text-white shadow transition-colors hover:opacity-90"
            >
              Register as Teacher
            </Link>
            <Link
              to="/authentication/login"
              className="text-center text-sm text-[var(--color-gradient-to)] hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#e0e7ff] bg-white/90 p-10 shadow-md dark:bg-gray-900/90">
        <h2 className="mb-8 bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] bg-clip-text text-center text-3xl font-bold text-transparent dark:text-white">
          Key Features
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] shadow">
              <FaRocket className="text-2xl text-white" />
            </div>
            <h3 className="font-bold text-[var(--color-gradient-to)]">
              Interactive Quizzes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Multiple question types, beautiful UI, easy to use.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-to)] to-[var(--color-gradient-from)] shadow">
              <FaChartLine className="text-2xl text-white" />
            </div>
            <h3 className="font-bold text-[var(--color-gradient-to)]">
              Progress Tracking
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View results, analytics, and improve learning efficiency.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] shadow">
              <FaBolt className="text-2xl text-white" />
            </div>
            <h3 className="font-bold text-[var(--color-gradient-to)]">
              Instant Feedback
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get results and explanations right after finishing quizzes.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 text-center">
        <h2 className="mb-6 text-3xl font-bold text-[#232946] dark:text-white">
          Why QuizEdu?
        </h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl bg-white/90 p-6 shadow dark:bg-gray-900/90">
            <FaRocket className="mb-2 text-3xl text-[var(--color-gradient-from)] dark:text-[var(--color-gradient-to)]" />
            <h4 className="mb-2 font-semibold text-[var(--color-gradient-to)]">
              Engaging & Fun
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gamified quizzes and instant feedback keep learners motivated and
              excited.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/90 p-6 shadow dark:bg-gray-900/90">
            <FaChartLine className="mb-2 text-3xl text-[var(--color-gradient-from)] dark:text-[var(--color-gradient-to)]" />
            <h4 className="mb-2 font-semibold text-[var(--color-gradient-to)]">
              Easy Progress Tracking
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Both students and teachers can easily monitor learning progress
              and results.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/90 p-6 shadow dark:bg-gray-900/90">
            <FaBolt className="mb-2 text-3xl text-[var(--color-gradient-from)] dark:text-[var(--color-gradient-to)]" />
            <h4 className="mb-2 font-semibold text-[var(--color-gradient-to)]">
              Flexible & Accessible
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Access anywhere, anytime, on any device. Suitable for all ages and
              levels.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#232946] dark:text-white">
          What Teachers & Students Say
        </h2>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          <div className="h-[220px] w-full overflow-hidden">
            <div className={`relative h-full w-full`}>
              {[
                current,
                (current + 1) % feedbacks.length,
                (current - 1 + feedbacks.length) % feedbacks.length,
              ].map((idx) => {
                // Only render current, next, and prev for performance
                let pos = 0;
                if (idx === current) pos = 0;
                else if (
                  idx ===
                  (current - 1 + feedbacks.length) % feedbacks.length
                )
                  pos = -1;
                else pos = 1;
                return (
                  <div
                    key={idx}
                    className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${
                      pos === 0 ? "z-10" : "pointer-events-none z-0 opacity-0"
                    }`}
                    style={{
                      transform:
                        pos === 0
                          ? "translateX(0%)"
                          : direction === "right"
                            ? `translateX(${pos * 100}%)`
                            : `translateX(${pos * 100}%)`,
                      transition:
                        "transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.3s",
                      opacity: pos === 0 ? 1 : 0,
                    }}
                  >
                    <div className="flex min-h-[180px] flex-col items-center rounded-xl bg-white/90 p-6 shadow dark:bg-gray-900/90">
                      <div className="mb-2 flex items-center gap-2">
                        {feedbacks[idx].icon}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {feedbacks[idx].name}
                        </span>
                      </div>
                      <p className="text-gray-700 italic dark:text-gray-300">
                        “{feedbacks[idx].text}”
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              aria-label="Previous feedback"
              onClick={prev}
              className="rounded-full border border-gray-300 bg-white p-2 shadow hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M13 15l-5-5 5-5"
                  stroke="#7e51c2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {feedbacks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`mx-1 h-2.5 w-2.5 rounded-full transition-all ${
                  idx === current
                    ? "bg-[#7e51c2]"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
                aria-label={`Go to feedback ${idx + 1}`}
              />
            ))}
            <button
              aria-label="Next feedback"
              onClick={next}
              className="rounded-full border border-gray-300 bg-white p-2 shadow hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M7 5l5 5-5 5"
                  stroke="#7e51c2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-20 text-center">
        <div className="inline-block rounded-2xl bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] px-10 py-8 shadow-lg">
          <h2 className="mb-4 text-3xl font-extrabold text-white">
            Ready to start your learning journey?
          </h2>
          <p className="mb-6 text-lg text-white">
            Join QuizEdu today and unlock a world of interactive, effective, and
            fun learning!
          </p>
          <Link
            to="/authentication/register/student"
            className="mr-4 inline-block rounded-full bg-white px-8 py-3 font-bold text-[#5d7cff] shadow transition-colors hover:bg-gray-100"
          >
            I'm a Student
          </Link>
          <Link
            to="/authentication/register/teacher"
            className="inline-block rounded-full bg-white px-8 py-3 font-bold text-[#7e51c2] shadow transition-colors hover:bg-gray-100"
          >
            I'm a Teacher
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
