-- ============================================================================
-- REVOLT LEDGER — RLS Fix Migration (Fixes Infinite Recursion Error 42P17)
-- ============================================================================
-- Run this in your Ledger Supabase SQL Editor:
-- https://fulhegisexopfuqbxrmb.supabase.co -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- These functions run with definer rights to check roles without triggering RLS loops.

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

-- 2. DROP OLD POLICIES
DROP POLICY IF EXISTS "ledger_users_read_own" ON ledger_users;
DROP POLICY IF EXISTS "ledger_users_admin_read_all" ON ledger_users;
DROP POLICY IF EXISTS "ledger_users_select" ON ledger_users;

DROP POLICY IF EXISTS "ledger_clients_admin_select" ON ledger_clients;
DROP POLICY IF EXISTS "ledger_clients_admin_insert" ON ledger_clients;
DROP POLICY IF EXISTS "ledger_clients_admin_update" ON ledger_clients;

DROP POLICY IF EXISTS "ledger_rate_history_admin_select" ON ledger_client_rate_history;
DROP POLICY IF EXISTS "ledger_rate_history_admin_insert" ON ledger_client_rate_history;

DROP POLICY IF EXISTS "ledger_settings_admin_select" ON ledger_settings;
DROP POLICY IF EXISTS "ledger_settings_admin_update" ON ledger_settings;

DROP POLICY IF EXISTS "ledger_payments_select" ON ledger_payments;
DROP POLICY IF EXISTS "ledger_payments_admin_insert" ON ledger_payments;
DROP POLICY IF EXISTS "ledger_payments_admin_update" ON ledger_payments;
DROP POLICY IF EXISTS "ledger_payments_operator_update" ON ledger_payments;

-- 3. CREATE RECURSION-FREE POLICIES

-- ledger_users: Any active ledger user can read their own record, admins can read all
CREATE POLICY "ledger_users_select"
  ON ledger_users FOR SELECT
  USING (user_id = auth.uid() OR is_ledger_admin(auth.uid()));

-- ledger_clients: Admin only
CREATE POLICY "ledger_clients_admin_select"
  ON ledger_clients FOR SELECT
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_clients_admin_insert"
  ON ledger_clients FOR INSERT
  WITH CHECK (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_clients_admin_update"
  ON ledger_clients FOR UPDATE
  USING (is_ledger_admin(auth.uid()));

-- ledger_client_rate_history: Admin only
CREATE POLICY "ledger_rate_history_admin_select"
  ON ledger_client_rate_history FOR SELECT
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_rate_history_admin_insert"
  ON ledger_client_rate_history FOR INSERT
  WITH CHECK (is_ledger_admin(auth.uid()));

-- ledger_settings: Admin only
CREATE POLICY "ledger_settings_admin_select"
  ON ledger_settings FOR SELECT
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_settings_admin_update"
  ON ledger_settings FOR UPDATE
  USING (is_ledger_admin(auth.uid()));

-- ledger_payments: Role-based access
CREATE POLICY "ledger_payments_select"
  ON ledger_payments FOR SELECT
  USING (is_ledger_user(auth.uid()));

CREATE POLICY "ledger_payments_admin_insert"
  ON ledger_payments FOR INSERT
  WITH CHECK (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_payments_admin_update"
  ON ledger_payments FOR UPDATE
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_payments_admin_delete"
  ON ledger_payments FOR DELETE
  USING (is_ledger_admin(auth.uid()));

CREATE POLICY "ledger_payments_operator_update"
  ON ledger_payments FOR UPDATE
  USING (is_ledger_operator(auth.uid()) AND status = 'PENDING');
