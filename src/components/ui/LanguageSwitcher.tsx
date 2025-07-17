import { useState, useRef, useEffect } from "react";
import { FaGlobe } from "react-icons/fa";

const LANGS = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

const LanguageSwitcher = ({
  onChange,
}: {
  onChange?: (lang: string) => void;
}) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
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
    onChange?.(code);
    setToggleOpen(false); // Close dropdown when selecting
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 shadow transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={() => setToggleOpen((open) => !open)}
      >
        <FaGlobe className="text-[#5d7cff]" />
        <span className="dark:text-white">
          {LANGS.find((l) => l.code === lang)?.label}
        </span>
      </button>
      <div
        className={`absolute ${toggleOpen ? "block" : "hidden"} right-0 z-10 mt-2 w-32 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800`}
      >
        {LANGS.map((l) => (
          <button
            key={l.code}
            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${lang === l.code ? "font-bold text-[#7e51c2]" : ""}`}
            onClick={() => handleChange(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
