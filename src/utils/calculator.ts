export type EvalResult =
  | { ok: true; value: number; formatted: string }
  | { ok: false; error: string };

type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '%' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function normalizeExpression(raw: string): string {
  return raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/,/g, '')
    .trim();
}

function tokenize(input: string): { ok: true; tokens: Token[] } | { ok: false; error: string } {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let start = i;
      let dotCount = 0;
      while (i < input.length && /[0-9.]/.test(input[i])) {
        if (input[i] === '.') {
          dotCount += 1;
          if (dotCount > 1) {
            return { ok: false, error: 'Invalid number format' };
          }
        }
        i += 1;
      }
      const numStr = input.slice(start, i);
      if (numStr === '.') {
        return { ok: false, error: 'Invalid number format' };
      }
      const num = Number(numStr);
      if (!Number.isFinite(num)) {
        return { ok: false, error: 'Number out of range' };
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        i += 1;
      }
      const ident = input.slice(start, i);
      return { ok: false, error: `Unknown variable "${ident}"` };
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%') {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i += 1;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i += 1;
      continue;
    }

    return { ok: false, error: `Unexpected character "${ch}"` };
  }

  return { ok: true, tokens };
}

export function cleanPrecision(value: number): number {
  if (!Number.isFinite(value)) return value;
  if (Object.is(value, -0) || Math.abs(value) < 1e-15) return 0;
  return Number(value.toPrecision(12));
}

export function formatNumber(value: number): string {
  const cleaned = cleanPrecision(value);
  if (!Number.isFinite(cleaned)) return 'Error';
  if (Math.abs(cleaned) >= 1e12 || (cleaned !== 0 && Math.abs(cleaned) < 1e-9)) {
    return cleaned.toExponential(6).replace(/\.?0+e/, 'e');
  }
  return cleaned.toLocaleString('en-US', {
    maximumFractionDigits: 10,
  });
}

export function evaluateExpression(rawInput: string): EvalResult {
  const normalized = normalizeExpression(rawInput);
  if (!normalized) {
    return { ok: true, value: 0, formatted: '0' };
  }

  const tokenized = tokenize(normalized);
  if (!tokenized.ok) {
    return { ok: false, error: tokenized.error };
  }

  const tokens = tokenized.tokens;
  if (tokens.length === 0) {
    return { ok: true, value: 0, formatted: '0' };
  }

  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function consume(): Token {
    const t = tokens[pos];
    pos += 1;
    return t;
  }

  function parseExpression(): number {
    let left = parseTerm();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseTerm();
        left = t.value === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseUnary();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
        consume();
        const right = parseUnary();
        if (t.value === '/') {
          if (right === 0) {
            throw new Error('Division by zero');
          }
          left = left / right;
        } else {
          left = left * right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): number {
    const t = peek();
    if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume();
      const val = parseUnary();
      return t.value === '-' ? -val : val;
    }
    return parsePostfix();
  }

  function parsePostfix(): number {
    let val = parsePrimary();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && t.value === '%') {
        consume();
        val = val / 100;
      } else {
        break;
      }
    }
    return val;
  }

  function parsePrimary(): number {
    const t = peek();
    if (!t) {
      throw new Error('Incomplete expression');
    }
    if (t.type === 'number') {
      consume();
      return t.value;
    }
    if (t.type === 'lparen') {
      consume();
      const inner = parseExpression();
      const closing = peek();
      if (!closing || closing.type !== 'rparen') {
        throw new Error('Missing closing parenthesis');
      }
      consume();
      return inner;
    }
    throw new Error('Invalid syntax');
  }

  try {
    const rawValue = parseExpression();
    if (pos < tokens.length) {
      return { ok: false, error: 'Invalid syntax' };
    }
    if (!Number.isFinite(rawValue)) {
      return { ok: false, error: 'Result out of range' };
    }
    const cleaned = cleanPrecision(rawValue);
    return {
      ok: true,
      value: cleaned,
      formatted: formatNumber(cleaned),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid expression',
    };
  }
}

export function tryEvaluatePreview(rawInput: string): string | null {
  const normalized = normalizeExpression(rawInput);
  if (!normalized) return null;

  // Avoid flashing syntax error while user is mid-expression like "12 + "
  if (/[+\-*/(]$/.test(normalized)) {
    return null;
  }

  const res = evaluateExpression(rawInput);
  if (!res.ok) {
    // Surface semantic / unknown variable errors immediately, suppress incomplete paren errors
    if (res.error === 'Missing closing parenthesis' || res.error === 'Incomplete expression') {
      return null;
    }
    return res.error;
  }

  // Only show live "= value" preview if expression has an operator or parens or %
  if (!/[+\-*/%()]/.test(normalized)) {
    return null;
  }

  return `= ${res.formatted}`;
}

export function appendDigitOrDot(expr: string, char: string, justEvaluated: boolean): string {
  const current = justEvaluated ? '' : expr;
  if (char === '.') {
    // Check last numeric segment for an existing decimal point
    const match = current.match(/([0-9.]+)$/);
    if (match && match[1].includes('.')) {
      return current;
    }
    if (!match) {
      return current ? `${current}0.` : '0.';
    }
    return `${current}.`;
  }
  return `${current}${char}`;
}

export function appendOperator(
  expr: string,
  opDisplay: '÷' | '×' | '−' | '+',
  lastResult: string,
  justEvaluated: boolean
): string {
  const opChar =
    opDisplay === '÷'
      ? '/'
      : opDisplay === '×'
        ? '*'
        : opDisplay === '−'
          ? '-'
          : '+';

  let base = expr.trimEnd();
  if (justEvaluated || (!base && lastResult !== '0')) {
    base = lastResult.replace(/,/g, '');
  }
  if (!base) {
    if (opChar === '-') return '-';
    return `0 ${opChar} `;
  }

  // Replace trailing operator if user taps two operators in a row
  if (/[+\-*/]$/.test(base)) {
    return `${base.slice(0, -1).trimEnd()} ${opChar} `;
  }

  return `${base} ${opChar} `;
}

export function appendPercent(expr: string, lastResult: string, justEvaluated: boolean): string {
  const base = justEvaluated ? lastResult.replace(/,/g, '') : expr;
  if (!base.trim()) return '0%';
  if (base.trimEnd().endsWith('%')) return base;
  if (/[+\-*/(]\s*$/.test(base)) return base;
  return `${base.trimEnd()}%`;
}

export function toggleSign(expr: string, lastResult: string, justEvaluated: boolean): string {
  const base = justEvaluated ? lastResult.replace(/,/g, '') : expr.trim();
  if (!base) {
    if (lastResult && lastResult !== '0') {
      const cleanLast = lastResult.replace(/,/g, '');
      return cleanLast.startsWith('-') ? cleanLast.slice(1) : `-${cleanLast}`;
    }
    return '-';
  }

  if (base.startsWith('-(') && base.endsWith(')')) {
    return base.slice(2, -1);
  }

  // Simple standalone number
  if (/^-?[0-9.]+$/.test(base)) {
    return base.startsWith('-') ? base.slice(1) : `-${base}`;
  }

  return `-(${base})`;
}

export function backspaceExpression(expr: string): string {
  if (!expr) return '';
  if (/\s[+\-*/]\s$/.test(expr)) {
    return expr.slice(0, -3);
  }
  return expr.slice(0, -1);
}
