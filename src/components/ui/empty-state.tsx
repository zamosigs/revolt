import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center bg-white/50 border-dashed">
      <div className="h-16 w-16 bg-secondary flex items-center justify-center rounded-2xl mb-6 text-muted-foreground">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs mb-8">{description}</p>
      {action}
    </Card>
  );
}
