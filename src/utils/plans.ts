export type PlanId = 'free' | 'pro' | 'business';

export interface PlanDefinition {
  id: PlanId;
  kicker: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  shortDescription: string;
  limit: number | null; // null means unlimited
  features: string[];
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    kicker: 'For trying out the calculator',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    description: 'Includes 5 free calculations before a monthly plan is required.',
    shortDescription: '5 free calculations included.',
    limit: 5,
    features: [
      '5 calculations included',
      'Standard arithmetic (+, −, ×, ÷, %)',
      'Keyboard & keypad input',
    ],
  },
  pro: {
    id: 'pro',
    kicker: 'For regular individual use',
    name: 'Pro Plan',
    price: 1,
    priceLabel: '$1',
    description: 'Includes 100 calculations per month with full session history.',
    shortDescription: '100 calculations per month and full calculation history.',
    limit: 100,
    features: [
      '100 calculations per month',
      'Full calculation history list',
      'One-click result recall & copy',
      'Billed $1 monthly',
    ],
  },
  business: {
    id: 'business',
    kicker: 'For heavy & team use',
    name: 'Business Plan',
    price: 2,
    priceLabel: '$2',
    description: 'Unlimited calculations per month for teams and high-volume work.',
    shortDescription: 'Unlimited calculations per month for up to 5 team seats.',
    limit: null,
    features: [
      'Unlimited calculations per month',
      'Full calculation history list',
      'Up to 5 team seats included',
      'Billed $2 monthly',
    ],
  },
};

export const STORAGE_KEYS = {
  plan: 'numera_simple_plan_v2',
  used: 'numera_simple_used_v2',
  history: 'numera_simple_history_v2',
  theme: 'numera_theme_v1',
} as const;

export function getRemainingCalculations(plan: PlanId, used: number): number | null {
  const limit = PLANS[plan].limit;
  if (limit === null) return null;
  return Math.max(0, limit - used);
}

export function isPlanLimitReached(plan: PlanId, used: number): boolean {
  const remaining = getRemainingCalculations(plan, used);
  return remaining !== null && remaining <= 0;
}

export function getPlanStatusSummary(plan: PlanId, used: number): string {
  if (plan === 'free') {
    const remaining = getRemainingCalculations('free', used) ?? 0;
    return `Free plan · ${remaining} of 5 calculations left`;
  }
  if (plan === 'pro') {
    const remaining = getRemainingCalculations('pro', used) ?? 0;
    return `Pro Plan ($1/month) · ${remaining} of 100 calculations left`;
  }
  return 'Business Plan ($2/month) · Unlimited calculations';
}
