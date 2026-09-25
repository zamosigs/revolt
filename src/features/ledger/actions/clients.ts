'use server';

// ============================================================================
// Revolt Ledger — Client Server Actions (ADMIN only)
// ============================================================================

import { createLedgerAdminClient } from '../lib/supabase/admin';
import { createLedgerServerClient } from '../lib/supabase/server';
import { requireLedgerAdmin } from './auth';
import type { CreateClientInput, UpdateClientInput, LedgerClient, LedgerClientRateHistory } from '../types';

/**
 * Create a new Ledger client. ADMIN only.
 */
export async function createLedgerClientAction(input: CreateClientInput) {
  try {
    const { session } = await requireLedgerAdmin();
    const admin = createLedgerAdminClient();

    // Validate
    if (!input.name?.trim()) {
      return { success: false, error: 'Client name is required' };
    }
    if (!input.commission_rate || input.commission_rate <= 0 || input.commission_rate > 100) {
      return { success: false, error: 'Commission rate must be between 0 and 100' };
    }

    // Insert client
    const { data: client, error } = await admin
      .from('ledger_clients')
      .insert({
        name: input.name.trim(),
        commission_rate: input.commission_rate,
        status: 'ACTIVE',
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create client error:', error);
      return { success: false, error: error.message };
    }

    // Record initial rate in history
    await admin.from('ledger_client_rate_history').insert({
      client_id: client.id,
      old_rate: null,
      new_rate: input.commission_rate,
      effective_from: new Date().toISOString(),
      changed_by: session.user.id,
    });

    return { success: true, data: client };
  } catch (error: any) {
    console.error('createLedgerClientAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

/**
 * Update a Ledger client. ADMIN only.
 * If commission_rate changes, records in rate history.
 */
export async function updateLedgerClientAction(clientId: string, input: UpdateClientInput) {
  try {
    const { session } = await requireLedgerAdmin();
    const admin = createLedgerAdminClient();

    // Validate
    if (input.commission_rate !== undefined) {
      if (input.commission_rate <= 0 || input.commission_rate > 100) {
        return { success: false, error: 'Commission rate must be between 0 and 100' };
      }
    }

    // Get current client for rate comparison
    const { data: current, error: fetchError } = await admin
      .from('ledger_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: 'Client not found' };
    }

    // Build update payload
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.status !== undefined) updates.status = input.status;
    if (input.commission_rate !== undefined) updates.commission_rate = input.commission_rate;

    // Update client
    const { data: updated, error: updateError } = await admin
      .from('ledger_clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Update client error:', updateError);
      return { success: false, error: updateError.message };
    }

    // Record rate change in history if commission_rate changed
    if (input.commission_rate !== undefined && input.commission_rate !== current.commission_rate) {
      await admin.from('ledger_client_rate_history').insert({
        client_id: clientId,
        old_rate: current.commission_rate,
        new_rate: input.commission_rate,
        effective_from: new Date().toISOString(),
        changed_by: session.user.id,
      });
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('updateLedgerClientAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

/**
 * Get all Ledger clients. ADMIN only.
 */
export async function getLedgerClientsAction() {
  try {
    await requireLedgerAdmin();
    const supabase = await createLedgerServerClient();

    const { data, error } = await supabase
      .from('ledger_clients')
      .select('*')
      .order('name');

    if (error) throw error;

    return { success: true, data: (data || []) as LedgerClient[] };
  } catch (error: any) {
    console.error('getLedgerClientsAction failed:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get a single Ledger client with rate history. ADMIN only.
 */
export async function getLedgerClientByIdAction(clientId: string) {
  try {
    await requireLedgerAdmin();
    const supabase = await createLedgerServerClient();

    const { data: client, error } = await supabase
      .from('ledger_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) throw error;

    // Fetch rate history
    const { data: rateHistory } = await supabase
      .from('ledger_client_rate_history')
      .select('*')
      .eq('client_id', clientId)
      .order('changed_at', { ascending: false });

    // Fetch payment stats for this client
    const { data: payments } = await supabase
      .from('ledger_payments')
      .select('gross_amount, wasi_amount, ali_amount, wire_amount, status')
      .eq('client_id', clientId);

    const validPayments = (payments || []).filter(p => p.status !== 'CANCELLED');
    const clientStats = {
      total_payments: validPayments.length,
      total_gross: validPayments.reduce((s, p) => s + Number(p.gross_amount), 0),
      total_wasi: validPayments.reduce((s, p) => s + Number(p.wasi_amount), 0),
      total_ali: validPayments.reduce((s, p) => s + Number(p.ali_amount), 0),
    };

    return {
      success: true,
      data: {
        client: client as LedgerClient,
        rateHistory: (rateHistory || []) as LedgerClientRateHistory[],
        stats: clientStats,
      },
    };
  } catch (error: any) {
    console.error('getLedgerClientByIdAction failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get payments for a specific client. ADMIN only.
 */
export async function getClientPaymentsAction(clientId: string) {
  try {
    await requireLedgerAdmin();
    const supabase = await createLedgerServerClient();

    const { data, error } = await supabase
      .from('ledger_payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getClientPaymentsAction failed:', error);
    return { success: false, error: error.message, data: [] };
  }
}
