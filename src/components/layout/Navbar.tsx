"use client";

import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { profile } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 h-16 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto h-full w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex items-center justify-between">
        <div className="flex w-full max-w-md items-center">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="Search loads, clients, assets..."
              className="h-10 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-1.5 border border-border">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Access Level:</span>
            <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-2 py-0.5 rounded-md">
              {profile?.role?.replace('_', ' ') || 'GUEST'}
            </span>
          </div>

          <button className="relative rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all border border-transparent hover:border-border">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-red shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
          </button>

          <div className="h-6 w-[1px] bg-border"></div>

          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold tracking-tight group-hover:text-brand-orange transition-colors">{profile?.full_name}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{profile?.role?.replace('_', ' ')}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white font-black italic shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

