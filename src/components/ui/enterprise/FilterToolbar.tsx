"use client";

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterToolbarProps {
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function FilterToolbar({
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters,
  actions,
  className
}: FilterToolbarProps) {
  return (
    <div className={cn("flex items-center gap-3 bg-secondary/30 p-1.5 rounded-xl border border-border/50 backdrop-blur-md", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <input 
          type="text" 
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-3 h-9 bg-background/50 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all placeholder:text-muted-foreground/40"
        />
      </div>
      <div className="flex items-center gap-1.5">
        {filters}
        <Button variant="outline" className="h-9 rounded-lg border-border/30 bg-background/50 px-3 text-[9px] font-black uppercase italic hover:bg-brand-orange hover:text-white transition-all group">
          <Filter size={12} className="mr-1.5 group-hover:rotate-180 transition-transform" />
          Filters
        </Button>
        {actions}
      </div>
    </div>
  );
}
