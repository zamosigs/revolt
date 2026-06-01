"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  triggerClassName?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className,
  triggerClassName
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative space-y-1", className)} ref={containerRef}>
      {label && (
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "relative flex items-center h-9 px-3 bg-background/50 border border-border/50 rounded-lg cursor-pointer transition-all hover:bg-secondary/50",
          isOpen && "ring-2 ring-brand-orange/20 border-brand-orange/50 bg-secondary/40",
          triggerClassName
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 overflow-hidden">
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest truncate",
            !selectedOption && "text-muted-foreground/60"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={12} 
          className={cn("ml-2 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-brand-orange")} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 z-[110] bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl p-1"
          >
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                    value === option.value ? "bg-brand-orange/10 text-brand-orange" : "hover:bg-secondary/50 text-foreground"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {option.label || 'Selectable Option'}
                  </span>
                  {value === option.value && (
                    <Check size={12} className="text-brand-orange" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
