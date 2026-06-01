import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string;
    progress: number;
    description: string;
    assigneeName?: string;
  };
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'Overdue': return <AlertCircle className="text-rose-500" size={16} />;
      default: return <Clock className="text-amber-500" size={16} />;
    }
  };

  return (
    <motion.div
      whileHover={{ 
        y: -2, 
        boxShadow: "0 10px 20px -12px rgba(0,0,0,0.3), 0 0 10px rgba(249,115,22,0.1)",
        borderColor: "rgba(249,115,22,0.3)"
      }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="p-2.5 flex flex-col gap-2 bg-secondary/40 backdrop-blur-md border-border/50 hover:border-brand-orange/50 transition-colors group relative overflow-hidden rounded-lg">
        {/* Border Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-start justify-between gap-2 relative">
          <h4 className="font-black italic uppercase text-[10px] tracking-tight leading-tight line-clamp-2 text-foreground group-hover:text-brand-orange transition-colors">
            {task.title}
          </h4>
          <Badge 
            variant={getPriorityColor(task.priority)} 
            className="text-[7px] font-black uppercase tracking-widest px-1 py-0 h-3.5 flex items-center"
          >
            {task.priority}
          </Badge>
        </div>
        
        <p className="text-[9px] font-medium text-muted-foreground leading-tight line-clamp-2 relative opacity-70 italic">
          {task.description}
        </p>

        <div className="space-y-1 relative">
          <div className="flex justify-between text-[7px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
            <span>Progress</span>
            <span className="text-brand-orange">{task.progress}%</span>
          </div>
          <div className="h-1 w-full bg-background/50 rounded-full overflow-hidden border border-border/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              className="h-full bg-gradient-to-r from-brand-orange to-orange-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5 pt-2 border-t border-border/20 relative">
          <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">
            {getStatusIcon(task.status)}
            <span>{task.deadline}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-brand-orange text-white flex items-center justify-center shadow-sm">
              <User size={8} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter text-foreground/70">
              {task.assigneeName?.split(' ')[0]}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
