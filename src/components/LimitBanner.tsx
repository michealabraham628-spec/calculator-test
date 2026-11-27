import { Lock } from 'lucide-react';
import type { PlanId } from '../utils/plans';

interface LimitBannerProps {
  plan: PlanId;
  onOpenUpgrade: () => void;
}

export function LimitBanner({ plan, onOpenUpgrade }: LimitBannerProps) {
  const isPro = plan === 'pro';
  const title = isPro
    ? 'Monthly limit reached (100 of 100 calculations used)'
    : 'Free limit reached (5 of 5 calculations used)';
  const subtitle = isPro
    ? 'Upgrade to Business ($2/month) for unlimited monthly calculations.'
    : 'Subscribe to Pro ($1/month for 100 calculations) or Business ($2/month for unlimited).';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <Lock
          className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenUpgrade}
        className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
      >
        Choose Monthly Plan
      </button>
    </div>
  );
}
