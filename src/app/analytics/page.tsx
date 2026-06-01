"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Percent, 
  Users, 
  Calendar,
  Briefcase,
  PieChart as PieIcon,
  ShieldCheck
} from 'lucide-react';
import { useLoads } from '@/hooks/useLoads';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { KPICard } from '@/features/dashboard/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
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
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AnalyticsPage() {
  const { data: loadsData = [], isLoading: isLoadsLoading } = useLoads();
  const { data: clientsData = [], isLoading: isClientsLoading } = useClients();
  const { data: employeesData = [], isLoading: isEmployeesLoading } = useEmployees();
  
  const [timeRange, setTimeRange] = useState<'30' | '90' | 'all'>('all');

  const isLoading = isLoadsLoading || isClientsLoading || isEmployeesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-20 w-full rounded-2xl bg-secondary/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-3xl bg-secondary/50" />
          <Skeleton className="h-80 rounded-3xl bg-secondary/50" />
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalLoads = loadsData.length;
  const activeLoads = loadsData.filter(l => l.status === 'BOOKED' || l.status === 'IN_TRANSIT').length;
  const completedLoads = loadsData.filter(l => l.status === 'DELIVERED').length;
  
  const totalGross = loadsData.reduce((sum, l) => sum + (l.gross_amount || 0), 0);
  const totalNet = loadsData.reduce((sum, l) => sum + (l.company_revenue || 0), 0);
  const averageFee = totalGross > 0 ? (totalNet / totalGross) * 100 : 0;
  const averageLoadVal = totalLoads > 0 ? totalGross / totalLoads : 0;

  // Chart 1: Dynamic Client Revenue Performance
  const clientRevenueData = clientsData.map(client => {
    const clientLoads = loadsData.filter(l => l.client_id === client.id);
    const revenue = clientLoads.reduce((sum, l) => sum + (l.company_revenue || 0), 0);
    const gross = clientLoads.reduce((sum, l) => sum + (l.gross_amount || 0), 0);
    return {
      name: client.company_name?.split(' ')[0] || 'Partner',
      revenue,
      gross
    };
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Chart 2: Dynamic Dispatcher Booking Volume
  const dispatcherData = employeesData.map(emp => {
    const empLoads = loadsData.filter(l => l.dispatcher_id === emp.id);
    const revenue = empLoads.reduce((sum, l) => sum + (l.company_revenue || 0), 0);
    return {
      name: emp.full_name?.split(' ')[0] || 'Agent',
      loads: empLoads.length,
      revenue
    };
  }).filter(d => d.loads > 0).sort((a, b) => b.revenue - a.revenue);

  // Chart 3: Weekly Logistics Trend (Grouped by Pickup Date / Day)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrends = daysOfWeek.map((day, idx) => {
    // Map load dates to day index
    const dayLoads = loadsData.filter(l => {
      if (!l.pickup_date) return false;
      const date = new Date(l.pickup_date);
      return date.getDay() === idx;
    });
    const gross = dayLoads.reduce((sum, l) => sum + (l.gross_amount || 0), 0);
    const net = dayLoads.reduce((sum, l) => sum + (l.company_revenue || 0), 0);
    return {
      name: day,
      gross,
      net,
      loads: dayLoads.length
    };
  });

  // Reorder weekly trends starting with Monday
  const orderedWeeklyTrends = [...weeklyTrends.slice(1), weeklyTrends[0]];

  // Chart 4: Load Status Breakdown
  const statusBreakdown = [
    { name: 'Booked', value: loadsData.filter(l => l.status === 'BOOKED').length, color: '#A1A1AA' },
    { name: 'In Transit', value: loadsData.filter(l => l.status === 'IN_TRANSIT').length, color: '#F97316' },
    { name: 'Delivered', value: loadsData.filter(l => l.status === 'DELIVERED').length, color: '#10B981' },
    { name: 'Cancelled', value: loadsData.filter(l => l.status === 'CANCELLED').length, color: '#EF4444' },
  ].filter(s => s.value > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Logistics Analytics" 
        subtitle="Real-time Operational Intelligence & Performance Audits"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border/50 rounded-lg p-0.5 bg-secondary/50 backdrop-blur-md">
              <button 
                onClick={() => setTimeRange('all')}
                className={`rounded-md px-3 py-1.5 text-[9px] font-black uppercase italic transition-all cursor-pointer ${timeRange === 'all' ? "bg-brand-orange text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                All Time
              </button>
              <button 
                onClick={() => setTimeRange('30')}
                className={`rounded-md px-3 py-1.5 text-[9px] font-black uppercase italic transition-all cursor-pointer ${timeRange === '30' ? "bg-brand-orange text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                30 Days
              </button>
            </div>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Gross Payout" value={totalGross} trend={14.2} isCurrency icon={<DollarSign size={18} />} className="border-b-2 border-b-brand-orange" />
        <KPICard title="Company Net" value={totalNet} trend={11.8} isCurrency icon={<Briefcase size={18} />} />
        <KPICard title="Yield Margin" value={`${averageFee.toFixed(1)}%`} icon={<Percent size={18} />} />
        <KPICard title="Delivered Loads" value={completedLoads} icon={<Truck size={18} />} />
        <KPICard title="Active Fleet" value={activeLoads} icon={<ActivityIcon />} />
        <KPICard title="Avg Load Gross" value={averageLoadVal} isCurrency icon={<DollarSign size={18} />} />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart: Revenue Timeline */}
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 italic">
              <TrendingUp size={14} />
              Weekly Operations Payout Trend
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderedWeeklyTrends}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252525" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#181818', borderRadius: '8px', border: '1px solid #252525', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#F5F5F5', marginBottom: '4px', fontWeight: 'black', fontSize: '10px' }}
                    formatter={(val: any, name: any) => [formatCurrency(Number(val) || 0), name === 'gross' ? 'Gross Payout' : 'Company Net']}
                  />
                  <Area type="monotone" dataKey="gross" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" name="gross" />
                  <Area type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" name="net" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Bar Chart: Client Profitability */}
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 italic">
              <Briefcase size={14} />
              Strategic Client Profitability
            </h3>
            <div className="h-[280px] w-full">
              {clientRevenueData.length === 0 ? (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-border/20 rounded-xl opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">No client database bookings available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientRevenueData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252525" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      cursor={{ fill: '#1E1E1E' }}
                      contentStyle={{ backgroundColor: '#181818', borderRadius: '8px', border: '1px solid #252525', fontSize: '10px' }}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Yield Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {clientRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#F97316' : '#E05E00'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Secondary Row: Dispatchers & Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatcher Performance */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 italic">
              <Users size={14} />
              Dispatcher Yield Matrix
            </h3>
            <div className="h-[240px] w-full">
              {dispatcherData.length === 0 ? (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-border/20 rounded-xl opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">No dispatcher tracking details available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dispatcherData} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#252525" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717A', fontWeight: 'bold' }} width={60} />
                    <Tooltip 
                      cursor={{ fill: '#1E1E1E' }}
                      contentStyle={{ backgroundColor: '#181818', borderRadius: '8px', border: '1px solid #252525', fontSize: '10px' }}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Net Yield']}
                    />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {dispatcherData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10B981" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Load Status Pie */}
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 h-full">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 italic">
              <PieIcon size={14} />
              Load Status Manifest
            </h3>
            <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
              {statusBreakdown.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-border/20 rounded-xl opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">No active loads tracked</p>
                </div>
              ) : (
                <>
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#181818', borderRadius: '8px', border: '1px solid #252525', fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend overlay */}
                  <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                    {statusBreakdown.map((status, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">{status.name} ({status.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// Simple placeholder icon to prevent import errors if Activity isn't in Lucide
function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
