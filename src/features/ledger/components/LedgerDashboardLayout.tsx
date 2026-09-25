'use client';

// ============================================================================
// Revolt Ledger — Dashboard Layout
// ============================================================================

import { LedgerSidebar } from './LedgerSidebar';
import { LedgerNavbar } from './LedgerNavbar';
import { motion } from 'framer-motion';
import { useLedgerAuthStore } from '../hooks/useLedgerAuth';
import { Loader2 } from 'lucide-react';

export default function LedgerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, ledgerUser } = useLedgerAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-muted-foreground font-medium">Loading Ledger...</p>
        </div>
      </div>
    );
  }

  if (!ledgerUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/ledger/login';
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-muted-foreground font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <LedgerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <LedgerNavbar />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-[1800px] px-4 md:px-6 lg:px-8 py-5 md:py-6">
            <div className="flex flex-col gap-5 md:gap-6">
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
