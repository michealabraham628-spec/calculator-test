import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendDigitOrDot,
  appendOperator,
  appendPercent,
  backspaceExpression,
  evaluateExpression,
  toggleSign,
  tryEvaluatePreview,
} from './calculator';
import {
  getPlanStatusSummary,
  getRemainingCalculations,
  isPlanLimitReached,
} from './plans';

test('evaluates basic arithmetic with correct operator precedence', () => {
  const r1 = evaluateExpression('12 + 34');
  assert.equal(r1.ok, true);
  if (r1.ok) assert.equal(r1.value, 46);

  const r2 = evaluateExpression('2 + 3 * 4');
  assert.equal(r2.ok, true);
  if (r2.ok) assert.equal(r2.value, 14);

  const r3 = evaluateExpression('12 * (3 + 4)');
  assert.equal(r3.ok, true);
  if (r3.ok) assert.equal(r3.value, 84);

  const r4 = evaluateExpression('100 ÷ 4');
  assert.equal(r4.ok, true);
  if (r4.ok) assert.equal(r4.value, 25);
});

test('handles floating point precision and formatting', () => {
  const r1 = evaluateExpression('0.1 + 0.2');
  assert.equal(r1.ok, true);
  if (r1.ok) {
    assert.equal(r1.value, 0.3);
    assert.equal(r1.formatted, '0.3');
  }

  const r2 = evaluateExpression('12 + 34100 / 4');
  assert.equal(r2.ok, true);
  if (r2.ok) {
    assert.equal(r2.value, 8537);
    assert.equal(r2.formatted, '8,537');
  }
});

test('evaluates percentages and unary signs accurately', () => {
  const r1 = evaluateExpression('50%');
  assert.equal(r1.ok, true);
  if (r1.ok) assert.equal(r1.value, 0.5);

  const r2 = evaluateExpression('-(50%)');
  assert.equal(r2.ok, true);
  if (r2.ok) assert.equal(r2.value, -0.5);

  const r3 = evaluateExpression('200 * 15%');
  assert.equal(r3.ok, true);
  if (r3.ok) assert.equal(r3.value, 30);
});

test('returns explicit validation errors for division by zero and invalid expressions', () => {
  const divZero = evaluateExpression('5 / 0');
  assert.deepEqual(divZero, { ok: false, error: 'Division by zero' });

  const unknownVar = evaluateExpression('abc');
  assert.deepEqual(unknownVar, { ok: false, error: 'Unknown variable "abc"' });

  const unmatched = evaluateExpression('(12 + 3');
  assert.equal(unmatched.ok, false);
});

test('preview suppresses trailing operator noise and shows live result', () => {
  assert.equal(tryEvaluatePreview('12 + '), null);
  assert.equal(tryEvaluatePreview('42'), null);
  assert.equal(tryEvaluatePreview('12 + 34'), '= 46');
  assert.equal(tryEvaluatePreview('5 / 0'), 'Division by zero');
  assert.equal(tryEvaluatePreview('abc'), 'Unknown variable "abc"');
});

test('expression editing helpers behave cleanly', () => {
  assert.equal(appendDigitOrDot('', '.', false), '0.');
  assert.equal(appendDigitOrDot('12.3', '.', false), '12.3');
  assert.equal(appendOperator('100', '÷', '0', false), '100 / ');
  assert.equal(appendOperator('100 + ', '×', '0', false), '100 * ');
  assert.equal(backspaceExpression('100 + '), '100');
  assert.equal(appendPercent('50', '0', false), '50%');
  assert.equal(toggleSign('50%', '0', false), '-(50%)');
  assert.equal(toggleSign('-(50%)', '0', false), '50%');
});

test('plan quotas and status summaries compute accurately', () => {
  assert.equal(getRemainingCalculations('free', 0), 5);
  assert.equal(getRemainingCalculations('free', 5), 0);
  assert.equal(isPlanLimitReached('free', 4), false);
  assert.equal(isPlanLimitReached('free', 5), true);
  assert.equal(getRemainingCalculations('pro', 12), 88);
  assert.equal(getRemainingCalculations('business', 500), null);
  assert.equal(isPlanLimitReached('business', 500), false);
  assert.equal(
    getPlanStatusSummary('free', 2),
    'Free plan · 3 of 5 calculations left'
  );
  assert.equal(
    getPlanStatusSummary('pro', 0),
    'Pro Plan ($1/month) · 100 of 100 calculations left'
  );
  assert.equal(
    getPlanStatusSummary('business', 42),
    'Business Plan ($2/month) · Unlimited calculations'
  );
});
