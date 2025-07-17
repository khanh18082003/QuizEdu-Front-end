import { FaUsers, FaLightbulb, FaHeart } from "react-icons/fa";

const AboutUs = () => (
  <div className="mx-auto max-w-3xl text-center">
    <h1 className="mb-6 text-4xl font-extrabold text-[#232946] dark:text-white">
      About QuizEdu
    </h1>
    <p className="mb-8 text-lg text-gray-700 dark:text-gray-200">
      QuizEdu is a modern, interactive platform designed to make learning and
      teaching more engaging, effective, and fun for everyone.
    </p>
    <div className="mb-12 grid gap-8 md:grid-cols-3">
      <div className="flex flex-col items-center">
        <FaLightbulb className="mb-2 text-3xl text-[#7e51c2]" />
        <h3 className="mb-1 font-bold dark:text-white">Our Mission</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Empower students and teachers with innovative tools for interactive
          learning and assessment.
        </p>
      </div>
      <div className="flex flex-col items-center">
        <FaUsers className="mb-2 text-3xl text-[#7e51c2]" />
        <h3 className="mb-1 font-bold dark:text-white">Our Team</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          A passionate group of educators, developers, and designers dedicated
          to education technology.
        </p>
      </div>
      <div className="flex flex-col items-center">
        <FaHeart className="mb-2 text-3xl text-[#7e51c2]" />
        <h3 className="mb-1 font-bold dark:text-white">Our Values</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Innovation, accessibility, and a love for lifelong learning.
        </p>
      </div>
    </div>
    <div className="rounded-xl bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] p-8 text-white shadow-lg">
      <h2 className="mb-2 text-2xl font-bold">Join us on our mission!</h2>
      <p>
        Whether you are a student, teacher, or school, QuizEdu is here to help
        you succeed.
      </p>
    </div>
  </div>
);

export default AboutUs;
