"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/components/ui/enterprise/Modal';
import { Button } from '@/components/ui/button';
import { PersonnelSelector } from '@/components/ui/enterprise/PersonnelSelector';
import { Select } from '@/components/ui/enterprise/Select';
import { useDataStore } from '@/store/useDataStore';
import { ClipboardCheck, FileText, Calendar, ShieldCheck, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask } = useDataStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      assignee: '',
      priority: 'Medium',
      deadline: ''
    }
  });

  const priorityOptions = [
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!data.title || !data.assignee || !data.deadline) {
        throw new Error("Please fill in all required operational task parameters.");
      }

      addTask({
        title: data.title,
        description: data.description,
        assignee: data.assignee,
        priority: data.priority,
        status: 'Pending',
        progress: 0,
        deadline: data.deadline
      });

      reset();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to commit task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Operations Task"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive animate-in fade-in slide-in-from-top-1">
            <ShieldCheck size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Task Title</label>
          <div className="relative group">
            <ClipboardCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
            <input
              type="text"
              {...register('title', { required: true })}
              className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40"
              placeholder="Enter task title (e.g. Northeast Carrier Onboarding)..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="assignee"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <PersonnelSelector
                role="all"
                label="Assignee"
                value={field.value}
                onChange={field.onChange}
                placeholder="CHOOSE ASSIGNEE..."
                includeAll={false}
                showWorkload={true}
              />
            )}
          />

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Deadline</label>
            <div className="relative group">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
              <input
                type="date"
                {...register('deadline', { required: true })}
                className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Priority Level</label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  options={priorityOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Description / Protocol</label>
          <div className="relative group">
            <FileText className="absolute left-3.5 top-3 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
            <textarea
              {...register('description')}
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-xl font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40 min-h-[100px]"
              placeholder="Describe the mission parameters and objectives..."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/30">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg h-10 px-6 font-black uppercase italic text-[9px]">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-lg h-10 px-8 bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic shadow-lg group">
            <Save size={16} className={cn("mr-2 group-hover:scale-110 transition-transform", isSubmitting && "animate-spin")} />
            {isSubmitting ? 'PROCESSING...' : 'Commit Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
