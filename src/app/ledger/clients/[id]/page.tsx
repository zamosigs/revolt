'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Percent, 
  History, 
  Receipt, 
  DollarSign, 
  Edit3, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getLedgerClientByIdAction, 
  updateLedgerClientAction,
  getClientPaymentsAction 
} from '@/features/ledger/actions/clients';
import { formatLedgerCurrency } from '@/features/ledger/lib/calculations';
import type { LedgerClient, LedgerClientRateHistory, LedgerPayment } from '@/features/ledger/types';

export default function LedgerClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const [client, setClient] = useState<LedgerClient | null>(null);
  const [rateHistory, setRateHistory] = useState<LedgerClientRateHistory[]>([]);
  const [stats, setStats] = useState<{
    total_payments: number;
    total_gross: number;
    total_wasi: number;
    total_ali: number;
  } | null>(null);
  const [payments, setPayments] = useState<LedgerPayment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getLedgerClientByIdAction(clientId);
      if (res.success && res.data) {
        setClient(res.data.client);
        setRateHistory(res.data.rateHistory);
        setStats(res.data.stats);
        setEditName(res.data.client.name);
        setEditRate(String(res.data.client.commission_rate));
      } else {
        setError(res.error || 'Client not found');
      }

      const paymentsRes = await getClientPaymentsAction(clientId);
      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data as LedgerPayment[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);

    const rateNum = parseFloat(editRate);
    if (!editName.trim()) {
      setUpdateError('Client name is required');
      setIsUpdating(false);
      return;
    }
    if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
      setUpdateError('Commission rate must be between 0.1% and 100%');
      setIsUpdating(false);
      return;
    }

    try {
      const res = await updateLedgerClientAction(clientId, {
        name: editName.trim(),
        commission_rate: rateNum,
      });

      if (res.success) {
        setIsEditOpen(false);
        loadData();
      } else {
        setUpdateError(res.error || 'Failed to update client');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'Error updating client');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-white">{error || 'Client Not Found'}</h2>
        <Link href="/ledger/clients">
          <Button variant="outline" className="border-white/10 text-white font-bold">
            Back to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/ledger/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white font-bold transition-colors">
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center font-black text-2xl border border-emerald-500/20">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{client.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {client.commission_rate}% Agreement Rate
              </span>
              <span className="text-muted-foreground">
                Created {new Date(client.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setIsEditOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 self-start sm:self-auto"
        >
          <Edit3 size={16} />
          Edit Rate & Name
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-[#121212] border-white/5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Gross Processed</p>
          <p className="text-2xl font-black text-white">{formatLedgerCurrency(stats?.total_gross || 0)}</p>
        </Card>
        <Card className="p-5 bg-[#121212] border-white/5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Payments</p>
          <p className="text-2xl font-black text-white">{stats?.total_payments || 0}</p>
        </Card>
        <Card className="p-5 bg-blue-950/30 border-blue-900/30">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Wasi Total Earnings</p>
          <p className="text-2xl font-black text-blue-400">{formatLedgerCurrency(stats?.total_wasi || 0)}</p>
        </Card>
        <Card className="p-5 bg-violet-950/30 border-violet-900/30">
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Ali Total Earnings</p>
          <p className="text-2xl font-black text-violet-400">{formatLedgerCurrency(stats?.total_ali || 0)}</p>
        </Card>
      </div>

      {/* Tabs / Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Audit Log */}
        <Card className="p-6 bg-[#121212] border-white/5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <History size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Rate Change Audit Log</h2>
          </div>

          {rateHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No rate changes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {rateHistory.map((item) => (
                <div key={item.id} className="p-3 bg-[#0A0A0A] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">
                      {item.old_rate === null ? 'Initial Rate' : `${item.old_rate}% → ${item.new_rate}%`}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(item.effective_from || item.changed_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                    {item.new_rate}% Rate
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payments List */}
        <Card className="p-6 bg-[#121212] border-white/5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <Receipt size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Associated Payments</h2>
          </div>

          {payments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No payments recorded for this client yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">{p.invoice_number}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.sender_name} • {p.received_date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">{formatLedgerCurrency(p.gross_amount)}</span>
                    <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                      p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Edit Client Details</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Rate changes will automatically record an entry in the audit history.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Commission Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    required
                  />
                  <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {updateError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>{updateError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 border-white/10 text-white font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
