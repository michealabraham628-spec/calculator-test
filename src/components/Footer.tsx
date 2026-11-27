interface FooterProps {
  onOpenPlans: () => void;
}

export function Footer({ onOpenPlans }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span>Numera</span>
        <button
          type="button"
          onClick={onOpenPlans}
          className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          Pro ($1/mo) · Business ($2/mo)
        </button>
      </div>
    </footer>
  );
}
