import { useEffect, useState } from 'react';
import { CalculatorPanel } from './components/CalculatorPanel';
import { Footer } from './components/Footer';
import { Header, type ActiveTab } from './components/Header';
import { HistoryPanel } from './components/HistoryPanel';
import { LimitBanner } from './components/LimitBanner';
import { PlansView } from './components/PlansView';
import { ThemeToggle } from './components/ThemeToggle';
import { UpgradeModal } from './components/UpgradeModal';
import {
  appendDigitOrDot,
  appendOperator,
  appendPercent,
  backspaceExpression,
  evaluateExpression,
  toggleSign,
  tryEvaluatePreview,
} from './utils/calculator';
import {
  STORAGE_KEYS,
  getPlanStatusSummary,
  isPlanLimitReached,
  type HistoryItem,
  type PlanId,
} from './utils/plans';

function readStoredPlan(): PlanId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.plan);
    if (!raw) return 'free';
    const parsed = JSON.parse(raw);
    if (parsed === 'free' || parsed === 'pro' || parsed === 'business') {
      return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return 'free';
}

function readStoredUsed(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.used);
    if (!raw) return 0;
    const parsed = Number(JSON.parse(raw));
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  } catch {
    // ignore storage read error
  }
  return 0;
}

function readStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is HistoryItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.expression === 'string' &&
          typeof item.result === 'string' &&
          typeof item.timestamp === 'string'
      );
    }
  } catch {
    // ignore storage read error
  }
  return [];
}

function readStoredTheme(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.theme);
    if (!raw) return false;
    return JSON.parse(raw) === 'dark';
  } catch {
    return false;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [plan, setPlan] = useState<PlanId>(readStoredPlan);
  const [used, setUsed] = useState<number>(readStoredUsed);
  const [history, setHistory] = useState<HistoryItem[]>(readStoredHistory);
  const [isDark, setIsDark] = useState<boolean>(readStoredTheme);

  const [expression, setExpression] = useState<string>('');
  const [resultDisplay, setResultDisplay] = useState<string>('0');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalReason, setModalReason] = useState<'limit_reached' | 'manual'>('manual');

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(isDark ? 'dark' : 'light'));
    } catch {
      // ignore storage write error
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(plan));
    } catch {
      // ignore storage write error
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.used, JSON.stringify(used));
    } catch {
      // ignore storage write error
    }
  }, [used]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    } catch {
      // ignore storage write error
    }
  }, [history]);

  const isBlocked = isPlanLimitReached(plan, used);
  const preview =
    !isBlocked && !justEvaluated ? tryEvaluatePreview(expression) : null;

  const openUpgradeModal = (reason: 'limit_reached' | 'manual' = 'manual') => {
    setModalReason(reason);
    setModalOpen(true);
  };

  const handleExpressionChange = (value: string) => {
    if (isBlocked) return;
    setErrorMessage(null);
    setJustEvaluated(false);
    setExpression(value);
  };

  const handleDigitOrDot = (char: string) => {
    if (isBlocked) {
      openUpgradeModal('limit_reached');
      return;
    }
    setErrorMessage(null);
    setExpression((prev) => appendDigitOrDot(prev, char, justEvaluated));
    setJustEvaluated(false);
  };

  const handleOperator = (op: '÷' | '×' | '−' | '+') => {
    if (isBlocked) {
      openUpgradeModal('limit_reached');
      return;
    }
    setErrorMessage(null);
    setExpression((prev) => appendOperator(prev, op, resultDisplay, justEvaluated));
    setJustEvaluated(false);
  };

  const handlePercent = () => {
    if (isBlocked) {
      openUpgradeModal('limit_reached');
      return;
    }
    setErrorMessage(null);
    setExpression((prev) => appendPercent(prev, resultDisplay, justEvaluated));
    setJustEvaluated(false);
  };

  const handleToggleSign = () => {
    if (isBlocked) {
      openUpgradeModal('limit_reached');
      return;
    }
    setErrorMessage(null);
    setExpression((prev) => toggleSign(prev, resultDisplay, justEvaluated));
    setJustEvaluated(false);
  };

  const handleBackspace = () => {
    if (isBlocked) return;
    setErrorMessage(null);
    setJustEvaluated(false);
    setExpression((prev) => backspaceExpression(prev));
  };

  const handleClear = () => {
    setExpression('');
    setResultDisplay('0');
    setErrorMessage(null);
    setJustEvaluated(false);
  };

  const handleEvaluate = () => {
    if (isBlocked) {
      openUpgradeModal('limit_reached');
      return;
    }

    const trimmed = expression.trim();
    if (!trimmed) {
      return;
    }

    const res = evaluateExpression(trimmed);
    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    setErrorMessage(null);
    setResultDisplay(res.formatted);
    setJustEvaluated(true);

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      expression: trimmed,
      result: res.formatted,
      timestamp,
    };

    setHistory((prev) => [newItem, ...prev]);

    const nextUsed = used + 1;
    setUsed(nextUsed);

    if (isPlanLimitReached(plan, nextUsed)) {
      openUpgradeModal('limit_reached');
    }
  };

  const handleRecallHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResultDisplay(item.result);
    setErrorMessage(null);
    setJustEvaluated(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSelectPlan = (nextPlan: PlanId) => {
    setPlan(nextPlan);
    setUsed(0);
    setErrorMessage(null);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F6F7F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        plan={plan}
        onOpenUpgrade={() =>
          openUpgradeModal(isBlocked ? 'limit_reached' : 'manual')
        }
      />

      <main className="flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {activeTab === 'calculator' ? (
          <section className="space-y-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Calculator
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums mt-0.5">
                  {getPlanStatusSummary(plan, used)}
                </p>
              </div>
              <ThemeToggle
                isDark={isDark}
                onToggle={() => setIsDark((prev) => !prev)}
              />
            </div>

            {isBlocked && (
              <LimitBanner
                plan={plan}
                onOpenUpgrade={() => openUpgradeModal('limit_reached')}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <CalculatorPanel
                expression={expression}
                resultDisplay={resultDisplay}
                preview={preview}
                errorMessage={errorMessage}
                isBlocked={isBlocked}
                onExpressionChange={handleExpressionChange}
                onDigitOrDot={handleDigitOrDot}
                onOperator={handleOperator}
                onPercent={handlePercent}
                onToggleSign={handleToggleSign}
                onBackspace={handleBackspace}
                onClear={handleClear}
                onEvaluate={handleEvaluate}
              />

              <HistoryPanel
                items={history}
                onRecall={handleRecallHistory}
                onClear={handleClearHistory}
              />
            </div>
          </section>
        ) : (
          <PlansView
            currentPlan={plan}
            onSelectPlan={handleSelectPlan}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
          />
        )}
      </main>

      <Footer onOpenPlans={() => setActiveTab('plans')} />

      <UpgradeModal
        isOpen={modalOpen}
        reason={modalReason}
        currentPlan={plan}
        onClose={() => setModalOpen(false)}
        onConfirmPlan={handleSelectPlan}
      />
    </div>
  );
}
