"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/enterprise/Modal';
import { Button } from '@/components/ui/button';
import { useCreateEmployee } from '@/hooks/useEmployees';
import { UserPlus, Mail, Briefcase, Percent, Key } from 'lucide-react';
import { Select } from '@/components/ui/enterprise/Select';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (password?: string) => void;
}

const roleOptions = [
  { value: 'DISPATCHER', label: 'Dispatcher' },
  { value: 'SALES_AGENT', label: 'Sales Agent' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'DISPATCH_MANAGER', label: 'Dispatch Manager' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
];

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      role: 'DISPATCHER',
      baseSalary: '',
      commissionPercentage: '',
      password: ''
    }
  });

  const createEmployee = useCreateEmployee();
  const selectedRole = watch('role');

  const onSubmit = (data: any) => {
    createEmployee.mutate(data, {
      onSuccess: (response: any) => {
        reset();
        onClose();
        if (onSuccess) {
          onSuccess(response?.temporaryPassword);
        }
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Fleet Personnel"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
        {createEmployee.isError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-[10px] font-black uppercase tracking-widest italic">
            {(createEmployee.error as any)?.message || "Failed to commit employee record."}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Full Name</label>
          <div className="relative">
            <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange/50" size={16} />
            <input 
              {...register('fullName', { required: true })}
              className="w-full h-11 pl-11 pr-4 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
              placeholder="Enter legal name..."
            />
          </div>
          {errors.fullName && <p className="text-[8px] text-brand-red font-bold uppercase ml-1">Name is required</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Verified Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange/50" size={16} />
            <input 
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              className="w-full h-11 pl-11 pr-4 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
              placeholder="Operational email..."
            />
          </div>
          {errors.email && <p className="text-[8px] text-brand-red font-bold uppercase ml-1">Valid email is required</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange/50 z-10" size={16} />
              <Select 
                options={roleOptions}
                value={selectedRole}
                onChange={(val) => setValue('role', val)}
                className="w-full pl-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temp Password <span className="opacity-50 lowercase">(Optional)</span></label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange/50" size={16} />
              <input 
                {...register('password')}
                type="text"
                className="w-full h-11 pl-11 pr-4 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all placeholder:italic"
                placeholder="Auto-generated if empty..."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Salary (PKR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black italic text-brand-orange/80">PKR</span>
              <input 
                {...register('baseSalary', { required: true })}
                type="number"
                className="w-full h-11 pl-12 pr-4 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Commission %</label>
            <div className="relative">
              <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange/50" size={16} />
              <input 
                {...register('commissionPercentage', { required: true })}
                type="number"
                step="0.1"
                className="w-full h-11 pl-11 pr-4 bg-secondary/20 border border-border/40 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-12 rounded-lg font-black uppercase italic text-[10px] tracking-widest"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createEmployee.isPending}
            className="flex-[2] h-12 rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic text-[10px] tracking-widest shadow-lg shadow-brand-orange/20"
          >
            {createEmployee.isPending ? 'COMMITTING...' : 'COMMIT PERSONNEL'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
