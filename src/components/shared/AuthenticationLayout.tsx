import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Link, Outlet } from "react-router-dom";

const AuthenticationLayout = () => {
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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticationLayout;
