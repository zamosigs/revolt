"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  density?: 'compact' | 'standard' | 'detailed';
}

export function GlassCard({ children, className, hoverGlow = true, density = 'standard', ...props }: GlassCardProps) {
  const padding = {
    compact: 'p-3',
    standard: 'p-5',
    detailed: 'p-8'
  };

  return (
    <motion.div
      whileHover={hoverGlow ? { 
        y: -2, 
        boxShadow: "0 15px 30px -12px rgba(0,0,0,0.3), 0 0 15px rgba(249,115,22,0.1)",
      } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <Card className={cn(
        "relative overflow-hidden bg-secondary/40 backdrop-blur-md border-border/50 transition-colors group",
        padding[density],
        hoverGlow && "hover:border-brand-orange/50",
        className
      )}>
        {/* Subtle Gradient Glow */}
        {hoverGlow && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
        {children}
      </Card>
    </motion.div>
  );
}
