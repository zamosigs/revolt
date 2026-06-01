import React from 'react';
import { Card } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  isCurrency?: boolean;
  icon: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, trend, isCurrency, icon, className }: KPICardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <Card className={cn("premium-card p-6 flex flex-col gap-4 bg-secondary/20", className)}>
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter italic",
            isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-brand-red bg-brand-red/10"
          )}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-2xl font-black tracking-tight mt-1 italic uppercase">
          {isCurrency && typeof value === 'number' ? formatCurrency(value) : value}
        </h3>
      </div>
    </Card>
  );
}

