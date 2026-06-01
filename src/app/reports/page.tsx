"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ReportForm } from '@/features/reports/ReportForm';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { FilterToolbar } from '@/components/ui/enterprise/FilterToolbar';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { isAdmin } from '@/lib/auth/permissions';
import { Select } from '@/components/ui/enterprise/Select';
import { PersonnelSelector } from '@/components/ui/enterprise/PersonnelSelector';
import { useEmployees } from '@/hooks/useEmployees';

export default function ReportsPage() {
  const { reports } = useDataStore();
  const { data: employees = [] } = useEmployees();
  const { profile } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [personnelFilter, setPersonnelFilter] = useState('all');

  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const isUserAdmin = isAdmin(profile?.role);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Operation Reports" 
        subtitle="Daily Performance Metrics & Strategic Priorities"
        icon={FileText}
        actions={
          !isUserAdmin && !showForm ? (
            <Button onClick={() => setShowForm(true)} size="sm" className="rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic h-9 px-4 shadow-lg text-[10px]">
              <Plus size={16} className="mr-1.5" />
              New Report
            </Button>
          ) : showForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="rounded-lg border-border font-black uppercase italic h-9 px-3 text-[10px]">
              View All
            </Button>
          ) : null
        }
      />

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
          >
            <ReportForm onSuccess={() => setShowForm(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <FilterToolbar 
              searchPlaceholder="Search operational reports..."
              filters={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/50 bg-background/50 px-3 text-[9px] font-black uppercase italic hover:bg-secondary">
                    <Calendar size={12} className="mr-1.5" />
                    Period
                  </Button>
                  {isUserAdmin && (
                    <PersonnelSelector 
                      value={personnelFilter} 
                      onChange={setPersonnelFilter} 
                      label=""
                      placeholder="ALL PERSONNEL"
                      showWorkload={false}
                    />
                  )}
                </div>
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {reports.map((report) => {
                const emp = getEmployee(report.employeeId);
                return (
                  <GlassCard key={report.id} className="p-0 overflow-hidden flex flex-col group" density="compact">
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-brand-orange text-white flex items-center justify-center font-black italic text-sm shadow-md group-hover:scale-105 transition-transform">
                            {(emp?.full_name || emp?.name || '??').split(' ').map((n: any) => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-black italic uppercase text-[11px] tracking-tight group-hover:text-brand-orange transition-colors">{emp?.full_name || emp?.name}</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">{report.date}</p>
                          </div>
                        </div>
                        <Badge variant="success" className="rounded-md font-black italic text-[8px] uppercase tracking-widest px-1.5 py-0.5 leading-none">Verified</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-secondary/30 p-3 rounded-xl border border-border/30 shadow-inner">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 italic">Loads Logged</p>
                          <p className="text-xl font-black italic tracking-tighter leading-none">{report.loadsHandled}</p>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-xl border border-border/30 shadow-inner">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 italic">Yield Value</p>
                          <p className="text-xl font-black text-brand-orange italic tracking-tighter leading-none">{formatCurrency(report.revenueGenerated)}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[8px] font-black text-brand-red uppercase tracking-[0.2em] mb-1.5 border-b border-brand-red/10 pb-0.5 italic">Impediments</h4>
                          <p className="text-[10px] font-black italic text-muted-foreground uppercase tracking-tight leading-tight opacity-80">&quot;{report.problemsFaced || 'NONE DOCUMENTED.'}&quot;</p>
                        </div>
                        <div>
                          <h4 className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1.5 border-b border-emerald-500/10 pb-0.5 italic">Objectives</h4>
                          <p className="text-[10px] font-black italic text-muted-foreground uppercase tracking-tight leading-tight opacity-80">&quot;{report.tomorrowPriorities || 'NONE DOCUMENTED.'}&quot;</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-secondary/10 border-t border-border/20 flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="rounded-md h-7 px-2 font-black uppercase italic text-[9px] hover:bg-secondary">Details</Button>
                      {isUserAdmin && (
                        <Button variant="outline" size="sm" className="rounded-md h-7 px-3 font-black uppercase italic text-[9px] border-brand-orange/20 text-brand-orange hover:bg-brand-orange hover:text-white transition-all">
                          Archive
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
