'use server';

// ============================================================================
// Revolt Ledger — Settings Server Actions (ADMIN only)
// ============================================================================

import { createLedgerAdminClient } from '../lib/supabase/admin';
import { createLedgerServerClient } from '../lib/supabase/server';
import { requireLedgerAdmin } from './auth';

/**
 * Get the current Wasi commission rate.
 */
export async function getWasiRateAction() {
  try {
    await requireLedgerAdmin();
    const supabase = await createLedgerServerClient();

    const { data, error } = await supabase
      .from('ledger_settings')
      .select('value')
      .eq('key', 'wasi_commission_rate')
      .single();

    if (error) throw error;

    return { success: true, data: parseFloat(data?.value || '4') };
  } catch (error: any) {
    console.error('getWasiRateAction failed:', error);
    return { success: false, error: error.message, data: 4 };
  }
}

/**
 * Update the global Wasi commission rate. ADMIN only.
 * Only affects new payments — existing payments retain their snapshot.
 */
export async function updateWasiRateAction(newRate: number) {
  try {
    const { session } = await requireLedgerAdmin();
    const admin = createLedgerAdminClient();

    if (newRate <= 0 || newRate > 100) {
      return { success: false, error: 'Rate must be between 0 and 100' };
    }

    const { error } = await admin
      .from('ledger_settings')
      .update({
        value: String(newRate),
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      })
      .eq('key', 'wasi_commission_rate');

    if (error) {
      console.error('Update wasi rate error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('updateWasiRateAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
