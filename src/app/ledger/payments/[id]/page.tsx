'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Receipt, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  FileText, 
  Loader2, 
  AlertCircle,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLedgerAuthStore } from '@/features/ledger/hooks/useLedgerAuth';
import { getPaymentByIdAction, markPaymentAsPaidAction } from '@/features/ledger/actions/payments';
import { formatLedgerCurrency } from '@/features/ledger/lib/calculations';

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;

  const { ledgerUser } = useLedgerAuthStore();
  const isAdmin = ledgerUser?.role === 'ADMIN';

  const [payment, setPayment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mark Paid Modal
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [wireDate, setWireDate] = useState(new Date().toISOString().split('T')[0]);
  const [wireRef, setWireRef] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadPayment = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentByIdAction(paymentId);
      if (res.success && res.data) {
        setPayment(res.data);
      } else {
        setError(res.error || 'Payment record not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading payment detail');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await markPaymentAsPaidAction({
        payment_id: paymentId,
        wire_date: wireDate,
        wire_reference: wireRef.trim() || undefined,
        notes: modalNotes.trim() || undefined,
      });

      if (res.success) {
        setIsPaidModalOpen(false);
        loadPayment();
      } else {
        setModalError(res.error || 'Failed to update payment');
      }
    } catch (err: any) {
      setModalError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-white">{error || 'Payment Not Found'}</h2>
        <Link href="/ledger/payments">
          <Button variant="outline" className="border-white/10 text-white font-bold">
            Back to Payments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href="/ledger/payments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white font-bold transition-colors">
        <ArrowLeft size={16} />
        Back to Payments
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Receipt size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-black text-white">{payment.invoice_number}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                payment.status === 'PAID' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {payment.status === 'PAID' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {payment.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Received on {payment.received_date} • Sender: <span className="text-white font-bold">{payment.sender_name}</span>
            </p>
          </div>
        </div>

        {payment.status === 'PENDING' && (
          <Button 
            onClick={() => setIsPaidModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2"
          >
            Mark as Paid
          </Button>
        )}
      </div>

      {/* Breakdown Card */}
      <Card className="p-8 bg-[#121212] border-white/5 space-y-6 shadow-2xl">
        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-3">
          Payment Details & Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Invoice Reference:</span>
              <span className="font-mono font-bold text-white">{payment.invoice_number}</span>
            </div>
            {isAdmin && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Client Name:</span>
                <span className="font-bold text-emerald-400">{payment.client_name || 'Client'}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Sender Name:</span>
              <span className="font-bold text-white">{payment.sender_name}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Received Date:</span>
              <span className="font-medium text-white">{payment.received_date}</span>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Wire Transfer Status:</span>
              <span className="font-bold text-white">{payment.status}</span>
            </div>
            {payment.status === 'PAID' && (
              <>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Wire Date:</span>
                  <span className="font-bold text-white">{payment.wire_date}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Wire Reference:</span>
                  <span className="font-mono font-bold text-white">{payment.wire_reference || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FINANCIAL BREAKDOWN BASED ON ROLE */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            {isAdmin ? 'Financial Breakdown & Commission Split' : 'Payment Amounts'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAdmin && (
              <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Gross Amount</span>
                <span className="text-xl font-black text-white">{formatLedgerCurrency(payment.gross_amount)}</span>
              </div>
            )}

            <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-900/30">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">
                Wasi Share {payment.wasi_rate_snapshot ? `(${payment.wasi_rate_snapshot}%)` : ''}
              </span>
              <span className="text-xl font-black text-blue-400">{formatLedgerCurrency(payment.wasi_amount)}</span>
            </div>

            {isAdmin && (
              <div className="p-4 bg-violet-950/40 rounded-xl border border-violet-900/30">
                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest block mb-1">Ali Share ({payment.ali_rate_snapshot}%)</span>
                <span className="text-xl font-black text-violet-400">{formatLedgerCurrency(payment.ali_amount)}</span>
              </div>
            )}

            <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Wire Amount to Client</span>
              <span className="text-xl font-black text-emerald-300">{formatLedgerCurrency(payment.wire_amount)}</span>
            </div>
          </div>
        </div>

        {payment.notes && (
          <div className="pt-4 border-t border-white/5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Notes</span>
            <p className="text-sm text-white font-medium bg-[#0A0A0A] p-4 rounded-xl border border-white/5">{payment.notes}</p>
          </div>
        )}
      </Card>

      {/* Mark Paid Modal */}
      {isPaidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsPaidModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-4">Confirm Wire Paid</h2>

            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Wire Transfer Date *
                </label>
                <input
                  type="date"
                  value={wireDate}
                  onChange={(e) => setWireDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Wire Reference # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-9948201"
                  value={wireRef}
                  onChange={(e) => setWireRef(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-medium text-xs resize-none"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaidModalOpen(false)}
                  className="flex-1 border-white/10 text-white font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save as Paid'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
