'use client';

// ============================================================================
// Revolt Ledger — Navbar
// ============================================================================

import React, { useState } from 'react';
import { BookOpen, LogOut, Loader2 } from 'lucide-react';
import { useLedgerAuthStore } from '../hooks/useLedgerAuth';

export function LedgerNavbar() {
  const { ledgerUser, signOut } = useLedgerAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-10 h-16 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto h-full w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex items-center justify-between">
        {/* Left: Module indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/50 rounded-xl px-3 py-1.5 border border-emerald-900/30">
            <BookOpen size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              Payment Ledger
            </span>
          </div>
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-1.5 border border-border">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Role:</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-950/50 px-2 py-0.5 rounded-md">
              {ledgerUser?.role || 'GUEST'}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-border"></div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold tracking-tight">{ledgerUser?.display_name}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {ledgerUser?.role}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black italic shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              {ledgerUser?.display_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')}
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign Out of Ledger"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-50 ml-2"
          >
            {isLoggingOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
