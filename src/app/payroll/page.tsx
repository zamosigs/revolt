"use client";

import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter,
  ArrowUpRight,
  ChevronRight,
  MoreHorizontal,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/store/useDataStore';
import { formatCurrency, formatPKR, cn } from '@/lib/utils';
import { SalaryCard } from '@/features/payroll/SalaryCard';
import { motion, AnimatePresence } from 'framer-motion';

import { usePayroll } from '@/hooks/usePayroll';
import { Skeleton } from '@/components/ui/skeleton';

import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { FilterToolbar } from '@/components/ui/enterprise/FilterToolbar';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { Select } from '@/components/ui/enterprise/Select';

export default function PayrollPage() {
  const { data: payrollData = [], isLoading } = usePayroll();
  const [selectedPay, setSelectedPay] = useState<any>(null);
  const [periodFilter, setPeriodFilter] = useState('current');

  const totalPayroll = payrollData.reduce((acc, curr) => acc + (curr.total_net || 0), 0);
  const totalCommission = payrollData.reduce((acc, curr) => acc + (curr.commission_amount || 0), 0);
  const totalBonuses = payrollData.reduce((acc, curr) => acc + (curr.bonus_amount || 0), 0);

  const periodOptions = [
    { value: 'current', label: 'Current Period (April)' },
    { value: 'previous', label: 'Previous Period (March)' },
    { value: 'q1', label: 'Q1 Analysis' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Payroll Control" 
        subtitle="Employee Compensation & Performance Payouts"
        icon={CreditCard}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/50 bg-background/50 px-3 text-[9px] font-black uppercase italic hover:bg-brand-orange hover:text-white transition-all group">
              <FileSpreadsheet size={14} className="mr-1.5 group-hover:scale-110" />
              Excel
            </Button>
            <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/50 bg-background/50 px-3 text-[9px] font-black uppercase italic hover:bg-brand-orange hover:text-white transition-all group">
              <FileText size={14} className="mr-1.5 group-hover:scale-110" />
              PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard className="bg-brand-orange text-white border-none shadow-[0_10px_30px_rgba(249,115,22,0.2)]" density="compact">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-0.5 italic">Total Net Payroll</p>
          <h3 className="text-2xl font-black italic tracking-tighter">{formatCurrency(totalPayroll)}</h3>
          <p className="text-[8px] font-bold mt-3 opacity-70 uppercase tracking-tight">Consolidated payout / current period</p>
        </GlassCard>
        <GlassCard density="compact">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5 italic">Dispatcher Commissions</p>
          <h3 className="text-2xl font-black italic text-brand-orange tracking-tighter">{formatCurrency(totalCommission)}</h3>
          <p className="text-[8px] font-bold mt-3 text-muted-foreground uppercase tracking-tight">Performance-based earnings</p>
        </GlassCard>
        <GlassCard density="compact">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5 italic">Operational Bonuses</p>
          <h3 className="text-2xl font-black italic text-emerald-500 tracking-tighter">{formatCurrency(totalBonuses)}</h3>
          <p className="text-[8px] font-bold mt-3 text-muted-foreground uppercase tracking-tight">Efficiency & Safety rewards</p>
        </GlassCard>
      </div>

      <FilterToolbar 
        searchPlaceholder="Search personnel or ID..."
        filters={
          <Select 
            options={periodOptions} 
            value={periodFilter} 
            onChange={setPeriodFilter} 
            className="w-56"
          />
        }
      />

      <GlassCard className="p-0 overflow-hidden" hoverGlow={false} density="compact">
        <div className="bg-secondary/30 px-5 py-3 border-b border-border/50">
          <h3 className="text-[11px] font-black uppercase tracking-widest italic opacity-80">Compensation Records - Fiscal Period 2024.04</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/10">
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Employee</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Base</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Comm</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Bonus</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right text-rose-500">Ded.</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Net Payout</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Status</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-3">
                      <Skeleton className="h-10 w-full bg-secondary/50" />
                    </td>
                  </tr>
                ))
              ) : (
                payrollData.map((pay) => (
                  <tr key={pay.id} className="group hover:bg-brand-orange/[0.03] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-orange text-white font-black italic shadow-md group-hover:scale-105 transition-transform text-[10px]">
                          {pay.employee?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black italic uppercase text-[11px] tracking-tight group-hover:text-brand-orange transition-colors truncate max-w-[120px]">{pay.employee?.full_name}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">{(pay.employee?.role || '').replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[11px] tracking-tighter opacity-80">{formatPKR(pay.base_salary_snapshot)}</td>
                    <td className="px-5 py-3 text-right font-black text-[11px] text-emerald-500 tracking-tighter">+{formatCurrency(pay.commission_amount)}</td>
                    <td className="px-5 py-3 text-right font-black text-[11px] text-emerald-500 tracking-tighter">+{formatCurrency(pay.bonus_amount)}</td>
                    <td className="px-5 py-3 text-right font-black text-[11px] text-rose-500 tracking-tighter">-{formatCurrency(pay.deductions_amount)}</td>
                    <td className="px-5 py-3 text-right font-black text-[11px] tracking-tighter border-l border-border/20 bg-secondary/10 group-hover:bg-brand-orange/5">{formatCurrency(pay.total_net)}</td>
                    <td className="px-5 py-3">
                      <Badge 
                        variant={pay.status === 'PAID' ? 'success' : pay.status === 'GENERATED' ? 'warning' : 'secondary'}
                        className="rounded-md font-black italic text-[8px] uppercase tracking-widest px-1.5 py-0.5"
                      >
                        {pay.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg h-7 px-2.5 font-black uppercase italic text-[9px] hover:bg-brand-orange hover:text-white transition-all group"
                        onClick={() => setSelectedPay(pay)}
                      >
                        Audit
                        <ChevronRight size={12} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedPay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPay(null)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 p-8 flex flex-col gap-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Payroll Audit</h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Record Verification ID: {selectedPay.id?.slice(0, 8)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPay(null)} className="rounded-xl hover:bg-brand-orange hover:text-white">
                  <ChevronRight size={24} />
                </Button>
              </div>

              <GlassCard className="p-6 border-brand-orange/30 bg-brand-orange/[0.03]" hoverGlow={false}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-brand-orange text-white flex items-center justify-center text-2xl font-black italic shadow-xl">
                    {selectedPay.employee?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight">{selectedPay.employee?.full_name}</h3>
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">{selectedPay.employee?.role?.replace('_', ' ')}</p>
                    <Badge variant="outline" className="mt-2 rounded-md border-border text-[9px] font-black uppercase">
                      Period: {selectedPay.period}
                    </Badge>
                  </div>
                </div>
              </GlassCard>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2">Earnings Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Contractual Base</span>
                      <span className="text-sm font-black tracking-tighter">{formatPKR(selectedPay.base_salary_snapshot)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Load Commissions</span>
                      <span className="text-sm font-black text-emerald-500 tracking-tighter">+{formatCurrency(selectedPay.commission_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Performance Bonus</span>
                      <span className="text-sm font-black text-emerald-500 tracking-tighter">+{formatCurrency(selectedPay.bonus_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2">Adjustments & Tax</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Standard Deductions</span>
                      <span className="text-sm font-black text-rose-500 tracking-tighter">-{formatCurrency(selectedPay.deductions_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-secondary/50 rounded-2xl border border-border border-l-4 border-l-brand-orange shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Final Net Payout</span>
                    <span className="text-3xl font-black italic text-brand-orange tracking-tighter">
                      {formatCurrency(selectedPay.total_net)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <Button className="h-12 rounded-xl bg-brand-orange text-white font-black uppercase italic shadow-xl hover:bg-brand-orange/90">
                  <Download size={18} className="mr-2" />
                  PDF Slip
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-border font-black uppercase italic hover:bg-secondary">
                  Close Audit
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
