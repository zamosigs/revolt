'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Percent, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createLedgerClientAction } from '@/features/ledger/actions/clients';

export default function NewLedgerClientPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rateNum = parseFloat(commissionRate) || 0;
  const wasiRate = 4.0;
  const aliRate = Math.max(0, rateNum - wasiRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!name.trim()) {
      setError('Client name is required');
      setIsSubmitting(false);
      return;
    }

    if (rateNum <= 0 || rateNum > 100) {
      setError('Commission rate must be between 0.1% and 100%');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createLedgerClientAction({
        name: name.trim(),
        commission_rate: rateNum,
      });

      if (res.success) {
        router.push('/ledger/clients');
      } else {
        setError(res.error || 'Failed to create client');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/ledger/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white font-bold transition-colors">
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Add New Client</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register an internal client and assign their commission rate agreement
        </p>
      </div>

      <Card className="p-8 bg-[#121212] border-white/5 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Client Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="e.g. Anas, Usama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Commission Rate (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                placeholder="e.g. 7, 10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                required
              />
              <Percent size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Live Preview Card */}
          {rateNum > 0 && (
            <div className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Live Commission Breakdown Preview
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Client Agreement Rate:</span>
                  <span className="font-bold text-white text-base">{rateNum.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground pt-2 border-t border-white/5">
                  <span>Wasi Fixed Share:</span>
                  <span className="font-bold text-blue-400">{wasiRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Ali Share (Remaining):</span>
                  <span className="font-bold text-violet-400">{aliRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <Link href="/ledger/clients" className="flex-1">
              <Button type="button" variant="outline" className="w-full border-white/10 text-white font-bold py-6">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Client'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
