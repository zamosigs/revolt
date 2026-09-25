'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  DollarSign, 
  Building2, 
  User, 
  Calendar, 
  FileText, 
  Percent, 
  Calculator, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLedgerClientsAction } from '@/features/ledger/actions/clients';
import { getWasiRateAction } from '@/features/ledger/actions/settings';
import { createPaymentAction } from '@/features/ledger/actions/payments';
import { calculatePayment, formatLedgerCurrency } from '@/features/ledger/lib/calculations';
import type { LedgerClient } from '@/features/ledger/types';

export default function NewPaymentPage() {
  const router = useRouter();

  const [clients, setClients] = useState<LedgerClient[]>([]);
  const [wasiRate, setWasiRate] = useState(4.0);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [grossAmountStr, setGrossAmountStr] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsRes, rateRes] = await Promise.all([
          getLedgerClientsAction(),
          getWasiRateAction(),
        ]);

        if (clientsRes.success && clientsRes.data) {
          setClients(clientsRes.data);
          if (clientsRes.data.length > 0) {
            setSelectedClientId(clientsRes.data[0].id);
          }
        }
        if (rateRes.success && rateRes.data) {
          setWasiRate(rateRes.data);
        }
      } catch (err) {
        console.error('Failed to load clients or settings:', err);
      } finally {
        setIsLoadingClients(false);
      }
    }
    loadData();
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const grossAmount = parseFloat(grossAmountStr) || 0;
  const clientRate = selectedClient?.commission_rate || 0;

  // Real-time calculation
  const calc = grossAmount > 0 && clientRate > 0
    ? calculatePayment(grossAmount, clientRate, wasiRate)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedClientId) {
      setError('Please select a client');
      setIsSubmitting(false);
      return;
    }
    if (!senderName.trim()) {
      setError('Sender name is required');
      setIsSubmitting(false);
      return;
    }
    if (grossAmount <= 0) {
      setError('Gross amount must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createPaymentAction({
        client_id: selectedClientId,
        sender_name: senderName.trim(),
        gross_amount: grossAmount,
        received_date: receivedDate,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        router.push('/ledger/payments');
      } else {
        setError(res.error || 'Failed to record payment');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href="/ledger/payments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white font-bold transition-colors">
        <ArrowLeft size={16} />
        Back to Payments
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">New Ledger Payment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record an incoming payment. Financial splits and wire amounts are computed automatically.
        </p>
      </div>

      {isLoadingClients ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : clients.length === 0 ? (
        <Card className="p-12 text-center bg-[#121212] border-white/5 space-y-4">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-white">No active clients found</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You must add at least one client (e.g. Anas, Usama) before creating payment records.
          </p>
          <Link href="/ledger/clients/new">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              Add Client Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <Card className="lg:col-span-7 p-6 bg-[#121212] border-white/5 shadow-2xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Client */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Select Client *
                </label>
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm appearance-none cursor-pointer"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.commission_rate}% Agreement)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sender Name */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Sender Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Acme Logistics / John Doe"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    required
                  />
                </div>
              </div>

              {/* Gross Amount */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Gross Amount ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={grossAmountStr}
                    onChange={(e) => setGrossAmountStr(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-base tracking-tight"
                    required
                  />
                </div>
              </div>

              {/* Received Date */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Received Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Notes / References (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional memo or transaction details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-medium text-sm resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6 text-base uppercase italic tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Save Payment Record'}
              </Button>
            </form>
          </Card>

          {/* Real-Time Calculation Preview Card Column */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 bg-[#121212] border-emerald-500/20 border shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Calculator size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Live Calculation Breakdown</h3>
              </div>

              {calc ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Gross Amount
                    </p>
                    <p className="text-2xl font-black text-white">{formatLedgerCurrency(grossAmount)}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Total Commission ({calc.client_rate}%):</span>
                      <span className="font-bold text-emerald-400">{formatLedgerCurrency(calc.total_commission)}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground pl-3 border-l-2 border-blue-500">
                      <span>Wasi Earnings ({calc.wasi_rate}%):</span>
                      <span className="font-bold text-blue-400">{formatLedgerCurrency(calc.wasi_amount)}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground pl-3 border-l-2 border-violet-500">
                      <span>Ali Earnings ({calc.ali_rate.toFixed(1)}%):</span>
                      <span className="font-bold text-violet-400">{formatLedgerCurrency(calc.ali_amount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                      Final Wire Amount to Client
                    </p>
                    <p className="text-2xl font-black text-emerald-300">{formatLedgerCurrency(calc.wire_amount)}</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                  <DollarSign size={32} className="mx-auto opacity-30" />
                  <p>Enter a Gross Amount to view real-time commission splits.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
