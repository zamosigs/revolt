import LedgerDashboardLayout from '@/features/ledger/components/LedgerDashboardLayout';

export default function LedgerClientsLayout({ children }: { children: React.ReactNode }) {
  return <LedgerDashboardLayout>{children}</LedgerDashboardLayout>;
}
