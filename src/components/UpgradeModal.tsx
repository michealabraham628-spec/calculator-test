import { useEffect, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { PLANS, type PlanId } from '../utils/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  reason: 'limit_reached' | 'manual';
  currentPlan: PlanId;
  onClose: () => void;
  onConfirmPlan: (plan: 'pro' | 'business') => void;
}

export function UpgradeModal({
  isOpen,
  reason,
  currentPlan,
  onClose,
  onConfirmPlan,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>(
    currentPlan === 'business' ? 'business' : currentPlan === 'pro' ? 'business' : 'pro'
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedPlan(currentPlan === 'pro' ? 'business' : 'pro');
  }, [isOpen, currentPlan]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLimitReached = reason === 'limit_reached';
  const title = isLimitReached
    ? currentPlan === 'pro'
      ? 'Monthly calculation limit reached'
      : 'Free calculation limit reached'
    : 'Choose a monthly plan';
  const subtitle = isLimitReached
    ? currentPlan === 'pro'
      ? 'You have used all 100 Pro calculations for this month.'
      : 'You have used all 5 free calculations.'
    : 'Select Pro ($1/mo) or Business ($2/mo).';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirmPlan(selectedPlan);
  };

  const options: Array<'pro' | 'business'> = ['pro', 'business'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="upgrade-dialog-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              {title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            {options.map((planId) => {
              const plan = PLANS[planId];
              const isSelected = selectedPlan === planId;
              return (
                <button
                  key={planId}
                  type="button"
                  onClick={() => setSelectedPlan(planId)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-4 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {plan.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                        {plan.priceLabel} / mo
                      </span>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {plan.shortDescription}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {selectedPlan === 'pro'
                ? 'Start Pro ($1/mo)'
                : 'Start Business ($2/mo)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
