-- ============================================================================
-- REVOLT LEDGER — Database Schema Migration
-- ============================================================================
-- This migration creates all tables required for the Ledger module.
-- All tables are prefixed with `ledger_` to avoid collision with existing ERP.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).
-- ============================================================================

-- ============================================================================
-- 1. LEDGER USERS (maps Supabase auth users to Ledger-specific roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'OPERATOR')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 2. LEDGER CLIENTS (internal clients like Anas, Usama — Admin only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL CHECK (commission_rate > 0 AND commission_rate <= 100),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- 3. CLIENT RATE HISTORY (audit trail for commission rate changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_client_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES ledger_clients(id) ON DELETE CASCADE,
  old_rate NUMERIC(5,2),
  new_rate NUMERIC(5,2) NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. LEDGER SETTINGS (global config like Wasi commission rate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- 5. INVOICE NUMBER SEQUENCE
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS ledger_invoice_seq START 1;

-- ============================================================================
-- 6. LEDGER PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,

  client_id UUID NOT NULL REFERENCES ledger_clients(id),
  sender_name TEXT NOT NULL,

  gross_amount NUMERIC(12,2) NOT NULL CHECK (gross_amount > 0),

  -- Rate snapshots (immutable after creation)
  client_rate_snapshot NUMERIC(5,2) NOT NULL,
  wasi_rate_snapshot NUMERIC(5,2) NOT NULL,
  ali_rate_snapshot NUMERIC(5,2) NOT NULL,

  -- Calculated amounts (computed server-side, immutable after creation)
  total_commission NUMERIC(12,2) NOT NULL,
  wasi_amount NUMERIC(12,2) NOT NULL,
  ali_amount NUMERIC(12,2) NOT NULL,
  wire_amount NUMERIC(12,2) NOT NULL,

  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),

  received_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Wire details (populated by Operator via Mark Paid)
  wire_date DATE,
  wire_reference TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  marked_paid_by UUID REFERENCES auth.users(id),
  marked_paid_at TIMESTAMPTZ
);

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all ledger tables
ALTER TABLE ledger_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_client_rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_settings ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Security Definer Helpers (prevents RLS infinite recursion)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_ledger_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM ledger_users
    WHERE user_id = p_user_id AND role = 'ADMIN' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_ledger_user(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM ledger_users
    WHERE user_id = p_user_id AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_ledger_operator(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM ledger_users
    WHERE user_id = p_user_id AND role = 'OPERATOR' AND is_active = true
  );
$$;

-- -------------------------------------------------------
-- ledger_users: Any active ledger user can read their own record, admins can read all
-- -------------------------------------------------------
CREATE POLICY "ledger_users_select"
  ON ledger_users FOR SELECT
  USING (user_id = auth.uid() OR is_ledger_admin(auth.uid()));

-- -------------------------------------------------------
-- ledger_clients: Admin only (CRUD)
-- -------------------------------------------------------
CREATE POLICY "ledger_clients_admin_select"
  ON ledger_clients FOR SELECT
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_clients_admin_insert"
  ON ledger_clients FOR INSERT
  WITH CHECK (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_clients_admin_update"
  ON ledger_clients FOR UPDATE
  USING (is_ledger_admin(auth.uid()));

-- -------------------------------------------------------
-- ledger_client_rate_history: Admin only
-- -------------------------------------------------------
CREATE POLICY "ledger_rate_history_admin_select"
  ON ledger_client_rate_history FOR SELECT
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_rate_history_admin_insert"
  ON ledger_client_rate_history FOR INSERT
  WITH CHECK (is_ledger_admin(auth.uid()));

-- -------------------------------------------------------
-- ledger_settings: Admin only
-- -------------------------------------------------------
CREATE POLICY "ledger_settings_admin_select"
  ON ledger_settings FOR SELECT
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_settings_admin_update"
  ON ledger_settings FOR UPDATE
  USING (is_ledger_admin(auth.uid()));

-- -------------------------------------------------------
-- ledger_payments: Role-based access
-- -------------------------------------------------------

-- Both ADMIN and OPERATOR can read payments
CREATE POLICY "ledger_payments_select"
  ON ledger_payments FOR SELECT
  USING (is_ledger_user(auth.uid()));

-- Only ADMIN can create payments
CREATE POLICY "ledger_payments_admin_insert"
  ON ledger_payments FOR INSERT
  WITH CHECK (is_ledger_admin(auth.uid()));

-- ADMIN can update any payment
CREATE POLICY "ledger_payments_admin_update"
  ON ledger_payments FOR UPDATE
  USING (is_ledger_admin(auth.uid()));

-- ADMIN can delete any payment
CREATE POLICY "ledger_payments_admin_delete"
  ON ledger_payments FOR DELETE
  USING (is_ledger_admin(auth.uid()));

-- OPERATOR can update ONLY PENDING payments
CREATE POLICY "ledger_payments_operator_update"
  ON ledger_payments FOR UPDATE
  USING (is_ledger_operator(auth.uid()) AND status = 'PENDING');

-- ============================================================================
-- 8. SEED DEFAULT SETTINGS
-- ============================================================================
INSERT INTO ledger_settings (key, value)
VALUES ('wasi_commission_rate', '4')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 9. INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ledger_payments_client_id ON ledger_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_ledger_payments_status ON ledger_payments(status);
CREATE INDEX IF NOT EXISTS idx_ledger_payments_received_date ON ledger_payments(received_date);
CREATE INDEX IF NOT EXISTS idx_ledger_payments_invoice_number ON ledger_payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_ledger_payments_sender_name ON ledger_payments(sender_name);
CREATE INDEX IF NOT EXISTS idx_ledger_client_rate_history_client_id ON ledger_client_rate_history(client_id);
CREATE INDEX IF NOT EXISTS idx_ledger_users_user_id ON ledger_users(user_id);
