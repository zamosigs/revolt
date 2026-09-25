'use server';

// ============================================================================
// Revolt Ledger — Payment Server Actions
// ============================================================================
// All financial calculations are performed server-side.
// Operator updates restricted to markPaymentAsPaid() only.
// ============================================================================

import { createLedgerAdminClient } from '../lib/supabase/admin';
import { createLedgerServerClient } from '../lib/supabase/server';
import { requireLedgerAdmin, requireLedgerUser } from './auth';
import { calculatePayment } from '../lib/calculations';
import { OPERATOR_VISIBLE_COLUMNS } from '../lib/permissions';
import type { 
  CreatePaymentInput, 
  MarkPaidInput, 
  LedgerPayment, 
  OperatorPayment,
  LedgerPaymentWithClient 
} from '../types';

/**
 * Create a new payment. ADMIN only.
 * Server independently calculates all financial values.
 */
export async function createPaymentAction(input: CreatePaymentInput) {
  try {
    const { session } = await requireLedgerAdmin();
    const admin = createLedgerAdminClient();

    // Validate input
    if (!input.client_id || !input.sender_name?.trim() || !input.gross_amount || input.gross_amount <= 0) {
      return { success: false, error: 'Invalid payment data' };
    }

    // Fetch client's current commission rate
    const { data: client, error: clientError } = await admin
      .from('ledger_clients')
      .select('id, name, commission_rate, status')
      .eq('id', input.client_id)
      .single();

    if (clientError || !client) {
      return { success: false, error: 'Client not found' };
    }

    if (client.status !== 'ACTIVE') {
      return { success: false, error: 'Client is inactive' };
    }

    // Fetch current Wasi commission rate
    const { data: wasiSetting } = await admin
      .from('ledger_settings')
      .select('value')
      .eq('key', 'wasi_commission_rate')
      .single();

    const wasiRate = wasiSetting ? parseFloat(wasiSetting.value) : 4;

    if (wasiRate > client.commission_rate) {
      return { success: false, error: 'Wasi rate exceeds client rate — cannot create payment' };
    }

    // SERVER-SIDE calculation (never trust browser values)
    const calc = calculatePayment(input.gross_amount, client.commission_rate, wasiRate);

    // Generate invoice number using database sequence
    const { data: invoiceResult } = await admin.rpc('generate_ledger_invoice_number');
    
    let invoiceNumber: string;
    if (invoiceResult) {
      invoiceNumber = invoiceResult;
    } else {
      // Fallback: generate via raw query
      const year = new Date().getFullYear();
      const { data: seqResult } = await admin
        .from('ledger_payments')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastSeq = seqResult?.[0]?.invoice_number;
      let nextNum = 1;
      if (lastSeq) {
        const match = lastSeq.match(/INV-\d{4}-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      invoiceNumber = `INV-${year}-${String(nextNum).padStart(4, '0')}`;
    }

    // Insert payment
    const { data: payment, error: insertError } = await admin
      .from('ledger_payments')
      .insert({
        invoice_number: invoiceNumber,
        client_id: input.client_id,
        sender_name: input.sender_name.trim(),
        gross_amount: input.gross_amount,
        client_rate_snapshot: calc.client_rate,
        wasi_rate_snapshot: calc.wasi_rate,
        ali_rate_snapshot: calc.ali_rate,
        total_commission: calc.total_commission,
        wasi_amount: calc.wasi_amount,
        ali_amount: calc.ali_amount,
        wire_amount: calc.wire_amount,
        status: 'PENDING',
        received_date: input.received_date || new Date().toISOString().split('T')[0],
        notes: input.notes?.trim() || null,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, data: payment };
  } catch (error: any) {
    console.error('createPaymentAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

/**
 * Mark a payment as PAID. Available to both ADMIN and OPERATOR.
 * STRICT: Only updates wire-related fields. Never modifies financial amounts.
 */
export async function markPaymentAsPaidAction(input: MarkPaidInput) {
  try {
    const { session, ledgerUser } = await requireLedgerUser();
    const admin = createLedgerAdminClient();

    // Validate input
    if (!input.payment_id || !input.wire_date) {
      return { success: false, error: 'Payment ID and wire date are required' };
    }

    // Verify payment exists and is PENDING
    const { data: existing, error: fetchError } = await admin
      .from('ledger_payments')
      .select('id, status')
      .eq('id', input.payment_id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: 'Payment not found' };
    }

    if (existing.status !== 'PENDING') {
      return { success: false, error: `Payment is already ${existing.status}` };
    }

    // STRICT update — only mark-paid fields, nothing else
    const { data: updated, error: updateError } = await admin
      .from('ledger_payments')
      .update({
        status: 'PAID',
        wire_date: input.wire_date,
        wire_reference: input.wire_reference?.trim() || null,
        notes: input.notes?.trim() || null,
        marked_paid_by: session.user.id,
        marked_paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.payment_id)
      .eq('status', 'PENDING') // Double-check: only update if still PENDING
      .select()
      .single();

    if (updateError) {
      console.error('Mark paid error:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('markPaymentAsPaidAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

/**
 * Get payments list. Role-aware:
 * - ADMIN: Full payment data with client names
 * - OPERATOR: Restricted columns, no client info
 */
export async function getPaymentsAction(filters?: {
  status?: string;
  client_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}) {
  try {
    const { ledgerUser } = await requireLedgerUser();
    const supabase = await createLedgerServerClient();

    if (ledgerUser.role === 'ADMIN') {
      // Admin: full data with client names
      let query = supabase
        .from('ledger_payments')
        .select('*, ledger_clients(name)')
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.client_id) query = query.eq('client_id', filters.client_id);
      if (filters?.date_from) query = query.gte('received_date', filters.date_from);
      if (filters?.date_to) query = query.lte('received_date', filters.date_to);
      if (filters?.search) {
        query = query.or(
          `invoice_number.ilike.%${filters.search}%,sender_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map client name
      const payments = (data || []).map((p: any) => ({
        ...p,
        client_name: p.ledger_clients?.name || 'Unknown',
      }));

      return { success: true, data: payments as LedgerPaymentWithClient[] };
    } else {
      // OPERATOR: restricted columns only, NO client info
      const columns = OPERATOR_VISIBLE_COLUMNS.join(',');
      let query = supabase
        .from('ledger_payments')
        .select(columns)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) {
        query = query.or(
          `invoice_number.ilike.%${filters.search}%,sender_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: (data || []) as unknown as OperatorPayment[] };
    }
  } catch (error: any) {
    console.error('getPaymentsAction failed:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get a single payment by ID. Role-aware column restriction.
 */
export async function getPaymentByIdAction(paymentId: string) {
  try {
    const { ledgerUser } = await requireLedgerUser();
    const supabase = await createLedgerServerClient();

    if (ledgerUser.role === 'ADMIN') {
      const { data, error } = await supabase
        .from('ledger_payments')
        .select('*, ledger_clients(name)')
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: { ...data, client_name: data.ledger_clients?.name || 'Unknown' } as LedgerPaymentWithClient,
      };
    } else {
      const columns = OPERATOR_VISIBLE_COLUMNS.join(',');
      const { data, error } = await supabase
        .from('ledger_payments')
        .select(columns)
        .eq('id', paymentId)
        .single();

      if (error) throw error;

      return { success: true, data: data as unknown as OperatorPayment };
    }
  } catch (error: any) {
    console.error('getPaymentByIdAction failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get dashboard statistics. ADMIN only.
 */
export async function getDashboardStatsAction(filters?: {
  date_from?: string;
  date_to?: string;
}) {
  try {
    await requireLedgerAdmin();
    const supabase = await createLedgerServerClient();

    let query = supabase
      .from('ledger_payments')
      .select('gross_amount, wasi_amount, ali_amount, wire_amount, status');

    if (filters?.date_from) query = query.gte('received_date', filters.date_from);
    if (filters?.date_to) query = query.lte('received_date', filters.date_to);

    const { data, error } = await query;
    if (error) throw error;

    const payments = data || [];
    const validPayments = payments.filter(p => p.status !== 'CANCELLED');

    const stats = {
      total_gross: validPayments.reduce((sum, p) => sum + Number(p.gross_amount), 0),
      wasi_earnings: validPayments.reduce((sum, p) => sum + Number(p.wasi_amount), 0),
      ali_earnings: validPayments.reduce((sum, p) => sum + Number(p.ali_amount), 0),
      pending_wire: validPayments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + Number(p.wire_amount), 0),
      completed_wire: validPayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.wire_amount), 0),
      payment_count: validPayments.length,
    };

    return { success: true, data: stats };
  } catch (error: any) {
    console.error('getDashboardStatsAction failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing payment. ADMIN only.
 * Automatically recalculates financial splits if gross_amount is changed.
 */
export async function updatePaymentAction(
  paymentId: string,
  input: {
    sender_name?: string;
    gross_amount?: number;
    received_date?: string;
    notes?: string;
    status?: 'PENDING' | 'PAID' | 'CANCELLED';
    wire_date?: string;
    wire_reference?: string;
  }
) {
  try {
    const { session } = await requireLedgerAdmin();
    const admin = createLedgerAdminClient();

    // Fetch existing payment
    const { data: existing, error: fetchError } = await admin
      .from('ledger_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: 'Payment record not found' };
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (input.sender_name !== undefined) updates.sender_name = input.sender_name.trim();
    if (input.received_date !== undefined) updates.received_date = input.received_date;
    if (input.notes !== undefined) updates.notes = input.notes.trim() || null;
    if (input.status !== undefined) updates.status = input.status;
    if (input.wire_date !== undefined) updates.wire_date = input.wire_date || null;
    if (input.wire_reference !== undefined) updates.wire_reference = input.wire_reference.trim() || null;

    // Recalculate financial amounts if gross_amount is changed
    if (input.gross_amount !== undefined && input.gross_amount !== existing.gross_amount) {
      if (input.gross_amount <= 0) {
        return { success: false, error: 'Gross amount must be greater than zero' };
      }

      const calc = calculatePayment(
        input.gross_amount,
        existing.client_rate_snapshot,
        existing.wasi_rate_snapshot
      );

      updates.gross_amount = input.gross_amount;
      updates.total_commission = calc.total_commission;
      updates.wasi_amount = calc.wasi_amount;
      updates.ali_amount = calc.ali_amount;
      updates.wire_amount = calc.wire_amount;
    }

    const { data: updated, error: updateError } = await admin
      .from('ledger_payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      console.error('Update payment error:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('updatePaymentAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

/**
 * Permanently delete a payment record. ADMIN only.
 */
export async function deletePaymentAction(paymentId: string) {
  try {
    await requireLedgerAdmin();
    const admin = createLedgerAdminClient();

    const { error } = await admin
      .from('ledger_payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error('Delete payment error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('deletePaymentAction failed:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
