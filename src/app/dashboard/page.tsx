"use client";

import React from 'react';
import { 
  DollarSign, 
  Package, 
  ClipboardCheck, 
  Calendar,
  TrendingUp,
  BarChart as BarChartIcon
} from 'lucide-react';
import { KPICard } from '@/features/dashboard/KPICard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

import { useEmployees } from '@/hooks/useEmployees';
import { useLoads } from '@/hooks/useLoads';

import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: employeesData, isLoading: isEmployeesLoading } = useEmployees();
  const { data: loadsData = [], isLoading: isLoadsLoading } = useLoads();

  const getEmployeeLoadsCount = (id: string) => loadsData.filter(l => l.dispatcher_id === id).length;
  const getEmployeeRevenue = (id: string) => loadsData.filter(l => l.dispatcher_id === id).reduce((acc, curr) => acc + (curr.gross_amount || 0), 0);
  const getEmployeeProfit = (id: string) => loadsData.filter(l => l.dispatcher_id === id).reduce((acc, curr) => acc + (curr.company_revenue || 0), 0);
  
  const getEmployeeScore = (id: string) => {
    const empLoads = loadsData.filter(l => l.dispatcher_id === id);
    if (empLoads.length === 0) return "100.0%";
    const delivered = empLoads.filter(l => l.status === 'DELIVERED').length;
    const cancelled = empLoads.filter(l => l.status === 'CANCELLED').length;
    if (empLoads.length === cancelled) return "0.0%";
    const score = ((delivered + (empLoads.length - delivered - cancelled) * 0.8) / (empLoads.length - cancelled)) * 100;
    return `${Math.min(100, score).toFixed(1)}%`;
  };

  if (isLoading || isEmployeesLoading || isLoadsLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-20 w-full rounded-2xl bg-secondary/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const todayRevenue = stats?.totalRevenue || 0;
  const activeLoads = stats?.activeLoads || 0;
  const deliveredCount = stats?.deliveredCount || 0;

  // Calculate dynamic weekly and monthly stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weeklyRevenue = loadsData
    .filter(l => l.pickup_date && new Date(l.pickup_date) >= oneWeekAgo)
    .reduce((sum, l) => sum + (l.company_revenue || 0), 0);

  const monthlyRevenue = loadsData
    .filter(l => l.pickup_date && new Date(l.pickup_date) >= oneMonthAgo)
    .reduce((sum, l) => sum + (l.company_revenue || 0), 0);

  const totalCompleted = loadsData.filter(l => l.status === 'DELIVERED' || l.status === 'CANCELLED').length;
  const deliveryRate = totalCompleted > 0 
    ? Math.round((loadsData.filter(l => l.status === 'DELIVERED').length / totalCompleted) * 100) 
    : 100;

  // Dynamic Freight Revenue Trend grouped by day of week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const revenueData = daysOfWeek.map((day, idx) => {
    const jsDayIdx = idx === 6 ? 0 : idx + 1; // Map Mon..Sun to 1..6, 0
    const dayLoads = loadsData.filter(l => {
      if (!l.pickup_date) return false;
      const date = new Date(l.pickup_date);
      return date.getDay() === jsDayIdx;
    });
    const value = dayLoads.reduce((sum, l) => sum + (l.company_revenue || 0), 0);
    return { name: day, value };
  });

  // Dynamic Dispatcher Performance Chart
  const performanceData = (employeesData || [])
    .map(emp => {
      const empLoads = loadsData.filter(l => l.dispatcher_id === emp.id);
      const delivered = empLoads.filter(l => l.status === 'DELIVERED').length;
      const cancelled = empLoads.filter(l => l.status === 'CANCELLED').length;
      const score = empLoads.length > cancelled 
        ? ((delivered + (empLoads.length - delivered - cancelled) * 0.8) / (empLoads.length - cancelled)) * 100 
        : 100;
      return {
        name: (emp.full_name || 'Agent').split(' ')[0],
        value: Math.round(score)
      };
    })
    .slice(0, 4); // show top 4

  return (
    <div className="flex flex-col gap-5">
      <PageHeader 
        title="Operations Control" 
        subtitle="Real-time Freight Logistics Intelligence"
        icon={TrendingUp}
        actions={
          <div className="flex items-center gap-2 bg-brand-orange/10 px-3 py-1.5 rounded-lg border border-brand-orange/20">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse"></div>
            <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest">Live Feed Active</span>
          </div>
        }
      />

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Revenue" value={todayRevenue} trend={12} isCurrency icon={<DollarSign size={18} />} className="border-b-2 border-b-brand-orange" />
        <KPICard title="Active" value={activeLoads} trend={8} icon={<Package size={18} />} />
        <KPICard title="Delivered" value={deliveredCount} icon={<ClipboardCheck size={18} />} />
        <KPICard title="Weekly" value={weeklyRevenue} isCurrency icon={<Calendar size={18} />} />
        <KPICard title="Monthly" value={monthlyRevenue} isCurrency icon={<TrendingUp size={18} />} />
        <KPICard title="Delivery %" value={`${deliveryRate}%`} icon={<TrendingUp size={18} />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 italic">
              <TrendingUp size={14} />
              Freight Revenue Trend
            </h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252525" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', borderRadius: '8px', border: '1px solid #252525', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#F97316', fontWeight: 'bold', fontSize: '10px' }}
                    labelStyle={{ color: '#F5F5F5', marginBottom: '4px', fontWeight: 'black', fontSize: '10px' }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 italic">
              <BarChartIcon size={14} />
              Dispatcher Performance
            </h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252525" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#1E1E1E' }}
                    contentStyle={{ backgroundColor: '#181818', borderRadius: '8px', border: '1px solid #252525', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F97316' : '#252525'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Leaderboard Section */}
      <GlassCard className="p-0 overflow-hidden" hoverGlow={false} density="compact">
        <div className="bg-secondary/30 px-5 py-3 border-b border-border/50">
          <h3 className="text-[11px] font-black uppercase tracking-widest italic opacity-80">Fleet Performance Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          {isEmployeesLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-secondary/50" />
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/10">
                  <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Personnel</th>
                  <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Loads</th>
                  <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Revenue</th>
                  <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Net Profit</th>
                  <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {(employeesData || []).map((emp) => (
                  <tr key={emp.id} className="group hover:bg-brand-orange/[0.03] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-brand-orange text-white font-black italic shadow-md group-hover:scale-105 transition-transform text-[10px]">
                          {(emp.full_name || emp.name || '??').split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-black italic uppercase text-[11px] tracking-tight group-hover:text-brand-orange transition-colors">{emp.full_name || emp.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">{(emp.role || 'PERSONNEL').replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-black text-[11px] opacity-80">{getEmployeeLoadsCount(emp.id)}</td>
                    <td className="px-5 py-3 text-right font-black text-[11px] opacity-80">{formatCurrency(getEmployeeRevenue(emp.id))}</td>
                    <td className="px-5 py-3 text-right font-black text-[11px] text-brand-orange">{formatCurrency(getEmployeeProfit(emp.id))}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge variant="outline" className="rounded-md border-emerald-500/30 text-emerald-500 font-black italic text-[9px] h-5">
                        {getEmployeeScore(emp.id)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

