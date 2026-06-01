"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions, 
  children,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{title}</h1>
          {subtitle && (
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2 italic">
              {Icon && <Icon size={10} className="text-brand-orange" />}
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
