import LedgerDashboardLayout from '@/features/ledger/components/LedgerDashboardLayout';

export default function LedgerAppLayout({ children }: { children: React.ReactNode }) {
  return <LedgerDashboardLayout>{children}</LedgerDashboardLayout>;
}
