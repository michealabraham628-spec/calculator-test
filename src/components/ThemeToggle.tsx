import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      className="inline-flex items-center justify-between gap-3 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg w-fit shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
        )}
        <span>Dark theme</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          isDark ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-[18px]' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}
