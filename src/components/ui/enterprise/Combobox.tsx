"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  status?: 'active' | 'inactive';
  avatar?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  label?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  label,
  className
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    (opt.label?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (opt.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setActiveIndex(-1);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        onChange(filteredOptions[activeIndex].value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative space-y-1", className)} ref={containerRef}>
      {label && (
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "relative flex items-center h-10 px-3 bg-secondary/30 border border-border/50 rounded-lg cursor-pointer transition-all hover:bg-secondary/50",
          isOpen && "ring-2 ring-brand-orange/20 border-brand-orange/50 bg-secondary/40"
        )}
        onClick={handleOpenToggle}
      >
        <div className="flex-1 flex items-center gap-2.5 overflow-hidden">
          {selectedOption ? (
            <>
              <div className="h-5 w-5 rounded-md bg-brand-orange text-white flex items-center justify-center text-[8px] font-black italic shadow-lg">
                {selectedOption.label.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-[11px] font-black uppercase tracking-tight truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-[11px] font-bold text-muted-foreground uppercase opacity-60">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={14} 
          className={cn("text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-brand-orange")} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 z-[110] bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="p-2 border-b border-border/50 bg-secondary/20">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-10 pl-9 pr-4 bg-background border border-border/50 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all placeholder:text-muted-foreground/60 placeholder:font-bold"
                />
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                    {emptyText}
                  </p>
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group",
                      value === option.value ? "bg-brand-orange/10" : "hover:bg-secondary/50",
                      activeIndex === index && "bg-secondary/80"
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black italic transition-all shadow-sm",
                      value === option.value ? "bg-brand-orange text-white" : "bg-secondary text-muted-foreground group-hover:bg-brand-orange group-hover:text-white"
                    )}>
                      {option.label.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs font-black uppercase tracking-tight transition-colors",
                          value === option.value ? "text-brand-orange" : "text-foreground"
                        )}>
                          {option.label}
                        </span>
                        {option.status === 'active' && (
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </div>
                      {option.description && (
                        <span className="text-[9px] font-bold text-muted-foreground uppercase truncate opacity-70">
                          {option.description}
                        </span>
                      )}
                    </div>

                    {value === option.value && (
                      <Check size={14} className="text-brand-orange animate-in zoom-in-50 duration-200" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
