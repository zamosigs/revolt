import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SalaryCardProps {
  label: string;
  amount: number;
  description: string;
  className?: string;
}

export function SalaryCard({ label, amount, description, className }: SalaryCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-bold mt-2 tracking-tight">{formatCurrency(amount)}</h3>
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
    </Card>
  );
}
