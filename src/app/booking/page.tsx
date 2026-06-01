"use client";

import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Info,
  CheckCircle2,
  Clock,
  Truck,
  Loader2,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { Combobox } from '@/components/ui/enterprise/Combobox';

export default function LoadBookingPage() {
  const { profile } = useAuthStore();
  const { data: clients = [], isLoading: isClientsLoading } = useClients();
  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      clientId: '',
      pickupCity: '',
      pickupState: '',
      pickupAddress: '',
      pickupDate: '',
      dropoffCity: '',
      dropoffState: '',
      dropoffAddress: '',
      dropoffDate: '',
      grossAmount: 0,
      contractPercentage: 0,
      notes: ''
    }
  });

  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedClientId = watch('clientId');
  const grossAmount = watch('grossAmount') || 0;

  // Auto-fill contract percentage when client is selected
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setValue('contractPercentage', client.contract_percentage);
      }
    }
  }, [selectedClientId, clients, setValue]);

  const contractPercentage = watch('contractPercentage') || 0;
  const companyRevenue = (grossAmount * contractPercentage) / 100;

  const clientOptions = clients.map(c => ({
    value: c.id,
    label: c.company_name || 'Partner Entity',
    description: c.contact_person || 'Logistics Partner',
    status: 'active' as const
  }));

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    
    try {
      const { error: insertError } = await supabase
        .from('loads')
        .insert({
          client_id: data.clientId,
          dispatcher_id: profile?.id,
          pickup_city: data.pickupCity,
          pickup_state: data.pickupState,
          pickup_address: data.pickupAddress,
          pickup_date: data.pickupDate,
          dropoff_city: data.dropoffCity,
          dropoff_state: data.dropoffState,
          dropoff_address: data.dropoffAddress,
          dropoff_date: data.dropoffDate,
          gross_amount: data.grossAmount,
          contract_percentage_snapshot: contractPercentage,
          company_revenue: companyRevenue,
          dispatcher_notes: data.notes,
          status: 'BOOKED'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to book load. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-20">
      <PageHeader 
        title="Fast Booking" 
        subtitle="Industrial Grade Load Entry & Revenue Generation System"
        icon={ClipboardCheck}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-7 border-brand-orange/30 text-brand-orange px-2 font-black uppercase italic tracking-widest text-[9px]">
              <Clock size={10} className="mr-1.5" />
              Est. Entry: 20s
            </Badge>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="border-l-4 border-l-brand-orange p-6" density="compact">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <Truck size={18} />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter">Logistics Parameters</h3>
            </div>

            <div className="space-y-6">
              <Controller
                name="clientId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Combobox
                    label="Account Entity Selection"
                    options={clientOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={isClientsLoading ? "SYNCHRONIZING..." : "CHOOSE PARTNER..."}
                    searchPlaceholder="SEARCH BY COMPANY NAME..."
                    emptyText="No matching partners found"
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-orange border-b border-brand-orange/20 pb-1.5">
                    <MapPin size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Origin Logistics</span>
                  </div>
                  <div className="space-y-3">
                    <input 
                      {...register("pickupCity", { required: true })}
                      placeholder="City of origin" 
                      className="w-full h-10 px-3.5 bg-secondary/20 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <input 
                        {...register("pickupState", { required: true })}
                        placeholder="ST" 
                        className="col-span-1 h-10 px-2 bg-secondary/20 border border-border/30 rounded-lg text-xs outline-none text-center font-bold focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                      />
                      <input 
                        {...register("pickupAddress")}
                        placeholder="Street address" 
                        className="col-span-3 h-10 px-3.5 bg-secondary/20 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange" size={14} />
                      <input 
                        {...register("pickupDate", { required: true })}
                        type="date" 
                        className="w-full h-10 pl-10 pr-3.5 bg-secondary/20 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-red border-b border-brand-red/20 pb-1.5">
                    <MapPin size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Destination Hub</span>
                  </div>
                  <div className="space-y-3">
                    <input 
                      {...register("dropoffCity", { required: true })}
                      placeholder="City of delivery" 
                      className="w-full h-10 px-3.5 bg-secondary/20 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-red/30 focus:border-brand-red/50 transition-all"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <input 
                        {...register("dropoffState", { required: true })}
                        placeholder="ST" 
                        className="col-span-1 h-10 px-2 bg-secondary/20 border border-border/30 rounded-lg text-xs outline-none text-center font-bold focus:ring-1 focus:ring-brand-red/30 focus:border-brand-red/50 transition-all"
                      />
                      <input 
                        {...register("dropoffAddress")}
                        placeholder="Street address" 
                        className="col-span-3 h-10 px-3.5 bg-secondary/20 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-red/30 focus:border-brand-red/50 transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-red" size={14} />
                      <input 
                        {...register("dropoffDate", { required: true })}
                        type="date" 
                        className="w-full h-10 pl-10 pr-3.5 bg-secondary/20 border border-border/30 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-brand-red/30 focus:border-brand-red/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6" density="compact">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <Info size={18} />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter">Manifest Documentation</h3>
            </div>
            <textarea 
              {...register("notes")}
              placeholder="Specific logistics protocols, shipper requirements, or manifest notes..."
              className="w-full h-32 px-4 py-3 bg-secondary/20 border border-border/30 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:bg-secondary/30 min-h-[100px] tracking-tight placeholder:text-muted-foreground/30"
            />
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="bg-brand-orange/[0.03] border-brand-orange/30 sticky top-24 p-6 shadow-xl" density="compact">
            <div className="mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange mb-1 italic">Revenue Matrix</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Real-time contract valuation</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic opacity-80">Gross Load Payout ($)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange font-black italic text-xl group-focus-within:scale-110 transition-transform">$</div>
                  <input 
                    {...register("grossAmount", { required: true, valueAsNumber: true })}
                    type="number" 
                    placeholder="0.00" 
                    className="w-full h-16 pl-10 pr-4 bg-background border border-border/50 rounded-xl text-3xl font-black italic tracking-tighter outline-none focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange/50 transition-all placeholder:text-muted-foreground/20"
                  />
                </div>
              </div>

              <div className="p-5 bg-secondary/40 rounded-xl border border-border/50 space-y-5 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Service Fee</span>
                  <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/30 font-black italic px-2 py-0.5 text-[10px]">{contractPercentage}%</Badge>
                </div>
                <div className="h-[1px] bg-border/20"></div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 italic">Company Net</span>
                    <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-tighter italic opacity-60">Auto calculation</span>
                  </div>
                  <span className="text-3xl font-black text-brand-orange italic tracking-tighter">{formatCurrency(companyRevenue)}</span>
                </div>
              </div>

              <div className="pt-4">
                {error && (
                  <p className="text-[8px] font-black text-brand-red uppercase text-center mb-3 tracking-widest border border-brand-red/20 bg-brand-red/5 p-1.5 rounded-lg italic">{error}</p>
                )}
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full h-14 bg-emerald-500 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase italic shadow-lg"
                    >
                      <CheckCircle2 size={20} />
                      LOAD SECURED
                    </motion.div>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-16 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-lg uppercase italic shadow-[0_10px_30px_rgba(249,115,22,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 group"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <div className="flex items-center gap-2">
                          EXECUTE BOOKING
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                      )}
                    </Button>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-[8px] text-center text-muted-foreground font-black uppercase tracking-[0.1em] px-2 leading-relaxed italic opacity-50">
                Live manifest update. Commits revenue to fiscal period.
              </p>
            </div>
          </GlassCard>
        </div>
      </form>
    </div>
  );
}
