import { useState, useRef, useEffect } from "react";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

const LanguageSwitcher = ({
  onChange,
}: {
  onChange?: (lang: string) => void;
}) => {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "vi");
  const [toggleOpen, setToggleOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toggleOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setToggleOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setToggleOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleOpen]);

  // Dynamically decide to show dropdown above or below based on available space
  useEffect(() => {
    if (!toggleOpen) return;

    const computePlacement = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Estimate menu height (items * itemHeight + padding). Keep conservative.
      const estimatedMenuHeight = Math.min(300, 44 * LANGS.length + 12);
      const shouldDropUp =
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
      setDropUp(shouldDropUp);
    };

    computePlacement();
    window.addEventListener("resize", computePlacement);
    // Use capture to catch scrolls on parents as well
    window.addEventListener("scroll", computePlacement, true);
    return () => {
      window.removeEventListener("resize", computePlacement);
      window.removeEventListener("scroll", computePlacement, true);
    };
  }, [toggleOpen]);

  const handleChange = (code: string) => {
    setLang(code);
    localStorage.setItem("lang", code);
    i18n.changeLanguage(code);
    setToggleOpen(false);
    if (onChange) {
      onChange(code);
    }
  };

  const menuPositionClasses = dropUp ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div ref={ref} className="relative">
      <button
        id="language-menu-button"
        onClick={() => setToggleOpen(!toggleOpen)}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        aria-haspopup="menu"
        aria-expanded={toggleOpen}
        aria-controls="language-menu"
      >
        <FaGlobe className="h-3.5 w-3.5" />
        {LANGS.find((l) => l.code === lang)?.label || "Language"}
      </button>

      {toggleOpen && (
        <div
          id="language-menu"
          aria-labelledby="language-menu-button"
          role="menu"
          className={`absolute right-0 z-50 w-40 rounded-md bg-white shadow-lg ring-1 ring-black/10 dark:bg-gray-800 dark:ring-white/10 ${menuPositionClasses}`}
        >
          <div className="py-1">
            {LANGS.map((item) => (
              <button
                key={item.code}
                onClick={() => handleChange(item.code)}
                className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  lang === item.code
                    ? "bg-gray-100 text-[var(--color-gradient-to)] dark:bg-gray-700"
                    : "text-gray-700 dark:text-gray-200"
                }`}
                role="menuitem"
              >
                {t(`language.${item.code === "en" ? "english" : "vietnamese"}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
