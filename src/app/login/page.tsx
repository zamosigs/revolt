"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (authError) throw authError;
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to initialize system. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6 relative overflow-hidden">
      {/* Industrial Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-orange/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-orange/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="h-20 w-20 bg-brand-orange text-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(249,115,22,0.3)]">
            <Building2 size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">REVOLT</h1>
          <p className="text-[10px] font-black text-brand-orange mt-2 uppercase tracking-[0.4em]">Fleet Management System</p>
        </div>

        <Card className="p-10 bg-[#121212]/80 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Access Credentials</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={18} />
                <input 
                  {...register("email")}
                  type="email" 
                  placeholder="name@revolt.com" 
                  className="w-full pl-12 pr-4 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Security Token</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={18} />
                <input 
                  {...register("password")}
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all text-white font-bold"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-3"
              >
                <p className="text-[10px] font-bold text-brand-red uppercase text-center">{error}</p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-8 text-lg font-black rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white shadow-[0_10px_30px_rgba(249,115,22,0.2)] uppercase italic group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={24} />
              ) : (
                <>
                  Initialize System
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-12 flex items-center justify-center gap-6">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Enterprise Encrypted</p>
          <div className="h-1 w-1 bg-white/10 rounded-full"></div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Logistics Secured</p>
        </div>
      </motion.div>
    </div>
  );
}

