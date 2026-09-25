import { createBrowserClient } from '@supabase/ssr';

/**
 * Ledger browser client — connects to the SEPARATE Ledger Supabase project.
 * Used in client components for Ledger data access.
 */
export const createLedgerClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_LEDGER_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_LEDGER_SUPABASE_ANON_KEY!
  );
