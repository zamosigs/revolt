import LedgerDashboardLayout from '@/features/ledger/components/LedgerDashboardLayout';

export default function LedgerSettingsLayout({ children }: { children: React.ReactNode }) {
  return <LedgerDashboardLayout>{children}</LedgerDashboardLayout>;
}
