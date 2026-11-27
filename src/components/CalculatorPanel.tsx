import { useState, type FormEvent } from 'react';
import { Check, Copy } from 'lucide-react';

interface CalculatorPanelProps {
  expression: string;
  resultDisplay: string;
  preview: string | null;
  errorMessage: string | null;
  isBlocked: boolean;
  onExpressionChange: (value: string) => void;
  onDigitOrDot: (char: string) => void;
  onOperator: (op: '÷' | '×' | '−' | '+') => void;
  onPercent: () => void;
  onToggleSign: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onEvaluate: () => void;
}

type KeyVariant = 'utility' | 'operator' | 'number' | 'equals';

interface KeyConfig {
  label: string;
  variant: KeyVariant;
  ariaLabel?: string;
  onPress: () => void;
}

const KEY_VARIANT_CLASSES: Record<KeyVariant, string> = {
  utility:
    'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium',
  operator:
    'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 font-semibold',
  number:
    'bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 font-medium',
  equals:
    'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-semibold',
};

export function CalculatorPanel({
  expression,
  resultDisplay,
  preview,
  errorMessage,
  isBlocked,
  onExpressionChange,
  onDigitOrDot,
  onOperator,
  onPercent,
  onToggleSign,
  onBackspace,
  onClear,
  onEvaluate,
}: CalculatorPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy =
      resultDisplay !== '0'
        ? resultDisplay.replace(/,/g, '')
        : expression.trim() || '0';
    try {
      await navigator.clipboard?.writeText(textToCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onEvaluate();
  };

  const keys: KeyConfig[] = [
    { label: 'C', variant: 'utility', onPress: onClear },
    { label: '⌫', variant: 'utility', onPress: onBackspace },
    { label: '%', variant: 'utility', onPress: onPercent },
    { label: '÷', variant: 'operator', onPress: () => onOperator('÷') },

    { label: '7', variant: 'number', onPress: () => onDigitOrDot('7') },
    { label: '8', variant: 'number', onPress: () => onDigitOrDot('8') },
    { label: '9', variant: 'number', onPress: () => onDigitOrDot('9') },
    { label: '×', variant: 'operator', onPress: () => onOperator('×') },

    { label: '4', variant: 'number', onPress: () => onDigitOrDot('4') },
    { label: '5', variant: 'number', onPress: () => onDigitOrDot('5') },
    { label: '6', variant: 'number', onPress: () => onDigitOrDot('6') },
    { label: '−', variant: 'operator', onPress: () => onOperator('−') },

    { label: '1', variant: 'number', onPress: () => onDigitOrDot('1') },
    { label: '2', variant: 'number', onPress: () => onDigitOrDot('2') },
    { label: '3', variant: 'number', onPress: () => onDigitOrDot('3') },
    { label: '+', variant: 'operator', onPress: () => onOperator('+') },

    { label: '±', variant: 'number', onPress: onToggleSign },
    { label: '0', variant: 'number', onPress: () => onDigitOrDot('0') },
    { label: '.', variant: 'number', onPress: () => onDigitOrDot('.') },
    { label: '=', variant: 'equals', onPress: onEvaluate },
  ];

  const isPreviewError =
    preview !== null && !preview.startsWith('= ');

  return (
    <div className="lg:col-span-7 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 space-y-4">
      <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <span>Standard</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors rounded px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="border-b border-slate-800 pb-2.5">
          <label htmlFor="expression-input" className="sr-only">
            Expression
          </label>
          <input
            id="expression-input"
            type="text"
            inputMode="decimal"
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onClear();
              }
            }}
            placeholder={
              isBlocked ? 'Upgrade plan to continue...' : 'Type or tap numbers...'
            }
            readOnly={isBlocked}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-right font-mono text-lg text-slate-300 placeholder:text-slate-600 focus:outline-none tabular-nums"
          />
        </form>

        <div className="flex items-baseline justify-between gap-3 pt-1 min-h-[40px]">
          <div className="text-xs font-mono tabular-nums truncate">
            {errorMessage ? (
              <span className="text-rose-400">{errorMessage}</span>
            ) : preview ? (
              <span className={isPreviewError ? 'text-rose-400' : 'text-slate-400'}>
                {preview}
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
          <div
            data-testid="calculator-result"
            className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight truncate"
          >
            {resultDisplay}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {keys.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={key.onPress}
            aria-label={key.ariaLabel}
            className={`h-12 sm:h-14 w-full min-w-0 rounded-xl border font-mono text-base sm:text-lg tabular-nums active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${KEY_VARIANT_CLASSES[key.variant]}`}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
}
