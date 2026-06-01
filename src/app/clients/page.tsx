"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Building,
  Mail,
  Phone,
  ArrowUpRight,
  Save,
  Percent,
  User,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdmin } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { FilterToolbar } from '@/components/ui/enterprise/FilterToolbar';
import { GlassCard } from '@/components/ui/enterprise/GlassCard';
import { Modal } from '@/components/ui/enterprise/Modal';
import { PersonnelSelector } from '@/components/ui/enterprise/PersonnelSelector';
import { Select } from '@/components/ui/enterprise/Select';
import { useClients, useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientsPage() {
  const { data: dbClients = [], isLoading: isClientsLoading } = useClients();
  const { data: dbEmployees = [], isLoading: isEmployeesLoading } = useEmployees();
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient } = useUpdateClient();
  const { profile } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    contractPercentage: '8',
    assignedDispatcher: ''
  });

  const isUserAdmin = isAdmin(profile?.role);
  
  // Combine DB and Mock data for rich UI
  const employees = dbEmployees.length > 0 ? dbEmployees : [];
  
  const filteredClients = dbClients.filter((client: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return client.status === 'ACTIVE';
    if (statusFilter === 'pending') return client.status === 'PENDING_APPROVAL';
    if (statusFilter === 'hold') return client.status === 'REJECTED';
    return true;
  });

  const getDispatcherName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp?.full_name || emp?.name || 'Unassigned';
  };

  const statusOptions = [
    { value: 'all', label: 'All Account Status' },
    { value: 'active', label: 'Active Contracts' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'hold', label: 'On Hold' }
  ];

  const getStatusActions = (currentStatus: string) => {
    const actions = [];
    if (currentStatus !== 'ACTIVE') {
      actions.push({
        label: 'ACTIVATE CONTRACT',
        value: 'ACTIVE',
        color: 'bg-emerald-500',
      });
    }
    if (currentStatus !== 'PENDING_APPROVAL') {
      actions.push({
        label: 'SET PENDING',
        value: 'PENDING_APPROVAL',
        color: 'bg-sky-500',
      });
    }
    if (currentStatus !== 'REJECTED') {
      actions.push({
        label: 'PUT ON HOLD',
        value: 'REJECTED',
        color: 'bg-brand-orange',
      });
    }
    if (currentStatus !== 'INACTIVE') {
      actions.push({
        label: 'END CONTRACT',
        value: 'INACTIVE',
        color: 'bg-brand-red',
      });
    }
    return actions;
  };

  const handleKebabClick = (e: React.MouseEvent<HTMLButtonElement>, clientId: string) => {
    e.stopPropagation();
    if (activeDropdownId === clientId) {
      setActiveDropdownId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 180 + window.scrollX,
      });
      setActiveDropdownId(clientId);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName || !formData.contactName || !formData.email) {
      setError("Please fill in all required operational fields.");
      return;
    }

    createClient(formData, {
      onSuccess: () => {
        setShowAddModal(false);
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          contractPercentage: '8',
          assignedDispatcher: ''
        });
        // Success feedback (placeholder for toast)
        console.log('Client successfully committed to operational database.');
      },
      onError: (err: any) => {
        console.error('Submission failed:', err);
        setError(err.message || "Strategic failure during account initiation.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Client Relations" 
        subtitle="Strategic Account & Logistics Partnership Management"
        icon={Building}
        actions={
          isUserAdmin && (
            <Button onClick={() => setShowAddModal(true)} className="rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic h-10 px-5 shadow-lg">
              <UserPlus size={16} className="mr-2" />
              Add Client
            </Button>
          )
        }
      />

      <FilterToolbar 
        searchPlaceholder="Search accounts, companies, or contacts..."
        filters={
          <Select 
            options={statusOptions} 
            value={statusFilter} 
            onChange={setStatusFilter} 
            className="w-48"
          />
        }
      />

      <GlassCard density="standard" className="p-0 overflow-hidden">
        <div className="p-5 border-b border-border/50 flex justify-between items-center">
          <h3 className="text-[11px] font-black uppercase tracking-widest italic opacity-80">Strategic Client Partnerships</h3>
          <Badge variant="outline" className="rounded-md border-brand-orange/30 text-brand-orange font-black italic text-[9px] h-5">
            {filteredClients.length} accounts
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/10">
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Company Legal Entity</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Contact Representative</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Email Address</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Phone Number</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-center">Contract Fee</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Account Mgr</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic">Status</th>
                <th className="px-5 py-3 font-black text-[9px] text-muted-foreground uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isClientsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-5">
                      <Skeleton className="h-10 w-full bg-secondary/50" />
                    </td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-xs font-black uppercase italic text-muted-foreground">
                    No matching client accounts found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="group hover:bg-brand-orange/[0.03] transition-colors">
                    <td className="px-5 py-4 font-black italic uppercase text-xs tracking-tight group-hover:text-brand-orange transition-colors truncate max-w-[180px]">
                      {client.company_name || client.companyName}
                    </td>
                    <td className="px-5 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                      {client.contact_person || client.name}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-muted-foreground/80 lowercase">
                      {client.email}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-muted-foreground/80">
                      {client.phone}
                    </td>
                    <td className="px-5 py-4 text-center font-black text-[13px] text-brand-orange italic tracking-tighter">
                      {client.contract_percentage || client.contractPercentage}%
                    </td>
                    <td className="px-5 py-4 text-xs font-black uppercase italic">
                      {getDispatcherName(client.assigned_dispatcher_id || client.assignedDispatcher).split(' ')[0]}
                    </td>
                    <td className="px-5 py-4">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "rounded-md border text-[8px] font-black uppercase tracking-widest px-2.5 py-1 italic shadow-sm",
                          client.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          client.status === 'PENDING_APPROVAL' && "bg-sky-500/10 text-sky-500 border-sky-500/20",
                          client.status === 'REJECTED' && "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
                          client.status === 'INACTIVE' && "bg-brand-red/10 text-brand-red border-brand-red/20"
                        )}
                      >
                        {client.status === 'PENDING_APPROVAL' ? 'PENDING' : client.status === 'REJECTED' ? 'ON HOLD' : client.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg font-black uppercase italic text-[9px] hover:bg-brand-orange hover:text-white transition-all group px-2">
                          History
                          <ArrowUpRight size={12} className="ml-1" />
                        </Button>
                        {isUserAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-8 w-8 rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground",
                              activeDropdownId === client.id && "bg-secondary text-brand-orange"
                            )}
                            onClick={(e) => handleKebabClick(e, client.id)}
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

      {/* Add Client Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Account Initiation"
        maxWidth="max-w-xl"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive animate-in fade-in slide-in-from-top-1">
              <ShieldCheck size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Company Legal Entity</label>
              <div className="relative group">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  disabled={isCreating}
                  className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40 disabled:opacity-50"
                  placeholder="Enter company name..." 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Contact Representative</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
                <input 
                  type="text" 
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  disabled={isCreating}
                  className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40 disabled:opacity-50"
                  placeholder="Enter contact name..." 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isCreating}
                  className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40 disabled:opacity-50"
                  placeholder="Enter email address..." 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isCreating}
                  className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40 disabled:opacity-50"
                  placeholder="Enter phone number..." 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic opacity-70">Contract Valuation (%)</label>
              <div className="relative group">
                <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-orange transition-colors" size={14} />
                <input 
                  type="number" 
                  placeholder="8" 
                  value={formData.contractPercentage}
                  onChange={(e) => handleInputChange('contractPercentage', e.target.value)}
                  disabled={isCreating}
                  className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border/50 rounded-lg font-bold outline-none focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all text-xs placeholder:text-muted-foreground/40 disabled:opacity-50"
                />
              </div>
            </div>
            
            <PersonnelSelector
              role="DISPATCHER"
              label="Account Manager"
              value={formData.assignedDispatcher}
              onChange={(val) => handleInputChange('assignedDispatcher', val)}
              placeholder="SEARCH DISPATCHER..."
              includeAll={false}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} disabled={isCreating} className="rounded-lg h-10 px-6 font-black uppercase italic text-[9px]">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="rounded-lg h-10 px-8 bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic shadow-lg group">
              <Save size={16} className={cn("mr-2 group-hover:scale-110 transition-transform", isCreating && "animate-spin")} />
              {isCreating ? 'PROCESSING...' : 'Commit Account'}
            </Button>
          </div>
        </form>
      </Modal>
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
              const client = filteredClients.find(c => c.id === activeDropdownId);
              if (!client) return null;
              const actions = getStatusActions(client.status);
              return actions.map((action) => (
                <button
                  key={action.value}
                  onClick={() => {
                    updateClient({ clientId: client.id, updates: { status: action.value } });
                    setActiveDropdownId(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 hover:bg-secondary/80 text-foreground transition-all cursor-pointer group"
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125", action.color)} />
                  <span className="font-black uppercase tracking-widest text-[9px] italic group-hover:text-brand-orange transition-colors">
                    {action.label}
                  </span>
                </button>
              ));
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
