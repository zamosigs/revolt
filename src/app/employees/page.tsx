"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserPlus, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  X,
  Mail,
  MoreVertical,
  CheckCircle,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency, formatPKR, cn } from '@/lib/utils';
import { isAdmin } from '@/lib/auth/permissions';
import { useEmployees, useUpdateEmployee } from '@/hooks/useEmployees';
import { useLoads } from '@/hooks/useLoads';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { FilterToolbar } from '@/components/ui/enterprise/FilterToolbar';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { Select } from '@/components/ui/enterprise/Select';
import { AddEmployeeModal } from '@/features/employees/AddEmployeeModal';
import { EditEmployeeModal } from '@/features/employees/EditEmployeeModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeesPage() {
  const { profile } = useAuthStore();
  const { data: employees = [], isLoading: isEmployeesLoading } = useEmployees();
  const { data: loadsData = [], isLoading: isLoadsLoading } = useLoads();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null);
  const [toastData, setToastData] = useState<{ visible: boolean; password?: string }>({ visible: false });

  const isUserAdmin = isAdmin(profile?.role);

  const deptOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'management', label: 'Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'dispatch', label: 'Dispatch' },
    { value: 'finance', label: 'Finance' }
  ];

  // Debug Logging for Authorization
  useEffect(() => {
    console.log('--- Employees Auth Debug ---');
    console.log('User ID:', profile?.id);
    console.log('User Role:', profile?.role);
    console.log('Is Admin (Evaluated):', isUserAdmin);
    if (!isUserAdmin) {
      console.warn('Authorization Failed: SUPER_ADMIN bypass or OPERATIONS_MANAGER check did not trigger.');
    }
    console.log('---------------------------');
  }, [profile, isUserAdmin]);

  if (!isUserAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <GlassCard className="p-12 text-center max-w-md" hoverGlow={false}>
          <ShieldCheck size={48} className="mx-auto text-brand-red mb-6" />
          <h2 className="text-2xl font-black italic uppercase mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">Only administrative personnel can manage employee profiles. Contact your manager for details.</p>
        </GlassCard>
      </div>
    );
  }

  const getEmployeeLoadsCount = (id: string) => loadsData.filter(l => l.dispatcher_id === id).length;
  const getEmployeeRevenue = (id: string) => loadsData.filter(l => l.dispatcher_id === id).reduce((acc, curr) => acc + (curr.company_revenue || 0), 0);

  const filteredEmployees = employees.filter((emp: any) => {
    // 1. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (emp.full_name || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !role.includes(q)) {
        return false;
      }
    }
    // 2. Department Filter
    if (deptFilter === 'all') return true;
    const role = emp.role;
    if (deptFilter === 'management') {
      return role === 'SUPER_ADMIN' || role === 'CEO' || role === 'ADMIN' || role === 'OPERATIONS_MANAGER';
    }
    if (deptFilter === 'operations' || deptFilter === 'dispatch') {
      return role === 'DISPATCHER';
    }
    if (deptFilter === 'finance') {
      return role === 'ACCOUNTANT';
    }
    return true;
  });

  const getStatusActions = (currentStatus: string) => {
    const actions = [];
    if (currentStatus !== 'ACTIVE') {
      actions.push({
        label: 'SET ACTIVE',
        value: 'ACTIVE',
        color: 'bg-emerald-500',
      });
    }
    if (currentStatus !== 'INACTIVE') {
      actions.push({
        label: 'SET INACTIVE',
        value: 'INACTIVE',
        color: 'bg-brand-red',
      });
    }
    return actions;
  };

  const handleKebabClick = (e: React.MouseEvent<HTMLButtonElement>, employeeId: string) => {
    e.stopPropagation();
    if (activeDropdownId === employeeId) {
      setActiveDropdownId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 180 + window.scrollX,
      });
      setActiveDropdownId(employeeId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Fleet Personnel" 
        subtitle="Administrative Management System"
        icon={Users}
        actions={
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic h-10 px-5 shadow-lg active:scale-95 transition-all"
          >
            <UserPlus size={16} className="mr-2" />
            Add Employee
          </Button>
        }
      />

      <FilterToolbar 
        searchPlaceholder="Search by name, role, or department..."
        onSearchChange={setSearchQuery}
        filters={
          <Select 
            options={deptOptions} 
            value={deptFilter} 
            onChange={setDeptFilter} 
            className="w-48"
          />
        }
      />

      <GlassCard density="standard" className="p-0 overflow-hidden">
        <div className="p-5 border-b border-border/50 flex justify-between items-center">
          <h3 className="text-[11px] font-black uppercase tracking-widest italic opacity-80">Fleet Personnel roster</h3>
          <Badge variant="outline" className="rounded-md border-brand-orange/30 text-brand-orange font-black italic text-[9px] h-5">
            {filteredEmployees.length} personnel
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/10">
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Personnel Name</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Operational Role</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-center">Loads</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Revenue Yield</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-center">Salary (Base)</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-center">Commission</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-center">Score</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Status</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isEmployeesLoading || isLoadsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-5 py-5">
                      <Skeleton className="h-10 w-full bg-secondary/50" />
                    </td>
                  </tr>
                ))
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-xs font-black uppercase italic text-muted-foreground">
                    No matching personnel records found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-brand-orange/[0.03] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-brand-orange text-white flex items-center justify-center font-black italic text-xs shadow-md">
                          {(emp.full_name || '??').split(' ').map((n: any) => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black italic uppercase text-xs tracking-tight group-hover:text-brand-orange transition-colors truncate max-w-[180px]">
                            {emp.full_name}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 lowercase tracking-tight">
                            {emp.email || `${emp.full_name?.toLowerCase().replace(' ', '.')}@revolt.com`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-black text-brand-orange/90 uppercase tracking-widest italic">
                      {emp.role?.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-xs">
                      {getEmployeeLoadsCount(emp.id)}
                    </td>
                    <td className="px-5 py-4 text-right font-black text-xs italic text-brand-orange">
                      {formatCurrency(getEmployeeRevenue(emp.id))}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-xs">
                      {formatPKR(emp.base_salary)}
                    </td>
                    <td className="px-5 py-4 text-center font-black text-xs text-brand-orange/80 italic">
                      {emp.commission_percentage}%
                    </td>
                    <td className="px-5 py-4 text-center font-black text-xs text-emerald-500 italic">
                      98%
                    </td>
                    <td className="px-5 py-4">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "rounded-md border text-[8px] font-black uppercase tracking-widest px-2.5 py-1 italic shadow-sm",
                          (emp.status === 'ACTIVE' || !emp.status) && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          emp.status === 'INACTIVE' && "bg-brand-red/10 text-brand-red border-brand-red/20"
                        )}
                      >
                        {emp.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-lg h-8 px-2 font-black uppercase italic text-[9px] hover:bg-brand-orange hover:text-white transition-all group"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          Profile
                          <ChevronRight size={12} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                        {isUserAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-8 w-8 rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground",
                              activeDropdownId === emp.id && "bg-secondary text-brand-orange"
                            )}
                            onClick={(e) => handleKebabClick(e, emp.id)}
                          >
                            <MoreVertical size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={(password) => {
          setToastData({ visible: true, password });
          setTimeout(() => setToastData({ visible: false }), 8000);
        }}
      />

      <EditEmployeeModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEmployeeToEdit(null);
        }}
        employee={employeeToEdit}
      />

      {/* Custom Theme Toast */}
      <AnimatePresence>
        {toastData.visible && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-80 p-4 bg-[#0A0A0A] border-2 border-brand-orange/40 rounded-xl shadow-2xl shadow-brand-orange/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-brand-orange">
                  <CheckCircle size={18} />
                  <h4 className="font-black italic uppercase tracking-widest text-xs">Personnel Created</h4>
                </div>
                <button 
                  onClick={() => setToastData({ visible: false })}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-relaxed">
                The employee profile and authentication account have been successfully generated.
              </div>
              {toastData.password && (
                <div className="mt-2 bg-secondary/40 border border-border/50 rounded-lg p-3 flex flex-col gap-2 relative group">
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-orange/80 italic">Temporary Password</span>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-xs font-black text-white bg-black/50 px-2 py-1 rounded select-all">{toastData.password}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(toastData.password || '');
                      }}
                      className="text-muted-foreground hover:text-brand-orange transition-colors"
                      title="Copy Password"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Employee Detail Drawer */}
      <AnimatePresence>
        {selectedEmployee && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-background border-l border-border shadow-2xl z-50 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Personnel Profile</h2>
                  <Badge variant={selectedEmployee.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-md uppercase text-[8px] tracking-widest font-black italic h-6 px-3 flex items-center leading-none">
                    {selectedEmployee.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmployee(null)} className="rounded-xl h-10 w-10 hover:bg-brand-orange hover:text-white transition-all">
                  <X size={20} />
                </Button>
              </div>

              {/* Profile Card */}
              <GlassCard className="p-6 border-brand-orange/30 bg-brand-orange/[0.03]" hoverGlow={false}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-brand-orange text-white flex items-center justify-center text-2xl font-black italic shadow-xl">
                    {(selectedEmployee.full_name || '??').split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight">{selectedEmployee.full_name}</h3>
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest mt-1">{(selectedEmployee.role || 'Personnel').replace('_', ' ')}</p>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <Mail size={12} className="text-brand-orange" />
                      <span className="text-[10px] font-bold tracking-tight lowercase">{selectedEmployee.email || `${selectedEmployee.full_name?.toLowerCase().replace(' ', '.')}@revolt.com`}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Financial Matrix */}
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4" hoverGlow={false}>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">Contractual Base</p>
                  <p className="text-xl font-black italic tracking-tighter">{formatPKR(selectedEmployee.base_salary)}</p>
                  <p className="text-[8px] font-bold mt-2 text-muted-foreground uppercase tracking-tight">Standard payroll distribution</p>
                </GlassCard>
                <GlassCard className="p-4" hoverGlow={false}>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">Commission Rate</p>
                  <p className="text-xl font-black text-brand-orange italic tracking-tighter">{selectedEmployee.commission_percentage}%</p>
                  <p className="text-[8px] font-bold mt-2 text-muted-foreground uppercase tracking-tight">On client booking revenue</p>
                </GlassCard>
              </div>

              {/* Workload Stats */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2 italic">Operational Productivity</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/30 shadow-inner">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 italic">Total Loads</p>
                    <p className="text-xl font-black italic tracking-tighter leading-none">{getEmployeeLoadsCount(selectedEmployee.id)}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/30 shadow-inner">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 italic">Revenue Yield</p>
                    <p className="text-xl font-black text-brand-orange italic tracking-tighter leading-none">{formatCurrency(getEmployeeRevenue(selectedEmployee.id))}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/30 shadow-inner">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 italic">Score</p>
                    <p className="text-xl font-black text-emerald-500 italic tracking-tighter leading-none">98.0%</p>
                  </div>
                </div>
              </div>

              {/* Loads Manifest */}
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2 italic">Assigned Loads Manifest</h4>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {loadsData.filter(l => l.dispatcher_id === selectedEmployee.id).length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-border/20 rounded-xl opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-widest">No loads assigned in database</p>
                    </div>
                  ) : (
                    loadsData.filter(l => l.dispatcher_id === selectedEmployee.id).map(load => (
                      <div key={load.id} className="p-3 bg-secondary/10 border border-border/30 rounded-xl flex items-center justify-between group hover:border-brand-orange/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center text-brand-orange font-black italic text-xs shadow-inner">
                            L
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black italic text-brand-orange text-xs tracking-wider">{load.load_number}</span>
                              <Badge className="text-[7px] font-black px-1.5 h-3.5 flex items-center leading-none" variant={load.status === 'DELIVERED' ? 'success' : load.status === 'IN_TRANSIT' ? 'warning' : 'secondary'}>
                                {load.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">
                              {load.pickup_city}, {load.pickup_state} → {load.dropoff_city}, {load.dropoff_state}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black tracking-tighter">{formatCurrency(load.gross_amount)}</p>
                          <p className="text-[8px] font-bold text-brand-orange uppercase opacity-75 mt-0.5">+{formatCurrency(load.company_revenue)} Net</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {activeDropdownId && dropdownCoords && (
        <Portal>
          <div 
            className="fixed inset-0 z-[120] bg-transparent" 
            onClick={() => setActiveDropdownId(null)} 
          />
          <div 
            style={{ 
              position: 'absolute', 
              top: dropdownCoords.top, 
              left: dropdownCoords.left,
            }}
            className="z-[130] w-48 bg-[#0F0F11]/95 border border-border/60 rounded-xl shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1"
          >
            {(() => {
              const emp = filteredEmployees.find(e => e.id === activeDropdownId);
              if (!emp) return null;
              const actions = getStatusActions(emp.status || 'ACTIVE');
              return (
                <>
                  <button
                    onClick={() => {
                      setEmployeeToEdit(emp);
                      setIsEditModalOpen(true);
                      setActiveDropdownId(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 hover:bg-secondary/80 text-foreground transition-all cursor-pointer group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-orange transition-transform group-hover:scale-125" />
                    <span className="font-black uppercase tracking-widest text-[9px] italic group-hover:text-brand-orange transition-colors">
                      EDIT PERSONNEL
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
                        updateEmployee({ employeeId: emp.id, updates: { deleted_at: new Date().toISOString() } });
                      }
                      setActiveDropdownId(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 hover:bg-secondary/80 text-foreground transition-all cursor-pointer group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red transition-transform group-hover:scale-125" />
                    <span className="font-black uppercase tracking-widest text-[9px] italic group-hover:text-brand-orange transition-colors">
                      DELETE PERSONNEL
                    </span>
                  </button>
                  <div className="h-px bg-border/50 my-1 mx-2" />
                  {actions.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => {
                        updateEmployee({ employeeId: emp.id, updates: { status: action.value } });
                        setActiveDropdownId(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 hover:bg-secondary/80 text-foreground transition-all cursor-pointer group"
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125", action.color)} />
                      <span className="font-black uppercase tracking-widest text-[9px] italic group-hover:text-brand-orange transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </>
              );
            })()}
          </div>
        </Portal>
      )}
    </div>
  );
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}
