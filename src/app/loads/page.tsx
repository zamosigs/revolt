"use client";

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Truck,
  MapPin,
  Clock,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, cn } from '@/lib/utils';
import { isAdmin } from '@/lib/auth/permissions';
import { useLoads } from '@/hooks/useLoads';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { FilterToolbar } from '@/components/ui/enterprise/FilterToolbar';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { Select } from '@/components/ui/enterprise/Select';

export default function LoadManagementPage() {
  const [view, setView] = useState<'table' | 'card'>('table');
  const { data: loadsData, isLoading } = useLoads();
  const { profile } = useAuthStore();
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  const [opFilter, setOpFilter] = useState('all');

  const isUserAdmin = isAdmin(profile?.role);
  
  const opOptions = [
    { value: 'all', label: 'All Operations' },
    { value: 'active', label: 'Active Loads' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED': return 'secondary';
      case 'IN_TRANSIT': return 'warning';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <PageHeader 
        title="Load Management" 
        subtitle="Enterprise Freight Operations & Logistics Monitoring"
        icon={Truck}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border/50 rounded-lg p-0.5 bg-secondary/50 backdrop-blur-md">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('table')}
                className={cn(
                  "rounded-md h-7 px-3 text-[9px] font-black uppercase italic transition-all",
                  view === 'table' ? "bg-brand-orange text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={12} className="mr-1.5" />
                Table
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('card')}
                className={cn(
                  "rounded-md h-7 px-3 text-[9px] font-black uppercase italic transition-all",
                  view === 'card' ? "bg-brand-orange text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={12} className="mr-1.5" />
                Cards
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/50 bg-background/50 px-3 text-[9px] font-black uppercase italic hover:bg-brand-orange hover:text-white transition-all group">
              <Download size={14} className="mr-1.5 group-hover:scale-110" />
              Export
            </Button>
          </div>
        }
      />

      <FilterToolbar 
        searchPlaceholder="Search by Load ID, Client, or Location..."
        filters={
          <Select 
            options={opOptions} 
            value={opFilter} 
            onChange={setOpFilter} 
            className="w-48"
          />
        }
      />

      <AnimatePresence mode="wait">
        {view === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <GlassCard className="p-0 overflow-hidden" hoverGlow={false} density="compact">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">
                      <th className="px-5 py-3">Load ID</th>
                      <th className="px-5 py-3">Client</th>
                      <th className="px-5 py-3">Route Info</th>
                      <th className="px-5 py-3 text-right">Gross</th>
                      <th className="px-5 py-3 text-right">Company Net</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {isLoading ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={7} className="px-5 py-3">
                            <Skeleton className="h-9 w-full bg-secondary/50" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      (loadsData || []).map((load) => (
                        <tr key={load.id} className="group hover:bg-brand-orange/[0.03] transition-colors">
                          <td className="px-5 py-3 font-black italic text-brand-orange tracking-widest text-[13px]">{load.load_number}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="font-black italic uppercase text-[11px] tracking-tight group-hover:text-brand-orange transition-colors truncate max-w-[140px]">{load.client?.company_name}</span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70 italic">Verified Account</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase italic tracking-tighter">{load.pickup_city}, {load.pickup_state}</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Origin</span>
                              </div>
                              <ArrowRight size={10} className="text-brand-orange opacity-50" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase italic tracking-tighter">{load.dropoff_city}, {load.dropoff_state}</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Dest</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-black text-[11px] tracking-tighter opacity-80">{formatCurrency(load.gross_amount)}</td>
                          <td className="px-5 py-3 text-right font-black text-[11px] text-brand-orange tracking-tighter">{formatCurrency(load.company_revenue)}</td>
                          <td className="px-5 py-3">
                            <Badge variant={getStatusColor(load.status)} className="rounded-md uppercase text-[8px] tracking-widest font-black italic px-1.5 py-0.5 leading-none">
                              {load.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-lg h-7 px-2 font-black uppercase italic text-[9px] hover:bg-brand-orange hover:text-white transition-all group"
                              onClick={() => setSelectedLoad(load)}
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
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {(loadsData || []).map((load) => (
              <GlassCard key={load.id} className="flex flex-col justify-between h-[210px]" density="compact">
                <div className="flex items-center justify-between">
                  <span className="font-black italic text-brand-orange text-sm tracking-widest">{load.load_number}</span>
                  <Badge variant={getStatusColor(load.status)} className="rounded-md uppercase text-[8px] tracking-widest font-black italic px-1.5 py-0.5 leading-none">
                    {load.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-3 my-2">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-brand-orange shadow-inner">
                      <Truck size={14} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 opacity-70 italic">Client Account</span>
                      <span className="font-black italic uppercase text-[11px] tracking-tight truncate">{load.client?.company_name}</span>
                    </div>
                  </div>
                  
                  <div className="relative pl-3.5 space-y-2 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[1.5px] before:bg-brand-orange/30">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase italic tracking-tighter leading-none">{load.pickup_city}, {load.pickup_state}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Pickup</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase italic tracking-tighter leading-none text-brand-red">{load.dropoff_city}, {load.dropoff_state}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Delivery</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-secondary/30 rounded-xl border border-border/30 flex justify-between items-center shadow-inner">
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60 italic">Gross</p>
                    <p className="text-[12px] font-black tracking-tighter leading-none opacity-80">{formatCurrency(load.gross_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60 italic">Revenue</p>
                    <p className="text-[14px] font-black text-brand-orange tracking-tighter italic leading-none">{formatCurrency(load.company_revenue)}</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full rounded-lg h-8 font-black uppercase italic text-[9px] hover:bg-brand-orange hover:text-white border-border/30 transition-all group mt-2"
                  onClick={() => setSelectedLoad(load)}
                >
                  Audit Record
                  <ChevronRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load Audit Drawer */}
      <AnimatePresence>
        {selectedLoad && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLoad(null)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-background border-l border-border shadow-2xl z-50 p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black italic text-brand-orange tracking-tighter">{selectedLoad.load_number}</span>
                  <Badge variant={getStatusColor(selectedLoad.status)} className="rounded-md uppercase text-[10px] tracking-widest font-black italic h-7 px-4">
                    {selectedLoad.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLoad(null)} className="rounded-xl h-12 w-12 hover:bg-brand-orange hover:text-white transition-all">
                  <ChevronRight size={28} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 bg-brand-orange/[0.03] border-brand-orange/30" hoverGlow={false}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 border-b border-border pb-2">Financial Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Gross</span>
                      <span className="text-xl font-black tracking-tighter">{formatCurrency(selectedLoad.gross_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Contract Rate</span>
                      <span className="text-sm font-black text-brand-orange italic">{selectedLoad.contract_percentage_snapshot}%</span>
                    </div>
                    <div className="pt-2 flex justify-between items-center border-t border-border/50">
                      <span className="text-[10px] font-black uppercase italic">Company Net</span>
                      <span className="text-2xl font-black text-brand-orange tracking-tighter italic">{formatCurrency(selectedLoad.company_revenue)}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6" hoverGlow={false}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 border-b border-border pb-2">Operational Agent</h4>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black italic text-xl shadow-lg">
                      {selectedLoad.dispatcher?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-black italic uppercase text-sm tracking-tight">{selectedLoad.dispatcher?.full_name}</p>
                      <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">Freight Solutions Agent</p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="space-y-10">
                <div className="relative pl-10 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-brand-orange before:to-brand-red">
                  <div className="space-y-14">
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-xl bg-brand-orange shadow-[0_0_20px_rgba(249,115,22,0.4)] border-4 border-background flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange mb-3">Origin Logistics Point</h4>
                      <p className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{selectedLoad.pickup_city}, {selectedLoad.pickup_state}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase italic tracking-tight mb-4">{selectedLoad.pickup_address}</p>
                      <Badge variant="outline" className="rounded-md border-brand-orange/30 bg-brand-orange/5 text-[10px] font-black uppercase px-3 py-1 italic">
                        <Calendar size={12} className="mr-2 text-brand-orange" />
                        ETD: {selectedLoad.pickup_date}
                      </Badge>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-xl bg-brand-red shadow-[0_0_20px_rgba(220,38,38,0.4)] border-4 border-background flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red mb-3">Final Delivery Hub</h4>
                      <p className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{selectedLoad.dropoff_city}, {selectedLoad.dropoff_state}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase italic tracking-tight mb-4">{selectedLoad.dropoff_address}</p>
                      <Badge variant="outline" className="rounded-md border-brand-red/30 bg-brand-red/5 text-[10px] font-black uppercase px-3 py-1 italic">
                        <Calendar size={12} className="mr-2 text-brand-red" />
                        ETA: {selectedLoad.dropoff_date}
                      </Badge>
                    </div>
                  </div>
                </div>

                <GlassCard className="p-6 bg-secondary/20 shadow-inner" hoverGlow={false}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 border-b border-border pb-2 italic">Operation Dispatch Notes</h4>
                  <p className="text-xs font-black italic leading-relaxed text-muted-foreground uppercase tracking-tight">
                    "{selectedLoad.dispatcher_notes || 'LOGISTICS PROTOCOL: No additional dispatcher notes documented for this load.'}"
                  </p>
                </GlassCard>
              </div>

              <div className="mt-auto pt-8 grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 rounded-2xl font-black uppercase italic tracking-widest border-border/50 hover:bg-secondary transition-all">
                  Operational Status
                </Button>
                <Button className="h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic tracking-widest shadow-xl transition-all">
                  <Download size={18} className="mr-2" />
                  Load Rate Con
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
