import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Layout = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = [
    { to: "/", label: t("nav.home"), match: /^\/$/ },
    { to: "/about", label: t("nav.aboutUs"), match: /^\/about/ },
    { to: "/contact", label: t("nav.contact"), match: /^\/contact/ },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] transition-colors">
      <header className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-4 rounded-b-2xl bg-white/80 px-8 py-4 shadow-md md:flex-row dark:bg-gray-900/80">
        <Link to="/" className="flex cursor-pointer items-center gap-3">
          <span className="bg-gradient-to-l from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] bg-clip-text text-3xl text-transparent">
            🎓
          </span>
          <h1 className="bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Quiz Edu
          </h1>
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.match.test(location.pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded px-2 py-1 font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#5d7cff] to-[#7e51c2] font-bold text-white underline underline-offset-4 shadow-sm dark:text-white"
                    : "text-gray-700 hover:text-[var(--color-gradient-from)] dark:text-gray-200 dark:hover:text-[var(--color-gradient-to)]"
                } `}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex md:items-center md:gap-3">
            <Link
              to="/authentication/login"
              className="rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] px-4 py-1 text-sm font-medium text-white shadow-sm duration-200 hover:opacity-90"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/authentication/register"
              className="rounded-full bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] px-4 py-1 text-sm font-medium text-white shadow-sm duration-200 hover:opacity-90"
            >
              {t("nav.register")}
            </Link>
          </div>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <Outlet />
      </main>
      <footer className="mt-16 rounded-t-2xl border-t border-[#e0e7ff] bg-white/80 py-8 shadow-inner dark:bg-gray-900/80">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="mb-2 bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] bg-clip-text text-xl font-bold text-transparent">
                Quiz Edu
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Modern, interactive learning platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="mb-2 font-semibold text-[var(--color-gradient-from)]">
                  Resources
                </h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-[var(--color-gradient-from)] dark:text-gray-400"
                    >
                      Docs
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-[var(--color-gradient-from)] dark:text-gray-400"
                    >
                      Guides
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-[var(--color-gradient-from)] dark:text-gray-400"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-[var(--color-gradient-to)]">
                  Company
                </h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-[var(--color-gradient-to)] dark:text-gray-400"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-[var(--color-gradient-to)] dark:text-gray-400"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-[var(--color-gradient-to)] dark:text-gray-400"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-[#e0e7ff] pt-6 text-center text-gray-400 dark:text-gray-500">
            <p>© {new Date().getFullYear()} Quiz Edu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
