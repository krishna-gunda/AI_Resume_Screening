import { ScanSearch } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle.jsx";

/**
 * Top navigation bar. Purely presentational — receives dark-mode
 * state/handlers as props so it stays a "dumb" component.
 */
export default function Navbar({ isDark, onToggleDarkMode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center shadow-sm">
            <ScanSearch size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
              AI Resume Screener
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              Skill gap &amp; fit analysis
            </p>
          </div>
        </div>
        <DarkModeToggle isDark={isDark} onToggle={onToggleDarkMode} />
      </div>
    </header>
  );
}
