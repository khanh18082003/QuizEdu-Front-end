import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { PAGE_TITLES, usePageTitle } from "../utils/title";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  // Set page title
  usePageTitle(PAGE_TITLES.CONTACT);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="mb-6 text-4xl font-extrabold text-[var(--color-gradient-from)]">
        Contact Us
      </h1>
      <p className="mb-8 text-lg text-gray-700 dark:text-gray-200">
        Have questions or feedback? We&apos;d love to hear from you!
      </p>
      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center">
          <FaEnvelope className="mb-2 text-2xl text-[#7e51c2]" />
          <span className="font-semibold">Email</span>
          <a
            href="mailto:support@quizedu.com"
            className="text-sm text-gray-600 hover:underline dark:text-gray-300"
          >
            support@quizedu.com
          </a>
        </div>
        <div className="flex flex-col items-center">
          <FaPhone className="mb-2 text-2xl text-[#5d7cff]" />
          <span className="font-semibold">Phone</span>
          <a
            href="tel:+1234567890"
            className="text-sm text-gray-600 hover:underline dark:text-gray-300"
          >
            +1 234 567 890
          </a>
        </div>
        <div className="flex flex-col items-center">
          <FaMapMarkerAlt className="mb-2 text-2xl text-[#7e51c2]" />
          <span className="font-semibold">Address</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            123 Edu Street, Learning City
          </span>
        </div>
      </div>
      <div className="mt-8 rounded-xl bg-white/90 p-8 text-left shadow dark:bg-gray-900/90">
        <h2 className="mb-2 text-xl font-bold text-[var(--color-gradient-to)]">
          Send us a message
        </h2>
        <form className="mx-auto max-w-md space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e51c2] focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e51c2] focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#7e51c2] focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[#5d7cff] to-[#7e51c2] px-8 py-2 font-semibold text-white shadow transition-colors hover:opacity-90"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
