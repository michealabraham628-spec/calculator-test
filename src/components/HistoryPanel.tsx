import type { HistoryItem } from '../utils/plans';

interface HistoryPanelProps {
  items: HistoryItem[];
  onRecall: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryPanel({ items, onRecall, onClear }: HistoryPanelProps) {
  const countLabel =
    items.length === 1 ? '1 calculation' : `${items.length} calculations`;

  return (
    <div className="lg:col-span-5 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {countLabel}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No calculations yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your recent results will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRecall(item)}
              className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded transition-colors min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate">
                  {item.expression}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums mt-0.5">
                  {item.timestamp}
                </div>
              </div>
              <div className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white shrink-0">
                = {item.result}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
