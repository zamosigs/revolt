import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Ledger server client — connects to the SEPARATE Ledger Supabase project.
 * Used in Server Components and Server Actions for Ledger data access.
 */
export const createLedgerServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_LEDGER_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_LEDGER_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
};
