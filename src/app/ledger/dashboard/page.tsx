'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Receipt,
  Plus,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLedgerAuthStore } from '@/features/ledger/hooks/useLedgerAuth';
import { formatLedgerCurrency } from '@/features/ledger/lib/calculations';
import { getDashboardStatsAction } from '@/features/ledger/actions/payments';

interface StatsData {
  total_gross: number;
  wasi_earnings: number;
  ali_earnings: number;
  pending_wire: number;
  completed_wire: number;
  payment_count: number;
}

export default function LedgerDashboardPage() {
  const { ledgerUser } = useLedgerAuthStore();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getDashboardStatsAction();
        if (res.success && res.data) {
          setStatsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = [
    {
      label: 'Total Gross Received',
      value: formatLedgerCurrency(statsData?.total_gross || 0),
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-950/50',
      borderColor: 'border-emerald-900/30',
    },
    {
      label: 'Wasi Earnings',
      value: formatLedgerCurrency(statsData?.wasi_earnings || 0),
      icon: ArrowUpRight,
      color: 'text-blue-500',
      bg: 'bg-blue-950/50',
      borderColor: 'border-blue-900/30',
    },
    {
      label: 'Ali Earnings',
      value: formatLedgerCurrency(statsData?.ali_earnings || 0),
      icon: ArrowDownRight,
      color: 'text-violet-500',
      bg: 'bg-violet-950/50',
      borderColor: 'border-violet-900/30',
    },
    {
      label: 'Pending Wire',
      value: formatLedgerCurrency(statsData?.pending_wire || 0),
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-950/50',
      borderColor: 'border-amber-900/30',
    },
    {
      label: 'Wired',
      value: formatLedgerCurrency(statsData?.completed_wire || 0),
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-950/50',
      borderColor: 'border-emerald-900/30',
    },
    {
      label: 'Payment Count',
      value: String(statsData?.payment_count || 0),
      icon: Receipt,
      color: 'text-cyan-500',
      bg: 'bg-cyan-950/50',
      borderColor: 'border-cyan-900/30',
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-bold text-emerald-400">{ledgerUser?.display_name}</span>
          </p>
        </div>

        {ledgerUser?.role === 'ADMIN' && (
          <div className="flex items-center gap-3">
            <Link href="/ledger/clients/new">
              <Button variant="outline" className="border-white/10 text-white font-bold gap-2">
                <Plus size={16} />
                Add Client
              </Button>
            </Link>
            <Link href="/ledger/payments/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2">
                <Plus size={16} />
                New Payment
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className={`p-6 ${stat.bg} ${stat.borderColor} border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black tracking-tight text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Action / Empty Banner */}
      {!isLoading && (statsData?.payment_count || 0) === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center bg-[#121212] border-white/5">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 text-emerald-500">
            <Receipt className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">No ledger payments yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Start by adding clients (e.g. Anas, Usama) and recording your first incoming payment. 
            Financial breakdowns and wire tracking will update instantly.
          </p>
          {ledgerUser?.role === 'ADMIN' && (
            <div className="flex items-center gap-4">
              <Link href="/ledger/clients/new">
                <Button variant="outline" className="border-white/10 text-white font-bold">
                  1. Add a Client
                </Button>
              </Link>
              <Link href="/ledger/payments/new">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  2. Create First Payment
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
