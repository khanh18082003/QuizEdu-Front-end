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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toggleOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setToggleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setToggleOpen(!toggleOpen)}
        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <FaGlobe className="h-3.5 w-3.5" />
        {LANGS.find((l) => l.code === lang)?.label || "Language"}
      </button>

      {toggleOpen && (
        <div className="ring-opacity-5 absolute right-0 z-10 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1" role="menu">
            {LANGS.map((item) => (
              <button
                key={item.code}
                onClick={() => handleChange(item.code)}
                className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  lang === item.code
                    ? "bg-gray-100 text-[var(--color-gradient-from)] dark:bg-gray-700"
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
