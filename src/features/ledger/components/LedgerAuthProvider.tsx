'use client';

// ============================================================================
// Revolt Ledger — Auth Provider
// ============================================================================

import { useEffect } from 'react';
import { useLedgerAuthStore } from '../hooks/useLedgerAuth';

export default function LedgerAuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useLedgerAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
