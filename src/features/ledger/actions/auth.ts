'use server';

// ============================================================================
// Revolt Ledger — Auth Server Actions
// ============================================================================

import { createLedgerServerClient } from '../lib/supabase/server';
import type { LedgerUser } from '../types';

/**
 * Get the current user's Ledger profile.
 * Returns null if the user has no Ledger access.
 */
export async function getLedgerUser(): Promise<LedgerUser | null> {
  const supabase = await createLedgerServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  const { data } = await supabase
    .from('ledger_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return data || null;
}

/**
 * Verify the current user is a Ledger ADMIN.
 * Throws if not authenticated or not authorized.
 */
export async function requireLedgerAdmin() {
  const supabase = await createLedgerServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  const { data: ledgerUser } = await supabase
    .from('ledger_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!ledgerUser || ledgerUser.role !== 'ADMIN') {
    throw new Error('Forbidden: Ledger ADMIN access required');
  }

  return { session, ledgerUser };
}

/**
 * Verify the current user has any Ledger access.
 * Throws if not authenticated or not a Ledger user.
 */
export async function requireLedgerUser() {
  const supabase = await createLedgerServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  const { data: ledgerUser } = await supabase
    .from('ledger_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!ledgerUser) {
    throw new Error('Forbidden: No Ledger access');
  }

  return { session, ledgerUser };
}

/**
 * Sign out the current Ledger user and clear server-side session cookies.
 */
export async function signOutLedgerAction() {
  try {
    const supabase = await createLedgerServerClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (error: any) {
    console.error('signOutLedgerAction error:', error);
    return { success: false, error: error.message };
  }
}
