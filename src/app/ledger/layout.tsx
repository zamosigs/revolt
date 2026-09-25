import type { Metadata } from 'next';
import LedgerAuthProvider from '@/features/ledger/components/LedgerAuthProvider';
import QueryProvider from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'REVOLT LEDGER | Payment Reconciliation',
  description: 'Internal payment ledger and wire reconciliation system.',
};

export default function LedgerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <LedgerAuthProvider>
        {children}
      </LedgerAuthProvider>
    </QueryProvider>
  );
}
