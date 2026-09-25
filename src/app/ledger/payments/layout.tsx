import LedgerDashboardLayout from '@/features/ledger/components/LedgerDashboardLayout';

export default function LedgerPaymentsLayout({ children }: { children: React.ReactNode }) {
  return <LedgerDashboardLayout>{children}</LedgerDashboardLayout>;
}
