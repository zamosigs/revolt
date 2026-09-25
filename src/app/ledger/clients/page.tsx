'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Percent, 
  Building2, 
  TrendingUp, 
  Edit3, 
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLedgerClientsAction, createLedgerClientAction } from '@/features/ledger/actions/clients';
import type { LedgerClient } from '@/features/ledger/types';

export default function LedgerClientsPage() {
  const [clients, setClients] = useState<LedgerClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await getLedgerClientsAction();
      if (res.success && res.data) {
        setClients(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const rateNum = parseFloat(commissionRate);
    if (!name.trim()) {
      setFormError('Client name is required');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
      setFormError('Commission rate must be a valid number between 0.1 and 100');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await createLedgerClientAction({
        name: name.trim(),
        commission_rate: rateNum,
      });

      if (res.success) {
        setSuccessMessage(`Client "${name.trim()}" created successfully!`);
        setName('');
        setCommissionRate('');
        setIsModalOpen(false);
        fetchClients();
      } else {
        setFormError(res.error || 'Failed to create client');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Ledger Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage internal clients and their commission rate agreements
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 self-start sm:self-auto shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
        >
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-muted-foreground hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-[#121212] p-3 rounded-2xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search clients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl outline-none focus:border-emerald-500/50 text-sm text-white font-medium"
          />
        </div>
        <div className="text-xs text-muted-foreground font-bold px-3">
          Showing {filteredClients.length} of {clients.length} Clients
        </div>
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center bg-[#121212] border-white/5">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 text-emerald-500">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">No clients found</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {search ? 'No client matches your search query.' : 'Add your first client (e.g. Anas, Usama) to start assigning payments.'}
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2"
          >
            <Plus size={16} />
            Add First Client
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="p-6 bg-[#121212] border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-black text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {client.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                        Active Client
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Percent size={14} className="text-emerald-500" />
                      Commission Rate
                    </span>
                    <span className="font-black text-white text-sm">{client.commission_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-muted-foreground font-medium">Wasi Share</span>
                    <span className="font-bold text-blue-400">4.0%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Ali Share</span>
                    <span className="font-bold text-violet-400">
                      {Math.max(0, client.commission_rate - 4).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/ledger/clients/${client.id}`}>
                <Button variant="outline" className="w-full justify-between border-white/10 text-white font-bold hover:bg-emerald-500/10 hover:border-emerald-500/40">
                  View Detail & History
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Add New Client</h2>
                <p className="text-xs text-muted-foreground">Register an internal client and agreed rate</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anas, Usama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                  required
                />
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
                    className="w-full pl-4 pr-10 py-3 bg-[#0A0A0A] border border-white/10 rounded-xl outline-none focus:border-emerald-500 text-white font-bold text-sm"
                    required
                  />
                  <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Commission Preview Card */}
              {commissionRate && !isNaN(parseFloat(commissionRate)) && (
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 text-xs space-y-2">
                  <div className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    Calculated Commission Split
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Wasi Fixed Share:</span>
                    <span className="font-bold text-blue-400">4.0%</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Ali Share:</span>
                    <span className="font-bold text-violet-400">
                      {Math.max(0, parseFloat(commissionRate) - 4).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border-white/10 text-white font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
