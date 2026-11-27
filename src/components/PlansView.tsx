import { Check } from 'lucide-react';
import { PLANS, type PlanId } from '../utils/plans';
import { ThemeToggle } from './ThemeToggle';

interface PlansViewProps {
  currentPlan: PlanId;
  onSelectPlan: (plan: PlanId) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function PlansView({
  currentPlan,
  onSelectPlan,
  isDark,
  onToggleTheme,
}: PlansViewProps) {
  const orderedPlans: PlanId[] = ['free', 'pro', 'business'];

  return (
    <section className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Subscription Plans
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Free includes 5 calculations, Pro ($1/month) includes 100 calculations,
            and Business ($2/month) includes unlimited calculations.
          </p>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {orderedPlans.map((planId) => {
          const plan = PLANS[planId];
          const isActive = currentPlan === planId;
          const isFeaturedPro = planId === 'pro';

          const cardBorderClass = isActive
            ? isFeaturedPro
              ? 'border-blue-600'
              : 'border-slate-900 dark:border-white'
            : isFeaturedPro
              ? 'border-blue-600'
              : 'border-slate-200 dark:border-slate-800';

          let buttonLabel = '';
          let buttonClass = '';
          if (isActive) {
            buttonLabel = `Active on ${plan.id === 'free' ? 'Free' : plan.id === 'pro' ? 'Pro' : 'Business'}`;
            buttonClass =
              'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default';
          } else if (planId === 'pro') {
            buttonLabel = 'Subscribe ($1/mo)';
            buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white';
          } else if (planId === 'business') {
            buttonLabel = 'Subscribe ($2/mo)';
            buttonClass =
              'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900';
          } else {
            buttonLabel = 'Switch to Free';
            buttonClass =
              'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white';
          }

          return (
            <div
              key={planId}
              className={`min-w-0 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-6 border transition-colors ${cardBorderClass}`}
            >
              <div className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{plan.kicker}</span>
                    {isActive && (
                      <span className="font-medium text-slate-900 dark:text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {plan.priceLabel}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / month
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={isActive}
                onClick={() => onSelectPlan(planId)}
                className={`w-full px-4 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${buttonClass}`}
              >
                {buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
