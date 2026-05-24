export const CURRENCY_CODE = 'UGX';

/** Approximate gold price for Nisab calculation (UGX per gram) */
export const GOLD_PRICE_UGX_PER_GRAM = 350_000;
export const NISAB_GOLD_GRAMS = 85;
export const NISAB_UGX = NISAB_GOLD_GRAMS * GOLD_PRICE_UGX_PER_GRAM;

export function formatCurrency(amount, options = {}) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0,
    ...options,
  }).format(Number(amount));
}

export function formatCurrencyPerUnit(amount, unit) {
  return `${formatCurrency(amount)} / ${unit}`;
}

export function formatCompactCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const value = Number(amount);
  if (value >= 1_000_000_000) return `UGX ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `UGX ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `UGX ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
}
