import { createClient } from '@supabase/supabase-js';

/**
 * Ledger admin client — connects to the SEPARATE Ledger Supabase project
 * using the service role key. Bypasses Row Level Security.
 * NEVER expose to the browser. Server-side only.
 */
export function createLedgerAdminClient() {
  if (!process.env.NEXT_PUBLIC_LEDGER_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_LEDGER_SUPABASE_URL is not defined');
  }

  if (!process.env.LEDGER_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('LEDGER_SUPABASE_SERVICE_ROLE_KEY is not defined');
  }

  return createClient(
    process.env.NEXT_PUBLIC_LEDGER_SUPABASE_URL,
    process.env.LEDGER_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
