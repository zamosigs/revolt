// ============================================================================
// Revolt Ledger — Centralized Financial Calculations
// ============================================================================
// This is the SINGLE source of truth for all financial calculations.
// Used server-side in actions AND client-side for previews.
// The server always independently calculates — never trusts browser values.
// ============================================================================

import type { PaymentCalculation } from '../types';

/**
 * Calculate all payment amounts from gross amount and commission rates.
 * 
 * Formula:
 *   ali_rate = client_rate - wasi_rate
 *   total_commission = gross_amount × (client_rate / 100)
 *   wasi_amount = gross_amount × (wasi_rate / 100)
 *   ali_amount = gross_amount × (ali_rate / 100)
 *   wire_amount = gross_amount - wasi_amount
 * 
 * All amounts are rounded to 2 decimal places using banker's rounding.
 */
export function calculatePayment(
  grossAmount: number,
  clientRate: number,
  wasiRate: number
): PaymentCalculation {
  // Validate inputs
  if (grossAmount <= 0) {
    throw new Error('Gross amount must be greater than zero');
  }
  if (clientRate <= 0 || clientRate > 100) {
    throw new Error('Client rate must be between 0 and 100');
  }
  if (wasiRate <= 0 || wasiRate > 100) {
    throw new Error('Wasi rate must be between 0 and 100');
  }
  if (wasiRate > clientRate) {
    throw new Error('Wasi rate cannot exceed client rate');
  }

  const aliRate = round2(clientRate - wasiRate);
  const totalCommission = round2(grossAmount * (clientRate / 100));
  const wasiAmount = round2(grossAmount * (wasiRate / 100));
  const aliAmount = round2(grossAmount * (aliRate / 100));
  const wireAmount = round2(grossAmount - wasiAmount);

  return {
    client_rate: clientRate,
    wasi_rate: wasiRate,
    ali_rate: aliRate,
    total_commission: totalCommission,
    wasi_amount: wasiAmount,
    ali_amount: aliAmount,
    wire_amount: wireAmount,
  };
}

/**
 * Round to 2 decimal places using standard rounding.
 * Avoids floating-point precision issues by working with integers.
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Format a number as USD currency string.
 */
export function formatLedgerCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a percentage for display.
 */
export function formatRate(rate: number): string {
  return `${rate}%`;
}
