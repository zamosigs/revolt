'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  X, 
  Loader2, 
  AlertCircle,
  FileCheck,
  Edit3,
  Trash2,
  Eye,
  DollarSign,
  Download
} from 'lucide-react';
import { exportPaymentsToCSV } from '@/features/ledger/lib/exportCsv';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLedgerAuthStore } from '@/features/ledger/hooks/useLedgerAuth';
import { 
  getPaymentsAction, 
  markPaymentAsPaidAction, 
  updatePaymentAction, 
  deletePaymentAction 
} from '@/features/ledger/actions/payments';
import { formatLedgerCurrency, calculatePayment } from '@/features/ledger/lib/calculations';
import type { LedgerPaymentWithClient, OperatorPayment } from '@/features/ledger/types';

export default function LedgerPaymentsPage() {
  const { ledgerUser } = useLedgerAuthStore();
  const isAdmin = ledgerUser?.role === 'ADMIN';

  const [payments, setPayments] = useState<(LedgerPaymentWithClient | OperatorPayment)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Mark Paid Modal State
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [wireDate, setWireDate] = useState(new Date().toISOString().split('T')[0]);
  const [wireRef, setWireRef] = useState('');
  const [modalNotes, setModalNotes] = useState('');

  // Edit Modal State (Admin Only)
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [editSender, setEditSender] = useState('');
  const [editGross, setEditGross] = useState('');
  const [editReceivedDate, setEditReceivedDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED'>('PENDING');
  const [editWireDate, setEditWireDate] = useState('');
  const [editWireRef, setEditWireRef] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State (Admin Only)
  const [deletingPayment, setDeletingPayment] = useState<any | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isSubmittingPaid, setIsSubmittingPaid] = useState(false);
  const [paidError, setPaidError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentsAction({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, search]);

  // Handle Mark Paid
  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setIsSubmittingPaid(true);
    setPaidError(null);

    if (!wireDate) {
      setPaidError('Wire date is required');
      setIsSubmittingPaid(false);
      return;
    }

    try {
      const res = await markPaymentAsPaidAction({
        payment_id: selectedPayment.id,
        wire_date: wireDate,
        wire_reference: wireRef.trim() || undefined,
        notes: modalNotes.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(`Payment ${selectedPayment.invoice_number} marked as PAID!`);
        setSelectedPayment(null);
        setWireRef('');
        setModalNotes('');
        fetchPayments();
      } else {
        setPaidError(res.error || 'Failed to mark payment as paid');
      }
    } catch (err: any) {
      setPaidError(err.message || 'An error occurred');
    } finally {
      setIsSubmittingPaid(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (payment: any) => {
    setEditingPayment(payment);
    setEditSender(payment.sender_name || '');
    setEditGross(String(payment.gross_amount || ''));
    setEditReceivedDate(payment.received_date || '');
    setEditNotes(payment.notes || '');
    setEditStatus(payment.status || 'PENDING');
    setEditWireDate(payment.wire_date || '');
    setEditWireRef(payment.wire_reference || '');
    setEditError(null);
  };

  // Handle Edit Payment Submit
  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    setIsSubmittingEdit(true);
    setEditError(null);

    const newGross = parseFloat(editGross);
    if (!editSender.trim()) {
      setEditError('Sender name is required');
      setIsSubmittingEdit(false);
      return;
    }
    if (isNaN(newGross) || newGross <= 0) {
      setEditError('Gross amount must be a number greater than 0');
      setIsSubmittingEdit(false);
      return;
    }

    try {
      const res = await updatePaymentAction(editingPayment.id, {
        sender_name: editSender.trim(),
        gross_amount: newGross,
        received_date: editReceivedDate,
        notes: editNotes.trim() || undefined,
        status: editStatus,
        wire_date: editWireDate || undefined,
        wire_reference: editWireRef.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(`Payment ${editingPayment.invoice_number} updated successfully!`);
        setEditingPayment(null);
        fetchPayments();
      } else {
        setEditError(res.error || 'Failed to update payment');
      }
    } catch (err: any) {
      setEditError(err.message || 'An error occurred during update');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Payment
  const handleDeletePayment = async () => {
    if (!deletingPayment) return;

    setIsSubmittingDelete(true);
    setDeleteError(null);

    try {
      const res = await deletePaymentAction(deletingPayment.id);
      if (res.success) {
        setSuccessMsg(`Payment ${deletingPayment.invoice_number} permanently deleted.`);
        setDeletingPayment(null);
        fetchPayments();
      } else {
        setDeleteError(res.error || 'Failed to delete payment');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred during deletion');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Payment Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin 
              ? 'Complete incoming payment records, edit/delete entries & wire status' 
              : 'Wire transfer reconciliation queue — mark payments as wired'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => exportPaymentsToCSV(payments)}
              className="border-white/10 text-white font-bold gap-2 hover:bg-white/5"
            >
              <Download size={16} />
              Export CSV
            </Button>
            <Link href="/ledger/payments/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.2)]">
                <Plus size={16} />
                New Payment
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-muted-foreground hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-3 rounded-2xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search invoice # or sender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl outline-none focus:border-emerald-500/50 text-sm text-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground ml-2" />
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'PENDING' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'PAID' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Wired / Paid
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center bg-[#121212] border-white/5">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No payment records found</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {isAdmin 
              ? 'Create your first payment record to start tracking financial splits.'
              : 'No pending wires match your filter criteria.'}
          </p>
          {isAdmin && (
            <Link href="/ledger/payments/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2">
                <Plus size={16} />
                Create Payment Record
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="bg-[#121212] border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] text-muted-foreground font-black uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Invoice #</th>
                  {isAdmin && <th className="p-4">Client</th>}
                  <th className="p-4">Sender</th>
                  <th className="p-4">Received Date</th>

                  {/* FINANCIAL COLUMNS BASED ON ROLE */}
                  {isAdmin ? (
                    <>
                      <th className="p-4 text-right">Gross ($)</th>
                      <th className="p-4 text-right">Wasi ($)</th>
                      <th className="p-4 text-right">Ali ($)</th>
                      <th className="p-4 text-right">Wire Amt ($)</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4 text-right">Wasi Share ($)</th>
                      <th className="p-4 text-right">Wire Amt ($)</th>
                    </>
                  )}

                  <th className="p-4">Status</th>
                  <th className="p-4">Wire Ref / Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      <Link href={`/ledger/payments/${p.id}`} className="hover:text-emerald-400 underline decoration-dotted">
                        {p.invoice_number}
                      </Link>
                    </td>

                    {isAdmin && (
                      <td className="p-4 font-bold text-emerald-400">
                        {p.client_name || 'Client'}
                      </td>
                    )}

                    <td className="p-4 font-medium text-white">
                      {p.sender_name}
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {p.received_date}
                    </td>

                    {/* FINANCIAL VALUES BASED ON ROLE */}
                    {isAdmin ? (
                      <>
                        <td className="p-4 text-right font-black text-white">
                          {formatLedgerCurrency(p.gross_amount)}
                        </td>
                        <td className="p-4 text-right font-bold text-blue-400">
                          {formatLedgerCurrency(p.wasi_amount)}
                        </td>
                        <td className="p-4 text-right font-bold text-violet-400">
                          {formatLedgerCurrency(p.ali_amount)}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-300">
                          {formatLedgerCurrency(p.wire_amount)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-right font-bold text-blue-400">
                          {formatLedgerCurrency(p.wasi_amount)}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-300">
                          {formatLedgerCurrency(p.wire_amount)}
                        </td>
                      </>
                    )}

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === 'PAID' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : p.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {p.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {p.status === 'PAID' ? (
                        <div>
                          <span className="text-white font-mono font-bold">{p.wire_reference || 'N/A'}</span>
                          <span className="block text-[10px] text-muted-foreground">{p.wire_date}</span>
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground/50">Pending Wire</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'PENDING' && (
                          <Button 
                            size="sm"
                            onClick={() => setSelectedPayment(p)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Mark Paid
                          </Button>
                        )}

                        {/* Admin Action Buttons */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit Payment"
                              className="p-1.5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-lg transition-colors"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() => setDeletingPayment(p)}
                              title="Delete Payment"
                              className="p-1.5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Mark Paid Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <FileCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Mark Payment as Paid</h2>
                <p className="text-xs text-muted-foreground font-mono">Invoice: {selectedPayment.invoice_number}</p>
              </div>
            </div>

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
                  Wire Reference # / Confirmation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-8849204"
                  value={wireRef}
                  onChange={(e) => setWireRef(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Notes / Memo (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Bank wire notes..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-medium text-xs resize-none"
                />
              </div>

              {paidError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>{paidError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 border-white/10 text-white font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingPaid}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isSubmittingPaid ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Wire Paid'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal (Admin Only) */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditingPayment(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Edit3 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Edit Payment Record</h2>
                <p className="text-xs text-muted-foreground font-mono">Invoice: {editingPayment.invoice_number}</p>
              </div>
            </div>

            <form onSubmit={handleEditPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Sender Name *
                </label>
                <input
                  type="text"
                  value={editSender}
                  onChange={(e) => setEditSender(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Gross Amount ($) *
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editGross}
                    onChange={(e) => setEditGross(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Changing gross amount automatically recalculates all Wasi, Ali, and Wire amounts.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Received Date *
                </label>
                <input
                  type="date"
                  value={editReceivedDate}
                  onChange={(e) => setEditReceivedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {editStatus === 'PAID' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                      Wire Transfer Date
                    </label>
                    <input
                      type="date"
                      value={editWireDate}
                      onChange={(e) => setEditWireDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                      Wire Reference #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WIRE-998822"
                      value={editWireRef}
                      onChange={(e) => setEditWireRef(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-medium text-xs resize-none"
                />
              </div>

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingPayment(null)}
                  className="flex-1 border-white/10 text-white font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {isSubmittingEdit ? <Loader2 className="animate-spin" size={18} /> : 'Save Payment Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin Only) */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-red-500/20 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setDeletingPayment(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Delete Payment Record</h2>
                <p className="text-xs text-muted-foreground font-mono">Invoice: {deletingPayment.invoice_number}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to permanently delete payment record <span className="font-mono font-bold text-white">{deletingPayment.invoice_number}</span> ({deletingPayment.sender_name})? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeletingPayment(null)}
                className="flex-1 border-white/10 text-white font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={isSubmittingDelete}
                onClick={handleDeletePayment}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                {isSubmittingDelete ? <Loader2 className="animate-spin" size={18} /> : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
