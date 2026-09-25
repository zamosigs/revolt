'use client';

// ============================================================================
// Revolt Ledger — Sidebar
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLedgerAuthStore } from '../hooks/useLedgerAuth';
import { hasLedgerPermission, type LedgerModule } from '../lib/permissions';

const menuItems: { icon: any; label: string; href: string; module: LedgerModule }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/ledger/dashboard', module: 'dashboard' },
  { icon: Receipt, label: 'Payments', href: '/ledger/payments', module: 'payments' },
  { icon: Users, label: 'Clients', href: '/ledger/clients', module: 'clients' },
  { icon: Settings, label: 'Settings', href: '/ledger/settings', module: 'settings' },
];

export function LedgerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { ledgerUser, signOut } = useLedgerAuthStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  const filteredItems = menuItems.filter(item =>
    ledgerUser && hasLedgerPermission(ledgerUser.role, item.module)
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        'relative flex flex-col border-r border-border bg-secondary h-screen transition-all duration-300 ease-in-out z-20',
        isCollapsed ? 'px-3' : 'px-4'
      )}
    >
      {/* Branding */}
      <div className="flex items-center justify-between py-8">
        <Link href={ledgerUser?.role === 'ADMIN' ? '/ledger/dashboard' : '/ledger/payments'} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <BookOpen size={22} />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-lg font-black tracking-tighter text-foreground italic">
                REVOLT
              </span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] -mt-1">
                Ledger
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/ledger/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href}>
              <div
                className={cn(
                  'group flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="py-6 border-t border-border mt-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-xl border border-border py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mb-4 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className={cn('h-5 w-5 animate-spin', isCollapsed ? 'mx-auto' : 'mr-3')} />
          ) : (
            <LogOut className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
          )}
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
