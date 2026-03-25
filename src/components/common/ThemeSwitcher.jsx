import { Check, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (t) => {
    setTheme(t);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle group hover:bg-base-200 transition-colors"
        aria-label="Toggle theme"
      >
        <div className="relative">
          {theme === "dark" ? (
            <Moon className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
          ) : theme === "light" ? (
            <Sun className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
          ) : (
            <Palette className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-72 sm:w-[360px] bg-base-100 rounded-3xl shadow-2xl border border-base-300 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-base-200 bg-base-200/50">
            <h3 className="font-bold text-sm text-base-content">Select Theme</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Customize your experience</p>
          </div>
          
          <div className="p-3 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  type="button"
                  data-theme={t}
                  onClick={() => handleThemeChange(t)}
                  className={`relative flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${
                    theme === t 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-transparent bg-base-200 hover:bg-base-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold capitalize text-base-content">
                      {t}
                    </span>
                    {theme === t && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  
                  {/* Theme Color Preview Bubbles */}
                  <div className="flex gap-1.5 w-full">
                    <div className="w-4 h-4 rounded-full bg-primary shadow-sm" />
                    <div className="w-4 h-4 rounded-full bg-secondary shadow-sm" />
                    <div className="w-4 h-4 rounded-full bg-accent shadow-sm" />
                    <div className="w-4 h-4 rounded-full bg-neutral shadow-sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
