"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100] cursor-pointer"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "w-full bg-background border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col pointer-events-auto",
                maxWidth
              )}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">{title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg hover:bg-brand-orange hover:text-white transition-all h-8 w-8">
                  <X size={18} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
