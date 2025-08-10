import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { PAGE_TITLES, usePageTitle } from "../utils/title";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Set page title
  usePageTitle(PAGE_TITLES.NOT_FOUND);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <FaExclamationTriangle className="mb-4 text-6xl text-[#7e51c2]" />
      <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
        404 - Page Not Found
      </h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="inline-block rounded-full bg-gradient-to-r from-[#5d7cff] to-[#7e51c2] px-6 py-3 font-semibold text-white shadow transition-colors hover:opacity-90"
      >
        {t("common.back")}
      </button>
    </div>
  );
};

export default NotFound;
