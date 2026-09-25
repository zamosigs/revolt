// ============================================================================
// Revolt Ledger — Permissions
// ============================================================================

import type { LedgerRole } from '../types';

export type LedgerModule = 'dashboard' | 'payments' | 'clients' | 'settings';

const LEDGER_ROLE_PERMISSIONS: Record<LedgerRole, LedgerModule[]> = {
  ADMIN: ['dashboard', 'payments', 'clients', 'settings'],
  OPERATOR: ['payments'],
};

export function hasLedgerPermission(role: LedgerRole | undefined, module: LedgerModule): boolean {
  if (!role) return false;
  const permissions = LEDGER_ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(module) : false;
}

export function getAllowedLedgerModules(role: LedgerRole | undefined): LedgerModule[] {
  if (!role) return [];
  return LEDGER_ROLE_PERMISSIONS[role] || [];
}

export function isLedgerAdmin(role: LedgerRole | undefined): boolean {
  return role === 'ADMIN';
}

export function isLedgerOperator(role: LedgerRole | undefined): boolean {
  return role === 'OPERATOR';
}

/**
 * Columns that the OPERATOR is allowed to see from ledger_payments.
 * Used in server actions to strip sensitive data.
 */
export const OPERATOR_VISIBLE_COLUMNS = [
  'id',
  'invoice_number',
  'sender_name',
  'gross_amount',
  'wasi_amount',
  'wire_amount',
  'status',
  'received_date',
  'wire_date',
  'wire_reference',
  'notes',
  'marked_paid_at',
] as const;

/**
 * Fields the OPERATOR is allowed to set when marking a payment as paid.
 */
export const OPERATOR_MARK_PAID_FIELDS = [
  'status',
  'wire_date',
  'wire_reference',
  'notes',
  'marked_paid_by',
  'marked_paid_at',
  'updated_at',
] as const;
