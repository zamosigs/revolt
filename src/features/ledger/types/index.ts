// ============================================================================
// Revolt Ledger — Type Definitions
// ============================================================================

export type LedgerRole = 'ADMIN' | 'OPERATOR';

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface LedgerUser {
  id: string;
  user_id: string;
  role: LedgerRole;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface LedgerClient {
  id: string;
  name: string;
  commission_rate: number;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface LedgerClientRateHistory {
  id: string;
  client_id: string;
  old_rate: number | null;
  new_rate: number;
  effective_from: string;
  changed_by: string | null;
  changed_at: string;
}

export interface LedgerPayment {
  id: string;
  invoice_number: string;
  client_id: string;
  sender_name: string;
  gross_amount: number;
  client_rate_snapshot: number;
  wasi_rate_snapshot: number;
  ali_rate_snapshot: number;
  total_commission: number;
  wasi_amount: number;
  ali_amount: number;
  wire_amount: number;
  status: PaymentStatus;
  received_date: string;
  wire_date: string | null;
  wire_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  marked_paid_by: string | null;
  marked_paid_at: string | null;
}

// Payment with joined client name (for Admin views)
export interface LedgerPaymentWithClient extends LedgerPayment {
  client_name?: string;
  ledger_clients?: { name: string } | null;
}

// Operator-visible payment fields only
export interface OperatorPayment {
  id: string;
  invoice_number: string;
  sender_name: string;
  gross_amount: number;
  wasi_amount: number;
  wire_amount: number;
  status: PaymentStatus;
  received_date: string;
  wire_date: string | null;
  wire_reference: string | null;
  notes: string | null;
  marked_paid_at: string | null;
}

export interface LedgerSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}

export interface PaymentCalculation {
  client_rate: number;
  wasi_rate: number;
  ali_rate: number;
  total_commission: number;
  wasi_amount: number;
  ali_amount: number;
  wire_amount: number;
}

export interface DashboardStats {
  total_gross: number;
  wasi_earnings: number;
  ali_earnings: number;
  pending_wire: number;
  completed_wire: number;
  payment_count: number;
}

// Form types
export interface CreatePaymentInput {
  client_id: string;
  sender_name: string;
  gross_amount: number;
  received_date: string;
  notes?: string;
}

export interface MarkPaidInput {
  payment_id: string;
  wire_date: string;
  wire_reference?: string;
  notes?: string;
}

export interface CreateClientInput {
  name: string;
  commission_rate: number;
}

export interface UpdateClientInput {
  name?: string;
  commission_rate?: number;
  status?: ClientStatus;
}
