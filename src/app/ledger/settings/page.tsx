'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Percent, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLedgerAuthStore } from '@/features/ledger/hooks/useLedgerAuth';
import { getWasiRateAction, updateWasiRateAction } from '@/features/ledger/actions/settings';

export default function LedgerSettingsPage() {
  const { ledgerUser } = useLedgerAuthStore();
  const isAdmin = ledgerUser?.role === 'ADMIN';

  const [wasiRate, setWasiRate] = useState<string>('4.0');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getWasiRateAction();
        if (res.success && res.data !== undefined) {
          setWasiRate(String(res.data));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const rateNum = parseFloat(wasiRate);
    if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
      setErrorMsg('Wasi commission rate must be between 0.1% and 100%');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await updateWasiRateAction(rateNum);
      if (res.success) {
        setSuccessMsg('Wasi commission rate updated successfully! Future payments will use this rate.');
      } else {
        setErrorMsg(res.error || 'Failed to update rate');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldCheck size={48} className="mx-auto text-amber-500 opacity-50" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">Only Ledger Admins can access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Ledger Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure global commission parameters and Ledger settings
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Settings Card */}
      <Card className="p-8 bg-[#121212] border-white/5 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Percent size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Wasi Default Commission Rate</h2>
            <p className="text-xs text-muted-foreground">
              Global rate split assigned to Wasi for all newly created payments
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Wasi Rate (%)
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={wasiRate}
                  onChange={(e) => setWasiRate(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-lg"
                  required
                />
                <Percent size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Updating this rate will apply to all <strong>new</strong> payments. Existing historical payments retain their original rate snapshot.
              </p>
            </div>

            <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">Example Calculation</span>
              <p className="text-muted-foreground">
                If Client commission is set to <strong>10%</strong> and Wasi rate is set to <strong>{wasiRate || 4}%</strong>, then Ali's share is automatically calculated as <strong>{Math.max(0, 10 - parseFloat(wasiRate || '0')).toFixed(1)}%</strong>.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 px-6 py-6 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Save size={18} />
                  Save Commission Rate
                </>
              )}
            </Button>
          </form>
        )}
      </Card>

      {/* System Status Card */}
      <Card className="p-6 bg-[#121212] border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Database size={16} className="text-emerald-400" />
          System Information & Security
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
            <span className="text-muted-foreground block">Ledger Supabase Host</span>
            <span className="font-mono font-bold text-white">fulhegisexopfuqbxrmb.supabase.co</span>
          </div>
          <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/5">
            <span className="text-muted-foreground block">Database Isolation Status</span>
            <span className="font-bold text-emerald-400">Independent Separate Project</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
