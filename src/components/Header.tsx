import type { PlanId } from '../utils/plans';

export type ActiveTab = 'calculator' | 'plans';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  plan: PlanId;
  onOpenUpgrade: () => void;
}

export function Header({ activeTab, onSelectTab, plan, onOpenUpgrade }: HeaderProps) {
  const mobileCtaLabel =
    plan === 'free' ? 'Upgrade' : plan === 'pro' ? 'Pro Plan' : 'Business';
  const desktopCtaLabel =
    plan === 'free'
      ? 'Upgrade Plan'
      : plan === 'pro'
        ? 'Pro Plan Active'
        : 'Business Active';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 w-full">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3 sm:gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('calculator')}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          Numera
        </button>

        <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-6 min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('calculator')}
            aria-current={activeTab === 'calculator' ? 'page' : undefined}
            className={`relative py-1 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
              activeTab === 'calculator'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Calculator
            {activeTab === 'calculator' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[20px] sm:-bottom-[19px] h-0.5 bg-blue-600"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('plans')}
            aria-current={activeTab === 'plans' ? 'page' : undefined}
            className={`relative py-1 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
              activeTab === 'plans'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Plans
            {activeTab === 'plans' && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[20px] sm:-bottom-[19px] h-0.5 bg-blue-600"
              />
            )}
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenUpgrade}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <span className="sm:hidden">{mobileCtaLabel}</span>
          <span className="hidden sm:inline">{desktopCtaLabel}</span>
        </button>
      </div>
    </header>
  );
}
