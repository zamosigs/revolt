'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Mail, Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { createLedgerClient } from '@/features/ledger/lib/supabase/client';

export default function LedgerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <LedgerLoginContent />
    </Suspense>
  );
}

function LedgerLoginContent() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show error if redirected with no_access
  useEffect(() => {
    if (searchParams.get('error') === 'no_access') {
      setError('You do not have access to the Ledger system. Contact your administrator.');
    }
  }, [searchParams]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    const supabase = createLedgerClient();

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // Verify Ledger access
      const { data: ledgerUser, error: ledgerError } = await supabase
        .from('ledger_users')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (ledgerError || !ledgerUser) {
        // Sign out since they don't have Ledger access
        await supabase.auth.signOut();
        throw new Error('You do not have access to the Ledger system. Contact your administrator.');
      }

      // Redirect based on role
      if (ledgerUser.role === 'ADMIN') {
        router.push('/ledger/dashboard');
      } else {
        router.push('/ledger/payments');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[480px] relative z-10"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-12">
          <div className="h-20 w-20 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <BookOpen size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">
            REVOLT
          </h1>
          <p className="text-[10px] font-black text-emerald-500 mt-2 uppercase tracking-[0.4em]">
            Payment Ledger
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-10 bg-[#121212]/80 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="you@revolt.com"
                  className="w-full pl-12 pr-4 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-white font-bold"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register('password', { required: true })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-white font-bold"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2"
              >
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-bold text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-8 text-lg font-black rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)] uppercase italic group disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={24} />
              ) : (
                <>
                  Access Ledger
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Internal System
          </p>
          <div className="h-1 w-1 bg-white/10 rounded-full"></div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Authorized Access Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
